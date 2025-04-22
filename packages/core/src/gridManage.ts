// 网格性能优化策略，开率建一个缓存池，初始化的时候根据屏幕尺寸的大小、画面整体缩放比例、网格的间距，计算出初始网格点的数量，根据网格点的竖向生成网格池。当画面缩放的时候，需要重新根据上述条件，重新计算网格点数，重新调整缓存池的大小，
// 如果画面缩放比例保持不变，则缓存池的数量不变。在计算网格点数的时候，可以适当根据情况多生成一些，避免频繁的调整缓存池的大小，导致性能问题。
import { Group, Circle, init } from '@/index'

import type { ZRenderType, ITinyFlowchart, ISettingManage, IViewPortManage } from '@/index'

export interface IGridManage {
  drawGrid(): void
  setPosition(x: number, y: number): void
  setScale(x: number, y: number): void
  showGrid(show: boolean): void
  resizePool(): void
}

class PointsPool {
  private _points: Circle[] = []
  private _size: number
  private _layer: Group
  private _iocEditor: ITinyFlowchart
  private _settingMgr: ISettingManage
  private _viewPortMgr: IViewPortManage
  constructor(tinyFlowchart: ITinyFlowchart, layer: Group) {
    this._iocEditor = tinyFlowchart
    this._settingMgr = tinyFlowchart._settingMgr
    this._viewPortMgr = tinyFlowchart._viewPortMgr
    this._size = this.getPointsSize()
    this._layer = layer
    this.initPool()
  }

  createPoint() {
    const p = new Circle({
      shape: {
        r: 0.5,
        cx: 0,
        cy: 0
      },
      style: {
        stroke: '#868e96',
        fill: '#868e96',
        lineWidth: 1,
        strokeNoScale: true
      },
      silent: true
    })

    this._layer.add(p)

    return p
  }

  initPool() {
    for (let i = 0; i < this._size; i++) {
      this._points.push(this.createPoint())
    }
  }

  getPointsSize() {
    const zoom = this._viewPortMgr.getZoom()
    const width = (this._iocEditor._zr.getWidth() || 0) / zoom
    const height = (this._iocEditor._zr.getHeight() || 0) / zoom
    const step = this._settingMgr.get('gridStep')

    const xSize = Math.ceil(width / step) + 1
    const ySize = Math.ceil(height / step) + 1

    return xSize * ySize
  }

  /**
   * 调整点池的大小
   *
   * 当指定的大小与当前点池的大小不一致时，会根据需要增加或减少点的数量
   * 如果大小增加，则添加新点到池中；如果大小减小，则从池中移除多余的点
   */
  resizePool() {
    const size = this.getPointsSize()

    if (size > this._size) {
      for (let i = 0; i < size - this._size; i++) {
        this._points.push(this.createPoint())
      }
    } else if (size < this._size) {
      const newPoints = this._points.splice(0, size)

      for (let i = 0; i < this._size - size; i++) {
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
    this._points[index].x = cx
    this._points[index].y = cy
  }
}

class GridManage implements IGridManage {
  private _gridStep: number = 20
  private _width: number = 0
  private _height: number = 0
  private _xPoints: number[] = []
  private _yPoints: number[] = []
  private _gridLayer: Group | null = null
  private _pointsPool: PointsPool | null = null
  private _gridZr: ZRenderType | null = null
  private _settingMgr: ISettingManage
  private _viewPortMgr: IViewPortManage
  private _iocEditor: ITinyFlowchart

  constructor(tinyFlowchart: ITinyFlowchart, viewPortMgr: IViewPortManage) {
    this._settingMgr = tinyFlowchart._settingMgr
    this._viewPortMgr = viewPortMgr
    this._iocEditor = tinyFlowchart

    setTimeout(() => {
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '0'
      container.style.top = '0'
      container.style.zIndex = '-1'
      container.style.width = '100%'
      container.style.height = '100%'
      this._iocEditor._dom.appendChild(container)
      this._gridZr = init(container)
      this._gridLayer = new Group()
      this._gridZr.add(this._gridLayer)
      this._pointsPool = new PointsPool(this._iocEditor, this._gridLayer)
      this._width = this._gridZr.getWidth() as number
      this._height = this._gridZr.getHeight() as number
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
    this._gridStep = this._settingMgr.get('gridStep')
    const zoom = this._viewPortMgr.getZoom()
    let startX = this.getClosestVal(-this._gridLayer!.x / zoom, this._gridStep)
    const endX = this.getClosestVal(-this._gridLayer!.x / zoom + this._width / zoom, this._gridStep)
    let startY = this.getClosestVal(-this._gridLayer!.y / zoom, this._gridStep)
    const endY = this.getClosestVal(
      -this._gridLayer!.y / zoom + this._height / zoom,
      this._gridStep
    )
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

    let index = 0
    for (let i = 0; i < this._yPoints.length; i++) {
      for (let j = 0; j < this._xPoints.length; j++) {
        this._pointsPool?.updatePosition(index, this._xPoints[j], this._yPoints[i])
        index++
      }
    }
  }

  resizePool() {
    this._pointsPool?.resizePool()
  }

  showGrid(show: boolean) {
    console.log('===>> grid show', show)
    show ? this._gridLayer?.show() : this._gridLayer?.hide()
  }
}

export { GridManage }
