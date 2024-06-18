
import { injectable, inject } from 'inversify'
import * as zrender from 'zrender'
import { Subject, Observable } from 'rxjs'
import { getShape } from './shapes'
import IDENTIFIER from './constants/identifiers'
import { Anchor } from './anchor'
import { Disposable, IDisposable } from './disposable'

import type { ILayerManage } from './layerManage'
import type { IShape } from './shapes'
import type { IAnchorPoint } from './shapes'

export interface IShapeManage extends IDisposable {
  shapes: IShape[]
  updateClickShape$: Observable<IShape>
  addShape(type: string, options: { x: number, y: number }): void
}

@injectable()
class ShapeManage extends Disposable {
  shapes: IShape[] = []
  updateClickShape$ = new Subject<IShape>()
  constructor(@inject(IDENTIFIER.LAYER_MANAGE) private _layer: ILayerManage) {
    super()
    this._disposables.push(this.updateClickShape$)
  }

  addShape(type: string, { x, y }: { x: number, y: number }) {
    const {x: gX, y: gY} = this._layer
    const shape = getShape(type, { x: x - gX, y: y - gY })

    const anchor = new Anchor(shape)
    shape.anchor = anchor

    shape.createAnchors()
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._layer.add(bar)
    })
    shape.anchor.refresh()
    this.initShapeEvent(shape)
    this._layer.addToLayer(shape)
  }

  initShapeEvent(shape: IShape) {
    shape.on('click', () => {
      // this.clickShape$.next(shape)
      shape.active()
    })

    shape.on('mousemove', () => {
      shape.anchor?.show();
      (shape as unknown as zrender.Displayable).attr('cursor', 'move')
    })

    shape.on('mouseout', () => {
      shape.anchor?.hide()
    })
  }
}

export { ShapeManage } 
