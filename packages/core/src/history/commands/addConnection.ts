import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'
import { IConnection } from '../../shapes'

export interface IAddConnectionCommandOpts {
  connection: IConnection
}

class AddConnectionCommand implements Command {
  private connection: IConnection
  private iocEditor: IIocEditor

  constructor(iocEditor: IIocEditor, connection: IConnection) {
    this.iocEditor = iocEditor
    this.connection = connection
  }
  execute() {
    this.iocEditor._connectionMgr.addConnectionToViewPort(this.connection)
  }
  undo() {
    this.iocEditor._connectionMgr.removeConnectionFromViewPort(this.connection)
  }

  redo() {
    this.execute()
  }
}

export { AddConnectionCommand }
