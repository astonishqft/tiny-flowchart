import * as zrender from 'zrender'
import { NodeGroup } from './shapes/nodeGroup'
import { Subject } from 'rxjs'
import { Anchor } from './anchor'
import {
  isLeave,
  isEnter,
  getTopGroup,
  getMinPosition,
  getMinZLevel,
  getBoundingRect,
  getGroupMaxZLevel
} from './utils'
import { Disposable, IDisposable } from './disposable'

import type { IViewPortManage } from './viewPortManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IRefLineManage } from './refLineManage'
import type { IConnectionManage } from './connectionManage'
import type { IStorageManage } from './storageManage'
import type { IAnchorPoint, IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IocEditor } from './iocEditor'

export interface IGroupManage extends IDisposable {
  updateSelectGroup$: Subject<INodeGroup>
  createGroup(nodes?: (IShape | INodeGroup)[], groupId?: number): INodeGroup | undefined
  unGroup(): void
  unActive(): void
  clear(): void
}

class GroupManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _dragFrameMgr: IDragFrameManage
  private _refLineMgr: IRefLineManage
  private _connectionMgr: IConnectionManage
  private _storageMgr: IStorageManage
  updateSelectGroup$ = new Subject<INodeGroup>()
  constructor(iocEditor: IocEditor) {
    super()
    this._connectionMgr = iocEditor._connectionMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this._dragFrameMgr = iocEditor._dragFrameMgr
    this._refLineMgr = iocEditor._refLineMgr
    this._storageMgr = iocEditor._storageMgr
    this._disposables.push(this.updateSelectGroup$)
  }

  createGroup(nodes?: (IShape | INodeGroup)[], groupId?: number) {
    const activeShapes = nodes
      ? nodes
      : [...this._storageMgr.getActiveShapes(), ...this._storageMgr.getActiveGroups()]

    activeShapes.forEach(shape => {
      shape.unActive()
    })

    const minPostion = getMinPosition(activeShapes)

    const boundingBox = getBoundingRect(activeShapes)
    boundingBox.x = minPostion[0]
    boundingBox.y = minPostion[1]

    const minZLevel = getMinZLevel(activeShapes)

    const groupNode = new NodeGroup(boundingBox, activeShapes)
    groupNode.setZ(minZLevel - 1)

    const anchor = new Anchor(groupNode)
    groupNode.anchor = anchor

    groupNode.createAnchors()
    groupNode.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addElementToViewPort(bar)
    })
    groupNode.anchor.refresh()
    this.initShapeEvent(groupNode)
    this._storageMgr.addGroup(groupNode)
    this._viewPortMgr.addElementToViewPort(groupNode)

    if (groupId) {
      groupNode.id = groupId
    }

    return groupNode
  }

  unGroup() {
    const activeGroups = this._storageMgr.getActiveGroups()

    if (activeGroups.length < 1) return
    const activeGroup = activeGroups[0]
    this._viewPortMgr.getViewPort().remove(activeGroup)
    activeGroup.anchor!.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.removeElementFromViewPort(bar)
    })
    activeGroup.shapes.forEach((shape: IShape | INodeGroup) => {
      delete shape.parentGroup
      if (activeGroup.parentGroup) {
        shape.parentGroup = activeGroup.parentGroup
        activeGroup.parentGroup.shapes.push(shape)
        activeGroup.parentGroup.shapes = activeGroup.parentGroup.shapes.filter(
          item => item !== activeGroup
        )
      }
    })
    this.removeAssociatedConnection(activeGroup)
    this._storageMgr.removeGroup(activeGroup)
  }

  removeAssociatedConnection(nodeGroup: INodeGroup) {
    this._storageMgr.getConnections().forEach(connection => {
      if (connection.fromNode.id === nodeGroup.id || connection.toNode!.id === nodeGroup.id) {
        this._connectionMgr.removeConnection(connection)
      }
    })
  }

  dragLeave(isDragLeave: boolean, shape: IShape | INodeGroup) {
    console.log('groupNode dragLeave', isDragLeave)
    if (isDragLeave) {
      shape.parentGroup!.setAlertStyle()
    } else {
      shape.parentGroup!.setCommonStyle()
    }
  }

  dragEnter(isDragEnter: boolean, targetGroup: INodeGroup) {
    console.log('groupNode dragEnter', isDragEnter)
    if (isDragEnter) {
      targetGroup.setAlertStyle()
      this._storageMgr
        .getGroups()
        .filter(g => g.id !== targetGroup.id)
        .forEach(g => g.setCommonStyle())
    } else {
      this._storageMgr.getGroups().forEach(g => g.setCommonStyle())
    }
  }

  removeShapeFromGroup(shape: INodeGroup) {
    if (shape.parentGroup) {
      if (shape.parentGroup!.shapes.length === 1) return // 确保组内至少有一个元素
      shape.parentGroup!.shapes = shape.parentGroup!.shapes.filter(item => item.id !== shape.id)
      shape.parentGroup!.resizeNodeGroup()
      this._connectionMgr.refreshConnection(shape.parentGroup)
      delete shape.parentGroup
    }
  }

  addShapeToGroup(shape: INodeGroup, targetGroup: INodeGroup) {
    shape.parentGroup = targetGroup
    targetGroup.shapes.push(shape)
    targetGroup.resizeNodeGroup()
  }

  initShapeEvent(nodeGroup: INodeGroup) {
    let startX = 0
    let startY = 0
    let zoom = 1
    let magneticOffsetX = 0
    let magneticOffsetY = 0
    let isDragLeave = false
    let isDragEnter = false
    let dragEnterGroups: INodeGroup[] = []
    const mouseMove = (e: MouseEvent) => {
      const nodeName = (e.target as HTMLElement).nodeName
      if (nodeName !== 'CANVAS') return
      const { offsetX, offsetY } = e
      const stepX = offsetX - startX
      const stepY = offsetY - startY
      // 设置一个阈值，避免鼠标发生轻微位移时出现拖动浮层
      if (Math.abs(offsetX / zoom) > 2 || Math.abs(offsetY / zoom) > 2) {
        this._dragFrameMgr.updatePosition(nodeGroup.x + stepX / zoom, nodeGroup.y + stepY / zoom)
        if (nodeGroup.parentGroup) {
          isDragLeave = isLeave(
            this._dragFrameMgr.getBoundingBox(),
            nodeGroup.parentGroup!.getBoundingBox()
          )
          this.dragLeave(isDragLeave, nodeGroup)
        } else {
          // 需要把自身排除在外
          dragEnterGroups = this._storageMgr
            .getGroups()
            .filter(g => g.id !== nodeGroup.id)
            .filter(g => isEnter(this._dragFrameMgr.getBoundingBox(), g.getBoundingBox()))

          if (dragEnterGroups.length !== 0) {
            isDragEnter = true
          } else {
            isDragEnter = false
          }

          this.dragEnter(isDragEnter, getTopGroup(dragEnterGroups))
        }
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

      this.updateGroupShapes(
        nodeGroup,
        e.offsetX,
        e.offsetY,
        startX,
        startY,
        zoom,
        magneticOffsetX,
        magneticOffsetY
      )

      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)

      if (isDragLeave) {
        this.removeShapeFromGroup(nodeGroup)
        isDragLeave = false
      }
      if (isDragEnter) {
        const maxZ = getGroupMaxZLevel(this._storageMgr.getGroups())
        nodeGroup.setZ(maxZ + 1)
        this.addShapeToGroup(nodeGroup, getTopGroup(dragEnterGroups))
        isDragEnter = false
      }

      this.updateGroupSize(nodeGroup)
    }

    nodeGroup.on('click', () => {
      this.unActive()
      nodeGroup.active()
      this._connectionMgr.unActiveConnections()
      this.updateSelectGroup$.next(nodeGroup)
    })

    nodeGroup.on('mousemove', () => {
      nodeGroup.anchor?.show()
      ;(nodeGroup as unknown as zrender.Displayable).attr('cursor', 'move')
    })

    nodeGroup.on('mouseout', () => {
      nodeGroup.anchor?.hide()
    })

    nodeGroup.on('mousedown', e => {
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
    this._storageMgr.getGroups().forEach(group => {
      group.unActive()
    })
  }

  updateGroupShapes(
    nodeGroup: INodeGroup,
    offsetX: number,
    offsetY: number,
    startX: number,
    startY: number,
    zoom: number,
    magneticOffsetX: number,
    magneticOffsetY: number
  ) {
    nodeGroup.attr('x', nodeGroup.oldX! + (offsetX - startX) / zoom + magneticOffsetX / zoom)
    nodeGroup.attr('y', nodeGroup.oldY! + (offsetY - startY) / zoom + magneticOffsetY / zoom)
    this._connectionMgr.refreshConnection(nodeGroup)
    nodeGroup.shapes.forEach((shape: IShape | INodeGroup) => {
      ;(shape as IShape).attr('x', shape.oldX! + (offsetX - startX) / zoom + magneticOffsetX / zoom)
      ;(shape as IShape).attr('y', shape.oldY! + (offsetY - startY) / zoom + magneticOffsetY / zoom)
      shape.createAnchors()
      shape.anchor!.refresh()
      this._connectionMgr.refreshConnection(shape)
      if (shape.nodeType === 'nodeGroup') {
        this.updateGroupShapes(
          shape as NodeGroup,
          offsetX,
          offsetY,
          startX,
          startY,
          zoom,
          magneticOffsetX,
          magneticOffsetY
        )
      }
    })
  }

  setShapesOldPosition(nodeGroup: INodeGroup) {
    nodeGroup.oldX = nodeGroup.x
    nodeGroup.oldY = nodeGroup.y
    nodeGroup.shapes.forEach((shape: IShape | INodeGroup) => {
      shape.oldX = shape.x
      shape.oldY = shape.y
      if (shape.nodeType === 'nodeGroup') {
        this.setShapesOldPosition(shape as INodeGroup)
      }
    })
  }

  updateGroupSize(shape: IShape | INodeGroup) {
    if (shape.parentGroup) {
      shape.parentGroup.resizeNodeGroup()
      this._connectionMgr.refreshConnection(shape.parentGroup)
      this.updateGroupSize(shape.parentGroup)
    }
  }

  clear() {
    this._storageMgr.getGroups().forEach((group: INodeGroup) => {
      this._viewPortMgr.removeElementFromViewPort(group)
      group.anchor?.bars.forEach((bar: IAnchorPoint) => {
        this._viewPortMgr.removeElementFromViewPort(bar)
      })
    })
    this._storageMgr.clearGroups()
  }
}

export { GroupManage }
