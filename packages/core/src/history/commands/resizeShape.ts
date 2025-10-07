import { BoundingRect } from '@/index'

import type { IShape, ICommand, ITinyFlowchart } from '@/index'

export interface IResizeShapeCommandOpts {
  tinyFlowchart: ITinyFlowchart
  shape: IShape
  oldBoundingBox: BoundingRect
  boundingBox: BoundingRect
}

class ResizeShapeCommand implements ICommand {
  private shape: IShape
  private _tinyFlowchart: ITinyFlowchart
  private oldBoundingBox: BoundingRect
  private boundingBox: BoundingRect

  constructor(
    tinyFlowchart: ITinyFlowchart,
    shape: IShape,
    oldBoundingBox: BoundingRect,
    boundingBox: BoundingRect
  ) {
    this._tinyFlowchart = tinyFlowchart
    this.shape = shape
    this.oldBoundingBox = oldBoundingBox
    this.boundingBox = boundingBox
  }

  execute() {
    this.shape.controlFrame.reSizeNode(this.boundingBox)
    this.refreshConnections()
  }

  undo() {
    this.shape.controlFrame.reSizeNode(this.oldBoundingBox)
    this.refreshConnections()
  }

  redo() {
    this.execute()
  }

  refreshConnections() {
    this._tinyFlowchart._connectionMgr.refreshConnection(this.shape)
  }
}

export { ResizeShapeCommand }
