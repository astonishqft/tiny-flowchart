import type { Command } from '../historyManage'

class PatchCommand implements Command {
  private cmds: Command[]

  constructor(cmds: Command[]) {
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
