import { getShape } from './shapes'
import { Anchor } from './anchor'
import { Disposable, IDisposable } from './disposable'
import { NodeEventManage } from './nodeEventManage'

import type { IShape } from './shapes'
import type { IAnchorPoint } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { IocEditor } from './iocEditor'
import type { IControlFrameManage } from './controlFrameManage'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IWidthAnchor } from './shapes/mixins/widthAnchor'

export interface IShapeManage extends IDisposable {
  createShape(type: string, options: { x: number; y: number; url?: string }): IShape
  addShapeToEditor(shape: IShape): void
  removeShapeFromEditor(shape: IShape): void
  getNodeById(id: number): IShape | INodeGroup
  getPointByIndex<T extends IWidthAnchor>(node: T, index: number): IAnchorPoint | undefined
  clear(): void
}

class ShapeManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  private _controlFrameMgr: IControlFrameManage
  private _iocEditor: IocEditor
  constructor(iocEditor: IocEditor) {
    super()
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
    this._controlFrameMgr = iocEditor._controlFrameMgr
    this._iocEditor = iocEditor
  }

  createShape(type: string, { x, y, url }: { x: number; y: number; url?: string }): IShape {
    const [viewPortX, viewPortY] = this._viewPortMgr.getPosition()
    const zoom = this._viewPortMgr.getZoom()

    const shape = getShape(type, {
      x: (x - viewPortX) / zoom,
      y: (y - viewPortY) / zoom,
      image: url
    })

    shape.setType(type)

    const anchor = new Anchor(shape)
    shape.anchor = anchor
    shape.anchor.refresh()
    new NodeEventManage(shape, this._iocEditor)

    return shape
  }

  addShapeToEditor(shape: IShape) {
    this._storageMgr.addShape(shape)
    shape.unActive()
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addElementToViewPort(bar)
    })
    this._viewPortMgr.addElementToViewPort(shape)
  }

  removeShapeFromEditor(shape: IShape) {
    this._controlFrameMgr.unActive()
    shape.unActive()
    this._storageMgr.removeShape(shape)
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.removeElementFromViewPort(bar)
    })
    this._viewPortMgr.removeElementFromViewPort(shape)
  }

  getNodeById(id: number) {
    const nodes = this._storageMgr.getNodes()

    return nodes.filter(n => n.id === id)[0]
  }

  getPointByIndex<T extends IWidthAnchor>(node: T, index: number): IAnchorPoint | undefined {
    return node.anchor.getBarByIndex(index)
  }

  clear() {
    this._storageMgr.getShapes().forEach((shape: IShape) => {
      this.removeShapeFromEditor(shape)
    })
  }
}

export { ShapeManage }
