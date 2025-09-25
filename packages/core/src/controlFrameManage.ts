import { Rect, BoundingRect, Image, Ellipse } from '@/index'

import type {
  ElementEvent,
  ITinyFlowchart,
  IViewPortManage,
  IConnectionManage,
  IShape,
  ISettingManage
} from '@/index'

export interface IControlFrameManage {
  active(node: IShape): void
  unActive(): void
  reSizeNode(boundingBox: BoundingRect): void
}

export type IResizePoint = Rect & { mark: string }

interface IPointCursor {
  cursor: string
  z: number
}

class ControlFrameManage implements IControlFrameManage {
  private _controlPoints: IResizePoint[] = []
  private _controlBox: Rect
  private _connectionMgr: IConnectionManage
  private _viewPortMgr: IViewPortManage
  private _tinyFlowchart: ITinyFlowchart
  private _settingMgr: ISettingManage
  private _node: IShape | null = null
  private _controlFrameColor: string
  constructor(tinyFlowchart: ITinyFlowchart) {
    this._tinyFlowchart = tinyFlowchart
    this._connectionMgr = tinyFlowchart._connectionMgr
    this._viewPortMgr = tinyFlowchart._viewPortMgr
    this._settingMgr = tinyFlowchart._settingMgr
    this._controlFrameColor = this._settingMgr.get('controlFrameColor')

    this._controlBox = new Rect({
      shape: { x: 0, y: 0, width: 0, height: 0 },
      style: { fill: 'transparent', stroke: this._controlFrameColor, lineDash: 'dashed' },
      silent: true
    })

    this.createControlPoints()
    this._viewPortMgr.addElementToViewPort(this._controlBox)
    this._controlPoints.forEach(point => this._viewPortMgr.addElementToViewPort(point))
    this.unActive()
    this.initEvent()
  }

  private createControlPoints() {
    const positions: IPointCursor[] = [
      { cursor: 'nw-resize', z: 100 },
      { cursor: 'ne-resize', z: 100 },
      { cursor: 'sw-resize', z: 100 },
      { cursor: 'se-resize', z: 100 }
    ]

    positions.forEach((pos: IPointCursor) => {
      const controlPoint = new Rect({
        style: {
          fill: '#fff',
          stroke: this._controlFrameColor,
          lineWidth: 1
        },
        shape: { width: 8, height: 8, r: 2 },
        draggable: true,
        cursor: pos.cursor,
        z: pos.z
      }) as IResizePoint

      controlPoint.mark = 'resizePoint'
      this._controlPoints.push(controlPoint)
    })
  }

  active(node: IShape) {
    this._node = node
    this._controlBox.show()
    this._controlPoints.forEach(point => point.show())
    const { width, height, x, y } = node.getBoundingBox()
    const lineWidth = node.style.lineWidth || 1
    this.reSizeControlFrame(new BoundingRect(x, y, width - lineWidth, height - lineWidth))
  }

  reSizeControlFrame(boundingBox: BoundingRect) {
    const { x, y, width, height } = boundingBox
    this._controlBox.attr({ shape: { width, height }, x, y })
    const offsets = [-4, width - 4, height - 4]
    this._controlPoints[0].attr({ x: x + offsets[0], y: y + offsets[0] }) // 左上角
    this._controlPoints[1].attr({ x: x + offsets[1], y: y + offsets[0] }) // 右上角
    this._controlPoints[2].attr({ x: x + offsets[0], y: y + offsets[2] }) // 左下角
    this._controlPoints[3].attr({ x: x + offsets[1], y: y + offsets[2] }) // 右下角
  }

  reSizeNode(boundingBox: BoundingRect) {
    const { x, y, width, height } = boundingBox
    const { type } = this._node as IShape

    if (type === 'image') {
      ;(this._node as unknown as Image).attr('style', { width, height })
    } else if (type === 'circle') {
      ;(this._node as unknown as Ellipse).attr('shape', {
        cx: width / 2,
        cy: height / 2,
        rx: width / 2,
        ry: height / 2
      })
    } else {
      ;(this._node as unknown as Rect).attr('shape', { width, height })
    }
    this._node?.attr('x', x)
    this._node?.attr('y', y)
    this._connectionMgr.refreshConnection(this._node as IShape)
    this.reSizeControlFrame(boundingBox)
  }

  initEvent() {
    let isDragging = false
    let startX = 0
    let startY = 0
    let oldX = 0
    let oldY = 0
    let oldWidth = 0
    let oldHeight = 0
    let offsetX = 0
    let offsetY = 0
    let x = 0
    let y = 0
    let width = 0
    let height = 0
    let oldBoundingBox: BoundingRect = new BoundingRect(oldX, oldY, oldWidth, oldHeight)

    this._controlPoints.forEach((point, i) => {
      point.on('dragstart', (e: ElementEvent) => {
        isDragging = true
        startX = e.offsetX
        startY = e.offsetY
        oldX = this._controlBox.x
        oldY = this._controlBox.y
        oldWidth = this._controlBox.shape.width
        oldHeight = this._controlBox.shape.height
        oldBoundingBox = new BoundingRect(oldX, oldY, oldWidth, oldHeight)
      })

      point.on('drag', (e: ElementEvent) => {
        if (!isDragging) return
        offsetX = e.offsetX - startX
        offsetY = e.offsetY - startY
        switch (i) {
          case 0:
            x = offsetX + oldX
            y = offsetY + oldY
            width = oldWidth - offsetX
            height = oldHeight - offsetY
            break
          case 1:
            x = oldX
            y = oldY + offsetY
            width = oldWidth + offsetX
            height = oldHeight - offsetY
            break
          case 2:
            x = oldX + offsetX
            y = oldY
            width = oldWidth - offsetX
            height = oldHeight + offsetY
            break
          case 3:
            x = oldX
            y = oldY
            width = oldWidth + offsetX
            height = oldHeight + offsetY
            break
          default:
            break
        }

        this.reSizeNode(new BoundingRect(x, y, width, height))
      })

      point.on('dragend', () => {
        isDragging = false
        this._tinyFlowchart.execute('resizeShape', {
          node: this._node,
          oldBoundingBox: oldBoundingBox,
          boundingBox: new BoundingRect(x, y, width, height)
        })
      })
    })
  }

  unActive() {
    this._controlBox.hide()
    this._controlPoints.forEach(point => point.hide())
  }
}

export { ControlFrameManage }
