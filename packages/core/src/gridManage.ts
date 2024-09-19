import * as zrender from 'zrender'
import { injectable, inject } from 'inversify'
import IDENTIFIER from './constants/identifiers'
import { Disposable } from './disposable'

import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IDisposable } from './disposable'
import type { IStorageManage } from './storageManage'

export interface IGridManage extends IDisposable {
  drawGrid(): void
  setPosition(x: number, y: number): void
  setScale(x: number, y: number): void
}

class PointsPool {
  private _points: zrender.Circle[] = []
  private _size: number
  private _layer: zrender.Group
  constructor(size: number, layer: zrender.Group) {
    this._size = size
    this._layer = layer
    this.initPool()
  }

  createPoint() {
    const p = new zrender.Circle({
      shape: {
        r: 0.5,
        cx: 0,
        cy: 0
      },
      style: {
        stroke: '#868e96',
        fill: '#868e96',
        lineWidth: 1
      },
      silent: true
    })

    this._layer.add(p)

    return p
  }

  initPool() {
    for(let i = 0; i < this._size; i ++) {
      this._points.push(this.createPoint())
    }
  }

  /**
   * 调整点池的大小
   * 
   * 当指定的大小与当前点池的大小不一致时，会根据需要增加或减少点的数量
   * 如果大小增加，则添加新点到池中；如果大小减小，则从池中移除多余的点
   * 
   * @param size 想要调整到的点池大小
   */
  resizePool(size: number) {
    if (size > this._size) {
      for (let i = 0; i < size - this._size; i++) {
        this._points.push(this.createPoint())
      }
    } else if (size < this._size) {
      const newPoints = this._points.splice(0, size)

      for (let i = 0; i < (this._size - size); i++) {
        this._layer.remove(this._points[i])
      }
      this._points = newPoints
    }
    this._size = size
  }

  getPoints() {
    return this._points
  }

  updatePosition(index: number, cx: number, cy: number) {
    this._points[index].attr({
      shape: {
        cx,
        cy
      }
    })
  }
}

@injectable()
class GridManage extends Disposable {
  private _gridStep: number
  private _width: number = 0
  private _height: number = 0
  private _xPoints: number[] = []
  private _yPoints: number[] = []
  private _gridLayer: zrender.Group | null = null
  private _pointsPool: PointsPool | null = null
  private _gridZr: zrender.ZRenderType | null = null
  constructor(
    @inject(IDENTIFIER.SETTING_MANAGE) private _settingMgr: ISettingManage,
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortMgr: IViewPortManage,
    @inject(IDENTIFIER.STORAGE_MANAGE) private _storageMgr: IStorageManage
  ) {
    super()
    this._gridStep = this._settingMgr.get('gridStep')

    setTimeout(() => {
      this._gridZr = zrender.init(document.getElementById('ioc-editor-grid') as HTMLElement)
      this._gridLayer = new zrender.Group()
      this._gridZr.add(this._gridLayer)
      this._pointsPool = new PointsPool(1000, this._gridLayer)
      this._width = this._viewPortMgr.getSceneWidth()
      this._height = this._viewPortMgr.getSceneHeight()
      this.drawGrid()
    }, 0)
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

  setPosition(x: number, y: number) {
    this._gridLayer?.attr('x', x)
    this._gridLayer?.attr('y', y)
  }

  setScale(x: number, y: number) {
    this._gridLayer?.attr('scaleX', x)
    this._gridLayer?.attr('scaleY', y)
  }

  drawGrid() {
    const zoom = this._storageMgr.getZoom()
    let startX = this.getClosestVal(-this._gridLayer!.x / zoom, this._gridStep)
    let endX = this.getClosestVal(-this._gridLayer!.x / zoom + this._width / zoom, this._gridStep)
    let startY = this.getClosestVal(-this._gridLayer!.y / zoom, this._gridStep)
    let endY = this.getClosestVal(-this._gridLayer!.y / zoom + this._height / zoom, this._gridStep)
    this._xPoints = []
    this._yPoints = []

    while (startX <= endX) {
      this._xPoints.push(startX)
      startX += this._gridStep
    }

    while (startY <= endY) {
      this._yPoints.push(startY)
      startY += this._gridStep
    }

    this._pointsPool?.resizePool(this._yPoints.length * this._xPoints.length)

    let index = 0
    for (let i = 0; i < this._yPoints.length; i ++) {
      for(let j = 0; j < this._xPoints.length; j ++) {
        this._pointsPool?.updatePosition(index, this._xPoints[j], this._yPoints[i])
        index ++
      }
    }
  }
}

export { GridManage }
