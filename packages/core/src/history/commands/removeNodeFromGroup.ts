import type { IShape } from '../../shapes'
import type { INodeGroup } from '../../shapes/nodeGroup'
import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IRemoveNodeFromGroupCommandOpts {
  node: IShape | INodeGroup
  offsetX: number
  offsetY: number
}

class RemoveNodeFromGroupCommand implements Command {
  private node: IShape | INodeGroup
  private iocEditor: IIocEditor
  private parentGroup: INodeGroup

  constructor(iocEditor: IIocEditor, node: IShape | INodeGroup) {
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
