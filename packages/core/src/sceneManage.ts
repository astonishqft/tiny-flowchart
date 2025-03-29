import { Disposable } from '@/disposable'

import { NodeType } from '@/index'

import type {
  ZRenderType,
  Element,
  ElementEvent,
  IShapeManage,
  IConnectionManage,
  ISelectFrameManage,
  IViewPortManage,
  IGroupManage,
  IStorageManage,
  IZoomManage,
  ISettingManage,
  IIocEditor,
  IDisposable,
  IAnchorPoint,
  IShape,
  INodeGroup,
  IControlPoint
} from '@/index'
import type { INodeEventManage } from '@/nodeEventManage'
import type { IResizePoint } from '@/controlFrameManage'

export interface ISceneManage extends IDisposable {
  setCursorStyle(type: string): void
  init(): void
  clear(): void
}

export type IMouseEvent = Element & { nodeType?: string }

class SceneManage extends Disposable {
  private _iocEditor: IIocEditor
  private _viewPortMgr: IViewPortManage
  private _shapeMgr: IShapeManage
  private _connectionMgr: IConnectionManage
  private _selectFrameMgr: ISelectFrameManage
  private _groupMgr: IGroupManage
  private _storageMgr: IStorageManage
  private _settingMgr: ISettingManage
  private _zoomMgr: IZoomManage
  private _nodeEventMgr: INodeEventManage
  private _enableMiniMap
  private _zr: ZRenderType

