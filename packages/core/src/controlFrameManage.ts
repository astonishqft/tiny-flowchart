import * as zrender from 'zrender'

import type { IIocEditor } from './iocEditor'
import type { IViewPortManage } from './viewPortManage'
import type { IConnectionManage } from './connectionManage'
import type { IShape } from './shapes'

export interface IControlFrameManage {
  active(node: IShape): void
  unActive(): void
  reSizeNode(boundingBox: zrender.BoundingRect): void
}

class ControlFrameManage implements IControlFrameManage {
  private _ltControlPoint: zrender.Rect
  private _rtControlPoint: zrender.Rect
  private _lbControlPoint: zrender.Rect
  private _rbControlPoint: zrender.Rect
  private _controlBox: zrender.Rect
  private _connectionMgr: IConnectionManage
  private _viewPortMgr: IViewPortManage
  private _iocEditor: IIocEditor
  private _node: IShape | null = null
  constructor(iocEditor: IIocEditor) {
    this._iocEditor = iocEditor
    this._connectionMgr = iocEditor._connectionMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._controlBox = new zrender.Rect({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      style: {
        fill: 'transparent',
        stroke: 'red'
      }
    })

    // 左上角控制点
    this._ltControlPoint = new zrender.Rect({
      style: {
        fill: '#fff',
        stroke: 'red',
        lineWidth: 1
      },
      shape: {
        width: 8,
        height: 8,
        r: 2
      },
      draggable: true,
      cursor: 'nw-resize',
      z: 100
    })

    // 右上角控制点
    this._rtControlPoint = new zrender.Rect({
      style: {
        fill: '#fff',
        stroke: 'red',
        lineWidth: 1
      },
      shape: {
        width: 8,
        height: 8,
        r: 2
      },
      draggable: true,
      cursor: 'ne-resize',
      z: 100
    })

    // 左下角控制点
    this._lbControlPoint = new zrender.Rect({
      style: {
        fill: '#fff',
        stroke: 'red',
        lineWidth: 1
      },
      shape: {
        width: 8,
        height: 8,
        r: 2
      },
      draggable: true,
      cursor: 'sw-resize',
      z: 100
    })

    // 右下角
    this._rbControlPoint = new zrender.Rect({
      style: {
        fill: '#fff',
        stroke: 'red',
        lineWidth: 1
      },
      shape: {
        width: 8,
        height: 8,
        r: 2
      },
      draggable: true,
      cursor: 'se-resize',
      z: 100
    })

    this._viewPortMgr.addElementToViewPort(this._controlBox)
    this._viewPortMgr.addElementToViewPort(this._ltControlPoint)
    this._viewPortMgr.addElementToViewPort(this._rtControlPoint)
    this._viewPortMgr.addElementToViewPort(this._lbControlPoint)
    this._viewPortMgr.addElementToViewPort(this._rbControlPoint)
    this.unActive()

    this.initEvent()
  }

  active(node: IShape) {
    this._node = node
    this._controlBox.show()
    this._ltControlPoint.show()
    this._rtControlPoint.show()
    this._lbControlPoint.show()
    this._rbControlPoint.show()
    const boundingBox = node.getBoundingBox()
    this.reSizeControlFrame(boundingBox)
  }

  reSizeControlFrame(boundingBox: zrender.BoundingRect) {
    const { x, y, width, height } = boundingBox
    this._controlBox.attr('shape', { width, height })
    this._controlBox.attr('x', x)
    this._controlBox.attr('y', y)
    this._ltControlPoint.attr('x', x - 4)
    this._ltControlPoint.attr('y', y - 4)
    this._rtControlPoint.attr('x', x + width - 4)
    this._rtControlPoint.attr('y', y - 4)
    this._lbControlPoint.attr('x', x - 4)
    this._lbControlPoint.attr('y', y + height - 4)
    this._rbControlPoint.attr('x', x + width - 4)
    this._rbControlPoint.attr('y', y + height - 4)
  }

  reSizeNode(boundingBox: zrender.BoundingRect) {
    const { x, y, width, height } = boundingBox
    const { type } = this._node as IShape

    if (type === 'image') {
      ;(this._node as unknown as zrender.Image).attr('style', { width, height })
    } else if (type === 'circle') {
      ;(this._node as unknown as zrender.Ellipse).attr('shape', {
        cx: width / 2,
        cy: height / 2,
        rx: width / 2,
        ry: height / 2
      })
    } else {
      ;(this._node as unknown as zrender.Rect).attr('shape', { width, height })
    }
    this._node?.attr('x', x)
    this._node?.attr('y', y)
    this._connectionMgr.refreshConnection(this._node as IShape)
    this.reSizeControlFrame(boundingBox)
    // this._iocEditor.updateMiniMap$.next()
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
    let oldBoundingBox: zrender.BoundingRect = new zrender.BoundingRect(
      oldX,
      oldY,
      oldWidth,
      oldHeight
    )
    ;[
      this._ltControlPoint,
      this._rtControlPoint,
      this._lbControlPoint,
      this._rbControlPoint
    ].forEach((item, i) => {
      item.on('dragstart', (e: zrender.ElementEvent) => {
        isDragging = true
        startX = e.offsetX
        startY = e.offsetY
        oldX = this._controlBox.x
        oldY = this._controlBox.y
        oldWidth = this._controlBox.shape.width
        oldHeight = this._controlBox.shape.height
        oldBoundingBox = new zrender.BoundingRect(oldX, oldY, oldWidth, oldHeight)
      })

      item.on('drag', (e: zrender.ElementEvent) => {
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

        this.reSizeNode(new zrender.BoundingRect(x, y, width, height))
      })

      item.on('dragend', () => {
        isDragging = false
        this._iocEditor.execute('resizeShape', {
          node: this._node,
          oldBoundingBox: oldBoundingBox,
          boundingBox: new zrender.BoundingRect(x, y, width, height)
        })
      })
    })
  }

  unActive() {
    this._controlBox.hide()
    this._ltControlPoint.hide()
    this._rtControlPoint.hide()
    this._lbControlPoint.hide()
    this._rbControlPoint.hide()
  }
}

export { ControlFrameManage }
