import { Disposable } from '@/disposable'
import { NodeType } from '@/index'
import { getTopPriorityNode } from '@/utils'

import type {
  ZRenderType,
  Element,
  ElementEvent,
  IShapeManage,
  IConnectionManage,
  ISelectFrameManage,
  IViewPortManage,
  IGroupManage,
  IStorageManage,
  IZoomManage,
  ISettingManage,
  ITinyFlowchart,
  IDisposable,
  IAnchorPoint,
  IShape,
  INodeGroup,
  IControlPoint
} from '@/index'
import type { INodeEventManage } from '@/nodeEventManage'
import type { IResizePoint } from '@/controlFrameManage'

export interface ISceneManage extends IDisposable {
  setCursorStyle(type: string): void
  init(): void
  clear(): void
}

export type IMouseEvent = Element & { nodeType?: string }

class SceneManage extends Disposable {
  private _tinyFlowchart: ITinyFlowchart
  private _viewPortMgr: IViewPortManage
  private _shapeMgr: IShapeManage
  private _connectionMgr: IConnectionManage
  private _selectFrameMgr: ISelectFrameManage
  private _groupMgr: IGroupManage
  private _storageMgr: IStorageManage
  private _settingMgr: ISettingManage
  private _zoomMgr: IZoomManage
  private _nodeEventMgr: INodeEventManage
  private _enableMiniMap
  private _zr: ZRenderType

  private _oldViewPortX = 0
  private _oldViewPortY = 0
  private _mouseDownX = 0
  private _mouseDownY = 0
  private _isDragging = false
  private _mouseMoveOffsetX = 0
  private _mouseMoveOffsetY = 0
  private _currentZoom = 1
  private _eventModel = 'canvas'
  constructor(tinyFlowchart: ITinyFlowchart) {
    super()
    this._zr = tinyFlowchart._zr
    this._tinyFlowchart = tinyFlowchart
    this._connectionMgr = tinyFlowchart._connectionMgr
    this._storageMgr = tinyFlowchart._storageMgr
    this._zoomMgr = tinyFlowchart._zoomMgr
    this._viewPortMgr = tinyFlowchart._viewPortMgr
    this._shapeMgr = tinyFlowchart._shapeMgr
    this._groupMgr = tinyFlowchart._groupMgr
    this._settingMgr = tinyFlowchart._settingMgr
    this._selectFrameMgr = tinyFlowchart._selectFrameMgr
    this._nodeEventMgr = tinyFlowchart._nodeEventMgr
    this._enableMiniMap = this._settingMgr.get('enableMiniMap')
  }

  clear() {
    this._connectionMgr.clear()
    this._shapeMgr.clear()
    this._groupMgr.clear()
  }

  init() {
    this._viewPortMgr.addSelfToZr(this._zr)
    if (this._enableMiniMap) return
    this.initEvent()
  }

  setCursorStyle(cursor: string) {
    this._zr.setCursorStyle(cursor)
  }

  getSelectedNode(x: number, y: number) {
    const [vX, vY] = this._viewPortMgr.mapSceneToViewPort(x, y)

    const selectedNodes: {
      shapes: IShape[]
      groups: INodeGroup[]
    } = {
      shapes: [],
      groups: []
    }
    this._storageMgr.getNodes().forEach(n => {
      if (n.getBoundingBox().contain(vX, vY)) {
        if (n.nodeType === NodeType.Shape) {
          selectedNodes.shapes.push(n as IShape)
        } else {
          selectedNodes.groups.push(n as INodeGroup)
        }
      }
    })

    return selectedNodes
  }

  showAnch(x: number, y: number) {
    const [vX, vY] = this._viewPortMgr.mapSceneToViewPort(x, y)
    // 需要过滤掉选中状态的节点(节点选中状态下，锚点也必显示，因此在mousemove的时候需要排除掉已经选中的节点)
    const nodes = this._storageMgr.getNodes()

    // 找出所有包含当前鼠标位置的节点
    const hoveredNodes = nodes.filter(n => n.getBoundingBox().contain(vX, vY))

    // 隐藏所有非选中节点的锚点
    nodes.forEach(n => {
      !n.selected && n.anchor.hide()
      if (!n.selected) {
        n.setCursor('default')
      }
    })

    // 如果有多个节点重合，获取优先级最高的节点并显示其锚点
    if (hoveredNodes.length > 0) {
      const topNode = getTopPriorityNode(hoveredNodes)
      if (topNode) {
        topNode.anchor.show()
        topNode.setCursor('move')
      }
    }
  }

