import type { IShape, IExportShapeStyle } from '../../shapes'
import type { ICommand } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IUpdateShapePropertyCommandOpts {
  shape: IShape
  shapeConfig: IExportShapeStyle
  oldShapeConfig: IExportShapeStyle
}

class UpdateShapePropertyCommand implements ICommand {
  private iocEditor: IIocEditor
  private shape: IShape
  private shapeConfig: IExportShapeStyle
  private oldShapeConfig: IExportShapeStyle
  constructor(
    iocEditor: IIocEditor,
    shape: IShape,
    shapeConfig: IExportShapeStyle,
    oldShapeConfig: IExportShapeStyle
  ) {
    this.iocEditor = iocEditor
    this.shape = shape
    this.shapeConfig = shapeConfig
    this.oldShapeConfig = oldShapeConfig
  }

  execute() {
    this.shape.updateShape(this.shapeConfig)
  }

  undo() {
    this.shape.updateShape(this.oldShapeConfig)
  }

  redo() {
    this.execute()
  }
}

export { UpdateShapePropertyCommand }
