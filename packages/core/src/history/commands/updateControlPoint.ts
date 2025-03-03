import type { IConnection, ICommand, IIocEditor } from '@/index'

export interface IUpdateControlPointCommandOpts {
  connection: IConnection
  controlPoint1: (number | undefined)[]
  controlPoint2: (number | undefined)[]
  oldControlPoint1: (number | undefined)[]
  oldControlPoint2: (number | undefined)[]
}

class UpdateControlPointCommand implements ICommand {
  private iocEditor: IIocEditor
  private connection: IConnection
  private controlPoint1: (number | undefined)[]
  private controlPoint2: (number | undefined)[]
  private oldControlPoint1: (number | undefined)[]
  private oldControlPoint2: (number | undefined)[]

  constructor(
    iocEditor: IIocEditor,
    connection: IConnection,
    controlPoint1: (number | undefined)[],
    controlPoint2: (number | undefined)[],
    oldControlPoint1: (number | undefined)[],
    oldControlPoint2: (number | undefined)[]
  ) {
    this.iocEditor = iocEditor
    this.connection = connection
    this.controlPoint1 = controlPoint1
    this.controlPoint2 = controlPoint2
    this.oldControlPoint1 = oldControlPoint1
    this.oldControlPoint2 = oldControlPoint2
  }

  execute() {
    this.connection.setBezierCurve(this.controlPoint1, this.controlPoint2)
  }

  undo() {
    this.connection.setBezierCurve(this.oldControlPoint1, this.oldControlPoint2)
  }

  redo() {
    this.execute()
  }
}

export { UpdateControlPointCommand }
