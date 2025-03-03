import { ConnectionType } from '@/index'

import type { IConnection, ICommand, IIocEditor } from '@/index'

export interface IChangeConnectionTypeCommandOpts {
  connection: IConnection
  lineType: ConnectionType
  oldLineType: ConnectionType
}

class ChangeConnectionTypeCommand implements ICommand {
  private iocEditor: IIocEditor
  private connection: IConnection
  private lineType: ConnectionType
  private oldLineType: ConnectionType
  constructor(
    iocEditor: IIocEditor,
    connection: IConnection,
    lineType: ConnectionType,
    oldLineType: ConnectionType
  ) {
    this.iocEditor = iocEditor
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
