import * as zrender from 'zrender'
import { IocEditor } from './iocEditor'
import { Disposable } from './disposable'
import { GridManage } from './gridManage'

import type { ISceneDragMoveOpts } from './types'
import type { IDisposable } from './disposable'
import type { IGridManage } from './gridManage'
import type { ISettingManage } from './settingManage'

export interface IViewPortManage extends IDisposable {
  setPosition(x: number, y: number): void
  getPosition(): number[]
  addSelfToZr(zr: zrender.ZRenderType): void
  removeElementFromViewPort(element: zrender.Element): void
  addElementToViewPort(element: zrender.Element): void
  getViewPort(): zrender.Group
  setScale(x: number, y: number): void
  getScale(): number[]
  getSceneWidth(): number
  getSceneHeight(): number
  getBoundingRect(includeChildren: zrender.Element[]): zrender.BoundingRect
  setPosition(x: number, y: number): void
}

class ViewPortManage extends Disposable {
  private _viewPort: zrender.Group = new zrender.Group()
  private _iocEditor: IocEditor
  private _gridMgr: IGridManage | undefined
  private _settingMgr: ISettingManage
  private _enableMiniMap

  constructor(iocEditor: IocEditor) {
    super()
    this._iocEditor = iocEditor
    this._settingMgr = iocEditor._settingMgr
    this._enableMiniMap = this._settingMgr.get('enableMiniMap')

    if (!this._enableMiniMap) {
      this._gridMgr = new GridManage(iocEditor)
    }

    this._iocEditor.sceneDragMove$.subscribe(({ x, y }: ISceneDragMoveOpts) => {
      this.setPosition(x, y)
    })
  }

  getViewPort(): zrender.Group {
    return this._viewPort
  }

  getBoundingRect(includeChildren: zrender.Element[]) {
    return this._viewPort.getBoundingRect(includeChildren)
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

  addSelfToZr(zr: zrender.ZRenderType) {
    zr.add(this._viewPort)
  }

  removeElementFromViewPort(element: zrender.Element) {
    this._viewPort.remove(element)
  }

  addElementToViewPort(element: zrender.Element) {
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
