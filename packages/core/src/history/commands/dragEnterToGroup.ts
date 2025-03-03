import type { INodeGroup, INode, ICommand, IIocEditor } from '@/index'

export interface IDragEnterToGroupCommandOpts {
  targetGroup: INodeGroup
  node: INode
  offsetX: number
  offsetY: number
}

class DragEnterToGroupCommand implements ICommand {
  private iocEditor: IIocEditor
  private targetGroup: INodeGroup
  private node: INode

  constructor(iocEditor: IIocEditor, group: INodeGroup, node: INode) {
    this.iocEditor = iocEditor
    this.targetGroup = group
    this.node = node
  }

  execute() {
    this.iocEditor._groupMgr.addShapeToGroup(this.node, this.targetGroup)
  }

  undo() {
    this.iocEditor._groupMgr.removeShapeFromGroup(this.node)
  }

  redo() {
    this.execute()
  }
}

export { DragEnterToGroupCommand }
