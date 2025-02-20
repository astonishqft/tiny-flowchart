import { Disposable } from './disposable'

import type { IIocEditor } from './iocEditor'
import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IDisposable } from './disposable'

export interface IZoomManage extends IDisposable {
  zoomIn(): void
  zoomOut(): void
  getZoom(): number
}

class ZoomManage extends Disposable {
  private _minZoom: number
  private _maxZoom: number
  private _viewPortMgr: IViewPortManage
  private _settingMgr: ISettingManage
  private _iocMgr: IIocEditor
  private _zoomScale: number
  private _currentZoom = 1

  constructor(iocEditor: IIocEditor) {
    super()
    this._iocMgr = iocEditor
    this._settingMgr = iocEditor._settingMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._minZoom = this._settingMgr.get('zoomMin')
    this._maxZoom = this._settingMgr.get('zoomMax')
    this._zoomScale = 1 + this._settingMgr.get('zoomStep')
  }

  // 放大
  zoomIn() {
    this.adjustZoom(this._zoomScale)
  }

  // 缩小
  zoomOut() {
    this.adjustZoom(1 / this._zoomScale)
  }

  private adjustZoom(zoom: number) {
    const sceneWidth = this._viewPortMgr.getSceneWidth() || window.innerWidth
    const sceneHeight = this._viewPortMgr.getSceneHeight() || window.innerHeight
    const pOffsetX = (sceneWidth / 2) * (1 - zoom)
    const pOffsetY = (sceneHeight / 2) * (1 - zoom)
    this.setZoom(zoom, pOffsetX, pOffsetY)
  }

  setZoom(zoom: number, offsetX: number, offsetY: number) {
    const newZoom = this._currentZoom * zoom
    if (newZoom > this._maxZoom || newZoom < this._minZoom) {
      return
    }
    this._currentZoom = newZoom
    this._iocMgr.updateZoom$.next({ zoom, offsetX, offsetY, currentZoom: this._currentZoom })
  }

  getZoom() {
    return this._currentZoom
  }
}

export { ZoomManage }
