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
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortMgr: IViewPortManage,
    @inject(IDENTIFIER.SETTING_MANAGE) private _settingMgr: ISettingManage,
    @inject(IDENTIFIER.GRID_MANAGE) private _gridMgr: IGridManage,
    @inject(IDENTIFIER.STORAGE_MANAGE) private _storageMgr: IStorageManage
  ) {
    super()

    this.zoomStep = this._settingMgr.get('zoomStep')
    this.minZoom = this._settingMgr.get('zoomMin')
    this.maxZoom = this._settingMgr.get('zoomMax')
  }

  // 放大
  zoomIn() {
    const zoom = 1 + this.zoomStep
    const pOffsetX = (this._viewPortMgr.getSceneWidth() / 2) * (1 - zoom)
    const pOffsetY = (this._viewPortMgr.getSceneHeight() / 2) * (1 - zoom)
    this.setZoom(zoom, pOffsetX, pOffsetY)
  }

  // 缩小
  zoomOut() {
    const zoom = 1 - this.zoomStep
    const pOffsetX = (this._viewPortMgr.getSceneWidth() / 2) * (1 - zoom)
    const pOffsetY = (this._viewPortMgr.getSceneHeight() / 2) * (1 - zoom)
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
