import { Disposable } from '@/disposable'
import { GridManage } from '@/gridManage'
import { Group } from './'

import type { ISceneDragMoveOpts, IUpdateZoomOpts } from './types'
import type {
  IIocEditor,
  IDisposable,
  IGridManage,
  ISettingManage,
  ZRenderType,
  Element,
  BoundingRect
} from '@/index'

export interface IViewPortManage extends IDisposable {
  setPosition(x: number, y: number): void
  getPosition(): number[]
  addSelfToZr(zr: ZRenderType): void
  removeElementFromViewPort(element: Element): void
  addElementToViewPort(element: Element): void
  getViewPort(): Group
  setScale(x: number, y: number): void
  getScale(): number[]
  getSceneWidth(): number | undefined
  getSceneHeight(): number | undefined
  getBoundingRect(includeChildren: Element[]): BoundingRect
  getZoom(): number
}

class ViewPortManage extends Disposable {
  private _viewPort: Group = new Group()
  private _iocEditor: IIocEditor
  private _gridMgr?: IGridManage
  private _settingMgr: ISettingManage
  private _currentZoom = 1

  constructor(iocEditor: IIocEditor) {
    super()
    this._iocEditor = iocEditor
    this._settingMgr = iocEditor._settingMgr

    const enableMiniMap = this._settingMgr.get('enableMiniMap')
    const enableGrid = this._settingMgr.get('enableGrid')

    if (!enableMiniMap && enableGrid) {
      this._gridMgr = new GridManage(iocEditor, this)
    }

    this._iocEditor.sceneDragMove$.subscribe(({ x, y }: ISceneDragMoveOpts) => {
      this.setPosition(x, y)
    })

    this._iocEditor.updateZoom$.subscribe(
      ({ zoom, offsetX, offsetY, currentZoom }: IUpdateZoomOpts) => {
        this._currentZoom = currentZoom
        this.setZoom(zoom, offsetX, offsetY)
      }
    )
  }

  getViewPort(): Group {
    return this._viewPort
  }

  getBoundingRect(includeChildren: Element[]) {
    return this._viewPort.getBoundingRect(includeChildren)
  }

  setZoom(zoom: number, offsetX: number, offsetY: number) {
    const [scaleX, scaleY] = this.getScale()
    const [positionX, positionY] = this.getPosition()
    this._gridMgr?.resizePool()
    this.setScale(scaleX * zoom, scaleY * zoom)
    this.setPosition(zoom * positionX + offsetX, zoom * positionY + offsetY)
  }

  getZoom() {
    return this._currentZoom
  }

  setScale(x: number, y: number) {
    this._viewPort.attr('scaleX', x)
    this._viewPort.attr('scaleY', y)
    this._gridMgr?.setScale(x, y)
  }

  getScale() {
    return [this._viewPort.scaleX, this._viewPort.scaleY]
  }

  setPosition(x: number, y: number) {
    this._viewPort.attr('x', x)
    this._viewPort.attr('y', y)
    this._gridMgr?.setPosition(x, y)
    this._gridMgr?.drawGrid()
  }

  getPosition() {
    return [this._viewPort.x, this._viewPort.y]
  }

  addSelfToZr(zr: ZRenderType) {
    zr.add(this._viewPort)
  }

  removeElementFromViewPort(element: Element) {
    this._viewPort.remove(element)
  }

  addElementToViewPort(element: Element) {
    this._viewPort.add(element)
  }

  getSceneWidth() {
    return this._iocEditor._zr.getWidth()
  }

  getSceneHeight() {
    return this._iocEditor._zr.getHeight()
  }
}

export { ViewPortManage }
