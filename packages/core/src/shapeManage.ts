import { getShape } from './shapes'
import { Anchor } from './anchor'
import { Disposable, IDisposable } from './disposable'
import { NodeEventManage } from './nodeEventManage'

import type { IShape } from './shapes'
import type { IAnchorPoint } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { IocEditor } from './iocEditor'

export interface IShapeManage extends IDisposable {
  createShape(type: string, options: { x: number; y: number }): IShape
  clear(): void
}

class ShapeManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  private _iocEditor: IocEditor
  constructor(iocEditor: IocEditor) {
    super()
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
    this._iocEditor = iocEditor
  }

  createShape(type: string, { x, y }: { x: number; y: number }): IShape {
    const [viewPortX, viewPortY] = this._viewPortMgr.getPosition()
    const zoom = this._storageMgr.getZoom()

    const shape = getShape(type, {
      x: (x - viewPortX) / zoom,
      y: (y - viewPortY) / zoom
    })

    shape.setType(type)

    const anchor = new Anchor(shape)
    shape.anchor = anchor

    shape.createAnchors()
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addElementToViewPort(bar)
    })
    shape.anchor.refresh()
    new NodeEventManage(shape, this._iocEditor)
    this._viewPortMgr.addElementToViewPort(shape)

    this._storageMgr.addShape(shape)

    // TODO 更新miniMap
    this._iocEditor.updateMiniMap$.next()

    return shape
  }

  clear() {
    this._storageMgr.getShapes().forEach((shape: IShape) => {
      this._viewPortMgr.removeElementFromViewPort(shape)
      shape.anchor.bars.forEach((bar: IAnchorPoint) => {
        this._viewPortMgr.removeElementFromViewPort(bar)
      })
    })
    this._storageMgr.clearShapes()
  }
}

export { ShapeManage }
