import type { INodeGroup, ICommand, ITinyFlowchart, IConnection } from '@/index'

export interface IUnGroupCommandOpts {
  group: INodeGroup
}

class UnGroupCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private group: INodeGroup
  private connections: IConnection[] // 与Group相连的连接线

  constructor(tinyFlowchart: ITinyFlowchart, group: INodeGroup) {
    this.tinyFlowchart = tinyFlowchart
    this.group = group
    this.connections = this.tinyFlowchart._connectionMgr.getConnectionsByNodeId(this.group.id)
  }

  execute() {
    this.tinyFlowchart._groupMgr.removeGroupFromEditor(this.group)
    // 移除与Group相连的连接线
    this.connections.forEach(connection =>
      this.tinyFlowchart._connectionMgr.removeConnectionFromEditor(connection)
    )
    // 将Group的子节点添加到Group的父组中
    this.tinyFlowchart._groupMgr.addShapeToParentGroup(this.group)
  }

  undo() {
    this.tinyFlowchart._groupMgr.addGroupToEditor(this.group)
    // 恢复与Group相连的连接线
    this.connections.forEach(connection =>
      this.tinyFlowchart._connectionMgr.addConnectionToEditor(connection)
    )
    // 将Group的子节点从Group的父组中移除
    this.tinyFlowchart._groupMgr.removeShapeFromParentGroup(this.group)
  }

  redo() {
    this.execute()
  }
}

export { UnGroupCommand }
