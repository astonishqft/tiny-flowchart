import { NodeGroup } from './shapes/nodeGroup'
import { getMinZLevel } from './utils'
import { Disposable, IDisposable } from './disposable'
import { NodeEventManage } from './nodeEventManage'

import type { IViewPortManage } from './viewPortManage'
import type { IConnectionManage } from './connectionManage'
import type { IStorageManage } from './storageManage'
import type { IAnchorPoint, IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IIocEditor } from './iocEditor'

export interface IGroupManage extends IDisposable {
  createGroup(nodes?: (IShape | INodeGroup)[], groupId?: number): INodeGroup
  unGroup(): void
  clear(): void
  addGroupToEditor(group: INodeGroup): void
  removeGroupFromEditor(group: INodeGroup): void
}

class GroupManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _connectionMgr: IConnectionManage
  private _storageMgr: IStorageManage
  private _iocEditor: IIocEditor

  constructor(iocEditor: IIocEditor) {
    super()
    this._iocEditor = iocEditor
    this._connectionMgr = iocEditor._connectionMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
  }

  createGroup(nodes: (IShape | INodeGroup)[], groupId?: number) {
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
    group.unActive()
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

  unGroup() {
    const activeGroups = this._storageMgr.getActiveGroups()

    if (activeGroups.length < 1) return
    const activeGroup = activeGroups[0]
    this._viewPortMgr.getViewPort().remove(activeGroup)
    activeGroup.anchor.bars.forEach(bar => this._viewPortMgr.removeElementFromViewPort(bar))
    activeGroup.shapes.forEach((shape: IShape | INodeGroup) => {
      delete shape.parentGroup
      if (activeGroup.parentGroup) {
        shape.parentGroup = activeGroup.parentGroup
        activeGroup.parentGroup.shapes.push(shape)
        activeGroup.parentGroup.shapes = activeGroup.parentGroup.shapes.filter(
          item => item !== activeGroup
        )
      }
    })
    this.removeAssociatedConnection(activeGroup)
    this._storageMgr.removeGroup(activeGroup)
  }

  removeAssociatedConnection(nodeGroup: INodeGroup) {
    this._storageMgr.getConnections().forEach(connection => {
      if (connection.fromNode.id === nodeGroup.id || connection.toNode!.id === nodeGroup.id) {
        this._connectionMgr.removeConnectionFromViewPort(connection)
      }
    })
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
