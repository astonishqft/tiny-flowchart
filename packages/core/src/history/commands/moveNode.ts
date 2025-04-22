import type { ICommand, INode, ITinyFlowchart } from '@/index'

export interface IMoveNodeCommandOpts {
  tinyFlowchart: ITinyFlowchart
  nodes: INode[]
  offsetX: number
  offsetY: number
}

class MoveNodeCommand implements ICommand {
  private node: INode
  private _iocEditor: ITinyFlowchart
  private oldX: number
  private oldY: number
  private offsetX: number
  private offsetY: number

  constructor(tinyFlowchart: ITinyFlowchart, node: INode, offsetX: number, offsetY: number) {
    this._iocEditor = tinyFlowchart
    this.node = node
    this.oldX = this.node.oldX
    this.oldY = this.node.oldY
    this.offsetX = offsetX
    this.offsetY = offsetY
  }

  execute() {
    this.node.updatePosition([this.oldX + this.offsetX, this.oldY + this.offsetY])
    this.refreshConnections()
    this.updateGroupSize(this.node)
  }

  undo() {
    this.node.updatePosition([this.oldX, this.oldY])
    this.refreshConnections()
    this.updateGroupSize(this.node)
  }

  redo() {
    this.execute()
  }

  refreshConnections() {
    this._iocEditor._connectionMgr.refreshConnection(this.node)
  }

  updateGroupSize(node: INode) {
    if (node.parentGroup) {
      node.parentGroup.resizeNodeGroup()
      this._iocEditor._connectionMgr.refreshConnection(node.parentGroup)
      this.updateGroupSize(node.parentGroup)
    }
  }
}

export { MoveNodeCommand }
