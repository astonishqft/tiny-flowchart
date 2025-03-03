import type { IConnection, IExportConnectionStyle, ICommand, IIocEditor } from '@/index'

export interface IUpdateConnectionPropertyCommandOpts {
  connection: IConnection
  connectionConfig: IExportConnectionStyle
  oldConnectionConfig: IExportConnectionStyle
}

class UpdateConnectionPropertyCommand implements ICommand {
  private iocEditor: IIocEditor
  private connection: IConnection
  private connectionConfig: IExportConnectionStyle
  private oldConnectionConfig: IExportConnectionStyle
  constructor(
    iocEditor: IIocEditor,
    connection: IConnection,
    connectionConfig: IExportConnectionStyle,
    oldConnectionConfig: IExportConnectionStyle
  ) {
    this.iocEditor = iocEditor
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
