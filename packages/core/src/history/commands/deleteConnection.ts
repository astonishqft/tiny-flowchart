import { IConnection } from '../../shapes'
import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IDeleteConnectionCommandOpts {
  connections: IConnection[]
}

class DeleteConnectionCommand implements Command {
  private connection: IConnection
  private iocEditor: IIocEditor

  constructor(iocEditor: IIocEditor, connection: IConnection) {
    this.iocEditor = iocEditor
    this.connection = connection
  }

  execute() {
    this.iocEditor._sceneMgr.unActive()
    this.iocEditor._connectionMgr.removeConnectionFromEditor(this.connection)
  }

  undo() {
    this.iocEditor._connectionMgr.addConnectionToEditor(this.connection)
  }

  redo() {
    this.execute()
  }
}

export { DeleteConnectionCommand }
