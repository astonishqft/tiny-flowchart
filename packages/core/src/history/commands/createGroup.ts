import type { INodeGroup, ICommand, ITinyFlowchart } from '@/index'

export interface ICreateGroupCommandOpts {
  group: INodeGroup
}

class CreateGroupCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private group: INodeGroup

  constructor(tinyFlowchart: ITinyFlowchart, group: INodeGroup) {
    this.tinyFlowchart = tinyFlowchart
    this.group = group
  }

  execute() {
    this.tinyFlowchart._groupMgr.addGroupToEditor(this.group)
  }

  undo() {
    this.tinyFlowchart._groupMgr.removeGroupFromEditor(this.group)
  }

  redo() {
    this.execute()
  }
}

export { CreateGroupCommand }
