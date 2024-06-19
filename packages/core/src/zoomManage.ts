import { injectable, inject } from 'inversify'
import { Disposable } from './disposable'
import IDENTIFIER from './constants/identifiers'

import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IGridManage } from './gridManage'
import type { IDisposable } from './disposable'

export interface IZoomManage extends IDisposable {
  zoomIn(): void
  zoomOut(): void
  getZoom(): number
}

@injectable()
class ZoomManage extends Disposable {
  private zoomStep: number
  private minZoom: number
  private maxZoom: number
  private zoom: number = 1 // 放大系数

  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage,
    @inject(IDENTIFIER.SETTING_MANAGE) private _settingManage: ISettingManage,
    @inject(IDENTIFIER.GRID_MANAGE) private _gridManage: IGridManage
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
    this.zoom = parseFloat((this.zoom * zoom).toFixed(3))
    if (this.zoom > this.maxZoom) {
      this.zoom = this.maxZoom
      return
    } else if (this.zoom < this.minZoom) {
      this.zoom = this.minZoom
      return
    }
    const scaleX = this._viewPortManage.getScaleX()
    const scaleY = this._viewPortManage.getScaleY()
    const positionX = this._viewPortManage.getPositionX()
    const positionY = this._viewPortManage.getPositionY()

    this._viewPortManage.setScale(scaleX * zoom, scaleY * zoom)
    // this._gridManage.updateGrid(-positionX, -positionY)
    this._viewPortManage.setPosition(zoom * positionX + offsetX, zoom * positionY + offsetY)
  }

  getZoom() {
    return this.zoom
  }
}

export { ZoomManage }
