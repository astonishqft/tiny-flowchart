import * as zrender from 'zrender'
import { injectable, inject } from 'inversify'
import IDENTIFIER from './constants/identifiers'
import { Disposable } from './disposable'

import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IDisposable } from './disposable'

export interface IGridManage extends IDisposable {
  x: number
  y: number
  initGrid(zr: zrender.ZRenderType): void
  drawGrid(): void
  updateGrid(dx: number, dy: number): void
}

@injectable()
class GridManage extends Disposable {
  gridStep: number
  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0
  xPoints: number[] = []
  yPoints: number[] = []
  points: zrender.Circle [] = []
  constructor(
    @inject(IDENTIFIER.SETTING_MANAGE) private _settingManage: ISettingManage,
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage,
  ) {
    super()
    this.gridStep = this._settingManage.get('gridStep')
  }

  initGrid(zr: zrender.ZRenderType) {
    this.x = 0
    this.y = 0
    this.width = zr.getWidth() as number
    this.height = zr.getHeight() as number

    this.drawGrid()
  }

  /**
 * 找出离 value 最近的 segment 的倍数值
 */
  getClosestVal(value: number, segment: number) {
    const n = Math.floor(value / segment)
    const left = segment * n
    const right = segment * (n + 1)
    return value - left <= right - value ? left : right
  }

  drawGrid() {
    const scaleX = this._viewPortManage.getScaleX()
    const scaleY = this._viewPortManage.getScaleY()
    let startX = this.getClosestVal(this.x, this.gridStep)
    let endX = this.getClosestVal(this.x + this.width / scaleX, this.gridStep)
    let startY = this.getClosestVal(this.y, this.gridStep)
    let endY = this.getClosestVal(this.y + this.height / scaleY, this.gridStep)
    this.xPoints = []
    this.yPoints = []
    this.points.forEach(p => {
      this._viewPortManage.getViewPort().remove(p)
    })
    this.points = []

    while (startX <= endX) {
      this.xPoints.push(startX)
      startX += this.gridStep
    }

    while (startY <= endY) {
      this.yPoints.push(startY)
      startY += this.gridStep
    }

    for (let i = 0; i < this.yPoints.length; i ++) {
      for(let j = 0; j < this.xPoints.length; j ++) {
        const point = new zrender.Circle({
          shape: {
            r: 0.5,
            cx: (this.xPoints[j]-this.x) * scaleX,
            cy: (this.yPoints[i]-this.y) * scaleY
          },
          style: {
            stroke: '#868e96',
            fill: '#868e96',
            lineWidth: 1
          },
          z: -1
        })

        this.points.push(point)
        this._viewPortManage.getViewPort().add(point)
      }
    }
  }

  updateGrid(dx: number, dy: number) {

    this.x = dx
    this.y = dy
    this.drawGrid()
  }
}


export { GridManage }
