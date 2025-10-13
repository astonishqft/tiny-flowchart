import { NodeType } from '@/index'
import type { ICommand, INode, ITinyFlowchart, IShape } from '@/index'

export interface IMoveNodeCommandOpts {
  tinyFlowchart: ITinyFlowchart
  nodes: INode[]
  offsetX: number
  offsetY: number
}

class MoveNodeCommand implements ICommand {
  private node: INode
  private _tinyFlowchart: ITinyFlowchart
  private oldX: number
  private oldY: number
  private offsetX: number
  private offsetY: number

  constructor(tinyFlowchart: ITinyFlowchart, node: INode, offsetX: number, offsetY: number) {
    this._tinyFlowchart = tinyFlowchart
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
    this.updateNodeControlFrame()
  }

  undo() {
    this.node.updatePosition([this.oldX, this.oldY])
    this.updateNodeControlFrame()
    this.refreshConnections()
    this.updateGroupSize(this.node)
  }

  redo() {
    this.execute()
  }

  updateNodeControlFrame() {
    if (this.node.nodeType === NodeType.Shape && this.node.selected) {
      ;(this.node as IShape).controlFrame.active()
    }
  }

  refreshConnections() {
    this._tinyFlowchart._connectionMgr.refreshConnection(this.node)
  }

  updateGroupSize(node: INode) {
    if (node.parentGroup) {
      node.parentGroup.resizeNodeGroup()
      this._tinyFlowchart._connectionMgr.refreshConnection(node.parentGroup)
      this.updateGroupSize(node.parentGroup)
    }
  }
}

export { MoveNodeCommand }
