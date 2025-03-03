import { getBoundingBox, getMinPosition } from './utils'

import type {
  Element,
  ElementEvent,
  IIocEditor,
  IShape,
  INode,
  INodeGroup,
  ISettingManage,
  IZoomManage,
  IControlFrameManage,
  IStorageManage,
  IDragFrameManage,
  IRefLineManage,
  IConnectionManage,
  ISceneManage
} from '@/index'

class NodeEventManage {
  private _node: INode
  private _iocEditor: IIocEditor
  private _dragFrameMgr: IDragFrameManage
  private _refLineMgr: IRefLineManage
  private _connectionMgr: IConnectionManage
  private _sceneMgr: ISceneManage
  private _settingMgr: ISettingManage
  private _zoomMgr: IZoomManage
  private _storageMgr: IStorageManage
  private _controlFrameMgr: IControlFrameManage
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
  private _onMouseMove: (e: MouseEvent) => void
  private _onMouseUp: (e: MouseEvent) => void

  constructor(node: INode, iocEditor: IIocEditor) {
    this._iocEditor = iocEditor
    this._node = node
    this._zoomMgr = iocEditor._zoomMgr
    this._storageMgr = iocEditor._storageMgr
    this._dragFrameMgr = iocEditor._dragFrameMgr
    this._refLineMgr = iocEditor._refLineMgr
    this._connectionMgr = iocEditor._connectionMgr
    this._sceneMgr = iocEditor._sceneMgr
    this._settingMgr = iocEditor._settingMgr
    this._controlFrameMgr = iocEditor._controlFrameMgr
    this._onMouseUp = this.onMouseUp.bind(this)
    this._onMouseMove = this.onMouseMove.bind(this)

    if (!this._settingMgr.get('enableMiniMap')) {
      this.initEvent()
    }
  }

  initEvent() {
    ;(this._node as Element).on('mousedown', this.handleMouseDown.bind(this))
    ;(this._node as Element).on('click', this.handleClick.bind(this))
    ;(this._node as Element).on('mouseover', this.handleMouseOver.bind(this))
    ;(this._node as Element).on('mouseout', this.handleMouseOut.bind(this))
  }

  private isNodeSelectedInActiveNodes(node: INode): boolean {
    return this._activeNodes.some(activeNode => activeNode.id === node.id)
  }

  private handleMouseDown(e: ElementEvent) {
    this._mouseDownX = e.offsetX
    this._mouseDownY = e.offsetY

    // 判断当前节点是否被选中，如果没有被选中，则清除其他节点的选中状态，并将当前节点设为选中状态
    this._activeNodes = this._storageMgr.getActiveNodes()

    const isNodeInActive = this.isNodeSelectedInActiveNodes(this._node)

    if (isNodeInActive) {
      this._activeNodes.forEach(n => n.setOldPosition())
    } else {
      this._sceneMgr.unActive()
      this._node.active()
      this._node.setOldPosition()
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

  private handleClick() {
    console.log('shape click', this._node)
    this._sceneMgr.unActive()
    this._connectionMgr.unActive()
    this._node.active()
    if (this._node.nodeType === 'Shape') {
      this._controlFrameMgr.active(this._node as IShape)
    }
    this._sceneMgr.updateSelectNode$.next(this._node)
  }

  private handleMouseOver() {
    this._node.anchor.show()
    this._node.setCursor('move')
  }

  private handleMouseOut() {
    if (!this._node.selected) {
      this._node.anchor.hide()
    }
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
        this._dragFrameMgr.intersectWidthGroups(this._node)
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
      this._iocEditor.execute('dragOutToGroup', {
        targetGroup: this._dragTargetGroup,
        node: this._node,
        offsetX,
        offsetY
      })
    } else if (this._isRemoveFromGroup) {
      // 将一个节点从一个组移除
      this._iocEditor.execute('removeNodeFromGroup', {
        node: this._node,
        offsetX,
        offsetY
      })
    } else if (this._isDragEnterToGroup && this._dragTargetGroup) {
      // 将一个节点从外部拖入一个组
      this._iocEditor.execute('dragEnterToGroup', {
        targetGroup: this._dragTargetGroup,
        node: this._node,
        offsetX,
        offsetY
      })
    } else if (offsetX !== 0 || offsetY !== 0) {
      this._iocEditor.execute('moveNodes', { nodes: this._activeNodes, offsetX, offsetY })
    }

    this._controlFrameMgr.unActive()
    this._magneticOffsetX = 0
    this._magneticOffsetY = 0
  }
}

export { NodeEventManage }
