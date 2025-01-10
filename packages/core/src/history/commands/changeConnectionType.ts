import { ConnectionType } from '../../shapes'

import type { IConnection } from '../../shapes'
import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IChangeConnectionTypeCommandOpts {
  connection: IConnection
  lineType: ConnectionType
  oldLineType: ConnectionType
}

class ChangeConnectionTypeCommand implements Command {
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
    this.connection.setLineType(this.lineType)
  }

  undo() {
    this.connection.setLineType(this.oldLineType)
  }

  redo() {
    this.execute()
  }
}

export { ChangeConnectionTypeCommand }
