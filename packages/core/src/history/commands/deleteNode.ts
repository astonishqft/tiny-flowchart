import { NodeType } from '@/index'

import type { IShape, IConnection, INode, INodeGroup, ICommand, IIocEditor } from '@/index'

export interface IDeleteNodeCommandOpts {
  nodes: INode[]
  connections: IConnection[]
}

class DeleteNodeCommand implements ICommand {
  private node: INode
  private iocEditor: IIocEditor
  private nodeType: NodeType

  constructor(iocEditor: IIocEditor, node: INode) {
    this.iocEditor = iocEditor
    this.node = node
    this.nodeType = node.nodeType
  }

  execute() {
    this.iocEditor._sceneMgr.unActive()
    if (this.nodeType === NodeType.Group) {
      this.iocEditor._groupMgr.removeGroupFromEditor(this.node as INodeGroup)
    } else {
      this.iocEditor._shapeMgr.removeShapeFromEditor(this.node as IShape)
    }
  }

  undo() {
    if (this.nodeType === NodeType.Group) {
      this.iocEditor._groupMgr.addGroupToEditor(this.node as INodeGroup)
    } else {
      this.iocEditor._shapeMgr.addShapeToEditor(this.node as IShape)
    }
  }

  redo() {
    this.execute()
  }
}

export { DeleteNodeCommand }
