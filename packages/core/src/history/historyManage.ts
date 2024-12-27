export interface Command {
  execute(): void
  undo(): void
  redo(): void
}

export interface IHistoryManage {
  execute(command: Command): void
  undo(): void
  redo(): void
  reset(): void
}

class HistoryManage implements IHistoryManage {
  private undoList: Command[]
  private redoList: Command[]
  private maxHistory: number

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory
    this.undoList = []
    this.redoList = []
  }

  execute(command: Command) {
    command.execute()
    this.redoList = []
    // 如果超出了最大历史保存数
    if (this.undoList.length > this.maxHistory) {
      this.undoList.shift()
    }

    this.undoList.push(command)
  }

  undo() {
    if (this.undoList.length) {
      const command: Command = this.undoList.pop() as Command
      command.undo()
      this.redoList.push(command)
    }
  }

  redo() {
    if (this.redoList.length) {
      const command: Command = this.redoList.pop() as Command
      command.redo()
      this.undoList.push(command)
    }
  }

  reset() {
    this.undoList = []
    this.redoList = []
  }
}

export { HistoryManage }
