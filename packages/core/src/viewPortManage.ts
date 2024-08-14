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
  private _viewPort: zrender.Group = new zrender.Group()
  constructor() {
    super()
  }

  getViewPort(): zrender.Group {
    return this._viewPort
  }

  setScale(x: number, y: number) {
    this._viewPort.attr('scaleX', x)
    this._viewPort.attr('scaleY', y)
  }

  getScaleX() {
    return this._viewPort.scaleX
  }

  getScaleY() {
    return this._viewPort.scaleY
  }

  setPosition(x: number, y: number) {
    this._viewPort.attr('x', x)
    this._viewPort.attr('y', y)
  }

  getPositionX(): number {
    return this._viewPort.x
  }

  getPositionY(): number {
    return this._viewPort.y
  }

  addSelfToZr(zr: zrender.ZRenderType) {
    zr.add(this._viewPort)
  }

  addShapeToViewPort(shape: IShape) {
    this._viewPort.add(shape)
  }

  addAnchorToViewPort(anchor: IAnchorPoint) {
    this._viewPort.add(anchor)
  }

  getSceneWidth() {
    return this._viewPort.__zr.getWidth()
  }

  getSceneHeight() {
    return this._viewPort.__zr.getHeight()
  }

  getZr() {
    return this._viewPort.__zr
  }
}

export { ViewPortManage }
