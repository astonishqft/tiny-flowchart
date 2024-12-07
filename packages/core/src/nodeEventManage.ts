import Eventful from 'zrender/lib/core/Eventful'
import { IocEditor } from './iocEditor'

import type { IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IStorageManage } from './storageManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IRefLineManage } from './refLineManage'
import type { IConnectionManage } from './connectionManage'
import type { ISceneManage } from './sceneManage'
import type { ISettingManage } from './settingManage'

class NodeEventManage {
  private _node: IShape | INodeGroup
  private _iocEditor: IocEditor
  private _storageMgr: IStorageManage
  private _dragFrameMgr: IDragFrameManage
  private _refLineMgr: IRefLineManage
  private _connectionMgr: IConnectionManage
  private _sceneMgr: ISceneManage
  private _settingMgr: ISettingManage
  private _zoom: number = 1
  private _mouseDownX: number = 0
  private _mouseDownY: number = 0
  private _magneticOffsetX = 0
  private _magneticOffsetY = 0
  private _dragTargetGroup: null | INodeGroup = null
  private _isDragOutFromGroup = false
  private _isRemoveFromGroup = false
  private _isDragEnterToGroup = false
  private _onMouseMove: (e: MouseEvent) => void
  private _onMouseUp: (e: MouseEvent) => void

  constructor(node: IShape | INodeGroup, iocEditor: IocEditor) {
    this._iocEditor = iocEditor
    this._node = node
    this._storageMgr = iocEditor._storageMgr
    this._dragFrameMgr = iocEditor._dragFrameMgr
    this._refLineMgr = iocEditor._refLineMgr
    this._connectionMgr = iocEditor._connectionMgr
    this._sceneMgr = iocEditor._sceneMgr
    this._settingMgr = iocEditor._settingMgr
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
      this._node.setOldPosition()
      this._zoom = this._storageMgr.getZoom()
      this._dragFrameMgr.updatePosition(this._node.x, this._node.y)
      this._dragFrameMgr.show()
      const { width, height } = this._node.getBoundingBox()
      this._dragFrameMgr.initSize(width, height)

      this._refLineMgr.cacheRefLines()
      document.addEventListener('mousemove', this._onMouseMove)
      document.addEventListener('mouseup', this._onMouseUp)
    })
    ;(this._node as Eventful).on('click', () => {
      console.log('shape click', this._node)
      this._sceneMgr.unActive()
      this._connectionMgr.unActiveConnections()
      this._node.active()
      this._sceneMgr.updateSelectNode$.next(this._node)
    })
    ;(this._node as Eventful).on('mousemove', () => {
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
    // 设置一个阈值，避免鼠标发生轻微位移时出现拖动浮层
    if (Math.abs(offsetX / this._zoom) > 2 || Math.abs(offsetY / this._zoom) > 2) {
      this._dragFrameMgr.updatePosition(
        this._node.x + stepX / this._zoom,
        this._node.y + stepY / this._zoom
      )
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

    this._node.updatePosition(
      (e.offsetX - this._mouseDownX) / this._zoom + this._magneticOffsetX / this._zoom,
      (e.offsetY - this._mouseDownY) / this._zoom + this._magneticOffsetY / this._zoom
    )
    this._connectionMgr.refreshConnection(this._node)

    this._refLineMgr.clearRefPointAndRefLines()
    this._magneticOffsetX = 0
    this._magneticOffsetY = 0
    // 取消事件监听
    document.removeEventListener('mousemove', this._onMouseMove)
    document.removeEventListener('mouseup', this._onMouseUp)

    if (this._isDragOutFromGroup && this._dragTargetGroup) {
      this.removeShapeFromGroup(this._node)
      this.addShapeToGroup(this._node, this._dragTargetGroup)
    }

    if (this._isRemoveFromGroup) {
      this.removeShapeFromGroup(this._node)
    }
    if (this._isDragEnterToGroup && this._dragTargetGroup) {
      this.addShapeToGroup(this._node, this._dragTargetGroup)
    }

    this.updateGroupSize(this._node)

    this._iocEditor.updateMiniMap$.next()
  }

  removeShapeFromGroup(node: INodeGroup | IShape) {
    if (node.parentGroup) {
      if (node.parentGroup!.shapes.length === 1) return // 确保组内至少有一个元素
      node.parentGroup!.shapes = node.parentGroup!.shapes.filter(item => item.id !== node.id)
      node.parentGroup!.resizeNodeGroup()
      this._connectionMgr.refreshConnection(node.parentGroup)
      delete node.parentGroup
    }
  }

  addShapeToGroup(node: IShape | INodeGroup, targetGroup: INodeGroup) {
    node.setZ(targetGroup.z + 1)
    node.parentGroup = targetGroup
    targetGroup.shapes.push(node)
    targetGroup.resizeNodeGroup()
  }

  updateGroupSize(node: IShape | INodeGroup) {
    if (node.parentGroup) {
      node.parentGroup.resizeNodeGroup()
      this._connectionMgr.refreshConnection(node.parentGroup)
      this.updateGroupSize(node.parentGroup)
    }
  }
}

export { NodeEventManage }
