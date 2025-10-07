import { getShape } from './shapes'
import { Anchor } from './anchor'
import { ControlFrame } from './controlFrame'
import { Disposable } from './disposable'

import type {
  IAnchorPoint,
  IShape,
  IViewPortManage,
  IDisposable,
  IStorageManage,
  ITinyFlowchart,
  INodeGroup
} from '@/index'
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
  private _tinyFlowchart: ITinyFlowchart
  constructor(tinyFlowchart: ITinyFlowchart) {
    super()
    this._viewPortMgr = tinyFlowchart._viewPortMgr
    this._storageMgr = tinyFlowchart._storageMgr
    this._tinyFlowchart = tinyFlowchart
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
    shape.anchor = new Anchor(shape)
    shape.controlFrame = new ControlFrame(this._tinyFlowchart, shape)
    shape.anchor.refresh()

    return shape
  }

  addShapeToEditor(shape: IShape) {
    this._storageMgr.addShape(shape)
    this.addBarsToViewPort(shape.anchor.bars)
    this._viewPortMgr.addElementToViewPort(shape)
  }

  removeShapeFromEditor(shape: IShape) {
    shape.controlFrame.unActive()
    shape.unActive()
    this._storageMgr.removeShape(shape)
    this.removeBarsFromViewPort(shape.anchor.bars)
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
    this._storageMgr.getShapes().forEach(shape => this.removeShapeFromEditor(shape))
  }

  private addBarsToViewPort(bars: IAnchorPoint[]) {
    bars.forEach(bar => this._viewPortMgr.addElementToViewPort(bar))
  }

  private removeBarsFromViewPort(bars: IAnchorPoint[]) {
    bars.forEach(bar => this._viewPortMgr.removeElementFromViewPort(bar))
  }
}

export { ShapeManage }
