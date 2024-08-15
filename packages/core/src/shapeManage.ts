
import { injectable, inject } from 'inversify'
import * as zrender from 'zrender'
// import { Subject, Observable } from 'rxjs'
import { getShape } from './shapes'
import IDENTIFIER from './constants/identifiers'
import { Anchor } from './anchor'
import { Disposable, IDisposable } from './disposable'

import type { IShape } from './shapes'
import type { IAnchorPoint } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IConnectionManage } from './connectionManage'
import type { IRefLineManage } from './refLineManage'
import type { IStorageManage } from './storageManage'

export interface IShapeManage extends IDisposable {
  // updateAddShape$: Observable<IShape>
  createShape(type: string, options: { x: number, y: number }): IShape
  clear(): void
  unActive(): void
}

@injectable()
class ShapeManage extends Disposable {
  // updateAddShape$ = new Subject<IShape>()
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortMgr: IViewPortManage,
    @inject(IDENTIFIER.DRAG_FRAME_MANAGE) private _dragFrameMgr: IDragFrameManage,
    @inject(IDENTIFIER.CONNECTION_MANAGE) private _connectionMgr: IConnectionManage,
    @inject(IDENTIFIER.REF_LINE_MANAGE) private _refLineMgr: IRefLineManage,
    @inject(IDENTIFIER.STORAGE_MANAGE) private _storageMgr: IStorageManage 
  ) {
    super()
    // this._disposables.push(this.updateAddShape$)
  }

  createShape(type: string, { x, y }: { x: number, y: number }): IShape {
    const viewPortX = this._viewPortMgr.getPositionX()
    const viewPortY = this._viewPortMgr.getPositionY()
    const zoom = this._storageMgr.getZoom()

    const shape = getShape(type, { x: (x  - viewPortX) /zoom, y: (y - viewPortY) / zoom })

    const anchor = new Anchor(shape)
    shape.anchor = anchor

    // this.updateAddShape$.next(shape)

    shape.createAnchors()
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addElementToViewPort(bar)
    })
    shape.anchor.refresh()
    this.initShapeEvent(shape)
    this._viewPortMgr.addElementToViewPort(shape)

    this._storageMgr.addShape(shape)

    return shape
  }

  clear() {
    this._storageMgr.getShapes().forEach((shape: IShape) => {
      this._viewPortMgr.removeElementFromViewPort(shape)
      shape.anchor?.bars.forEach((bar: IAnchorPoint) => {
        this._viewPortMgr.removeElementFromViewPort(bar)
      })
    })
    this._storageMgr.clearShapes()
  }

  initShapeEvent(shape: IShape) {
    let startX = 0
    let startY = 0
    let zoom = 1
    let magneticOffsetX = 0
    let magneticOffsetY = 0
    const mouseMove = (e: MouseEvent) => {
      const nodeName = (e.target as HTMLElement).nodeName
      if (nodeName !== 'CANVAS') return
      const { offsetX, offsetY } = e
      const stepX = offsetX - startX
      const stepY = offsetY - startY
      // 设置一个阈值，避免鼠标发生轻微位移时出现拖动浮层
      if (Math.abs(offsetX / zoom) > 2 || Math.abs(offsetY / zoom) > 2) {
        this._dragFrameMgr.updatePosition(shape.x + stepX / zoom, shape.y + stepY / zoom)
      }
      // 拖拽浮层的时候同时更新对其参考线
      const magneticOffset = this._refLineMgr.updateRefLines()
      magneticOffsetX = magneticOffset.magneticOffsetX
      magneticOffsetY = magneticOffset.magneticOffsetY
    }

    const mouseUp = (e: MouseEvent) => {
      this._dragFrameMgr.hide()
      shape.attr('x', shape.oldX! + (e.offsetX - startX) / zoom + magneticOffsetX / zoom)
      shape.attr('y', shape.oldY! + (e.offsetY - startY) / zoom + magneticOffsetY / zoom)

      this._connectionMgr.refreshConnection(shape)

      this._refLineMgr.clearRefPointAndRefLines()
      magneticOffsetX = 0
      magneticOffsetY = 0
      // 取消事件监听
      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)

      this.updateGroupSize(shape)
    }

    shape.on('click', () => {
      console.log('shape click', shape)
      this.unActive()
      // this._groupMgr.unActive()
      shape.active()
    })

    shape.on('mousemove', () => {
      shape.anchor?.show();
      (shape as unknown as zrender.Displayable).attr('cursor', 'move')
    })

    shape.on('mouseout', () => {
      shape.anchor?.hide()
    })

    shape.on('mousedown', (e) => {
      startX = e.offsetX
      startY = e.offsetY
      shape.oldX = shape.x
      shape.oldY = shape.y
      zoom = this._storageMgr.getZoom()
      this._dragFrameMgr.updatePosition(shape.x, shape.y)
      this._dragFrameMgr.show()
      const { width, height } = this.getBoundingBox([shape])
      this._dragFrameMgr.initSize(width, height)

      this._refLineMgr.cacheRefLines()
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
    })

    shape.on('mouseup', () => {
      console.log('shape mouseup')
    })
  }

  unActive() {
    this._storageMgr.getShapes().forEach((shape: IShape) => {
      shape.unActive()
    })
  }

  getBoundingBox(shapes: IShape[]): zrender.BoundingRect {
    const g = new zrender.Group()
    return g.getBoundingRect(shapes)
  }

  updateGroupSize(shape: IShape) {
    if (shape.parentGroup) {
      shape.parentGroup.resizeNodeGroup()
      shape.parentGroup.createAnchors()
      shape.parentGroup.anchor!.refresh()
      this._connectionMgr.refreshConnection(shape.parentGroup)
      this.updateGroupSize(shape.parentGroup)
    }
  }
}

export { ShapeManage } 
