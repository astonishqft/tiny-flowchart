
import * as zrender from 'zrender'
import { Disposable } from './disposable'
import { SceneManage } from './sceneManage'
import { ShapeManage } from './shapeManage'
import { ViewPortManage } from './viewPortManage'
import { GridManage } from './gridManage'
import { ConnectionManage } from './connectionManage'
import { StorageManage } from './storageManage'
import { GroupManage } from './groupManage'
import { ZoomManage } from './zoomManage'
import { DragFrameManage } from './dragFrameManage'
import { RefLineManage } from './refLineManage'
import { SelectFrameManage } from './selectFrameManage'
import { SettingManage } from './settingManage'
import { downloadFile } from './utils'

import type { IRefLineManage } from './refLineManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IGroupManage } from './groupManage'
import type { IZoomManage } from './zoomManage'
import type { ISceneManage } from './sceneManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { IGridManage } from './gridManage'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IIocEditorConfig, ISettingManage } from './settingManage'
import { type IShape, type IExportShape, type IExportConnection, type IConnection, type IAnchorPoint, ConnectionType } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'

export class IocEditor {
  _zr: zrender.ZRenderType
  _manageList: Disposable[] = []
  _dragFrameMgr: IDragFrameManage
  _settingMgr: ISettingManage
  _shapeMgr: IShapeManage
  _viewPortMgr: IViewPortManage
  _gridMgr: IGridManage
  _connectionMgr: IConnectionManage
  _storageMgr: IStorageManage
  _sceneMgr: ISceneManage
  _zoomMgr: IZoomManage
  _groupMgr: IGroupManage
  _refLineMgr: IRefLineManage
  _selectFrameMgr: ISelectFrameManage

  initZr(dom: HTMLElement): zrender.ZRenderType {
    return zrender.init(dom)
  }

  constructor(dom: HTMLElement, config: Partial<IIocEditorConfig>) {
    this._settingMgr = new SettingManage()
    this._storageMgr = new StorageManage()
    this._viewPortMgr = new ViewPortManage()
    this._selectFrameMgr = new SelectFrameManage(this)
    this._dragFrameMgr = new DragFrameManage(this)
    this._refLineMgr = new RefLineManage(this)
    this._gridMgr = new GridManage(this)
    this._zoomMgr = new ZoomManage(this)
    
    this._connectionMgr = new ConnectionManage(this)
    
    this._groupMgr = new GroupManage(this)
    this._shapeMgr = new ShapeManage(this)
    this._settingMgr.setDefaultConfig(config)
    this._zr = this.initZr(dom)

    this._sceneMgr = new SceneManage(this)
    this._sceneMgr.init(this._zr)
  }

  addShape(type: string, options: { x: number, y: number }) {
    const shape = this._sceneMgr.addShape(type, options)

    return shape
  }

  getNodeById(id: number){
    const nodes = this._storageMgr.getNodes()

    return nodes.filter(n=> n.id === id)[0]
  }

  getPointByIndex(node: IShape | INodeGroup, index: number): IAnchorPoint | undefined {
    return node.anchor?.getBarByIndex(index)
  }

  initFlowChart(data: any) {
    console.log(data)
    this._sceneMgr.clear()

    this._viewPortMgr.setPosition(0, 0)
    this._gridMgr.setPosition(0, 0)
    this._gridMgr.drawGrid()
    
    const { shapes = [], connections = [], groups = [] } = data

    shapes.forEach(({ type, id, x, y, style, textStyle, textConfig }: IExportShape) => {
      const newShape = this._shapeMgr.createShape(type, { x, y });
      (newShape as unknown as zrender.Displayable).setStyle({ ...style });
      (newShape as unknown as zrender.Displayable).getTextContent().setStyle(textStyle);
      (newShape as unknown as zrender.Displayable).setTextConfig(textConfig)
      newShape.id = id
    })

    connections.forEach((conn: IExportConnection) => {
      const fromNode = this.getNodeById(conn.fromNode)
      const toNode = this.getNodeById(conn.toNode)

      const fromPoint = this.getPointByIndex(fromNode, conn.fromPoint)
      const toPoint = this.getPointByIndex(toNode, conn.toPoint)

      if (!fromPoint || !toPoint) return
      const connection = this._connectionMgr.createConnection(fromPoint)
      connection.setConnectionType(conn.type)
      this._connectionMgr.connect(connection, toPoint)
      connection.setLineStyle(conn.lineStyle)
      connection.setTextPosition(conn.textPosition)
      connection.setTextStyle(conn.textStyle)
      if (conn.type === ConnectionType.BezierCurve) {
        connection.setControlPoint1(conn.controlPoint1 as number[])
        connection.setControlPoint2(conn.controlPoint2 as number[])
        connection.setControlLine1(conn.controlLine1 as number[])
        connection.setControlLine2(conn.controlLine2 as number[])
      }
    })
  }

  exportFile() {
    const shapes = this._storageMgr.getShapes().map((shape: IShape) => shape.getExportData!())

    const connections = this._storageMgr.getConnections().map((connection: IConnection) => connection.getExportData!())
    const groups = this._storageMgr.getGroups().map((group: INodeGroup) => group.getExportData!())

    const data = {
      shapes,
      connections,
      groups
    }

    const str = JSON.stringify(data)
    downloadFile(str, 'ioc-chart-flow.json')

    return data
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
          }
        } catch(e){
          console.log('导入的JSON数据解析出错!', e)
        }
      })
    }

    input.click()
  }

  destroy() {
    this._sceneMgr.dispose()
    this._shapeMgr.dispose()
    this._gridMgr.dispose()
    this._viewPortMgr.dispose()
    this._settingMgr.dispose()
    this._zr.dispose()
  }
}
