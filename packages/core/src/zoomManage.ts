import { Disposable } from './disposable'
import type { IocEditor } from './iocEditor'

import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IDisposable } from './disposable'
import type { IStorageManage } from './storageManage'

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
  private _storageMgr: IStorageManage
  private _iocMgr: IocEditor
  private _zoomScale: number

  constructor(iocEditor: IocEditor) {
    super()
    this._iocMgr = iocEditor
    this._settingMgr = iocEditor._settingMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
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
    const currentZoom = this.getZoom() * zoom
    if (currentZoom > this._maxZoom) {
      return
    } else if (currentZoom < this._minZoom) {
      return
    }
    this._storageMgr.setZoom(currentZoom)
    const [scaleX, scaleY] = this._viewPortMgr.getScale()
    const [positionX, positionY] = this._viewPortMgr.getPosition()

    this._viewPortMgr.setScale(scaleX * zoom, scaleY * zoom)
    this._viewPortMgr.setPosition(zoom * positionX + offsetX, zoom * positionY + offsetY)
    this._iocMgr.updateZoom$.next({ zoom })
  }

  getZoom() {
    return this._storageMgr.getZoom()
  }
}

export { ZoomManage }
