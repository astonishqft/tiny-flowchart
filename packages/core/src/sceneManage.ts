import * as zrender from 'zrender'
import { Disposable } from './disposable'
import { Subject } from 'rxjs'

import type { IDisposable } from './disposable'
import type { IAnchorPoint, IConnection, IControlPoint, IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IGridManage } from './gridManage'
import type { IViewPortManage } from './viewPortManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IGroupManage } from './groupManage'
import type { IStorageManage } from './storageManage'
import type { IocEditor } from './iocEditor'

export interface ISceneManage extends IDisposable {
  _zr: zrender.ZRenderType | null
  updateSelectScene$: Subject<null>
  updateSelectNode$: Subject<IShape | INodeGroup>
  init(zr: zrender.ZRenderType): void
  addShape(type: string, options: { x: number; y: number }): IShape
  clear(): void
  unActive(): void
}

export type IMouseEvent = zrender.Element & { nodeType?: string }

class SceneManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _gridMgr: IGridManage
  private _shapeMgr: IShapeManage
  private _connectionMgr: IConnectionManage
  private _selectFrameMgr: ISelectFrameManage
  private _groupMgr: IGroupManage
  private _storageMgr: IStorageManage
  _zr: zrender.ZRenderType | null = null
  updateSelectScene$ = new Subject<null>()
  updateSelectNode$ = new Subject<IShape | INodeGroup>()
  constructor(iocEditor: IocEditor) {
    super()
    this._connectionMgr = iocEditor._connectionMgr
    this._gridMgr = iocEditor._gridMgr
    this._storageMgr = iocEditor._storageMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._shapeMgr = iocEditor._shapeMgr
    this._groupMgr = iocEditor._groupMgr
    this._selectFrameMgr = iocEditor._selectFrameMgr
    this._disposables.push(this.updateSelectScene$)
    this._disposables.push(this.updateSelectNode$)
  }

  addShape(type: string, options: { x: number; y: number }) {
    return this._shapeMgr.createShape(type, options)
  }

  clear() {
    this._connectionMgr.clear()
    this._shapeMgr.clear()
    this._groupMgr.clear()
  }

  init(zr: zrender.ZRenderType) {
    this._zr = zr
    this._viewPortMgr.addSelfToZr(this._zr)
    this.initEvent()
  }

  getActiveShapes() {
    return this._storageMgr.getShapes().filter(shape => shape.selected)
  }

  setCursorStyle(cursor: string) {
    this._zr?.setCursorStyle(cursor)
  }

  initEvent() {
    let startX = 0
    let startY = 0
    let offsetX = 0
    let offsetY = 0
    let drag = false
    let oldViewPortX = this._viewPortMgr.getPositionX()
    let oldViewPortY = this._viewPortMgr.getPositionY()
    let dragModel = 'canvas'
    let connection: IConnection | null = null
    let selectFrameStatus = false
    let zoom = 1

    this._zr?.on('mousedown', (e: zrender.ElementEvent) => {
      drag = true
      startX = e.offsetX
      startY = e.offsetY
      if (e.target) {
        drag = false
      }
      oldViewPortX = this._viewPortMgr.getPositionX()
      oldViewPortY = this._viewPortMgr.getPositionY()
      zoom = this._storageMgr.getZoom()
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
        connection = this._connectionMgr.createConnection(e.target as IAnchorPoint)
      }

      if (e.target && (e.target as IControlPoint).mark === 'controlPoint') {
        dragModel = 'controlPoint'
      }

      if (!e.target) {
        // 如果什么都没选中的话
        this.unActive()
        this._connectionMgr.unActiveConnections()
        dragModel = 'scene'
        this.updateSelectScene$.next(null)
      }
    })

    this._zr?.on('mousemove', e => {
      offsetX = e.offsetX - startX
      offsetY = e.offsetY - startY

      if (dragModel === 'anchor') {
        connection?.move((e.offsetX - oldViewPortX) / zoom, (e.offsetY - oldViewPortY) / zoom)
        this.setCursorStyle('crosshair')
      }

      if (!e.target) {
        this.setCursorStyle('grab')
      }

      // 拖拽画布(利用的原理是改变Group的 position 坐标)
      if (drag && dragModel === 'scene' && !selectFrameStatus) {
        // TODO: 排除没有点击到节点的情况，后续需要继续排除点击到连线等情况
        this.setCursorStyle('grabbing')
        this._viewPortMgr.setPosition(oldViewPortX + offsetX, oldViewPortY + offsetY)
        this._gridMgr.setPosition(oldViewPortX + offsetX, oldViewPortY + offsetY)
        this._gridMgr.drawGrid()
      }

      if (selectFrameStatus) {
        // 框选
        this._selectFrameMgr.resize(offsetX / zoom, offsetY / zoom)
      }
    })

    this._zr?.on('mouseup', e => {
      drag = false

      if (
        e.target &&
        (e.target as IAnchorPoint).mark === 'anch' &&
        connection &&
        (e.target as IAnchorPoint).node !== connection.fromNode
      ) {
        // 禁止和自身相连
        // 创建连线
        this._connectionMgr.connect(connection, e.target as IAnchorPoint)
      }

      if (connection) {
        // 取消连线创建的临时直线
        this._connectionMgr.cancelConnect(connection)
        connection = null
      }

      if (selectFrameStatus) {
        this._selectFrameMgr.multiSelect()
        this._selectFrameMgr.setSelectFrameStatus(false)
        this._selectFrameMgr.hide()
      }

      dragModel = 'scene'
    })
  }

  unActive() {
    this._storageMgr.getNodes().forEach(node => {
      node.unActive()
    })
  }
}

export { SceneManage }
