import * as zrender from 'zrender'
import { getClosestValInSortedArr, isEqualNum } from './utils'

import type { IShape } from './shapes'
import type { IDragFrameManage } from './dragFrameManage'
import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IStorageManage } from './storageManage'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IocEditor } from './iocEditor'

export interface IRefLineManage {
  updateRefLines(): { magneticOffsetX: number, magneticOffsetY: number }
  // addNode(node: IShape): void
  cacheRefLines(): void
  // removeNode(node: IShape): void
  clearRefPointAndRefLines(): void
}
interface IVerticalLine { // 有多个端点的垂直线
  x: number
  ys: number[]
}

interface IHorizontalLine { // 有多个端点的水平线
  y: number
  xs: number[]
}

class RefLineManage {
  // 参考图形产生的水平参照线，对于其中的同一条线，y 相同（作为 key），x 不同（作为 value）
  private _hLineMap = new Map<number, number[]>()
  // 参考图形产生的垂直参照线。对于其中的同一条线，x 相同（作为 key），y 不同（作为 value）
  private _vLineMap = new Map<number, number[]>()

  // 对 hLineMap 的 key 排序，方便高效二分查找，找到最近的线
  private _sortedXs: number[] = []
  // 对 vLineMap 的 key 排序
  private _sortedYs: number[] = []

  private _toDrawVLines: IVerticalLine[] = [] // 等待绘制的垂直参照线
  private _toDrawHLines: IHorizontalLine[] = [] // 等待绘制的水平参照线

  private _refPoints: number[][] = []
  private _refLines: number[][] = []
  private _refPointSize: number
  private _refLineColor: string

  private _refLinePool: zrender.Line[] = []
  private _refPointPool: zrender.Line[][] = []

  private _magneticSpacing = 0

  private _settingMgr: ISettingManage
  private _storageMgr: IStorageManage
  private _viewPortMgr: IViewPortManage
  private _dragFrameMgr: IDragFrameManage

  constructor(iocEditor: IocEditor) {
    this._settingMgr = iocEditor._settingMgr
    this._storageMgr = iocEditor._storageMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._dragFrameMgr = iocEditor._dragFrameMgr
    
    this._refPointSize = this._settingMgr.get('refPointSize')
    this._refLineColor = this._settingMgr.get('refLineColor')

    this. _magneticSpacing = this._settingMgr.get('magneticSpacing') / this._storageMgr.getZoom()
    this.createRefLinePool()
    this.createRefPointPool()
  }

  createRefLinePool() {
    for (let i = 0; i < 6; i++) {
      const l = new zrender.Line({
        shape: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0
        },
        style: {
          stroke: this._refLineColor,
          lineWidth: 1
        },
        silent: true,
        z: 100000,
        invisible: true
      })
  
      this._viewPortMgr.addElementToViewPort(l)
      this._refLinePool.push(l) 
    }
  }

  createRefPointPool() {
    for (let i = 0; i < 23; i++) {
      const lineL = new zrender.Line({
        shape: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0
        },
        style: {
          stroke: this._refLineColor,
          lineWidth: 1
        },
        silent: true,
        z: 100000,
        invisible: true
      })
      const lineR = new zrender.Line({
        shape: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0
        },
        style: {
          stroke: this._refLineColor,
          lineWidth: 1
        },
        silent: true,
        z: 100000,
        invisible: true
      })

      this._viewPortMgr.addElementToViewPort(lineL)
      this._viewPortMgr.addElementToViewPort(lineR)
      this._refPointPool.push([lineL, lineR])
    }
  }

  // 添加垂直线，垂直线的x值都相等
  addVLines(x: number, ys: number[]) {
    const hline = this._hLineMap.get(x)
    if (hline) {
      hline.push(...ys)
    } else {
      this._hLineMap.set(x, ys)
    }
  }

  addHLines(y: number, xs: number[]) {
    const vline = this._vLineMap.get(y)
    if (vline) {
      vline.push(...xs)
    } else {
      this._vLineMap.set(y, xs)
    }
  }

  getAllNodes(): (IShape | INodeGroup)[] {
    return [...this._storageMgr.getShapes(), ...this._storageMgr.getGroups()]
  }

  cacheRefLines() {
    this.clear()
    this.getAllNodes().forEach((shape: IShape | INodeGroup) => {
      const { x, y, width, height } = shape.getBoundingRect()
      const hl = x + shape.x
      const hm = hl + width / 2
      const hr = hl + width
      const vt = y + shape.y
      const vm = vt + height / 2
      const vb = vt + height
      // 水平线(y值相同，x值不同)
      this.addVLines(vt, [hl, hr])
      this.addVLines(vm, [hl, hr])
      this.addVLines(vb, [hl, hr])

      // 垂直线(x值相同，y值不同)
      this.addHLines(hl, [vt, vb])
      this.addHLines(hm, [vt, vb])
      this.addHLines(hr, [vt, vb])
    })

    this._sortedXs = Array.from(this._vLineMap.keys()).sort((a, b) => a - b)
    this._sortedYs = Array.from(this._hLineMap.keys()).sort((a, b) => a - b)
  }

  clearRefPointAndRefLines() {
    this._refLines.forEach((_, i) => {
      this._refLinePool[i].invisible = true
    })

    this._refPoints.forEach((_, i) => {
      this._refPointPool[i][0].invisible = true
      this._refPointPool[i][1].invisible = true
    })
    this._refPoints = []
    this._refLines = []
  }

  updateRefLines(): { magneticOffsetX: number, magneticOffsetY: number } {
    this._toDrawVLines = []
    this._toDrawHLines = []
    this.clearRefPointAndRefLines()

    const frame = this._dragFrameMgr.getFrame()
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

    if (closestXDist <= this._magneticSpacing) {
      if (isEqualNum(closestXDist, distMinHl)) {
        offsetX = closestHl - hl
      } else if (isEqualNum(closestXDist, distMinHm)) {
        offsetX = closestHm - hm
      } else if (isEqualNum(closestXDist, distMinHr)) {
        offsetX = closestHr - hr
      }
    }

    if (closestYDist <= this._magneticSpacing) {
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
      this._dragFrameMgr.updatePosition(
        this._dragFrameMgr.getFrame().x + offsetX,
        this._dragFrameMgr.getFrame().y + offsetY
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

        this._refPoints.push([x, y])
      }

      this._refLines.push([x, minY, x, maxY])
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

        this._refPoints.push([x, y])
      }

      this._refLines.push([minX, y, maxX, y])
    }

    this._refLines.forEach(([x1, y1, x2, y2], i) => {
      this._refLinePool[i].attr({
        shape: {
          x1,
          y1,
          x2,
          y2
        },
        invisible: false
      })
    })

    this._refPoints.forEach(([x, y], i) => {
      this._refPointPool[i][0].attr({
        shape: {
          x1: x - this._refPointSize,
          y1: y - this._refPointSize,
          x2: x + this._refPointSize,
          y2: y + this._refPointSize
        },
        invisible: false
      })

      this._refPointPool[i][1].attr({
        shape: {
          x1: x + this._refPointSize,
          y1: y - this._refPointSize,
          x2: x - this._refPointSize,
          y2: y + this._refPointSize
        },
        invisible: false
      })
    })

    return {
      magneticOffsetX: offsetX,
      magneticOffsetY: offsetY
    }
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
