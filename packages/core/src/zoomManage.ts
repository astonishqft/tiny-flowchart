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
    const zoom = this._zoomScale
    const pOffsetX = (this._viewPortMgr.getSceneWidth() / 2) * (1 - zoom)
    const pOffsetY = (this._viewPortMgr.getSceneHeight() / 2) * (1 - zoom)
    this.setZoom(zoom, pOffsetX, pOffsetY)
  }

  // 缩小
  zoomOut() {
    const zoom = 1 / this._zoomScale
    const pOffsetX = (this._viewPortMgr.getSceneWidth() / 2) * (1 - zoom)
    const pOffsetY = (this._viewPortMgr.getSceneHeight() / 2) * (1 - zoom)
    this.setZoom(zoom, pOffsetX, pOffsetY)
  }

  setZoom(zoom: number, offsetX: number, offsetY: number) {
    this._currentZoom = this._currentZoom * zoom
    if (this._currentZoom > this._maxZoom) {
      return
    } else if (this._currentZoom < this._minZoom) {
      return
    }

    this._iocMgr.updateZoom$.next({ zoom, offsetX, offsetY, currentZoom: this._currentZoom })
  }

  getZoom() {
    return this._currentZoom
  }
}

export { ZoomManage }
