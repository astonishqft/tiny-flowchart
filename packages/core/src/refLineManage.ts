import { injectable, inject } from 'inversify'
import * as zrender from 'zrender'
import IDENTIFIER from './constants/identifiers'
import { getClosestValInSortedArr, isEqualNum } from './utils'

import type { IShapeManage } from './shapeManage'
import type { IShape } from './shapes'
import type { IDragFrameManage } from './dragFrameManage'
import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IZoomManage } from './zoomManage'

export interface IRefLineManage {
  // initRefLine(zr: zrender.ZRenderType)
  updateRefLines(): { magneticOffsetX: number, magneticOffsetY: number }
  cacheRefLines(): void
  clearRefPointAndRefs(): void
}
interface IVerticalLine { // 有多个端点的垂直线
  x: number;
  ys: number[];
}

interface IHorizontalLine { // 有多个端点的水平线
  y: number;
  xs: number[];
}

@injectable()
class RefLineManage {
  // 参考图形产生的水平照线，对于其中的同一条线，y 相同（作为 key），x 不同（作为 value）
  private _hLineMap = new Map<number, number[]>()
  // 参考图形产生的垂直参照线。对于其中的同一条线，x 相同（作为 key），y 不同（作为 value）
  private _vLineMap = new Map<number, number[]>() 

  // 对 hLineMap 的 key 排序，方便高效二分查找，找到最近的线
  private _sortedXs: number[] = [] 
  // 对 vLineMap 的 key 排序
  private _sortedYs: number[] = [] 

  private _toDrawVLines: IVerticalLine[] = [] // 等待绘制的垂直参照线
  private _toDrawHLines: IHorizontalLine[] = [] // 等待绘制的水平参照线

  private _refPoints: zrender.Line[] = []
  private _refLines: zrender.Line[] = []
  private _refPointSize: number
  private _refLineColor: string

  constructor(
    @inject(IDENTIFIER.SHAPE_MANAGE) private _shapeManage: IShapeManage,
    @inject(IDENTIFIER.DRAG_FRAME_MANAGE) private _dragFrameManage: IDragFrameManage,
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage,
    @inject(IDENTIFIER.SETTING_MANAGE) private _settingManage: ISettingManage,
    @inject(IDENTIFIER.ZOOM_MANAGE) private _zoomManage: IZoomManage
  ) {
    this._refPointSize = this._settingManage.get('refPointSize')
    this._refLineColor = this._settingManage.get('refLineColor')
  }

  // 添加水平线，水平线的x值都相等
  addHLines(x: number, ys: number[]) {
    const hline = this._hLineMap.get(x)
    if (hline) {
      hline.push(...ys)
    } else {
      this._hLineMap.set(x, ys)
    }
  }

  addVLines(y: number, xs: number[]) {
    const vline = this._vLineMap.get(y)
    if (vline) {
      vline.push(...xs)
    } else {
      this._vLineMap.set(y, xs)
    }
  }

  cacheRefLines() {
    this.clear()
    this._shapeManage.getShapes().forEach((shape: IShape) => {
      const { x, y, width, height } = shape.getBoundingRect()
      const hl = x + shape.x
      const hm = hl + width / 2
      const hr = hl + width
      const vt = y + shape.y
      const vm = vt + height / 2
      const vb = vt + height
      // 水平线(y值相同，x值不同)
      this.addHLines(vt, [hl, hr])
      this.addHLines(vm, [hl, hr])
      this.addHLines(vb, [hl, hr])

      // 垂直线(x值相同，y值不同)
      this.addVLines(hl, [vt, vb])
      this.addVLines(hm, [vt, vb])
      this.addVLines(hr, [vt, vb])
    })

    this._sortedXs = Array.from(this._vLineMap.keys()).sort((a, b) => a - b)
    this._sortedYs = Array.from(this._hLineMap.keys()).sort((a, b) => a - b)
  }