  initEvent() {
    let fromAnchorPoint: IAnchorPoint | null = null
    let selectFrameStatus = false

    this._zr.on('mousedown', (e: ElementEvent) => {
      this._isDragging = true
      this._mouseDownX = e.offsetX
      this._mouseDownY = e.offsetY
      if (e.target) {
        this._isDragging = false
      }
      this._oldViewPortX = this._viewPortMgr.getPosition()[0]
      this._oldViewPortY = this._viewPortMgr.getPosition()[1]
      this._currentZoom = this._zoomMgr.getZoom()
      selectFrameStatus = this._selectFrameMgr.getSelectFrameStatus() // 是否是选中框
      if (selectFrameStatus) {
        this._selectFrameMgr.init(
          (this._mouseDownX - this._oldViewPortX) / this._currentZoom,
          (this._mouseDownY - this._oldViewPortY) / this._currentZoom
        )
      }

      if (e.target && (e.target as IResizePoint).mark === 'resizePoint') {
        this._eventModel = 'resizePoint'

        return
      }

      // 选中连线
      if (e.target && (e.target as Element & { mark: string }).mark === 'connection') {
        this._eventModel = 'connection'

        return
      }

      if (e.target && (e.target as IControlPoint).mark === 'controlPoint') {
        this._eventModel = 'controlPoint'

        return
      }

      // 选中锚点
      if (e.target && (e.target as IAnchorPoint).mark === 'anch') {
        this._eventModel = 'anchor'
        fromAnchorPoint = e.target as IAnchorPoint
        this._connectionMgr.createTmpConnection(fromAnchorPoint)
        this.setCursorStyle('crosshair')

        return
      }

      this._tinyFlowchart.sceneDragStart$.next({
        startX: this._mouseDownX,
        startY: this._mouseDownY,
        oldViewPortX: this._oldViewPortX,
        oldViewPortY: this._oldViewPortY
      })

      const { shapes, groups } = this.getSelectedNode(e.offsetX, e.offsetY)

      // 选中节点
      if (shapes.length > 0) {
        this._nodeEventMgr.updateNodeMouseDown$.next({
          node: getTopPriorityNode(shapes),
          e
        })
        this._eventModel = 'shape'

        return
      }

      // 选中节点组
      if (groups.length > 0 && shapes.length === 0) {
        // 按z值从小到大排序，然后取最后一项（z值最大的）
        const sortedGroups = [...groups].sort((a, b) => a.z - b.z)
        this._nodeEventMgr.updateNodeMouseDown$.next({
          node: sortedGroups[sortedGroups.length - 1],
          e
        })
        this._eventModel = 'group'

        return
      }

      if (!e.target) {
        // 如果什么都没选中的话
        this._tinyFlowchart.unActive()
        this._eventModel = 'scene'
      }
    })

    this._zr.on('mousemove', e => {
      this._mouseMoveOffsetX = e.offsetX - this._mouseDownX
      this._mouseMoveOffsetY = e.offsetY - this._mouseDownY

      if (this._eventModel === 'anchor') {
        this._connectionMgr.moveTmpConnection(
          (e.offsetX - this._oldViewPortX) / this._currentZoom,
          (e.offsetY - this._oldViewPortY) / this._currentZoom
        )
      }

      // 拖拽画布(利用的原理是改变Group的 position 坐标)
      if (this._isDragging && this._eventModel === 'scene' && !selectFrameStatus) {
        this._tinyFlowchart.sceneDragMove$.next({
          x: this._mouseMoveOffsetX + this._oldViewPortX,
          y: this._mouseMoveOffsetY + this._oldViewPortY,
          offsetX: this._mouseMoveOffsetX,
          offsetY: this._mouseMoveOffsetY
        })
      }

      if (selectFrameStatus) {
        // 框选
        this._selectFrameMgr.resize(
          this._mouseMoveOffsetX / this._currentZoom,
          this._mouseMoveOffsetY / this._currentZoom
        )
      }

      if (!this._isDragging) {
        this.showAnch(e.offsetX, e.offsetY)
      }
    })

    this._zr.on('mouseup', e => {
      this._isDragging = false

      if (
        e.target &&
        (e.target as IAnchorPoint).mark === 'anch' &&
        fromAnchorPoint &&
        (e.target as IAnchorPoint).node !== fromAnchorPoint.node
      ) {
        // 禁止和自身相连
        // 创建连线
        const connection = this._connectionMgr.createConnection(
          fromAnchorPoint,
          e.target as IAnchorPoint,
          this._connectionMgr.getConnectionType()
        )
        this._tinyFlowchart.execute('addConnection', { connection })
      }

      if (this._eventModel === 'anchor') {
        // 取消连线创建的临时直线
        this._connectionMgr.removeTmpConnection()
      }

      if (selectFrameStatus) {
        this._selectFrameMgr.multiSelect()
        this._selectFrameMgr.hide()
      }

      this._tinyFlowchart.sceneDragEnd$.next()

      this._eventModel = 'scene'
    })

    this._zr.on('click', e => {
      const { shapes, groups } = this.getSelectedNode(e.offsetX, e.offsetY)

      if (e.target && (e.target as Element & { mark: string }).mark === 'connection') {
        return
      }

      if (shapes.length > 0) {
        const topNode = getTopPriorityNode(shapes)
        this._nodeEventMgr.updateNodeClick$.next({ node: topNode, e })

        return
      }

      if (groups.length > 0 && shapes.length === 0) {
        const topGroup = getTopPriorityNode(groups)
        this._nodeEventMgr.updateNodeClick$.next({ node: topGroup, e })

        return
      }

      if (!e.target) {
        this._nodeEventMgr.updateNodeClick$.next({ node: null, e })
      }
    })
  }
}

export { SceneManage }
