import * as zrender from 'zrender'
import { injectable, inject } from 'inversify'
import type { IShape } from './shapes'
import type { IDragFrameManage  } from './dragFrameManage'
import type { IGridManage } from './gridManage'
import IDENTIFIER from './constants/identifiers'

export interface ILayerManage extends zrender.Group {
  _zr: zrender.ZRenderType | null
  initZrender: (container: HTMLElement) => zrender.ZRenderType
  addToLayer: (shape: IShape) => void
  zoomIn: () => void
  zoomOut: () => void
}

export type IMouseEvent = zrender.Element & { nodeType?: string }

@injectable()
class LayerManage extends zrender.Group {
  _zr: zrender.ZRenderType | null = null
  shapes: IShape[] = []
  maxScale = 4
  minScale = 0.4
  scaleStep = 0.2

  constructor(
    @inject(IDENTIFIER.DRAG_FRAME_MANAGE) private _dragFrameManage: IDragFrameManage,
    @inject(IDENTIFIER.GRID_MANAGE) private _gridManage: IGridManage
  ) {
    super()
  }

  addToLayer(shape: IShape) {
    this.add(shape)
    this.shapes.push(shape)
  }

  initZrender(container: HTMLElement) {
    this._zr = zrender.init(container, {})
    this._zr.add(this)
    this.initEvent()
    return this._zr
  }

  unActiveShapes() {
    this.shapes.forEach((shape: IShape) => {
      shape.unActive()
    })
  }

  getActiveShapes() {
    return this.shapes.filter((shape: IShape) => {
      return shape.selected
    })
  }

  setCursorStyle(cursor: string) {
    this._zr?.setCursorStyle(cursor)
  }

  zoomIn() {
    console.log('zoomIn')
  }

  zoomOut() {
    console.log('zoomOut')
  }

  initEvent() {
    let selectShape: IShape | null = null
    let startX = 0
    let startY = 0
    let offsetX = 0
    let offsetY = 0
    let drag = false
    let oldX = 0
    let oldY = 0
    this._zr?.on('mousedown', (e: zrender.ElementEvent) => {
      drag = true
      startX = e.offsetX
      startY = e.offsetY
      oldX = this.x
      oldY = this.y
      const target = e.target as IShape || null

      if (target && (target as IShape).nodeType === 'node') {
        // 当选中的是 shape 节点
        selectShape = target
      } else if (target && target.parent && target.parent.__hostTarget && (target.parent.__hostTarget as IShape).nodeType  === 'node') {
        // 当选中的是 shape 中的文本
        selectShape = target.parent.__hostTarget as IShape
      }

      if (selectShape) {
        selectShape.oldX = selectShape.x
        selectShape.oldY = selectShape.y
      }

      if (!e.target) {
        // 如果什么都没选中的话
        this.unActiveShapes()
      }
    })

    this._zr?.on('mousemove', (e) => {
      offsetX = e.offsetX - startX
      offsetY = e.offsetY - startY
      // 拖拽节点
      if (selectShape) {
        // this.setCursorStyle('move')
        selectShape.anchor?.show()
        // 设置一个阈值，避免鼠标发生轻微位移时出现拖动浮层
        if (Math.abs(offsetX) > 2 || Math.abs(offsetY) > 2) {
          const group = new zrender.Group()
          const boundingBox = group.getBoundingRect([selectShape])
          this._dragFrameManage.initSize(boundingBox.width, boundingBox.height)
          this._dragFrameManage.updatePosition(selectShape.oldX! + offsetX + this.x, selectShape.oldY! + offsetY + this.y)
        }
      }

      // 拖拽画布(利用的原理是改变Group的 position 坐标)
      if (drag && !selectShape) { // TODO: 排除没有点击到节点的情况，后续需要继续排除点击到连线等情况
        this.setCursorStyle('grabbing')
        this.attr('x', oldX + offsetX)
        this.attr('y', oldY + offsetY)
        this._gridManage.updateGrid(-this.x, -this.y)
      }
    })

    this._zr?.on('mouseup', (e) => {
      drag = false
      if (selectShape) {
        selectShape?.attr('x', selectShape.oldX! + e.offsetX - startX)
        selectShape?.attr('y', selectShape.oldY! + e.offsetY - startY)
        this._dragFrameManage.hide()
        // 更新锚点位置
        selectShape.createAnchors()
        selectShape.anchor!.refresh()
        selectShape = null
      }
    })
  }
}

export { LayerManage }
