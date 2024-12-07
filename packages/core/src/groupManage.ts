import { NodeGroup } from './shapes/nodeGroup'
import { getMinZLevel } from './utils'
import { Disposable, IDisposable } from './disposable'
import { NodeEventManage } from './nodeEventManage'

import type { IViewPortManage } from './viewPortManage'
import type { IConnectionManage } from './connectionManage'
import type { IStorageManage } from './storageManage'
import type { IAnchorPoint, IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IocEditor } from './iocEditor'

export interface IGroupManage extends IDisposable {
  createGroup(nodes?: (IShape | INodeGroup)[], groupId?: number): INodeGroup
  unGroup(): void
  clear(): void
}

class GroupManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _connectionMgr: IConnectionManage
  private _storageMgr: IStorageManage
  private _iocEditor: IocEditor

  constructor(iocEditor: IocEditor) {
    super()
    this._iocEditor = iocEditor
    this._connectionMgr = iocEditor._connectionMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
  }

  createGroup(nodes?: (IShape | INodeGroup)[], groupId?: number) {
    const activeShapes = nodes ? nodes : this._storageMgr.getActiveNodes()

    activeShapes.forEach(shape => shape.unActive())

    const minZLevel = getMinZLevel(activeShapes)

    const groupNode = new NodeGroup(activeShapes, this._iocEditor)
    groupNode.setZ(minZLevel - 1)

    new NodeEventManage(groupNode, this._iocEditor)
    this._storageMgr.addGroup(groupNode)
    this._viewPortMgr.addElementToViewPort(groupNode)

    if (groupId) {
      groupNode.id = groupId
    }

    this._iocEditor.updateMiniMap$.next()

    return groupNode
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
        this._connectionMgr.removeConnection(connection)
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
