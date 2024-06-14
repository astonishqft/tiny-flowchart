import * as zrender from 'zrender'
import { injectable } from 'inversify'
import type { IShape } from './types/interfaces/i-shape'

export interface ILayerManage extends zrender.Group {
  // _zr: zrender.ZRenderType | null
  initZrender: (container: HTMLElement) => zrender.ZRenderType
  addToLayer: (shape: IShape) => void
}

export type IMouseEvent = zrender.Element & { nodeType?: string }

@injectable()
class LayerManage extends zrender.Group {
  private _zr: zrender.ZRenderType | null = null
  shapes: IShape[] = []
  drag = false
  dragNode = false
  constructor() {
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

  initEvent() {
    let selectShape: IShape | null = null
    let startX = 0
    let startY = 0
    let offsetX = 0
    let offsetY = 0
    this._zr?.on('mousedown', (e: zrender.ElementEvent) => {
      this.drag = true
      startX = e.offsetX
      startY = e.offsetY
      const target = e.target as IShape || null

      if (target && (target as IShape).nodeType === 'node') {
        // 当选中的是 shape 节点
        selectShape = target
        selectShape.oldX = selectShape.x
        selectShape.oldY = selectShape.y
      } else if (target && target.parent && target.parent.__hostTarget && (target.parent.__hostTarget as IShape).nodeType  === 'node') {
        // 当选中的是 shape 中的文本
        selectShape = target.parent.__hostTarget as IShape
        selectShape.oldX = selectShape.x
        selectShape.oldY = selectShape.y
      }

      if (!e.target) {
        // 如果什么都没选中的话
        this.unActiveShapes()
      }
    })

    this._zr?.on('mousemove', (e) => {
      if (this.drag && selectShape) {
        offsetX = e.offsetX - startX
        offsetY = e.offsetY - startY
        selectShape?.attr('x', selectShape.oldX! + offsetX)
        selectShape?.attr('y', selectShape.oldY! + offsetY)
      }
    })

    this._zr?.on('mouseup', () => {
      this.drag = false
      this.dragNode = false
      selectShape = null
    })
  }
}

export { LayerManage }
