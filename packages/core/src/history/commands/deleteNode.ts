import { NodeType } from '@/index'

import type { IShape, IConnection, INode, INodeGroup, ICommand, ITinyFlowchart } from '@/index'

export interface IDeleteNodeCommandOpts {
  nodes: INode[]
  connections: IConnection[]
}

class DeleteNodeCommand implements ICommand {
  private node: INode
  private tinyFlowchart: ITinyFlowchart
  private nodeType: NodeType

  constructor(tinyFlowchart: ITinyFlowchart, node: INode) {
    this.tinyFlowchart = tinyFlowchart
    this.node = node
    this.nodeType = node.nodeType
  }

  execute() {
    this.tinyFlowchart.unActive()
    if (this.nodeType === NodeType.Group) {
      this.tinyFlowchart._groupMgr.removeGroupFromEditor(this.node as INodeGroup)
    } else {
      this.tinyFlowchart._shapeMgr.removeShapeFromEditor(this.node as IShape)
    }
  }

  undo() {
    if (this.nodeType === NodeType.Group) {
      this.tinyFlowchart._groupMgr.addGroupToEditor(this.node as INodeGroup)
    } else {
      this.tinyFlowchart._shapeMgr.addShapeToEditor(this.node as IShape)
    }
  }

  redo() {
    this.execute()
  }
}

export { DeleteNodeCommand }
