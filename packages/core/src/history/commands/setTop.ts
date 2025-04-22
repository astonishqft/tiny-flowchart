import type { INode, ICommand, ITinyFlowchart } from '@/index'

export interface ISetZLevelCommandOpts {
  activeNodes: INode[]
  level: number
}

class SetTopCommand implements ICommand {
  private activeNodes: INode[]
  private tinyFlowchart: ITinyFlowchart
  private level: number
  constructor(tinyFlowchart: ITinyFlowchart, activeNodes: INode[], level: number) {
    this.tinyFlowchart = tinyFlowchart
    this.activeNodes = activeNodes
    this.level = level
  }

  execute() {
    this.activeNodes.forEach((node: INode) => {
      node.setZ(this.level + 1)
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

export { SetTopCommand }
