import type { ICommand } from '../historyManage'

class PatchCommand implements ICommand {
  private cmds: ICommand[]

  constructor(cmds: ICommand[]) {
    this.cmds = cmds
  }

  execute() {
    this.cmds.forEach(cmd => cmd.execute())
  }

  undo() {
    this.cmds.forEach(cmd => cmd.undo())
  }

  redo() {
    this.execute()
  }
}

export { PatchCommand }
