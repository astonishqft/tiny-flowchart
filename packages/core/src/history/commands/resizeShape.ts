import * as zrender from 'zrender'

import type { INode } from '../../shapes'
import type { ICommand } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IResizeShapeCommandOpts {
  iocEditor: IIocEditor
  node: INode
  oldBoundingBox: zrender.BoundingRect
  boundingBox: zrender.BoundingRect
}

class ResizeShapeCommand implements ICommand {
  private node: INode
  private _iocEditor: IIocEditor
  private oldBoundingBox: zrender.BoundingRect
  private boundingBox: zrender.BoundingRect

  constructor(
    iocEditor: IIocEditor,
    node: INode,
    oldBoundingBox: zrender.BoundingRect,
    boundingBox: zrender.BoundingRect
  ) {
    this._iocEditor = iocEditor
    this.node = node
    this.oldBoundingBox = oldBoundingBox
    this.boundingBox = boundingBox
  }

  execute() {
    this._iocEditor._controlFrameMgr.reSizeNode(this.boundingBox)
    this.refreshConnections()
  }

  undo() {
    this._iocEditor._controlFrameMgr.reSizeNode(this.oldBoundingBox)
    this.refreshConnections()
  }

  redo() {
    this.execute()
  }

  refreshConnections() {
    this._iocEditor._connectionMgr.refreshConnection(this.node)
  }
}

export { ResizeShapeCommand }
