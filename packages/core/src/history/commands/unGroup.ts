import type { INodeGroup } from '../../shapes/nodeGroup'
import type { ICommand } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'
import type { IConnection } from '../../shapes'

export interface IUnGroupCommandOpts {
  group: INodeGroup
}

class UnGroupCommand implements ICommand {
  private iocEditor: IIocEditor
  private group: INodeGroup
  private connections: IConnection[] // 与Group相连的连接线

  constructor(iocEditor: IIocEditor, group: INodeGroup) {
    this.iocEditor = iocEditor
    this.group = group
    this.connections = this.iocEditor._connectionMgr.getConnectionsByNodeId(this.group.id)
  }

  execute() {
    this.iocEditor._groupMgr.removeGroupFromEditor(this.group)
    // 移除与Group相连的连接线
    this.connections.forEach(connection =>
      this.iocEditor._connectionMgr.removeConnectionFromEditor(connection)
    )
    // 将Group的子节点添加到Group的父组中
    this.iocEditor._groupMgr.addShapeToParentGroup(this.group)
  }

  undo() {
    this.iocEditor._groupMgr.addGroupToEditor(this.group)
    // 恢复与Group相连的连接线
    this.connections.forEach(connection =>
      this.iocEditor._connectionMgr.addConnectionToEditor(connection)
    )
    // 将Group的子节点从Group的父组中移除
    this.iocEditor._groupMgr.removeShapeFromParentGroup(this.group)
  }

  redo() {
    this.execute()
  }
}

export { UnGroupCommand }
