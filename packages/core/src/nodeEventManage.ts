import Eventful from 'zrender/lib/core/Eventful'
import { getBoundingBox, getMinPosition } from './utils'

import type { IIocEditor } from './iocEditor'
import type { IShape, INode } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IDragFrameManage } from './dragFrameManage'
import type { IRefLineManage } from './refLineManage'
import type { IConnectionManage } from './connectionManage'
import type { ISceneManage } from './sceneManage'
import type { ISettingManage } from './settingManage'
import type { IZoomManage } from './zoomManage'
import type { IControlFrameManage } from './controlFrameManage'
import type { IStorageManage } from './storageManage'

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
    ;(this._node as Eventful).on('mousedown', e => {
      this._mouseDownX = e.offsetX
      this._mouseDownY = e.offsetY

      if (
        this._storageMgr
          .getActiveNodes()
          .map(s => s.id)
          .includes(this._node.id)
      ) {
        this._activeNodes = this._storageMgr.getActiveNodes()
        this._activeNodes.forEach(node => node.setOldPosition())
      } else {
        this._activeNodes = [this._node]
        this._node.setOldPosition()
      }

      this._zoom = this._zoomMgr.getZoom()
      this._dragFrameMgr.updatePosition(
        getMinPosition(this._activeNodes)[0],
        getMinPosition(this._activeNodes)[1]
      )

      const { width, height } = getBoundingBox(this._activeNodes)

      this._dragFrameMgr.initSize(width, height)

      this._refLineMgr.cacheRefLines()
      document.addEventListener('mousemove', this._onMouseMove)
      document.addEventListener('mouseup', this._onMouseUp)
    })
    // 节点左键单击事件
    ;(this._node as Eventful).on('click', () => {
      console.log('shape click', this._node)
      this._sceneMgr.unActive()
      this._connectionMgr.unActiveConnections()
      this._node.active()
      if (this._node.nodeType === 'Shape') {
        this._controlFrameMgr.active(this._node as IShape)
      }
      this._sceneMgr.updateSelectNode$.next(this._node)
    })
    ;(this._node as Eventful).on('mouseover', () => {
      this._node.anchor.show()
      this._node.setCursor('move')
    })
    ;(this._node as Eventful).on('mouseout', () => {
      if (this._node.selected) return
      this._node.anchor.hide()
    })
  }

  onMouseMove(e: MouseEvent) {
    const nodeName = (e.target as HTMLElement).nodeName
    if (nodeName !== 'CANVAS') return
    const { offsetX, offsetY } = e
    const stepX = offsetX - this._mouseDownX
    const stepY = offsetY - this._mouseDownY

    this._dragFrameMgr.updatePosition(
      getMinPosition(this._activeNodes)[0] + stepX / this._zoom,
      getMinPosition(this._activeNodes)[1] + stepY / this._zoom
    )
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
    // 拖拽浮层的时候同时更新对其参考线
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
    } else {
      if (offsetX === 0 && offsetY === 0) return // 避免点击Group时发生轻微移动
      this._iocEditor.execute('moveNodes', { nodes: this._activeNodes, offsetX, offsetY })
      this._activeNodes = []
    }

    this._controlFrameMgr.unActive()
    this._magneticOffsetX = 0
    this._magneticOffsetY = 0
  }
}

export { NodeEventManage }
