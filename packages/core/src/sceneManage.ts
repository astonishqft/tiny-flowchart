import * as zrender from 'zrender'
import { injectable, inject } from 'inversify'
import IDENTIFIER from './constants/identifiers'
import { Disposable } from './disposable'

import type { IDisposable } from './disposable'
import type { IShape, IAnchorPoint } from './shapes'
import type { IGridManage } from './gridManage'
import type { IViewPortManage } from './viewPortManage'
import type { IShapeManage } from './shapeManage'
import type { IZoomManage } from './zoomManage'
import type { IConnectionManage } from './connectionManage'
import type { IConnection, IControlPoint } from './connection'
import type { ISelectFrameManage } from './selectFrameManage'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IGroupManage } from './groupManage'

export interface ISceneManage extends IDisposable {
  _zr: zrender.ZRenderType | null
  init(zr: zrender.ZRenderType): void
  addShape(type: string, options: { x: number, y: number }): void
  clear(): void
}

export type IMouseEvent = zrender.Element & { nodeType?: string }

@injectable()
class SceneManage extends Disposable {
  _zr: zrender.ZRenderType | null = null
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage,
    @inject(IDENTIFIER.GRID_MANAGE) private _gridManage: IGridManage,
    @inject(IDENTIFIER.SHAPE_MANAGE) private _shapeManage: IShapeManage,
    @inject(IDENTIFIER.ZOOM_MANAGE) private _zoomManage: IZoomManage,
    @inject(IDENTIFIER.CONNECTION_MANAGE) private _connectionManage: IConnectionManage,
    @inject(IDENTIFIER.SELECT_FRAME_MANAGE) private _selectFrameManage: ISelectFrameManage,
    @inject(IDENTIFIER.GROUP_MANAGE) private _groupManage: IGroupManage
  ) {
    super()
  }

  addShape(type: string, options: { x: number, y: number }) {
    this._shapeManage.createShape(type, options)
  }

  clear() {
    this._connectionManage.clear()
    this._shapeManage.clear()
  }

  init(zr: zrender.ZRenderType) {
    this._zr = zr
    this._viewPortManage.addSelfToZr(this._zr)
    this.initEvent()
  }

  getShapes(): IShape[] {
    return this._shapeManage.getShapes()
  }

  getActiveShapes() {
    return this.getShapes().filter((shape: IShape) => {
      return shape.selected
    })
  }

  setCursorStyle(cursor: string) {
    this._zr?.setCursorStyle(cursor)
  }

  initEvent() {
    let selectShape: IShape | INodeGroup | null = null
    let startX = 0
    let startY = 0
    let offsetX = 0
    let offsetY = 0
    let drag = false
    let oldViewPortX = this._viewPortManage.getPositionX()
    let oldViewPortY = this._viewPortManage.getPositionY()
    let dragModel = 'canvas'
    let connection: IConnection | null = null
    let selectFrameStatus = false
    let zoom = 1
    let targetShapes: IShape[] = [] // 当前选中的节点，拖拽移动的节点，需要考虑单独移动一个节点和框选中多个节点进行批量移动
    let isIntersect = false // 当从一个group里面往外拖动一个节点时，判断这个节点是否和Group的边界相交，也就是是否已经将这个节点拖动到Group外面

    this._zr?.on('mousedown', (e: zrender.ElementEvent) => {
      drag = true
      startX = e.offsetX
      startY = e.offsetY
      if (e.target) {
        drag = false
      }
      oldViewPortX = this._viewPortManage.getPositionX()
      oldViewPortY = this._viewPortManage.getPositionY()
      zoom = this._zoomManage.getZoom()
      selectFrameStatus = this._selectFrameManage.getSelectFrameStatus() // 是否是选中框
      if (selectFrameStatus) {
        this._selectFrameManage.setPosition((startX - oldViewPortX) / zoom, (startY - oldViewPortY) / zoom)
        this._selectFrameManage.resize(0, 0)
        this._selectFrameManage.show()
      }

      // if (e.target && (e.target as IShape).nodeType === 'node') {
      //   // 当选中的是 shape 节点
      //   selectShape = e.target as IShape
      //   dragModel = 'shape'
      // } else if (e.target && e.target.parent && e.target.parent.__hostTarget && (e.target.parent.__hostTarget as IShape).nodeType  === 'node') {
      //   // 当选中的是 shape 中的文本
      //   selectShape = e.target.parent.__hostTarget as IShape
      //   dragModel = 'shape'
      // } else if (e.target && (e.target as IZrenderGroup).nodeType === 'nodeGroup') {
      //   selectShape = e.target.parent as unknown as INodeGroup
      //   dragModel = 'nodeGroup'
      // }

      // if (['shape', 'nodeGroup'].includes(dragModel)) {
      //   if (this._shapeManage.isInActiveShape(selectShape as IShape)) {
      //     targetShapes = [...this._shapeManage.getActiveShapes()]
      //   } else if (dragModel === 'nodeGroup') {
      //     const nodeGroup = e.target.parent as unknown as INodeGroup
      //     targetShapes = [...(e.target.parent as unknown as INodeGroup).activeShapes, nodeGroup]
      //   } else {
      //     targetShapes = [selectShape as IShape]
      //   }

      //   targetShapes.forEach((shape: IShape) => {
      //     shape.oldX = shape.x
      //     shape.oldY = shape.y
      //   })
    
      //   // 创建参考线
      //   this._refLineManage.cacheRefLines()
      // }

      // 选中锚点
      if (e.target && (e.target as IAnchorPoint).mark === 'anch') {
        dragModel = 'anchor'
        connection = this._connectionManage.createConnection((e.target as IAnchorPoint).node)
        connection.setFromPoint((e.target as IAnchorPoint).point)
        connection.addSelfToViewPort(this._viewPortManage.getViewPort())
      }

      if (e.target && (e.target as IControlPoint).mark === 'controlPoint') {
        dragModel = 'controlPoint'
      }

      if (!e.target) {
        // 如果什么都没选中的话
        this._shapeManage.unActive()
        this._groupManage.unActive()
        dragModel = 'scene'
      }
    })

    this._zr?.on('mousemove', (e) => {
      offsetX = e.offsetX - startX
      offsetY = e.offsetY - startY
      // 拖拽节点
      // if (['shape', 'nodeGroup'].includes(dragModel)) {
      //   // this.setCursorStyle('move')
      //   (selectShape as IShape).anchor?.show()
      //   // 设置一个阈值，避免鼠标发生轻微位移时出现拖动浮层
      //   if (Math.abs(offsetX / zoom) > 2 || Math.abs(offsetY / zoom) > 2) {

      //     const boundingBox = this._shapeManage.getShapesBoundingBox(targetShapes)
      //     this._dragFrameManage.initSize(boundingBox.width, boundingBox.height)
      //     this._dragFrameManage.updatePosition(
      //       this._shapeManage.getMinPosition(targetShapes)[0] + offsetX / zoom,
      //       this._shapeManage.getMinPosition(targetShapes)[1] + offsetY / zoom
      //     )

      //     const pGroup = targetShapes[0].parentGroup
      //     if (pGroup) {
      //       pGroup.setIntersectStatus(isIntersect)
      //     }

      //     // 拖拽浮层的时候同时更新对其参考线
      //     const magneticOffset = this._refLineManage.updateRefLines()
      //     magneticOffsetX = magneticOffset.magneticOffsetX
      //     magneticOffsetY = magneticOffset.magneticOffsetY
      //   }
      // }

      if (dragModel === 'anchor') {
        connection?.move((e.offsetX - oldViewPortX) / zoom, (e.offsetY - oldViewPortY) / zoom)
        this.setCursorStyle('crosshair')
      }

      // 拖拽画布(利用的原理是改变Group的 position 坐标)
      if (drag && dragModel === 'scene' && !selectFrameStatus) { // TODO: 排除没有点击到节点的情况，后续需要继续排除点击到连线等情况
        this.setCursorStyle('grabbing')
        this._viewPortManage.setPosition(oldViewPortX + offsetX, oldViewPortY + offsetY)
        this._gridManage.drawGrid(zoom)
      }

      if (selectFrameStatus) {
        // 框选
        this._selectFrameManage.resize(offsetX / zoom, offsetY / zoom)
      }
    })

    this._zr?.on('mouseup', (e) => {
      const zoom = this._zoomManage.getZoom()
      drag = false
      // if (['shape', 'nodeGroup'].includes(dragModel)) {
      //   targetShapes.forEach(s => {
      //     s?.attr('x', s.oldX! + (e.offsetX - startX) / zoom + magneticOffsetX / zoom)
      //     s?.attr('y', s.oldY! + (e.offsetY - startY) / zoom + magneticOffsetY / zoom)
      //     // 更新连线
      //     this._connectionManage.refreshConnection(s)
      //     // 如果存在父组节点，需要更新组的坐标
      //     if (s.parentGroup as INodeGroup) {
      //       const pos = this._shapeManage.getMinPosition(s.parentGroup!.activeShapes)
      //       const { width, height } = this._shapeManage.getShapesBoundingBox(s.parentGroup!.activeShapes)
      //       s.parentGroup!.updateBoundingBox(pos[0], pos[1], width, height)
      //       s.parentGroup!.refresh()
      //       // 更新组的连线
      //       this._connectionManage.refreshConnection(s.parentGroup!)
      //       if (s.parentGroup?.canRemove) {
      //         s.parentGroup.removeShapeFromGroup(s)
      //       }
     
      //     }
      //   })

      //   this._refLineManage.clearRefPointAndRefs()
      //   magneticOffsetX = 0
      //   magneticOffsetY = 0
      //   this._dragFrameManage.hide()
      //   selectShape = null
      // }

      if (e.target && (e.target as IAnchorPoint).mark === 'anch' && connection && ((e.target as IAnchorPoint).node !== connection.fromNode)) { // 禁止和自身相连
        // 创建连线
        connection.setToPoint((e.target as IAnchorPoint).point)
        connection.connect((e.target as IAnchorPoint).node)
        this._connectionManage.addConnection(connection)
      }

      if (connection) {
        connection.cancel()
      }

      if (selectFrameStatus) {
        this._selectFrameManage.multiSelect()
        this._selectFrameManage.setSelectFrameStatus(false)
        this._selectFrameManage.hide()
      }

      targetShapes = []
      dragModel = 'scene'
    })
  }
}

export { SceneManage }
