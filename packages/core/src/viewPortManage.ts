import { injectable } from 'inversify'
import { Disposable } from './disposable'
import * as zrender from 'zrender'

import type { IShape, IAnchorPoint } from './shapes'

export interface IViewPortManage {
  setPosition(x: number, y: number): void
  getPositionX(): number
  getPositionY(): number
  addSelfToZr(zr: zrender.ZRenderType): void
  addShapeToViewPort(shape: IShape): void
  addAnchorToViewPort(anchor: IAnchorPoint): void
  getViewPort(): zrender.Group
  getZr(): zrender.ZRenderType
  setScale(x: number, y: number): void
  getScaleX(): number
  getScaleY(): number
  getSceneWidth(): number
  getSceneHeight(): number
}

@injectable()
class ViewPortManage extends Disposable {
  private viewPort: zrender.Group = new zrender.Group()
  constructor() {
    super()
  }

  getViewPort(): zrender.Group {
    return this.viewPort
  }

  setScale(x: number, y: number) {
    this.viewPort.attr('scaleX', x)
    this.viewPort.attr('scaleY', y)
  }

  getScaleX() {
    return this.viewPort.scaleX
  }

  getScaleY() {
    return this.viewPort.scaleY
  }

  setPosition(x: number, y: number) {
    this.viewPort.attr('x', x)
    this.viewPort.attr('y', y)
  }

  getPositionX(): number {
    return this.viewPort.x
  }

  getPositionY(): number {
    return this.viewPort.y
  }

  addSelfToZr(zr: zrender.ZRenderType) {
    zr.add(this.viewPort)
  }

  addShapeToViewPort(shape: IShape) {
    this.viewPort.add(shape)
  }

  addAnchorToViewPort(anchor: IAnchorPoint) {
    this.viewPort.add(anchor)
  }

  getSceneWidth() {
    return this.viewPort.__zr.getWidth()
  }

  getSceneHeight() {
    return this.viewPort.__zr.getHeight()
  }

  getZr() {
    return this.viewPort.__zr
  }
}

export { ViewPortManage }
