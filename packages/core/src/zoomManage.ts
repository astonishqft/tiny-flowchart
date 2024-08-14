import { injectable, inject } from 'inversify'
import { Disposable } from './disposable'
import IDENTIFIER from './constants/identifiers'

import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IGridManage } from './gridManage'
import type { IDisposable } from './disposable'
import type { IStorageManage } from './storageManage'

export interface IZoomManage extends IDisposable {
  zoomIn(): void
  zoomOut(): void
}

@injectable()
class ZoomManage extends Disposable {
  private zoomStep: number
  private minZoom: number
  private maxZoom: number

  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage,
    @inject(IDENTIFIER.SETTING_MANAGE) private _settingManage: ISettingManage,
    @inject(IDENTIFIER.GRID_MANAGE) private _gridManage: IGridManage,
    @inject(IDENTIFIER.STORAGE_MANAGE) private _storageMgr: IStorageManage
  ) {
    super()

    this.zoomStep = this._settingManage.get('zoomStep')
    this.minZoom = this._settingManage.get('zoomMin')
    this.maxZoom = this._settingManage.get('zoomMax')
  }

  // 放大
  zoomIn() {
    const zoom = 1 + this.zoomStep
    const pOffsetX = (this._viewPortManage.getSceneWidth() / 2) * (1 - zoom)
    const pOffsetY = (this._viewPortManage.getSceneHeight() / 2) * (1 - zoom)
    this.setZoom(zoom, pOffsetX, pOffsetY)
  }

  // 缩小
  zoomOut() {
    const zoom = 1 - this.zoomStep
    const pOffsetX = (this._viewPortManage.getSceneWidth() / 2) * (1 - zoom)
    const pOffsetY = (this._viewPortManage.getSceneHeight() / 2) * (1 - zoom)
    this.setZoom(zoom, pOffsetX, pOffsetY)
  }

  setZoom(zoom: number, offsetX: number, offsetY: number) {
    const currentZoom = parseFloat((this.getZoom() * zoom).toFixed(3))
    if (currentZoom > this.maxZoom) {
      return
    } else if (currentZoom < this.minZoom) {
      return
    }
    this._storageMgr.setZoom(currentZoom)
    const scaleX = this._viewPortManage.getScaleX()
    const scaleY = this._viewPortManage.getScaleY()
    const positionX = this._viewPortManage.getPositionX()
    const positionY = this._viewPortManage.getPositionY()

    this._viewPortManage.setScale(scaleX * zoom, scaleY * zoom)
    this._viewPortManage.setPosition(zoom * positionX + offsetX, zoom * positionY + offsetY)
    this._gridManage.setScale(scaleX * zoom, scaleY * zoom)
    this._gridManage.setPosition(zoom * positionX + offsetX, zoom * positionY + offsetY)
    this._gridManage.drawGrid()
  }

  getZoom() {
    return this._storageMgr.getZoom()
  }
}

export { ZoomManage }
