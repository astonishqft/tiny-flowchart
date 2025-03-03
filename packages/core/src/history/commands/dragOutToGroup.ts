import type { INodeGroup, INode, ICommand, IIocEditor } from '@/index'

export interface IDragOutToGroupCommandOpts {
  targetGroup: INodeGroup
  node: INode
  offsetX: number
  offsetY: number
}

class DragOutToGroupCommand implements ICommand {
  private iocEditor: IIocEditor
  private targetGroup: INodeGroup
  private node: INode
  private parentGroup: INodeGroup
  constructor(iocEditor: IIocEditor, group: INodeGroup, node: INode) {
    this.iocEditor = iocEditor
    this.parentGroup = node.parentGroup as INodeGroup
    this.targetGroup = group
    this.node = node
  }

  execute() {
    this.iocEditor._groupMgr.removeShapeFromGroup(this.node)
    this.iocEditor._groupMgr.addShapeToGroup(this.node, this.targetGroup)
  }

  undo() {
    this.iocEditor._groupMgr.removeShapeFromGroup(this.node)
    this.iocEditor._groupMgr.addShapeToGroup(this.node, this.parentGroup)
  }

  redo() {
    this.execute()
  }
}

export { DragOutToGroupCommand }
