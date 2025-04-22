import type { INode, ICommand, IIocEditor } from '@/index'

class SetBottomCommand implements ICommand {
  private activeNodes: INode[]
  private iocEditor: IIocEditor
  private level: number
  constructor(iocEditor: IIocEditor, activeNodes: INode[], level: number) {
    this.iocEditor = iocEditor
    this.activeNodes = activeNodes
    this.level = level
  }

  execute() {
    this.activeNodes.forEach((node: INode) => {
      node.setZ(this.level - 1)
    })
  }

  undo() {
    this.activeNodes.forEach((node: INode) => {
      node.setZ(this.level)
    })
  }

  redo() {
    this.execute()
  }
}

export { SetBottomCommand }
