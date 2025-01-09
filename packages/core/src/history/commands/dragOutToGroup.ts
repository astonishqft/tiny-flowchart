import type { INodeGroup } from '../../shapes/nodeGroup'
import type { IShape } from '../../shapes'
import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IDragOutToGroupCommandOpts {
  targetGroup: INodeGroup
  node: IShape | INodeGroup
  offsetX: number
  offsetY: number
}

class DragOutToGroupCommand implements Command {
  private iocEditor: IIocEditor
  private targetGroup: INodeGroup
  private node: IShape | INodeGroup
  private parentGroup: INodeGroup
  constructor(iocEditor: IIocEditor, group: INodeGroup, node: IShape | INodeGroup) {
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
