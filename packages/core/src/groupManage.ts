import { inject, injectable } from 'inversify'
import * as zrender from 'zrender'
import IDENTIFIER from './constants/identifiers'
import { NodeGroup } from './shapes/nodeGroup'
import { Anchor } from './anchor'
import { getMinPosition } from './utils'

import type { IViewPortManage } from './viewPortManage'
import type { IShapeManage } from './shapeManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IRefLineManage } from './refLineManage'
import type { IConnectionManage } from './connectionManage'
import type { IZoomManage } from './zoomManage'
import type { IAnchorPoint } from './shapes'

export interface IGroupManage {
  createGroup(): void
  unActive(): void
}

@injectable()
class GroupManage {
  private _groups: NodeGroup[] = []
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortMgr: IViewPortManage,
    @inject(IDENTIFIER.SHAPE_MANAGE) private _shapeMgr: IShapeManage,
    @inject(IDENTIFIER.DRAG_FRAME_MANAGE) private _dragFrameMgr: IDragFrameManage,
    @inject(IDENTIFIER.REF_LINE_MANAGE) private _refLineMgr: IRefLineManage,
    @inject(IDENTIFIER.CONNECTION_MANAGE) private _connectionMgr: IConnectionManage,
    @inject(IDENTIFIER.ZOOM_MANAGE) private _zoomMgr: IZoomManage,
  ) {}

  createGroup() {
    const activeShapes = this._shapeMgr.getActiveShapes()
    if (activeShapes.length < 2) {
      return
    }

    const minPostion = getMinPosition(activeShapes)

    const g = new zrender.Group()
    const boundingBox = g.getBoundingRect(activeShapes)
    boundingBox.x = minPostion[0]
    boundingBox.y = minPostion[1]
    const groupNode = new NodeGroup(boundingBox, activeShapes)

    const anchor = new Anchor(groupNode)
    groupNode.anchor = anchor

    groupNode.createAnchors()
    groupNode.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addAnchorToViewPort(bar)
    })
    groupNode.anchor.refresh()
    this.initShapeEvent(groupNode)
    this._groups.push(groupNode)
    this._viewPortMgr.getViewPort().add(groupNode)
    // 创建一个节点之后，就立即提前缓存参考线
    // TODO 只要元素发生变化都需要更新
    this._refLineMgr.addNode(groupNode)
  }

  initShapeEvent(nodeGroup: NodeGroup) {
    let startX = 0
    let startY = 0
    let oldViewPortX = 0
    let oldViewPortY = 0
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
        this._dragFrameMgr.updatePosition(nodeGroup.x + stepX / zoom, nodeGroup.y + stepY / zoom)
      }
      // 拖拽浮层的时候同时更新对其参考线
      const magneticOffset = this._refLineMgr.updateRefLines()
      magneticOffsetX = magneticOffset.magneticOffsetX
      magneticOffsetY = magneticOffset.magneticOffsetY
    }

    const mouseUp = (e: MouseEvent) => {
      this._dragFrameMgr.hide()
      nodeGroup.attr('x', nodeGroup.oldX! + (e.offsetX - startX) / zoom + magneticOffsetX / zoom)
      nodeGroup.attr('y', nodeGroup.oldY! + (e.offsetY - startY) / zoom + magneticOffsetY / zoom)

      this._connectionMgr.refreshConnection(nodeGroup)

      this._refLineMgr.clearRefPointAndRefLines()
      magneticOffsetX = 0
      magneticOffsetY = 0

      nodeGroup.shapes.forEach((shape) => {
        shape.attr('x', shape.oldX! + (e.offsetX - startX) / zoom + magneticOffsetX / zoom)
        shape.attr('y', shape.oldY! + (e.offsetY - startY) / zoom + magneticOffsetY / zoom)
        shape.createAnchors()
        shape.anchor!.refresh()
        this._connectionMgr.refreshConnection(shape)
      })
      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)
    }

    nodeGroup.on('click', () => {
      nodeGroup.active()
    })

    nodeGroup.on('mousemove', () => {
      nodeGroup.anchor?.show();
      (nodeGroup as unknown as zrender.Displayable).attr('cursor', 'move')
    })

    nodeGroup.on('mouseout', () => {
      nodeGroup.anchor?.hide()
    })

    nodeGroup.on('mousedown', (e) => {
      startX = e.offsetX
      startY = e.offsetY
      nodeGroup.oldX = nodeGroup.x
      nodeGroup.oldY = nodeGroup.y
      nodeGroup.shapes.forEach(shape => {
        shape.oldX = shape.x
        shape.oldY = shape.y
      })
      oldViewPortX = this._viewPortMgr.getPositionX()
      oldViewPortY = this._viewPortMgr.getPositionY()
      zoom = this._zoomMgr.getZoom()
      const { width, height, x, y } = nodeGroup.getBoundingBox()

      this._dragFrameMgr.updatePosition(x, y)
      this._dragFrameMgr.show()
      this._dragFrameMgr.initSize(width, height)
      this._refLineMgr.cacheRefLines()
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
    })
  }

  unActive() {
    this._groups.forEach((group) => {
      group.unActive()
    })
  }
}

export { GroupManage }
