import type { IConnection, ICommand, ITinyFlowchart } from '@/index'

export interface IDeleteConnectionCommandOpts {
  connections: IConnection[]
}

class DeleteConnectionCommand implements ICommand {
  private connection: IConnection
  private tinyFlowchart: ITinyFlowchart

  constructor(tinyFlowchart: ITinyFlowchart, connection: IConnection) {
    this.tinyFlowchart = tinyFlowchart
    this.connection = connection
  }

  execute() {
    this.tinyFlowchart.unActive()
    this.tinyFlowchart._connectionMgr.removeConnectionFromEditor(this.connection)
  }

  undo() {
    this.tinyFlowchart._connectionMgr.addConnectionToEditor(this.connection)
  }

  redo() {
    this.execute()
  }
}

export { DeleteConnectionCommand }
