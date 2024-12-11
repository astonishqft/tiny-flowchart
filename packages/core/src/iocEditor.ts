import * as zrender from 'zrender'
import { Subject } from 'rxjs'
import { Disposable } from './disposable'
import { SceneManage } from './sceneManage'
import { ShapeManage } from './shapeManage'
import { ViewPortManage } from './viewPortManage'
import { ConnectionManage } from './connectionManage'
import { StorageManage } from './storageManage'
import { GroupManage } from './groupManage'
import { ZoomManage } from './zoomManage'
import { DragFrameManage } from './dragFrameManage'
import { RefLineManage } from './refLineManage'
import { SelectFrameManage } from './selectFrameManage'
import { SettingManage } from './settingManage'
import { ControlFrameManage } from './controlFrameManage'
import {
  downloadFile,
  flatGroupArrayToTree,
  getChildShapesByGroupId,
  groupTreeToArray
} from './utils'

import type { IRefLineManage } from './refLineManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IGroupManage } from './groupManage'
import type { IZoomManage } from './zoomManage'
import type { ISceneManage } from './sceneManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IIocEditorConfig, ISettingManage } from './settingManage'
import type { IControlFrameManage } from './controlFrameManage'

import {
  ConnectionType,
  type IAnchorPoint,
  type IConnection,
  type IExportConnection,
  type IExportData,
  type IExportGroup,
  type IExportShape,
  type IShape
} from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IGroupTreeNode } from './utils'
import type { ISceneDragMoveOpts, ISceneDragStartOpts, IUpdateZoomOpts } from './types'

export class IocEditor {
  _zr: zrender.ZRenderType
  _dom: HTMLElement
  _manageList: Disposable[] = []
  _dragFrameMgr: IDragFrameManage
  _settingMgr: ISettingManage
  _shapeMgr: IShapeManage
  _viewPortMgr: IViewPortManage
  _connectionMgr: IConnectionManage
  _storageMgr: IStorageManage
  _sceneMgr: ISceneManage
  _zoomMgr: IZoomManage
  _groupMgr: IGroupManage
  _refLineMgr: IRefLineManage
  _selectFrameMgr: ISelectFrameManage
  _controlFrameMgr: IControlFrameManage
  updateZoom$ = new Subject<IUpdateZoomOpts>()
  updateMiniMap$ = new Subject<void>()

  // 鼠标拖拽画布时的移动事件
  sceneDragStart$ = new Subject<ISceneDragStartOpts>()
  sceneDragMove$ = new Subject<ISceneDragMoveOpts>()
  sceneDragEnd$ = new Subject<void>()

  constructor(dom: HTMLElement, config?: Partial<IIocEditorConfig>) {
    this._dom = dom
    this._settingMgr = new SettingManage()
    if (config) {
      this._settingMgr.setDefaultConfig(config)
    }
    this._storageMgr = new StorageManage()
    this._viewPortMgr = new ViewPortManage(this)
    this._selectFrameMgr = new SelectFrameManage(this)
    this._dragFrameMgr = new DragFrameManage(this)
    this._refLineMgr = new RefLineManage(this)
    this._zoomMgr = new ZoomManage(this)
    this._connectionMgr = new ConnectionManage(this)
    this._controlFrameMgr = new ControlFrameManage(this)
    this._groupMgr = new GroupManage(this)
    this._shapeMgr = new ShapeManage(this)
    this._zr = zrender.init(dom)
    this._sceneMgr = new SceneManage(this)
    this._sceneMgr.init()
  }

  addShape(type: string, options: { x: number; y: number; image?: string }) {
    return this._sceneMgr.addShape(type, options)
  }

  getNodeById(id: number) {
    const nodes = this._storageMgr.getNodes()

    return nodes.filter(n => n.id === id)[0]
  }

  getPointByIndex(node: IShape | INodeGroup, index: number): IAnchorPoint | undefined {
    return node.anchor.getBarByIndex(index)
  }

