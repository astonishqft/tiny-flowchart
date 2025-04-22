import { ConnectionType } from '@/index'

import type { IConnection, ICommand, ITinyFlowchart } from '@/index'

export interface IChangeConnectionTypeCommandOpts {
  connection: IConnection
  lineType: ConnectionType
  oldLineType: ConnectionType
}

class ChangeConnectionTypeCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private connection: IConnection
  private lineType: ConnectionType
  private oldLineType: ConnectionType
  constructor(
    tinyFlowchart: ITinyFlowchart,
    connection: IConnection,
    lineType: ConnectionType,
    oldLineType: ConnectionType
  ) {
    this.tinyFlowchart = tinyFlowchart
    this.connection = connection
    this.lineType = lineType
    this.oldLineType = oldLineType
  }

  execute() {
    this.connection.setConnectionType(this.lineType)
  }

  undo() {
    this.connection.setConnectionType(this.oldLineType)
  }

  redo() {
    this.execute()
  }
}

export { ChangeConnectionTypeCommand }
