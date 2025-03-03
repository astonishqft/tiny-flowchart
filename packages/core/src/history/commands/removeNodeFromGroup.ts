import type { INode, INodeGroup, ICommand, IIocEditor } from '@/index'

export interface IRemoveNodeFromGroupCommandOpts {
  node: INode
  offsetX: number
  offsetY: number
}

class RemoveNodeFromGroupCommand implements ICommand {
  private node: INode
  private iocEditor: IIocEditor
  private parentGroup: INodeGroup

  constructor(iocEditor: IIocEditor, node: INode) {
    this.iocEditor = iocEditor
    this.node = node
    this.parentGroup = node.parentGroup as INodeGroup
  }

  execute() {
    this.iocEditor._groupMgr.removeShapeFromGroup(this.node)
  }

  undo() {
    this.iocEditor._groupMgr.addShapeToGroup(this.node, this.parentGroup)
  }

  redo() {
    this.execute()
  }
}

export { RemoveNodeFromGroupCommand }