  clearRefPointAndRefs() {
    this._refPoints.forEach((point: zrender.Line) => this._viewPortManage.getViewPort().remove(point))
    this._refLines.forEach((line: zrender.Line) => this._viewPortManage.getViewPort().remove(line)) 
  }

  updateRefLines(): { magneticOffsetX: number, magneticOffsetY: number } {
    this._toDrawVLines = []
    this._toDrawHLines = []
    this.clearRefPointAndRefs()

    const frame = this._dragFrameManage.getFrame()
    const { x, y, width, height } = frame.getBoundingRect()
    const hl = x + frame.x
    const hm = hl + width / 2
    const hr = hl + width
    const vt = y + frame.y
    const vm = vt + height / 2
    const vb = vt + height

    if (this._sortedXs.length === 0 && this._sortedYs.length === 0) {
      return {
        magneticOffsetX: 0,
        magneticOffsetY: 0
      }
    }

    // 如果 offsetX 到最后还是 undefined，说明没有找到最靠近的垂直参照线
    let offsetX: number = 0
    let offsetY: number = 0

    const closestHl = getClosestValInSortedArr(this._sortedXs, hl)
    const closestHm = getClosestValInSortedArr(this._sortedXs, hm)
    const closestHr = getClosestValInSortedArr(this._sortedXs, hr)

    const distMinHl = Math.abs(hl - closestHl)
    const distMinHm = Math.abs(hm - closestHm)
    const distMinHr = Math.abs(hr - closestHr)

    const closestXDist = Math.min(distMinHl, distMinHm, distMinHr)

    const closestVt = getClosestValInSortedArr(this._sortedYs, vt)
    const closestVm = getClosestValInSortedArr(this._sortedYs, vm)
    const closestVb = getClosestValInSortedArr(this._sortedYs, vb)

    const distMinVt = Math.abs(vt - closestVt)
    const distMinVm = Math.abs(vm - closestVm)
    const distMinVb = Math.abs(vb - closestVb)

    const closestYDist = Math.min(distMinVt, distMinVm, distMinVb)

    const minAdSpacing = this._settingManage.get('minAdSpacing') / this._zoomManage.getZoom()

    if (closestXDist <= minAdSpacing) {
      if (isEqualNum(closestXDist, distMinHl)) {
        offsetX = closestHl - hl
      } else if (isEqualNum(closestXDist, distMinHm)) {
        offsetX = closestHm - hm
      } else if (isEqualNum(closestXDist, distMinHr)) {
        offsetX = closestHr - hr
      }
    }

    if (closestYDist <= minAdSpacing) {
      if (isEqualNum(closestYDist, distMinVt)) {
        offsetY = closestVt - vt
      } else if (isEqualNum(closestYDist, distMinVm)) {
        offsetY = closestVm - vm
      } else if (isEqualNum(closestYDist, distMinVb)) {
        offsetY = closestVb - vb
      }
    }

    if (offsetX) {
      if (isEqualNum(offsetX, closestHl - hl)) {
        // 创建一个垂线，x值都相同
        const vLine: IVerticalLine = {
          x: closestHl,
          ys: []
        }

        vLine.ys.push(vt + offsetY) // 修正后的垂线
        vLine.ys.push(vb + offsetY)

        vLine.ys.push(...this._vLineMap.get(closestHl)!)
        this._toDrawVLines.push(vLine)
      }
      if (isEqualNum(offsetX, closestHm - hm)) {
        // 创建一个垂线，x值都相同
        const vLine: IVerticalLine = {
          x: closestHm,
          ys: []
        }
        vLine.ys.push(vm + offsetY)
        vLine.ys.push(...this._vLineMap.get(closestHm)!)
        this._toDrawVLines.push(vLine)
      }
      if (isEqualNum(offsetX, closestHr - hr)) {
        const vLine: IVerticalLine = {
          x: closestHr,
          ys: []
        }
        vLine.ys.push(vt + offsetY)
        vLine.ys.push(vb + offsetY)
        vLine.ys.push(...this._vLineMap.get(closestHr)!)
        this._toDrawVLines.push(vLine)
      }
    }

    if (offsetY) {
      if (isEqualNum(offsetY, closestVt - vt)) {
        const hLine: IHorizontalLine = {
          y: closestVt,
          xs: []
        }
        hLine.xs.push(hl + offsetX)
        hLine.xs.push(hr + offsetX)
        hLine.xs.push(...this._hLineMap.get(closestVt)!)
        this._toDrawHLines.push(hLine)
      }
      if (isEqualNum(offsetY, closestVm - vm)) {
        const hLine: IHorizontalLine = {
          y: closestVm,
          xs: []
        }
        hLine.xs.push(hm + offsetX)
        hLine.xs.push(...this._hLineMap.get(closestVm)!)
        this._toDrawHLines.push(hLine)
      }
      if (isEqualNum(offsetY, closestVb - vb)) {
        const hLine: IHorizontalLine = {
          y: closestVb,
          xs: []
        }
        hLine.xs.push(hl + offsetX)
        hLine.xs.push(hr + offsetX)
        hLine.xs.push(...this._hLineMap.get(closestVb)!)
        this._toDrawHLines.push(hLine)
      }
    }

    // 修正拖动浮层的位置，产生磁吸的效果
    if (offsetX || offsetY) {
      this._dragFrameManage.updatePosition(
        this._dragFrameManage.getFrame().x + offsetX,
        this._dragFrameManage.getFrame().y + offsetY
      )
    }

    const pointsSet = new Set()
    for(const { x, ys = [] } of this._toDrawVLines) {
      let minY = Infinity
      let maxY = -Infinity
      for (const y of ys) {
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
        // 过滤掉重复的点
        const key = `${x},${y}`
        if (pointsSet.has(key)) {
          continue
        }
        pointsSet.add(key)
    
        this.drawRefPoint(x, y)
      }
      this.drawRefLine(x, minY, x, maxY)
    }

    for(const { y, xs = [] } of this._toDrawHLines) {
      let minX = Infinity
      let maxX = -Infinity
      for (const x of xs) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        // 过滤掉重复的点
        const key = `${x},${y}`
        if (pointsSet.has(key)) {
          continue
        }
        pointsSet.add(key)
    
        this.drawRefPoint(x, y)
      }
      this.drawRefLine(minX, y, maxX, y)
    }

