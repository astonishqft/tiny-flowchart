import * as zrender from 'zrender'
import { injectable, inject } from 'inversify'
import IDENTIFIER from './constants/identifiers'
import { Disposable } from './disposable'

import type { ILayerManage } from './layerManage'
import type { ISettingManage } from './settingManage'
import type { IDisposable } from './disposable'

export interface IGridManage extends IDisposable {
  x: number
  y: number
  initGrid(_layer: ILayerManage): void
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
  _layer: ILayerManage | null = null
  constructor(@inject(IDENTIFIER.SETTING_MANAGE) private _settingManage: ISettingManage) {
    super()
    this.gridStep = this._settingManage.get('gridStep')
  }

  initGrid(_layer: ILayerManage) {
    this._layer = _layer
    this.x = 0
    this.y = 0
    this.width = this._layer._zr!.getWidth() as number
    this.height = this._layer._zr!.getHeight() as number

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
    let startX = this.getClosestVal(this.x, this.gridStep)
    let endX = this.getClosestVal(this.x + this.width, this.gridStep)
    let startY = this.getClosestVal(this.y, this.gridStep)
    let endY = this.getClosestVal(this.y + this.height, this.gridStep)
    this.xPoints = []
    this.yPoints = []
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
            cx: this.xPoints[j],
            cy: this.yPoints[i]
          },
          style: {
            stroke: '#868e96',
            fill: '#868e96',
            lineWidth: 1
          },
          z: -1
        })

        this.points.push(point)
        this._layer!.add(point)
      }
    }
  }

  updateGrid(dx: number, dy: number) {
    this.points.forEach(p => {
      this._layer!.remove(p)
    })
    this.x = dx
    this.y = dy
    this.drawGrid()
  }
}


export { GridManage }
