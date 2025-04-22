import type { INodeGroup, INode, ICommand, ITinyFlowchart } from '@/index'

export interface IDragEnterToGroupCommandOpts {
  targetGroup: INodeGroup
  node: INode
  offsetX: number
  offsetY: number
}

class DragEnterToGroupCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private targetGroup: INodeGroup
  private node: INode

  constructor(tinyFlowchart: ITinyFlowchart, group: INodeGroup, node: INode) {
    this.tinyFlowchart = tinyFlowchart
    this.targetGroup = group
    this.node = node
  }

  execute() {
    this.tinyFlowchart._groupMgr.addShapeToGroup(this.node, this.targetGroup)
  }

  undo() {
    this.tinyFlowchart._groupMgr.removeShapeFromGroup(this.node)
  }

  redo() {
    this.execute()
  }
}

export { DragEnterToGroupCommand }
