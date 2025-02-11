export interface ICommand {
  execute(): void
  undo(): void
  redo(): void
}

export interface IHistoryManage {
  execute(command: ICommand): void
  undo(): void
  redo(): void
  reset(): void
}

class HistoryManage implements IHistoryManage {
  private undoList: ICommand[]
  private redoList: ICommand[]
  private maxHistory: number

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory
    this.undoList = []
    this.redoList = []
  }

  execute(command: ICommand) {
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
      const command: ICommand = this.undoList.pop() as ICommand
      command.undo()
      this.redoList.push(command)
    }
  }

  redo() {
    if (this.redoList.length) {
      const command: ICommand = this.redoList.pop() as ICommand
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
