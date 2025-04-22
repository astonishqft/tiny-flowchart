import { Line } from '@/index'
import { getClosestLine, isEqualNum } from '@/utils'

import type {
  IDragFrameManage,
  IViewPortManage,
  ISettingManage,
  IStorageManage,
  ITinyFlowchart
} from '@/index'

export interface IRefLineManage {
  updateRefLines(): { magneticOffsetX: number; magneticOffsetY: number }
  cacheRefLines(): void
  clearRefPointAndRefLines(): void
}

interface IVerticalLine {
  // 有多个端点的垂直线
  x: number
  ys: number[]
}

interface IHorizontalLine {
  // 有多个端点的水平线
  y: number
  xs: number[]
}

interface IFrame {
  x: number
  y: number
  getBoundingRect(): { width: number; height: number }
}

class RefLineManage {
  // 参考图形产生的水平参照线，对于其中的同一条线，y 相同（作为 key），x 不同（作为 value）
  private _hLineMap = new Map<number, number[]>()
  // 参考图形产生的垂直参照线。对于其中的同一条线，x 相同（作为 key），y 不同（作为 value）
  private _vLineMap = new Map<number, number[]>()

  // 对 vLineMap 的 key 排序，方便高效二分查找，找到最近的线
  private _sortedXs: number[] = []
  // 对 hLineMap 的 key 排序，方便高效二分查找，找到最近的线
  private _sortedYs: number[] = []

  private _toDrawVLines: IVerticalLine[] = [] // 等待绘制的垂直参照线
  private _toDrawHLines: IHorizontalLine[] = [] // 等待绘制的水平参照线

  private _refPoints: number[][] = []
  private _refLines: number[][] = []
  private _refPointSize: number
  private _refLineColor: string

  private _refLinePool: Line[] = []
  private _refPointPool: Line[][] = []

  private _magneticSpacing = 0

  private _settingMgr: ISettingManage
  private _storageMgr: IStorageManage
  private _viewPortMgr: IViewPortManage
  private _dragFrameMgr: IDragFrameManage

  constructor(tinyFlowchart: ITinyFlowchart) {
    this._settingMgr = tinyFlowchart._settingMgr
    this._storageMgr = tinyFlowchart._storageMgr
    this._viewPortMgr = tinyFlowchart._viewPortMgr
    this._dragFrameMgr = tinyFlowchart._dragFrameMgr

    this._refPointSize = this._settingMgr.get('refPointSize')
    this._refLineColor = this._settingMgr.get('refLineColor')

    this._magneticSpacing = this._settingMgr.get('magneticSpacing') / this._viewPortMgr.getZoom()
    this.createRefLinePool()
    this.createRefPointPool()
  }

  createRefLinePool() {
    for (let i = 0; i < 6; i++) {
      // 最多显示6条参考线
      const l = new Line({
        style: {
          stroke: this._refLineColor,
          lineWidth: 1,
          strokeNoScale: true
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
    for (let i = 0; i < 100; i++) {
      const lineL = new Line({
        style: {
          stroke: this._refLineColor,
          lineWidth: 1,
          strokeNoScale: true
        },
        silent: true,
        z: 100000,
        invisible: true
      })
      const lineR = new Line({
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
    const vline = this._vLineMap.get(x)
    if (vline) {
      vline.push(...ys)
    } else {
      this._vLineMap.set(x, ys)
    }
  }

  // 添加水平线，水平线的y值都相等
  addHLines(y: number, xs: number[]) {
    const hline = this._hLineMap.get(y)
    if (hline) {
      hline.push(...xs)
    } else {
      this._hLineMap.set(y, xs)
    }
  }

  cacheRefLines() {
    this.clear()
    this._storageMgr.getNodes().forEach(shape => {
      const { vl, vm, vr, ht, hm, hb } = this.getFrameCoordinates(shape)
      // 垂直线(x值相同，y值不同)
      this.addVLines(vl, [ht, hb])
      this.addVLines(vm, [ht, hb])
      this.addVLines(vr, [ht, hb])
      // 水平线(y值相同，x值不同)
      this.addHLines(ht, [vl, vr])
      this.addHLines(hm, [vl, vr])
      this.addHLines(hb, [vl, vr])
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

  getFrameCoordinates(frame: IFrame) {
    const { width, height } = frame.getBoundingRect()

    return {
      vl: frame.x,
      vm: frame.x + width / 2,
      vr: frame.x + width,
      ht: frame.y,
      hm: frame.y + height / 2,
      hb: frame.y + height
    }
  }

  updateRefLines(): { magneticOffsetX: number; magneticOffsetY: number } {
    this._toDrawVLines = []
    this._toDrawHLines = []
    this.clearRefPointAndRefLines()

    if (this._sortedXs.length === 0 && this._sortedYs.length === 0) {
      return {
        magneticOffsetX: 0,
        magneticOffsetY: 0
      }
    }

    const frame = this._dragFrameMgr.getFrame()
    const { vl, vm, vr, ht, hm, hb } = this.getFrameCoordinates(frame)
    let offsetX: number = 0
    let offsetY: number = 0

    const vs = [vl, vm, vr]
    const hs = [ht, hm, hb]

    const closestVs = vs.map(v => getClosestLine([...this._sortedXs], v))
    const closestHs = hs.map(h => getClosestLine(this._sortedYs, h))

    const closestVDiffs = vs.map((v, i) => closestVs[i] - v)
    const closestHDiffs = hs.map((h, i) => closestHs[i] - h)

    const closestVDist = Math.min(...closestVDiffs.map(v => Math.abs(v)))
    const closestHDist = Math.min(...closestHDiffs.map(h => Math.abs(h)))

    if (closestVDist <= this._magneticSpacing) {
      for (const closestVDiff of closestVDiffs) {
        if (isEqualNum(closestVDist, Math.abs(closestVDiff))) {
          offsetX = closestVDiff
          break
        }
      }
    }

    if (closestHDist <= this._magneticSpacing) {
      for (const closestHDiff of closestHDiffs) {
        if (isEqualNum(closestHDist, Math.abs(closestHDiff))) {
          offsetY = closestHDiff
          break
        }
      }
    }

    if (offsetX) {
      vs.forEach((y, i) => {
        if (isEqualNum(offsetX, closestVDiffs[i])) {
          const vLine: IVerticalLine = {
            x: closestVs[i],
            ys: []
          }

          vLine.ys.push(ht + offsetY) // 修正后的垂线
          vLine.ys.push(hb + offsetY)
          vLine.ys.push(...(this._vLineMap.get(closestVs[i])!! ?? []))
          this._toDrawVLines.push(vLine)
        }
      })
    }

    if (offsetY) {
      hs.forEach((x, i) => {
        if (isEqualNum(offsetY, closestHDiffs[i])) {
          const hLine: IHorizontalLine = {
            y: closestHs[i],
            xs: []
          }

          hLine.xs.push(vl + offsetX) // 修正后的水平线
          hLine.xs.push(vr + offsetX)
          hLine.xs.push(...(this._hLineMap.get(closestHs[i])!! ?? []))
          this._toDrawHLines.push(hLine)
        }
      })
    }
    // 修正拖动浮层的位置，产生磁吸的效果
    if (offsetX || offsetY) {
      this._dragFrameMgr.updatePosition(
        this._dragFrameMgr.getFrame().x + offsetX,
        this._dragFrameMgr.getFrame().y + offsetY
      )
    }

    const pointsSet = new Set()
    for (const { x, ys = [] } of this._toDrawVLines) {
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

    for (const { y, xs = [] } of this._toDrawHLines) {
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
