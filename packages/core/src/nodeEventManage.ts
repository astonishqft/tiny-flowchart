import { Subject } from 'rxjs'
import { getBoundingBox, getMinPosition } from './utils'
import { Disposable } from '@/disposable'
import { NodeType } from '@/index'

import type { IDisposable } from '@/disposable'
import type {
  ElementEvent,
  ITinyFlowchart,
  INode,
  IShape,
  INodeGroup,
  ISettingManage,
  IZoomManage,
  IStorageManage,
  IDragFrameManage,
  IRefLineManage,
  IConnectionManage
} from '@/index'

export interface INodeMouseDown {
  node: INode | null
  e: ElementEvent | null
}
export interface INodeEventManage extends IDisposable {
  updateNodeMouseDown$: Subject<INodeMouseDown>
  updateNodeClick$: Subject<INodeMouseDown>
}

class NodeEventManage extends Disposable {
  private _node?: INode
  private _tinyFlowchart: ITinyFlowchart
  private _dragFrameMgr: IDragFrameManage
  private _refLineMgr: IRefLineManage
  private _connectionMgr: IConnectionManage
  private _settingMgr: ISettingManage
  private _zoomMgr: IZoomManage
  private _storageMgr: IStorageManage
  private _zoom: number = 1
  private _mouseDownX: number = 0
  private _mouseDownY: number = 0
  private _magneticOffsetX = 0
  private _magneticOffsetY = 0
  private _dragTargetGroup: null | INodeGroup = null
  private _isDragOutFromGroup = false
  private _isRemoveFromGroup = false
  private _isDragEnterToGroup = false
  private _activeNodes: INode[] = []
  updateNodeMouseDown$ = new Subject<INodeMouseDown>()
  updateNodeClick$ = new Subject<INodeMouseDown>()
  private _onMouseMove: (e: MouseEvent) => void
  private _onMouseUp: (e: MouseEvent) => void

  constructor(tinyFlowchart: ITinyFlowchart) {
    super()
    this._tinyFlowchart = tinyFlowchart
    this._zoomMgr = tinyFlowchart._zoomMgr
    this._storageMgr = tinyFlowchart._storageMgr
    this._dragFrameMgr = tinyFlowchart._dragFrameMgr
    this._refLineMgr = tinyFlowchart._refLineMgr
    this._connectionMgr = tinyFlowchart._connectionMgr
    this._settingMgr = tinyFlowchart._settingMgr
    this._onMouseUp = this.onMouseUp.bind(this)
    this._onMouseMove = this.onMouseMove.bind(this)
    this._disposables.push(this.updateNodeMouseDown$)
    this._disposables.push(this.updateNodeClick$)
    if (!this._settingMgr.get('enableMiniMap')) {
      this.initEvent()
    }
  }

  initEvent() {
    this.updateNodeMouseDown$.subscribe((target: INodeMouseDown) => {
      if (target.node) {
        this._node = target.node
        this.handleMouseDown(target.node, target.e as ElementEvent)
      }
    })

    this.updateNodeClick$.subscribe((target: INodeMouseDown) => {
      if (target.node) {
        this.handleClick(target.node)
      }
    })
  }

  private isNodeSelectedInActiveNodes(node: INode): boolean {
    return this._activeNodes.some(activeNode => activeNode.id === node.id)
  }

  private handleMouseDown(node: INode, e: ElementEvent) {
    this._mouseDownX = e.offsetX
    this._mouseDownY = e.offsetY

    // 判断当前节点是否被选中，如果没有被选中，则清除其他节点的选中状态，并将当前节点设为选中状态
    this._activeNodes = this._storageMgr.getActiveNodes()

    const isNodeInActive = this.isNodeSelectedInActiveNodes(node)

    if (isNodeInActive) {
      this._activeNodes.forEach(n => n.setOldPosition())
    } else {
      this._tinyFlowchart.unActive()
      node.active()
      node.setOldPosition()
      this._activeNodes = this._storageMgr.getActiveNodes()
    }

    this._zoom = this._zoomMgr.getZoom()
    const [minX, minY] = getMinPosition(this._activeNodes)
    this._dragFrameMgr.updatePosition(minX, minY)

    const { width, height } = getBoundingBox(this._activeNodes)

    this._dragFrameMgr.initSize(width, height)

    this._refLineMgr.cacheRefLines()
    document.addEventListener('mousemove', this._onMouseMove)
    document.addEventListener('mouseup', this._onMouseUp)
  }

  private handleClick(node: INode) {
    console.log('shape click', node)
    this._tinyFlowchart.unActive()
    this._connectionMgr.unActive()
    node.active()
  }

  onMouseMove(e: MouseEvent) {
    const nodeName = (e.target as HTMLElement).nodeName
    if (nodeName !== 'CANVAS') return

    const stepX = e.offsetX - this._mouseDownX
    const stepY = e.offsetY - this._mouseDownY

    const [minX, minY] = getMinPosition(this._activeNodes)
    this._dragFrameMgr.updatePosition(minX + stepX / this._zoom, minY + stepY / this._zoom)
    this._dragFrameMgr.show()

    if (this._activeNodes.length === 1) {
      // 限制组之间拖动只允许一个节点
      const { isDragOutFromGroup, dragTargetGroup, isRemoveFromGroup, isDragEnterToGroup } =
        this._dragFrameMgr.intersectWidthGroups(this._node as INode)
      this._isDragOutFromGroup = isDragOutFromGroup
      this._dragTargetGroup = dragTargetGroup
      this._isRemoveFromGroup = isRemoveFromGroup
      this._isDragEnterToGroup = isDragEnterToGroup
    }

    const magneticOffset = this._refLineMgr.updateRefLines()
    this._magneticOffsetX = magneticOffset.magneticOffsetX
    this._magneticOffsetY = magneticOffset.magneticOffsetY
  }

  onMouseUp(e: MouseEvent) {
    this._dragFrameMgr.hide()
    this._refLineMgr.clearRefPointAndRefLines()
    // 取消事件监听
    document.removeEventListener('mousemove', this._onMouseMove)
    document.removeEventListener('mouseup', this._onMouseUp)

    const offsetX = (e.offsetX - this._mouseDownX) / this._zoom + this._magneticOffsetX / this._zoom
    const offsetY = (e.offsetY - this._mouseDownY) / this._zoom + this._magneticOffsetY / this._zoom

    if (this._isDragOutFromGroup && this._dragTargetGroup) {
      // 将一个节点从一个组拖到另一个组
      this._tinyFlowchart.execute('dragOutToGroup', {
        targetGroup: this._dragTargetGroup,
        node: this._node,
        offsetX,
        offsetY
      })
    } else if (this._isRemoveFromGroup) {
      // 将一个节点从一个组移除
      this._tinyFlowchart.execute('removeNodeFromGroup', {
        node: this._node,
        offsetX,
        offsetY
      })
    } else if (this._isDragEnterToGroup && this._dragTargetGroup) {
      // 将一个节点从外部拖入一个组
      this._tinyFlowchart.execute('dragEnterToGroup', {
        targetGroup: this._dragTargetGroup,
        node: this._node,
        offsetX,
        offsetY
      })
    } else if (offsetX !== 0 || offsetY !== 0) {
      this._tinyFlowchart.execute('moveNodes', { nodes: this._activeNodes, offsetX, offsetY })
    }

    this._magneticOffsetX = 0
    this._magneticOffsetY = 0

    this._activeNodes.forEach(n => {
      if (n.nodeType === NodeType.Shape) {
        ;(n as IShape).controlFrame.active()
      }
    })
  }
}

export { NodeEventManage }
