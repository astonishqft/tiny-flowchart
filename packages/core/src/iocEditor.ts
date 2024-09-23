
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
import type { IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IConnection } from './connection'

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
    this._zoomMgr = new ZoomManage(this)
    this._selectFrameMgr = new SelectFrameManage(this)
    this._dragFrameMgr = new DragFrameManage(this)
    this._refLineMgr = new RefLineManage(this)
    this._gridMgr = new GridManage(this)
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

  initFlowChart(data: any) {
    console.log(data)
    this._sceneMgr.clear()

    this._viewPortMgr.setPosition(0, 0)
    this._gridMgr.setPosition(0, 0)
    this._gridMgr.drawGrid()
    
    const { shapes = [], connections = [], groups = [] } = data

    shapes.forEach((shape: IShape) => {
      const newShape = this._shapeMgr.createShape(shape.type, shape)
      // newShape.setData(shape)
    })
  }

  exportFile() {
    const shapes = this._storageMgr.getShapes().map((shape: IShape) => shape.getData!())
    const connections = this._storageMgr.getConnections().map((connection: IConnection) => connection.getData!())
    const groups = this._storageMgr.getGroups().map((group: INodeGroup) => group.getData!())

    const data = {
      shapes,
      connections,
      groups
    }

    const str=JSON.stringify(data)
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
          console.log('导入的JSON数据解析出错!')
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
