import type { IConnection, IExportConnectionStyle, ICommand, ITinyFlowchart } from '@/index'

export interface IUpdateConnectionPropertyCommandOpts {
  connection: IConnection
  connectionConfig: IExportConnectionStyle
  oldConnectionConfig: IExportConnectionStyle
}

class UpdateConnectionPropertyCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private connection: IConnection
  private connectionConfig: IExportConnectionStyle
  private oldConnectionConfig: IExportConnectionStyle
  constructor(
    tinyFlowchart: ITinyFlowchart,
    connection: IConnection,
    connectionConfig: IExportConnectionStyle,
    oldConnectionConfig: IExportConnectionStyle
  ) {
    this.tinyFlowchart = tinyFlowchart
    this.connection = connection
    this.connectionConfig = connectionConfig
    this.oldConnectionConfig = oldConnectionConfig
  }

  execute() {
    this.connection.setStyle(this.connectionConfig)
  }

  undo() {
    this.connection.setStyle(this.oldConnectionConfig)
  }

  redo() {
    this.execute()
  }
}

export { UpdateConnectionPropertyCommand }
