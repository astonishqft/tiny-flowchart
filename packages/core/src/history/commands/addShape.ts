import type { IShape, ICommand, ITinyFlowchart } from '@/index'

export interface IAddShapeCommandOpts {
  shapeType: string
  x: number
  y: number
  url?: string
}

class AddShapeCommand implements ICommand {
  private shape: IShape
  private tinyFlowchart: ITinyFlowchart

  constructor(tinyFlowchart: ITinyFlowchart, shape: IShape) {
    this.tinyFlowchart = tinyFlowchart
    this.shape = shape
  }

  execute() {
    this.tinyFlowchart._shapeMgr.addShapeToEditor(this.shape)
  }

  undo() {
    this.tinyFlowchart._shapeMgr.removeShapeFromEditor(this.shape)
  }

  redo() {
    this.execute()
  }
}

export { AddShapeCommand }
