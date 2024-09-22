import { Disposable } from './disposable'
import type { IocEditor } from './iocEditor'

import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IGridManage } from './gridManage'
import type { IDisposable } from './disposable'
import type { IStorageManage } from './storageManage'

export interface IZoomManage extends IDisposable {
  zoomIn(): void
  zoomOut(): void
}

class ZoomManage extends Disposable {
  private _zoomStep: number
  private _minZoom: number
  private _maxZoom: number
  private _viewPortMgr: IViewPortManage
  private _settingMgr: ISettingManage
  private _gridMgr: IGridManage
  private _storageMgr: IStorageManage

  constructor(iocEditor: IocEditor) {
    super()
    this._settingMgr = iocEditor._settingMgr
    this._gridMgr = iocEditor._gridMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr

    this._zoomStep = this._settingMgr.get('zoomStep')
    this._minZoom = this._settingMgr.get('zoomMin')
    this._maxZoom = this._settingMgr.get('zoomMax')
  }

  // 放大
  zoomIn() {
    const zoom = 1 + this._zoomStep
    const pOffsetX = (this._viewPortMgr.getSceneWidth() / 2) * (1 - zoom)
    const pOffsetY = (this._viewPortMgr.getSceneHeight() / 2) * (1 - zoom)
    this.setZoom(zoom, pOffsetX, pOffsetY)
  }

  // 缩小
  zoomOut() {
    const zoom = 1 - this._zoomStep
    const pOffsetX = (this._viewPortMgr.getSceneWidth() / 2) * (1 - zoom)
    const pOffsetY = (this._viewPortMgr.getSceneHeight() / 2) * (1 - zoom)
    this.setZoom(zoom, pOffsetX, pOffsetY)
  }

  setZoom(zoom: number, offsetX: number, offsetY: number) {
    const currentZoom = parseFloat((this.getZoom() * zoom).toFixed(3))
    if (currentZoom > this._maxZoom) {
      return
    } else if (currentZoom < this._minZoom) {
      return
    }
    this._storageMgr.setZoom(currentZoom)
    const scaleX = this._viewPortMgr.getScaleX()
    const scaleY = this._viewPortMgr.getScaleY()
    const positionX = this._viewPortMgr.getPositionX()
    const positionY = this._viewPortMgr.getPositionY()

    this._viewPortMgr.setScale(scaleX * zoom, scaleY * zoom)
    this._viewPortMgr.setPosition(zoom * positionX + offsetX, zoom * positionY + offsetY)
    this._gridMgr.setScale(scaleX * zoom, scaleY * zoom)
    this._gridMgr.setPosition(zoom * positionX + offsetX, zoom * positionY + offsetY)
    this._gridMgr.drawGrid()
  }

  getZoom() {
    return this._storageMgr.getZoom()
  }
}

export { ZoomManage }