    return {
      magneticOffsetX: offsetX,
      magneticOffsetY: offsetY
    }
  }

  drawRefPoint(x: number, y: number) {

    const lineL = new zrender.Line({
      shape: {
        x1: x - this._refPointSize,
        y1: y - this._refPointSize,
        x2: x + this._refPointSize,
        y2: y + this._refPointSize
      },
      style: {
        stroke: this._refLineColor,
        lineWidth: 1
      },
      silent: true,
      z: 100000
    })
    const lineR = new zrender.Line({
      shape: {
        x1: x + this._refPointSize,
        y1: y - this._refPointSize,
        x2: x - this._refPointSize,
        y2: y + this._refPointSize
      },
      style: {
        stroke: this._refLineColor,
        lineWidth: 1
      },
      silent: true,
      z: 100000
    })

    this._viewPortManage.getViewPort().add(lineL)
    this._viewPortManage.getViewPort().add(lineR)
    this._refPoints.push(lineL)
    this._refPoints.push(lineR)
  }

  drawRefLine(x1: number, y1: number, x2: number, y2: number) {
    const l = new zrender.Line({
      shape: {
        x1,
        y1,
        x2,
        y2
      },
      style: {
        stroke: this._refLineColor,
        lineWidth: 1
      },
      silent: true,
      z: 100000
    })

    this._viewPortManage.getViewPort().add(l)
    this._refLines.push(l)
  }

  clear() {
    this._hLineMap.clear()
    this._vLineMap.clear()
    this._toDrawVLines = []
    this._toDrawHLines = []
    this._sortedXs = []
    this._sortedYs = []
  }
}

export { RefLineManage }
