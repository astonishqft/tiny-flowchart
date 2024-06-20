
import { injectable, inject } from 'inversify'
import * as zrender from 'zrender'
// import { Subject, Observable } from 'rxjs'
import { getShape } from './shapes'
import IDENTIFIER from './constants/identifiers'
import { Anchor } from './anchor'
import { Disposable, IDisposable } from './disposable'

import type { IShape } from './shapes'
import type { IAnchorPoint } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IZoomManage } from './zoomManage'

export interface IShapeManage extends IDisposable {
  shapes: IShape[]
  // updateAddShape$: Observable<IShape>
  createShape(type: string, options: { x: number, y: number }): IShape
}

@injectable()
class ShapeManage extends Disposable {
  shapes: IShape[] = []
  // updateAddShape$ = new Subject<IShape>()
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPort: IViewPortManage,
    @inject(IDENTIFIER.ZOOM_MANAGE) private _zoomManage: IZoomManage
  ) {
    super()
    // this._disposables.push(this.updateAddShape$)
  }

  createShape(type: string, { x, y }: { x: number, y: number }): IShape {
    const viewPortX = this._viewPort.getPositionX()
    const viewPortY = this._viewPort.getPositionY()
    const zoom = this._zoomManage.getZoom()

    const shape = getShape(type, { x: (x  - viewPortX) /zoom, y: (y - viewPortY) / zoom })

    const anchor = new Anchor(shape)
    shape.anchor = anchor

    // this.updateAddShape$.next(shape)

    shape.createAnchors()
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPort.addAnchorToViewPort(bar)
    })
    shape.anchor.refresh()
    this.initShapeEvent(shape)
    this._viewPort.addShapeToViewPort(shape)

    return shape
  }

  initShapeEvent(shape: IShape) {
    shape.on('click', () => {
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
