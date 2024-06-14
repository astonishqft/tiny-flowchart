
import { injectable, inject } from 'inversify'
import { Subject, Observable } from 'rxjs'
import { getShape } from './shapes'
import IDENTIFIER from './constants/identifiers'
import type { ILayerManage } from './layerManage'
import type { IShape } from './types/interfaces/i-shape'

export interface IShapeManage {
  shapes: IShape[]
  clickShape$: Observable<IShape>
  addShape(type: string, options: { x: number, y: number }): void
  destroy(): void
}

@injectable()
class ShapeManage {
  shapes: IShape[] = []
  clickShape$ = new Subject<IShape>()
  constructor(@inject(IDENTIFIER.LAYER_MANAGE) private _layer: ILayerManage) {
    console.log('shapeManage init')
  }

  addShape(type: string, options: { x: number, y: number }) {
    console.log(type, options)
    const shape = getShape(type, options)

    this.bindShapeEvent(shape)
    this._layer.addToLayer(shape)
  }

  bindShapeEvent(shape: IShape) {
    shape.on('click', () => {
      this.clickShape$.next(shape)
    })
  }

  destroy() {
    this.clickShape$.unsubscribe()
  }
}

export { ShapeManage } 
