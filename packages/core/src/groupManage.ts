import { NodeGroup } from './shapes/nodeGroup'
import { getMinZLevel } from './utils'
import { Disposable, IDisposable } from './disposable'
import { NodeEventManage } from './nodeEventManage'

import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { IAnchorPoint, INode } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IIocEditor } from './iocEditor'
import type { IConnectionManage } from './connectionManage'

export interface IGroupManage extends IDisposable {
  createGroup(nodes?: INode[], groupId?: number): INodeGroup
  clear(): void
  addGroupToEditor(group: INodeGroup): void
  removeGroupFromEditor(group: INodeGroup): void
  addShapeToParentGroup(group: INodeGroup): void
  removeShapeFromParentGroup(group: INodeGroup): void
  removeShapeFromGroup(node: INode): void
  addShapeToGroup(node: INode, targetGroup: INodeGroup): void
}

class GroupManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  private _iocEditor: IIocEditor
  private _connectionMgr: IConnectionManage
  constructor(iocEditor: IIocEditor) {
    super()
    this._iocEditor = iocEditor
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
    this._connectionMgr = iocEditor._connectionMgr
  }

  createGroup(nodes: INode[], groupId?: number) {
    nodes.forEach(shape => shape.unActive())
    const minZLevel = getMinZLevel(nodes)
    const groupNode = new NodeGroup(nodes, this._iocEditor)
    groupNode.setZ(minZLevel - 1)
    new NodeEventManage(groupNode, this._iocEditor)
    if (groupId) {
      groupNode.id = groupId
    }

    return groupNode
  }

  addGroupToEditor(group: INodeGroup) {
    this._storageMgr.addGroup(group)
    this._viewPortMgr.addElementToViewPort(group)
    group.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addElementToViewPort(bar)
    })
  }

  removeGroupFromEditor(group: INodeGroup) {
    this._storageMgr.removeGroup(group)
    this._viewPortMgr.removeElementFromViewPort(group)
    group.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.removeElementFromViewPort(bar)
    })
  }

  // 将shape添加到group的父组中
  addShapeToParentGroup(group: INodeGroup) {
    group.shapes.forEach(shape => {
      delete shape.parentGroup
      if (group.parentGroup) {
        shape.parentGroup = group.parentGroup
        group.parentGroup.shapes.push(shape)
        group.parentGroup.shapes = group.parentGroup.shapes.filter(item => item.id !== group.id)
      }
    })

    if (group.parentGroup) {
      group.parentGroup.resizeNodeGroup()
    }
  }

  // 将shape从group的父组中移除
  removeShapeFromParentGroup(group: INodeGroup) {
    group.shapes.forEach(shape => {
      if (shape.parentGroup) {
        // 将shape从父组中移除
        shape.parentGroup.shapes = shape.parentGroup.shapes.filter(item => item.id !== shape.id)
      }
    })

    group.shapes.forEach(shape => {
      shape.parentGroup = group
    })

    if (group.parentGroup) {
      group.parentGroup.shapes.push(group)
      group.parentGroup.resizeNodeGroup()
    }
  }

  removeShapeFromGroup(node: INode) {
    if (node.parentGroup) {
      if (node.parentGroup!.shapes.length === 1) return // 确保组内至少有一个元素
      node.parentGroup!.shapes = node.parentGroup!.shapes.filter(item => item.id !== node.id)
      // 递归调用 resizeNodeGroup 直到没有 parentGroup
      let currentGroup: INodeGroup | undefined = node.parentGroup
      while (currentGroup) {
        currentGroup.resizeNodeGroup()
        currentGroup = currentGroup.parentGroup // 向上查找父组
      }
      this._connectionMgr.refreshConnection(node.parentGroup)
      delete node.parentGroup
    }
  }

  addShapeToGroup(node: INode, targetGroup: INodeGroup) {
    node.setZ(targetGroup.z + 1)
    node.parentGroup = targetGroup
    targetGroup.shapes.push(node)
    targetGroup.resizeNodeGroup()
  }

  clear() {
    this._storageMgr.getGroups().forEach((group: INodeGroup) => {
      this._viewPortMgr.removeElementFromViewPort(group)
      group.anchor.bars.forEach((bar: IAnchorPoint) => {
        this._viewPortMgr.removeElementFromViewPort(bar)
      })
    })
    this._storageMgr.clearGroups()
  }
}

export { GroupManage }
