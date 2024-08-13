import { injectable, inject } from 'inversify'
import * as zrender from 'zrender'
import IDENTIFIER from './constants/identifiers'

import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IStorageManage } from './storageManage'

export interface ISelectFrameManage {
  getSelectFrame(): zrender.Rect
  getSelectFrameStatus(): boolean
  setSelectFrameStatus(status: boolean): void
  setPosition(x: number, y: number): void
  resize(width: number, height: number): void
  multiSelect(): void
  show(): void
  hide(): void
}

@injectable()
class SelectFrameManage {
  private _selectFrame: zrender.Rect
  private _selectFrameStatus: boolean = false

  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage,
    @inject(IDENTIFIER.SETTING_MANAGE) private _settingManage: ISettingManage,
    @inject(IDENTIFIER.STORAGE_MANAGE) private _storageMgr: IStorageManage
  ) {
    this._selectFrame = new zrender.Rect({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      style: {
        fill: this._settingManage.get('selectFrameColor'),
        opacity: 0.2,
        lineDash: [4, 4]
      },
      silent: true,
      z: 100000
    })

    this._viewPortManage.getViewPort().add(this._selectFrame)

    this.hide()
  }

  setPosition(x: number, y: number) {
    this._selectFrame.attr('x', x)
    this._selectFrame.attr('y', y)
  }

  resize(width: number, height: number) {
    this._selectFrame.attr({
      shape: {
        width,
        height
      }
    })
  }

  multiSelect() {
    const selectFrameBoundingBox = this._selectFrame.getBoundingRect()
    const groups = this._storageMgr.getGroups()
    const shapes = this._storageMgr.getShapes()
    selectFrameBoundingBox.x = this._selectFrame.x
    selectFrameBoundingBox.y = this._selectFrame.y
    shapes.concat(groups).forEach(shape => {
      const shapeBoundingBox = shape.getBoundingRect()
      shapeBoundingBox.x = shape.x
      shapeBoundingBox.y = shape.y
      if (selectFrameBoundingBox.intersect(shapeBoundingBox)) {
        shape.active()
      } else {
        shape.unActive()
      }
    })
  }

  show() {
    this._selectFrame.show()
  }

  hide() {
    this._selectFrame.hide()
  }

  getSelectFrame() {
    return this._selectFrame
  }

  setSelectFrameStatus(status: boolean) {
    this._selectFrameStatus = status
  }

  getSelectFrameStatus(): boolean {
    return this._selectFrameStatus
  }
}

export { SelectFrameManage }
