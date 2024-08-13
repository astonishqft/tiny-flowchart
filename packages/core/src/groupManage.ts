import { inject, injectable } from 'inversify'
import * as zrender from 'zrender'
import IDENTIFIER from './constants/identifiers'
import { NodeGroup } from './shapes/nodeGroup'
import { Anchor } from './anchor'
import { getMinPosition, getMinZLevel } from './utils'

import type { IViewPortManage } from './viewPortManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IRefLineManage } from './refLineManage'
import type { IConnectionManage } from './connectionManage'
import type { IStorageManage } from './storageManage'
import type { IAnchorPoint, IShape } from './shapes'

export interface IGroupManage {
  createGroup(): void
  unGroup(): void
  unActive(): void
}

@injectable()
class GroupManage {
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortMgr: IViewPortManage,
    @inject(IDENTIFIER.DRAG_FRAME_MANAGE) private _dragFrameMgr: IDragFrameManage,
    @inject(IDENTIFIER.REF_LINE_MANAGE) private _refLineMgr: IRefLineManage,
    @inject(IDENTIFIER.CONNECTION_MANAGE) private _connectionMgr: IConnectionManage,
    @inject(IDENTIFIER.STORAGE_MANAGE) private _storageMgr: IStorageManage,
  ) {}

  createGroup() {
    const activeShapes = this._storageMgr.getActiveShapes().concat(this._storageMgr.getActiveGroups())
    if (activeShapes.length < 2) {
      return
    }

    activeShapes.forEach(shape => { shape.unActive()})

    const minPostion = getMinPosition(activeShapes)

    const g = new zrender.Group()
    const boundingBox = g.getBoundingRect(activeShapes)
    boundingBox.x = minPostion[0]
    boundingBox.y = minPostion[1]

    const minZLevel = getMinZLevel(activeShapes)

    const groupNode = new NodeGroup(boundingBox, activeShapes)
    groupNode.setZ(minZLevel - 1)

    const anchor = new Anchor(groupNode)
    groupNode.anchor = anchor

    groupNode.createAnchors()
    groupNode.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addAnchorToViewPort(bar)
    })
    groupNode.anchor.refresh()
    this.initShapeEvent(groupNode)
    this._storageMgr.addGroup(groupNode)
    this._viewPortMgr.getViewPort().add(groupNode)
  }

  unGroup() {
    const activeGroup = this._storageMgr.getActiveGroups()


  }

  initShapeEvent(nodeGroup: NodeGroup) {
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
        this._dragFrameMgr.updatePosition(nodeGroup.x + stepX / zoom, nodeGroup.y + stepY / zoom)
      }
      // 拖拽浮层的时候同时更新对其参考线
      const magneticOffset = this._refLineMgr.updateRefLines()
      magneticOffsetX = magneticOffset.magneticOffsetX
      magneticOffsetY = magneticOffset.magneticOffsetY
    }

    const mouseUp = (e: MouseEvent) => {
      this._dragFrameMgr.hide()

      this._refLineMgr.clearRefPointAndRefLines()
      magneticOffsetX = 0
      magneticOffsetY = 0

      this.updateGroupShapes(nodeGroup, e.offsetX, e.offsetY, startX, startY, zoom, magneticOffsetX, magneticOffsetY)

      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)

      this.updateGroupSize(nodeGroup)
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
      console.log('nodeGroup mousedown', nodeGroup)
      startX = e.offsetX
      startY = e.offsetY

      this.setShapesOldPosition(nodeGroup)
      zoom = this._storageMgr.getZoom()
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
    this._storageMgr.getGroups().forEach((group) => {
      group.unActive()
    })
  }

  updateGroupShapes(nodeGroup: NodeGroup, offsetX: number, offsetY: number, startX: number, startY: number, zoom: number, magneticOffsetX: number, magneticOffsetY: number) {
    nodeGroup.attr('x', nodeGroup.oldX! + (offsetX - startX) / zoom + magneticOffsetX / zoom)
    nodeGroup.attr('y', nodeGroup.oldY! + (offsetY - startY) / zoom + magneticOffsetY / zoom)
    this._connectionMgr.refreshConnection(nodeGroup)
    nodeGroup.shapes.forEach((shape: IShape) => {
      shape.attr('x', shape.oldX! + (offsetX - startX) / zoom + magneticOffsetX / zoom)
      shape.attr('y', shape.oldY! + (offsetY - startY) / zoom + magneticOffsetY / zoom)
      shape.createAnchors()
      shape.anchor!.refresh()
      this._connectionMgr.refreshConnection(shape)
      if (shape.nodeType === 'nodeGroup') {
        this.updateGroupShapes(shape as NodeGroup, offsetX, offsetY, startX, startY, zoom, magneticOffsetX, magneticOffsetY)
      }
    })
  }

  setShapesOldPosition(nodeGroup: NodeGroup) {
    nodeGroup.oldX = nodeGroup.x
    nodeGroup.oldY = nodeGroup.y
    nodeGroup.shapes.forEach((shape: IShape) => {
      shape.oldX = shape.x
      shape.oldY = shape.y
      if (shape.nodeType === 'nodeGroup') {
        this.setShapesOldPosition(shape as NodeGroup)
      }
    })
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

export { GroupManage }
