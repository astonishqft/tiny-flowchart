import type { IConnection } from '../../shapes'
import type { ICommand } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IAddConnectionCommandOpts {
  connection: IConnection
}

class AddConnectionCommand implements ICommand {
  private connection: IConnection
  private iocEditor: IIocEditor

  constructor(iocEditor: IIocEditor, connection: IConnection) {
    this.iocEditor = iocEditor
    this.connection = connection
  }

  execute() {
    this.iocEditor._connectionMgr.addConnectionToEditor(this.connection)
  }

  undo() {
    this.iocEditor._connectionMgr.removeConnectionFromEditor(this.connection)
  }

  redo() {
    this.execute()
  }
}

export { AddConnectionCommand }
