import type { INodeGroup, INode, ICommand, ITinyFlowchart } from '@/index'

export interface IDragOutToGroupCommandOpts {
  targetGroup: INodeGroup
  node: INode
  offsetX: number
  offsetY: number
}

class DragOutToGroupCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private targetGroup: INodeGroup
  private node: INode
  private parentGroup: INodeGroup
  constructor(tinyFlowchart: ITinyFlowchart, group: INodeGroup, node: INode) {
    this.tinyFlowchart = tinyFlowchart
    this.parentGroup = node.parentGroup as INodeGroup
    this.targetGroup = group
    this.node = node
  }

  execute() {
    this.tinyFlowchart._groupMgr.removeShapeFromGroup(this.node)
    this.tinyFlowchart._groupMgr.addShapeToGroup(this.node, this.targetGroup)
  }

  undo() {
    this.tinyFlowchart._groupMgr.removeShapeFromGroup(this.node)
    this.tinyFlowchart._groupMgr.addShapeToGroup(this.node, this.parentGroup)
  }

  redo() {
    this.execute()
  }
}

export { DragOutToGroupCommand }
