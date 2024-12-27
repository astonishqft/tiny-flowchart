import * as zrender from 'zrender'
import { Disposable } from './disposable'
import { Subject } from 'rxjs'

import type { IDisposable } from './disposable'
import type { IAnchorPoint, IControlPoint, IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IViewPortManage } from './viewPortManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IGroupManage } from './groupManage'
import type { IStorageManage } from './storageManage'
import type { IocEditor } from './iocEditor'
import type { ISettingManage } from './settingManage'
import type { IZoomManage } from './zoomManage'
import type { IControlFrameManage } from './controlFrameManage'

export interface ISceneManage extends IDisposable {
  _zr: zrender.ZRenderType
  updateSelectScene$: Subject<null>
  updateSelectNode$: Subject<IShape | INodeGroup>
  setCursorStyle(type: string): void
  init(): void
  clear(): void
  unActive(): void
}

export type IMouseEvent = zrender.Element & { nodeType?: string }

class SceneManage extends Disposable {
  private _iocEditor: IocEditor
  private _viewPortMgr: IViewPortManage
  private _shapeMgr: IShapeManage
  private _connectionMgr: IConnectionManage
  private _selectFrameMgr: ISelectFrameManage
  private _groupMgr: IGroupManage
  private _storageMgr: IStorageManage
  private _settingMgr: ISettingManage
  private _zoomMgr: IZoomManage
  private _controlFrameMgr: IControlFrameManage
  private _enableMiniMap
  _zr: zrender.ZRenderType
  updateSelectScene$ = new Subject<null>()
  updateSelectNode$ = new Subject<IShape | INodeGroup>()
  constructor(iocEditor: IocEditor) {
    super()
    this._zr = iocEditor._zr
    this._iocEditor = iocEditor
    this._connectionMgr = iocEditor._connectionMgr
    this._storageMgr = iocEditor._storageMgr
    this._zoomMgr = iocEditor._zoomMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._shapeMgr = iocEditor._shapeMgr
    this._groupMgr = iocEditor._groupMgr
    this._settingMgr = iocEditor._settingMgr
    this._controlFrameMgr = iocEditor._controlFrameMgr
    this._selectFrameMgr = iocEditor._selectFrameMgr
    this._disposables.push(this.updateSelectScene$)
    this._disposables.push(this.updateSelectNode$)
    this._enableMiniMap = this._settingMgr.get('enableMiniMap')
  }

  clear() {
    this._connectionMgr.clear()
    this._shapeMgr.clear()
    this._groupMgr.clear()
  }

  init() {
    this._viewPortMgr.addSelfToZr(this._zr)
    if (this._enableMiniMap) return
    this.initEvent()
  }

  getActiveShapes() {
    return this._storageMgr.getShapes().filter(shape => shape.selected)
  }

  setCursorStyle(cursor: string) {
    this._zr.setCursorStyle(cursor)
  }

  initEvent() {
    let startX = 0
    let startY = 0
    let offsetX = 0
    let offsetY = 0
    let drag = false
    let [oldViewPortX, oldViewPortY] = this._viewPortMgr.getPosition()
    let dragModel = 'canvas'
    let fromAnchorPoint: IAnchorPoint | null = null
    let selectFrameStatus = false
    let zoom = 1

    this._zr.on('mousedown', (e: zrender.ElementEvent) => {
      drag = true
      startX = e.offsetX
      startY = e.offsetY
      if (e.target) {
        drag = false
      }
      oldViewPortX = this._viewPortMgr.getPosition()[0]
      oldViewPortY = this._viewPortMgr.getPosition()[1]
      zoom = this._zoomMgr.getZoom()
      selectFrameStatus = this._selectFrameMgr.getSelectFrameStatus() // 是否是选中框
      if (selectFrameStatus) {
        this._selectFrameMgr.setPosition(
          (startX - oldViewPortX) / zoom,
          (startY - oldViewPortY) / zoom
        )
        this._selectFrameMgr.resize(0, 0)
        this._selectFrameMgr.show()
      }

      // 选中锚点
      if (e.target && (e.target as IAnchorPoint).mark === 'anch') {
        dragModel = 'anchor'
        fromAnchorPoint = e.target as IAnchorPoint
        this._connectionMgr.createTmpConnection(fromAnchorPoint)
      }

      if (e.target && (e.target as IControlPoint).mark === 'controlPoint') {
        dragModel = 'controlPoint'
      }

      this._iocEditor.sceneDragStart$.next({ startX, startY, oldViewPortX, oldViewPortY })

      if (!e.target) {
        // 如果什么都没选中的话
        this.unActive()
        this._connectionMgr.unActiveConnections()
        dragModel = 'scene'
        this.updateSelectScene$.next(null)
      }
    })

    let time = 0
    this._zr.on('mousemove', e => {
      if (time && Date.now() - time < 16) return
      time = Date.now()
      offsetX = e.offsetX - startX
      offsetY = e.offsetY - startY

      if (dragModel === 'anchor') {
        this._connectionMgr.moveTmpConnection(
          (e.offsetX - oldViewPortX) / zoom,
          (e.offsetY - oldViewPortY) / zoom
        )
        this.setCursorStyle('crosshair')
      }

      // 拖拽画布(利用的原理是改变Group的 position 坐标)
      if (drag && dragModel === 'scene' && !selectFrameStatus) {
        // TODO: 排除没有点击到节点的情况，后续需要继续排除点击到连线等情况
        // this.setCursorStyle('grabbing')
        this._iocEditor.sceneDragMove$.next({
          x: offsetX + oldViewPortX,
          y: offsetY + oldViewPortY,
          offsetX,
          offsetY
        })
      }

      if (selectFrameStatus) {
        // 框选
        this._selectFrameMgr.resize(offsetX / zoom, offsetY / zoom)
      }
    })

    this._zr.on('mouseup', e => {
      drag = false

      if (
        e.target &&
        (e.target as IAnchorPoint).mark === 'anch' &&
        fromAnchorPoint &&
        (e.target as IAnchorPoint).node !== fromAnchorPoint.node
      ) {
        // 禁止和自身相连
        // 创建连线
        const connection = this._connectionMgr.createConnection(
          fromAnchorPoint,
          e.target as IAnchorPoint
        )
        this._iocEditor.execute('addConnection', { connection })
      }

      if (dragModel === 'anchor') {
        // 取消连线创建的临时直线
        this._connectionMgr.removeTmpConnection()
      }

      if (selectFrameStatus) {
        this._selectFrameMgr.multiSelect()
        this._selectFrameMgr.setSelectFrameStatus(false)
        this._selectFrameMgr.hide()
      }

      this._iocEditor.sceneDragEnd$.next()

      dragModel = 'scene'
    })
  }

  unActive() {
    this._storageMgr.getNodes().forEach(node => {
      node.unActive()
    })
    this._controlFrameMgr.unActive()
  }
}

export { SceneManage }