  private _oldViewPortX = 0
  private _oldViewPortY = 0
  private _mouseDownX = 0
  private _mouseDownY = 0
  private _isDragging = false
  private _mouseMoveOffsetX = 0
  private _mouseMoveOffsetY = 0
  private _currentZoom = 1
  private _eventModel = 'canvas'
  constructor(iocEditor: IIocEditor) {
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
    this._selectFrameMgr = iocEditor._selectFrameMgr
    this._nodeEventMgr = iocEditor._nodeEventMgr
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

  setCursorStyle(cursor: string) {
    this._zr.setCursorStyle(cursor)
  }

  getSelectedNode(x: number, y: number) {
    const [vX, vY] = this._viewPortMgr.mapSceneToViewPort(x, y)

    const selectedNodes: {
      shapes: IShape[]
      groups: INodeGroup[]
    } = {
      shapes: [],
      groups: []
    }
    this._storageMgr.getNodes().forEach(n => {
      if (n.getBoundingBox().contain(vX, vY)) {
        if (n.nodeType === NodeType.Shape) {
          selectedNodes.shapes.push(n as IShape)
        } else {
          selectedNodes.groups.push(n as INodeGroup)
        }
      }
    })

    return selectedNodes
  }

  showAnch(x: number, y: number) {
    const [vX, vY] = this._viewPortMgr.mapSceneToViewPort(x, y)
    this._storageMgr.getNodes().forEach(n => {
      if (n.getBoundingBox().contain(vX, vY)) {
        n.anchor.show()
        n.setCursor('move')
      } else {
        n.anchor.hide()
      }
    })
  }

  initEvent() {
    let fromAnchorPoint: IAnchorPoint | null = null
    let selectFrameStatus = false

    this._zr.on('mousedown', (e: ElementEvent) => {
      this._isDragging = true
      this._mouseDownX = e.offsetX
      this._mouseDownY = e.offsetY
      if (e.target) {
        this._isDragging = false
      }
      this._oldViewPortX = this._viewPortMgr.getPosition()[0]
      this._oldViewPortY = this._viewPortMgr.getPosition()[1]
      this._currentZoom = this._zoomMgr.getZoom()
      selectFrameStatus = this._selectFrameMgr.getSelectFrameStatus() // 是否是选中框
      if (selectFrameStatus) {
        this._selectFrameMgr.init(
          (this._mouseDownX - this._oldViewPortX) / this._currentZoom,
          (this._mouseDownY - this._oldViewPortY) / this._currentZoom
        )
      }

      if (e.target && (e.target as IResizePoint).mark === 'resizePoint') {
        this._eventModel = 'resizePoint'

        return
      }

      // 选中连线
      if (e.target && (e.target as Element & { mark: string }).mark === 'connection') {
        this._eventModel = 'connection'

        return
      }

      if (e.target && (e.target as IControlPoint).mark === 'controlPoint') {
        this._eventModel = 'controlPoint'

        return
      }

      // 选中锚点
      if (e.target && (e.target as IAnchorPoint).mark === 'anch') {
        this._eventModel = 'anchor'
        fromAnchorPoint = e.target as IAnchorPoint
        this._connectionMgr.createTmpConnection(fromAnchorPoint)
        this.setCursorStyle('crosshair')

        return
      }

      this._iocEditor.sceneDragStart$.next({
        startX: this._mouseDownX,
        startY: this._mouseDownY,
        oldViewPortX: this._oldViewPortX,
        oldViewPortY: this._oldViewPortY
      })

      const { shapes, groups } = this.getSelectedNode(e.offsetX, e.offsetY)

      // 选中节点
      if (shapes.length > 0) {
        this._nodeEventMgr.updateNodeMouseDown$.next({ node: shapes[0], e })
        this._eventModel = 'shape'

        return
      }

      // 选中节点组
      if (groups.length > 0 && shapes.length === 0) {
        this._nodeEventMgr.updateNodeMouseDown$.next({ node: groups[0], e })
        this._eventModel = 'group'

        return
      }

      if (!e.target) {
        // 如果什么都没选中的话
        this._iocEditor.unActive()
        this._eventModel = 'scene'
      }
    })

    this._zr.on('mousemove', e => {
      this._mouseMoveOffsetX = e.offsetX - this._mouseDownX
      this._mouseMoveOffsetY = e.offsetY - this._mouseDownY

      if (this._eventModel === 'anchor') {
        this._connectionMgr.moveTmpConnection(
          (e.offsetX - this._oldViewPortX) / this._currentZoom,
          (e.offsetY - this._oldViewPortY) / this._currentZoom
        )
      }

      // 拖拽画布(利用的原理是改变Group的 position 坐标)
      if (this._isDragging && this._eventModel === 'scene' && !selectFrameStatus) {
        this._iocEditor.sceneDragMove$.next({
          x: this._mouseMoveOffsetX + this._oldViewPortX,
          y: this._mouseMoveOffsetY + this._oldViewPortY,
          offsetX: this._mouseMoveOffsetX,
          offsetY: this._mouseMoveOffsetY
        })
      }

      if (selectFrameStatus) {
        // 框选
        this._selectFrameMgr.resize(
          this._mouseMoveOffsetX / this._currentZoom,
          this._mouseMoveOffsetY / this._currentZoom
        )
      }

      if (!this._isDragging) {
        this.showAnch(e.offsetX, e.offsetY)
      }
    })

    this._zr.on('mouseup', e => {
      this._isDragging = false

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
          e.target as IAnchorPoint,
          this._connectionMgr.getConnectionType()
        )
        this._iocEditor.execute('addConnection', { connection })
      }

      if (this._eventModel === 'anchor') {
        // 取消连线创建的临时直线
        this._connectionMgr.removeTmpConnection()
      }

      if (selectFrameStatus) {
        this._selectFrameMgr.multiSelect()
        this._selectFrameMgr.hide()
      }

      this._iocEditor.sceneDragEnd$.next()

      this._eventModel = 'scene'
    })

    this._zr.on('click', e => {
      const { shapes, groups } = this.getSelectedNode(e.offsetX, e.offsetY)

      if (e.target && (e.target as Element & { mark: string }).mark === 'connection') {
        return
      }

      if (shapes.length > 0) {
        this._nodeEventMgr.updateNodeClick$.next({ node: shapes[0], e })

        return
      }

      if (groups.length > 0 && shapes.length === 0) {
        this._nodeEventMgr.updateNodeClick$.next({ node: groups[0], e })

        return
      }

      if (!e.target) {
        this._nodeEventMgr.updateNodeClick$.next({ node: null, e })
      }
    })
  }
}

export { SceneManage }
