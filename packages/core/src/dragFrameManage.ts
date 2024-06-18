import * as zrender from 'zrender'
import { injectable } from 'inversify'
import { Disposable } from './disposable'
import type { IDisposable } from './disposable'

export interface IDragFrameManage extends IDisposable {
  addSelfToLayer(zr: zrender.ZRenderType): void
  show(): void
  hide(): void
  updatePosition(x: number, y: number): void
  initSize(width: number, height: number): void
}

@injectable()
class DragFrameManage extends Disposable {
  private _frame: zrender.Rect
  constructor() {
    super()
    this._frame = new zrender.Rect({
      shape: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      },
      style: {
        fill: '#1971c2',
        stroke: '#1971c2',
        opacity: 0.3,
        lineWidth: 1,
        lineDash: [4, 4]
      },
      silent: true
    })

    this._frame.hide()
  }

  addSelfToLayer(zr: zrender. ZRenderType) {
    zr.add(this._frame) 
  }

  show() {
    this._frame.show()
  }

  hide() {
    this._frame.hide()
  }

  initSize(width: number, height: number) {
    this._frame.setShape({
      width,
      height
    })
    this._frame.show()
  }

  updatePosition(x: number, y: number) {
    this._frame.attr('x', x)
    this._frame.attr('y', y)
  }
}

export { DragFrameManage }
