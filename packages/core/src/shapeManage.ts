import * as zrender from 'zrender'
import { getShape } from './shapes'
import { Anchor } from './anchor'
import { getBoundingRect } from './utils'
import { Disposable, IDisposable } from './disposable'
import { NodeEventManage } from './nodeEventManage'

import type { IExportShape, IShape } from './shapes'
import type { IAnchorPoint } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IConnectionManage } from './connectionManage'
import type { IStorageManage } from './storageManage'
import type { INodeGroup } from 'shapes/nodeGroup'
import type { IocEditor } from './iocEditor'
import type { IAnchor } from './shapes'

export interface IShapeManage extends IDisposable {
  createShape(type: string, options: { x: number; y: number }): IShape
  clear(): void
}

class ShapeManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  private _connectionMgr: IConnectionManage
  private _iocEditor: IocEditor
  constructor(iocEditor: IocEditor) {
    super()
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
    this._connectionMgr = iocEditor._connectionMgr
    this._iocEditor = iocEditor
  }

  createShape(type: string, { x, y }: { x: number; y: number }): IShape {
    const viewPortX = this._viewPortMgr.getPositionX()
    const viewPortY = this._viewPortMgr.getPositionY()
    const zoom = this._storageMgr.getZoom()

    const shape = getShape(type, {
      x: (x - viewPortX) / zoom,
      y: (y - viewPortY) / zoom
    })

    shape.getExportData = () => {
      const exportData: IExportShape = {
        x: shape.x,
        y: shape.y,
        id: shape.id,
        type,
        z: shape.z,
        style: {
          fill: shape.style.fill,
          stroke: shape.style.stroke,
          lineWidth: shape.style.lineWidth,
          lineDash: shape.style.lineDash,
          fontColor: shape.getTextContent().style.fill,
          text: shape.getTextContent().style.text,
          fontSize: shape.getTextContent().style.fontSize,
          fontWeight: shape.getTextContent().style.fontWeight,
          fontStyle: shape.getTextContent().style.fontStyle,
          textPosition: shape.textConfig.position
        }
      }

      if (shape.parentGroup) {
        exportData.parent = shape.parentGroup.id
      }

      return exportData
    }

    // 给每个shape增加公共方法
    shape.getBoundingBox = () => {
      const { width, height } = getBoundingRect([shape])
      return new zrender.BoundingRect(shape.x, shape.y, width, height)
    }

    shape.active = () => {
      shape.selected = true
      shape.attr({
        style: {
          shadowColor: '#1971c2',
          shadowBlur: 1
        }
      })
      shape.anchor?.show()
    }

    shape.unActive = () => {
      shape.selected = false
      shape.attr({
        style: {
          shadowColor: '',
          shadowBlur: 0
        }
      })
      shape.anchor?.hide()
    }

    shape.getAnchors = () => {
      return shape.anchors.slice()
    }

    shape.getAnchorByIndex = (index: number) => {
      return shape.anchors.filter((item: IAnchor) => item.index == index)[0]
    }

    shape.updatePosition = (target: IShape | INodeGroup, offsetX: number, offsetY: number) => {
      ;(target as IShape).attr('x', (target as IShape).oldX! + offsetX)
      ;(target as IShape).attr('y', (target as IShape).oldY! + offsetY)
      this._connectionMgr.refreshConnection(target)
    }

    shape.setOldPosition = (shape: IShape | INodeGroup) => {
      shape.oldX = shape.x
      shape.oldY = shape.y
    }

    const anchor = new Anchor(shape)
    shape.anchor = anchor

    shape.createAnchors()
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addElementToViewPort(bar)
    })
    shape.anchor.refresh()
    new NodeEventManage(shape, this._iocEditor)
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
}

export { ShapeManage }
