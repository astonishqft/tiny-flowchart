import type { IConnection, ICommand, ITinyFlowchart } from '@/index'

export interface IAddConnectionCommandOpts {
  connection: IConnection
}

class AddConnectionCommand implements ICommand {
  private connection: IConnection
  private tinyFlowchart: ITinyFlowchart

  constructor(tinyFlowchart: ITinyFlowchart, connection: IConnection) {
    this.tinyFlowchart = tinyFlowchart
    this.connection = connection
  }

  execute() {
    this.tinyFlowchart._connectionMgr.addConnectionToEditor(this.connection)
  }

  undo() {
    this.tinyFlowchart._connectionMgr.removeConnectionFromEditor(this.connection)
  }

  redo() {
    this.execute()
  }
}

export { AddConnectionCommand }
