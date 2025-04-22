import type { IConnection, ICommand, ITinyFlowchart } from '@/index'

export interface IUpdateControlPointCommandOpts {
  connection: IConnection
  controlPoint1: (number | undefined)[]
  controlPoint2: (number | undefined)[]
  oldControlPoint1: (number | undefined)[]
  oldControlPoint2: (number | undefined)[]
}

class UpdateControlPointCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private connection: IConnection
  private controlPoint1: (number | undefined)[]
  private controlPoint2: (number | undefined)[]
  private oldControlPoint1: (number | undefined)[]
  private oldControlPoint2: (number | undefined)[]

  constructor(
    tinyFlowchart: ITinyFlowchart,
    connection: IConnection,
    controlPoint1: (number | undefined)[],
    controlPoint2: (number | undefined)[],
    oldControlPoint1: (number | undefined)[],
    oldControlPoint2: (number | undefined)[]
  ) {
    this.tinyFlowchart = tinyFlowchart
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
