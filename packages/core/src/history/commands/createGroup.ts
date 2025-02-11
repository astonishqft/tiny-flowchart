import type { INodeGroup } from '../../shapes/nodeGroup'
import type { ICommand } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface ICreateGroupCommandOpts {
  group: INodeGroup
}

class CreateGroupCommand implements ICommand {
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
