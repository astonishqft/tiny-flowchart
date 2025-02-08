import * as zrender from 'zrender'
import { Disposable } from './disposable'
import { getTopGroup, isEnter } from './utils'

import type { IIocEditor } from './iocEditor'
import type { IDisposable } from './disposable'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { INodeGroup } from './shapes/nodeGroup'
import type { INode } from './shapes'

export interface IDragFrameManage extends IDisposable {
  show(): void
  hide(): void
  updatePosition(x: number, y: number): void
  initSize(width: number, height: number): void
  getFrame(): zrender.Rect
  getBoundingBox(): zrender.BoundingRect
  isIntersect(shapesBoundingBox: zrender.BoundingRect): boolean
  intersectWidthGroups(node: INode): IGroupShapeIntersectResult
}

export interface IGroupShapeIntersectResult {
  isDragOutFromGroup: boolean
  dragTargetGroup: null | INodeGroup
  isRemoveFromGroup: boolean
  isDragEnterToGroup: boolean
}

class DragFrameManage extends Disposable {
  private _frame: zrender.Rect
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  constructor(iocEditor: IIocEditor) {
    super()
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
    this._frame = new zrender.Rect({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        r: [3]
      },
      style: {
        fill: 'rgba(25, 113, 194, 0.2)',
        stroke: '#1971c2',
        lineWidth: 1,
        lineDash: [4, 4]
      },
      silent: true,
      z: 100000
    })

    this._viewPortMgr.addElementToViewPort(this._frame)

    this._frame.hide()
  }

  show() {
    this._frame.show()
  }

  hide() {
    this._frame.hide()
  }

  initSize(width: number, height: number) {
    this._frame.setShape({
      width,
      height
    })
  }

  updatePosition(x: number, y: number) {
    this._frame.attr('x', x)
    this._frame.attr('y', y)
  }

  // Group内部的Shape进入另一个子Group
  isEnterChild(targetGroups: INodeGroup[], z: number) {
    const result = targetGroups.filter(g => g.z > z)

    if (result.length > 0) {
      return true
    } else {
      return false
    }
  }

  isEnterParent(targetGroups: INodeGroup[], z: number) {
    if (targetGroups.length === 0) return false
    const result = targetGroups.filter(g => g.z < z)
    if (result.length === targetGroups.length) {
      return true
    } else {
      return false
    }
  }

  intersectWidthGroups(node: INode): IGroupShapeIntersectResult {
    // 获取所有节点组，判断是否与拖动浮层相交，如果相交，则将节点组添加到拖动浮层中
    let isDragOutFromGroup = false
    let dragTargetGroup = null
    let isRemoveFromGroup = false
    let isDragEnterToGroup = false
    const groups = this._storageMgr.getGroups()

    const target = groups.filter((g: INodeGroup) =>
      isEnter(this.getBoundingBox(), g.getBoundingBox())
    )

    const parentGroup = node.parentGroup
    groups.forEach(g => g.setOldStyle())
    if (parentGroup) {
      const { z } = parentGroup

      if (this.isEnterChild(target, z)) {
        const p = getTopGroup(target)
        dragTargetGroup = p
        isDragOutFromGroup = true
        p.setEnterStyle()
      } else if (this.isEnterParent(target, z)) {
        const p = getTopGroup(target)
        dragTargetGroup = p
        isDragOutFromGroup = true
        p.setEnterStyle()
      }

      if (target.length === 0) {
        // 从Group移除
        isRemoveFromGroup = true
      }
    } else {
      // 从外部将一个Shape移入Group
      if (target.length) {
        const p = getTopGroup(target)
        p.setEnterStyle()
        dragTargetGroup = p
        isDragEnterToGroup = true
      }
    }

    return {
      isDragOutFromGroup,
      dragTargetGroup,
      isRemoveFromGroup,
      isDragEnterToGroup
    }
  }

  getFrame() {
    return this._frame
  }

  getBoundingBox() {
    return new zrender.BoundingRect(
      this._frame.x,
      this._frame.y,
      this._frame.shape.width,
      this._frame.shape.height
    )
  }

  // 判断是否相交
  isIntersect(shapesBoundingBox: zrender.BoundingRect) {
    return shapesBoundingBox.intersect(this.getBoundingBox())
  }
}

export { DragFrameManage }
