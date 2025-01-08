import { IShape } from '../../shapes'
import { INodeGroup } from '../../shapes/nodeGroup'

import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IMoveNodeCommandOpts {
  iocEditor: IIocEditor
  node: IShape | INodeGroup
  offsetX: number
  offsetY: number
}

class MoveNodeCommand implements Command {
  private node: IShape | INodeGroup
  private _iocEditor: IIocEditor
  private oldX: number
  private oldY: number
  private offsetX: number
  private offsetY: number

  constructor(iocEditor: IIocEditor, node: IShape | INodeGroup, offsetX: number, offsetY: number) {
    this._iocEditor = iocEditor
    this.node = node
    this.oldX = this.node.oldX
    this.oldY = this.node.oldY
    this.offsetX = offsetX
    this.offsetY = offsetY
  }
  execute() {
    this.node.updatePosition([this.oldX + this.offsetX, this.oldY + this.offsetY])
    this.refreshConnections()
    this.updateGroupSize(this.node)
  }
  undo() {
    this.node.updatePosition([this.oldX, this.oldY])
    this.refreshConnections()
    this.updateGroupSize(this.node)
  }

  redo() {
    this.execute()
  }

  refreshConnections() {
    this._iocEditor._connectionMgr.refreshConnection(this.node)
  }

  updateGroupSize(node: IShape | INodeGroup) {
    if (node.parentGroup) {
      node.parentGroup.resizeNodeGroup()
      this._iocEditor._connectionMgr.refreshConnection(node.parentGroup)
      this.updateGroupSize(node.parentGroup)
    }
  }
}

export { MoveNodeCommand }
