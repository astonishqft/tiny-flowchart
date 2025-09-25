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
  private _tinyFlowchart: ITinyFlowchart
  private oldBoundingBox: BoundingRect
  private boundingBox: BoundingRect

  constructor(
    tinyFlowchart: ITinyFlowchart,
    node: INode,
    oldBoundingBox: BoundingRect,
    boundingBox: BoundingRect
  ) {
    this._tinyFlowchart = tinyFlowchart
    this.node = node
    this.oldBoundingBox = oldBoundingBox
    this.boundingBox = boundingBox
  }

  execute() {
    this._tinyFlowchart._controlFrameMgr.reSizeNode(this.boundingBox)
    this.refreshConnections()
  }

  undo() {
    this._tinyFlowchart._controlFrameMgr.reSizeNode(this.oldBoundingBox)
    this.refreshConnections()
  }

  redo() {
    this.execute()
  }

  refreshConnections() {
    this._tinyFlowchart._connectionMgr.refreshConnection(this.node)
  }
}

export { ResizeShapeCommand }
