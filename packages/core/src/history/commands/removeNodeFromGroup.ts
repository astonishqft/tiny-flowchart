import type { INode, INodeGroup, ICommand, ITinyFlowchart } from '@/index'

export interface IRemoveNodeFromGroupCommandOpts {
  node: INode
  offsetX: number
  offsetY: number
}

class RemoveNodeFromGroupCommand implements ICommand {
  private node: INode
  private tinyFlowchart: ITinyFlowchart
  private parentGroup: INodeGroup

  constructor(tinyFlowchart: ITinyFlowchart, node: INode) {
    this.tinyFlowchart = tinyFlowchart
    this.node = node
    this.parentGroup = node.parentGroup as INodeGroup
  }

  execute() {
    this.tinyFlowchart._groupMgr.removeShapeFromGroup(this.node)
  }

  undo() {
    this.tinyFlowchart._groupMgr.addShapeToGroup(this.node, this.parentGroup)
  }

  redo() {
    this.execute()
  }
}

export { RemoveNodeFromGroupCommand }
