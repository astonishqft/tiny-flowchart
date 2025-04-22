import { BoundingRect } from '@/index'

import type { INode, ICommand, ITinyFlowchart } from '@/index'

export interface IResizeShapeCommandOpts {
  tinyFlowchart: ITinyFlowchart
  node: INode
  oldBoundingBox: BoundingRect
  boundingBox: BoundingRect
}

class ResizeShapeCommand implements ICommand {
  private node: INode
  private _iocEditor: ITinyFlowchart
  private oldBoundingBox: BoundingRect
  private boundingBox: BoundingRect

  constructor(
    tinyFlowchart: ITinyFlowchart,
    node: INode,
    oldBoundingBox: BoundingRect,
    boundingBox: BoundingRect
  ) {
    this._iocEditor = tinyFlowchart
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
