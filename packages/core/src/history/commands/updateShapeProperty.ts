import type { IShape, IExportShapeStyle, ICommand, IIocEditor } from '@/index'

export interface IUpdateShapePropertyCommandOpts {
  shape: IShape
  shapeStyle: IExportShapeStyle
  oldShapeStyle: IExportShapeStyle
}

class UpdateShapePropertyCommand implements ICommand {
  private shape: IShape
  private shapeStyle: IExportShapeStyle
  private oldShapeStyle: IExportShapeStyle
  constructor(
    iocEditor: IIocEditor,
    shape: IShape,
    shapeStyle: IExportShapeStyle,
    oldShapeStyle: IExportShapeStyle
  ) {
    this.shape = shape
    this.shapeStyle = shapeStyle
    this.oldShapeStyle = oldShapeStyle
  }

  execute() {
    console.log('updateShapeProperty', this.shapeStyle)
    this.shape.updateShapeStyle(this.shapeStyle)
  }

  undo() {
    this.shape.updateShapeStyle(this.oldShapeStyle)
  }

  redo() {
    this.execute()
  }
}

export { UpdateShapePropertyCommand }
