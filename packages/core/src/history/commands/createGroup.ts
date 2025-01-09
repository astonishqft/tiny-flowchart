import type { INodeGroup } from '../../shapes/nodeGroup'
import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface ICreateGroupCommandOpts {
  group: INodeGroup
}

class CreateGroupCommand implements Command {
  private iocEditor: IIocEditor
  private group: INodeGroup

  constructor(iocEditor: IIocEditor, group: INodeGroup) {
    this.iocEditor = iocEditor
    this.group = group
  }

  execute() {
    this.iocEditor._groupMgr.addGroupToEditor(this.group)
  }

  undo() {
    this.iocEditor._groupMgr.removeGroupFromEditor(this.group)
  }

  redo() {
    this.execute()
  }
}

export { CreateGroupCommand }