  initFlowChart(data: IExportData) {
    console.log(data)
    // const enableMiniMap = this._settingMgr.get('enableMiniMap')
    this._sceneMgr.clear()

    this._viewPortMgr.setPosition(0, 0)

    const { shapes = [], connections = [], groups = [] } = data

    shapes.forEach(
      ({
        type,
        id,
        x,
        y,
        style: {
          fill,
          stroke,
          lineWidth,
          lineDash,
          text,
          fontColor,
          fontSize,
          fontStyle,
          fontWeight,
          textPosition,
          image
        },
        z
      }: IExportShape) => {
        const config: { x: number; y: number; image?: string } = { x, y }
        if (type === 'image') {
          config.image = image
        }
        const newShape = this._shapeMgr.createShape(type, config)
        newShape.setZ(z)
        newShape.setStyle({
          fill,
          stroke,
          lineWidth,
          lineDash
        })
        newShape
          .getTextContent()
          .setStyle({ text, fill: fontColor, fontSize, fontStyle, fontWeight })
        newShape.setTextConfig({ position: textPosition })

        newShape.id = id
        newShape.unActive()
      }
    )

    this.initGroup(groups, shapes)

    connections.forEach((conn: IExportConnection) => {
      const fromNode = this.getNodeById(conn.fromNode)
      const toNode = this.getNodeById(conn.toNode)

      const fromPoint = this.getPointByIndex(fromNode, conn.fromPoint)
      const toPoint = this.getPointByIndex(toNode, conn.toPoint)

      if (!fromPoint || !toPoint) return
      const connection = this._connectionMgr.createConnection(fromPoint)
      connection.setConnectionType(conn.type)
      this._connectionMgr.connect(connection, toPoint)
      connection.setStyle(conn.style)

      if (conn.type === ConnectionType.BezierCurve) {
        connection.setBezierCurve(
          fromPoint.point,
          toPoint.point,
          conn.controlPoint1!,
          conn.controlPoint2!
        )
      }
    })
  }

  initGroup(groups: IExportGroup[], shapes: IExportShape[]) {
    const { groupTree, groupMap } = flatGroupArrayToTree(groups)

    console.log('groupTree', JSON.stringify(groupTree, null, 2))
    console.log(
      'groupMap',
      JSON.stringify(
        Array.from(groupMap).reduce(
          (obj, [key, value]) => Object.assign(obj, { [key]: value }),
          {}
        ),
        null,
        2
      )
    )

    const treeGroupArray = groupTreeToArray(groupTree)

    console.log('treeArray', JSON.stringify(treeGroupArray), null, 2)

    treeGroupArray.forEach((gId: number) => {
      let childs = []
      const groupItem = groupMap.get(gId)
      if (groupItem.children.length === 0) {
        // 最底层的group，由shape组成
        const childIds = getChildShapesByGroupId(gId, shapes).map(s => s.id)
        const childShapes = this._storageMgr.getShapes().filter(s => childIds.includes(s.id))
        childs = childShapes
      } else {
        const childGroupIds = groupItem.children.map((c: IGroupTreeNode) => c.id)
        const childGroups = this._storageMgr.getGroups().filter(g => childGroupIds.includes(g.id))
        const childIds = getChildShapesByGroupId(gId, shapes).map(s => s.id)
        const childShapes = this._storageMgr.getShapes().filter(s => childIds.includes(s.id))
        childs = [...childGroups, ...childShapes]
      }
      const newGroup = this._groupMgr.createGroup(childs, gId)

      newGroup.unActive()
      newGroup.setZ(groupItem.z)
      newGroup.setStyle(groupItem.style)
    })
  }

  getShapeById(id: number) {
    return this._storageMgr.getShapes().filter(s => s.id === id)
  }

  getData() {
    const shapes = this._storageMgr.getShapes().map(shape => shape.getExportData())

    const connections = this._storageMgr
      .getConnections()
      .map((connection: IConnection) => connection.getExportData())
    const groups = this._storageMgr.getGroups().map((group: INodeGroup) => group.getExportData())

    return {
      shapes,
      connections,
      groups
    }
  }

  exportFile() {
    const str = JSON.stringify(this.getData(), null, 2)
    console.log('导出的数据为：', this.getData())
    downloadFile(str, 'ioc-chart-flow.json')
  }

  openFile() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files![0]
      const reader = new FileReader()
      reader.readAsText(file)

      reader.addEventListener('load', (e: ProgressEvent<FileReader>) => {
        const flowData = e.target!.result as string
        try {
          if (flowData) {
            this.initFlowChart(JSON.parse(flowData))
            this.updateMiniMap$.next()
          }
        } catch (e) {
          console.log('导入的JSON数据解析出错!', e)
        }
      })
    }

    input.click()
  }

  destroy() {
    this._sceneMgr.dispose()
    this._shapeMgr.dispose()
    this._viewPortMgr.dispose()
    this._dragFrameMgr.dispose()
    this._shapeMgr.dispose()
    this._groupMgr.dispose()
    this._settingMgr.dispose()
    this._zr.dispose()
    this.updateZoom$.unsubscribe()
    this.sceneDragMove$.unsubscribe()
    this.updateMiniMap$.unsubscribe()
  }

  offEvent() {
    this._zr.off()
  }

  getBoundingBox() {
    const g = new zrender.Group()

    return g.getBoundingRect([...this._storageMgr.getNodes(), ...this._storageMgr.getConnections()])
  }
}
