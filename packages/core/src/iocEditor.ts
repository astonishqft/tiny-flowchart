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
import { HistoryManage } from './history/historyManage'
import {
  downloadFile,
  flatGroupArrayToTree,
  getChildShapesByGroupId,
  groupTreeToArray
} from './utils'
import {
  AddShapeCommand,
  AddConnectionCommand,
  MoveNodeCommand,
  PatchCommand,
  CreateGroupCommand,
  UnGroupCommand,
  DragOutToGroupCommand,
  RemoveNodeFromGroupCommand,
  DragEnterToGroupCommand,
  UpdateShapePropertyCommand
} from './history/commands'

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
import type { IHistoryManage } from './history/historyManage'
import type {
  IAddShapeCommandOpts,
  IAddConnectionCommandOpts,
  IMoveNodeCommandOpts,
  ICreateGroupCommandOpts,
  IUnGroupCommandOpts,
  IDragOutToGroupCommandOpts,
  IRemoveNodeFromGroupCommandOpts,
  IDragEnterToGroupCommandOpts,
  IUpdateShapePropertyCommandOpts
} from './history/commands'

import {
  ConnectionType,
  NodeType,
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
import type { ISceneDragMoveOpts, ISceneDragStartOpts, IUpdateZoomOpts, Dictionary } from './types'
import type { Command } from './history/historyManage'

export interface IIocEditor {
  _connectionMgr: IConnectionManage
  _shapeMgr: IShapeManage
  _historyMgr: IHistoryManage
  _viewPortMgr: IViewPortManage
  _storageMgr: IStorageManage
  _sceneMgr: ISceneManage
  _settingMgr: ISettingManage
  _dragFrameMgr: IDragFrameManage
  _groupMgr: IGroupManage
  _refLineMgr: IRefLineManage
  _selectFrameMgr: ISelectFrameManage
  _controlFrameMgr: IControlFrameManage
  _zoomMgr: IZoomManage
  _zr: zrender.ZRenderType
  _dom: HTMLElement
  updateZoom$: Subject<IUpdateZoomOpts>
  updateMiniMap$: Subject<void>
  sceneDragStart$: Subject<ISceneDragStartOpts>
  addShape(options: IAddShapeCommandOpts): void
  execute(type: string, options: Dictionary<any>): void
  getNodeById(id: number): IShape | INodeGroup | undefined
  getPointByIndex(node: IShape | INodeGroup, index: number): IAnchorPoint | undefined
  initFlowChart(data: IExportData): void
  initGroup(groups: IExportGroup[], shapes: IExportShape[]): void
  getShapeById(id: number): IShape[]
  getData(): { shapes: IExportShape[]; connections: IExportConnection[]; groups: IExportGroup[] }
  exportFile(): void
  openFile(): void
  destroy(): void
  offEvent(): void
  getBoundingBox(): zrender.BoundingRect
  undo(): void
  redo(): void
  createGroup(): void
  unGroup(): void
}

export class IocEditor implements IIocEditor {
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
  _historyMgr: IHistoryManage
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
    this._historyMgr = new HistoryManage()
    this._sceneMgr.init()
  }

  addShape(options: IAddShapeCommandOpts) {
    return this.execute('addShape', options)
  }

  createGroup() {
    const shapes = this._storageMgr.getActiveNodes()
    if (shapes.length < 1) return
    const group = this._groupMgr.createGroup(shapes)
    this.execute('createGroup', { group })
  }

  unGroup() {
    const activeGroups = this._storageMgr.getActiveGroups()
    if (activeGroups.length !== 1) return
    const group = activeGroups[0]
    this.execute('unGroup', { group })
  }

  undo() {
    this._historyMgr.undo()
    this.updateMiniMap$.next()
  }

  redo() {
    this._historyMgr.redo()
    this.updateMiniMap$.next()
  }

  execute(
    type: string,
    options:
      | IAddShapeCommandOpts
      | IAddConnectionCommandOpts
      | IMoveNodeCommandOpts
      | ICreateGroupCommandOpts
      | IUnGroupCommandOpts
      | IDragOutToGroupCommandOpts
      | IRemoveNodeFromGroupCommandOpts
      | IDragEnterToGroupCommandOpts
      | IUpdateShapePropertyCommandOpts
  ) {
    switch (type) {
      case 'addShape': {
        const { shapeType } = options as IAddShapeCommandOpts
        const shape = this._shapeMgr.createShape(shapeType, options as IAddShapeCommandOpts)
        this._historyMgr.execute(new AddShapeCommand(this, shape))
        break
      }
      case 'addConnection': {
        const { connection } = options as IAddConnectionCommandOpts
        this._historyMgr.execute(new AddConnectionCommand(this, connection))
        break
      }
      case 'moveNode': {
        const { node, offsetX, offsetY } = options as IMoveNodeCommandOpts
        const patchCommands: Command[] = []

        const moveGroup = (group: INodeGroup, offsetX: number, offsetY: number) => {
          const moveNodeCommand = new MoveNodeCommand(this, group, offsetX, offsetY)
          patchCommands.push(moveNodeCommand)
          if (group.nodeType === NodeType.Group) {
            group.shapes.forEach(shape => {
              if (shape.nodeType === NodeType.Group) {
                moveGroup(shape as INodeGroup, offsetX, offsetY)
              } else {
                patchCommands.push(new MoveNodeCommand(this, shape, offsetX, offsetY))
              }
            })
          }
        }
        if (node.nodeType === NodeType.Group) {
          moveGroup(node as INodeGroup, offsetX, offsetY)
        } else {
          const moveNodeCommand = new MoveNodeCommand(this, node, offsetX, offsetY)
          patchCommands.push(moveNodeCommand)
        }

        this._historyMgr.execute(new PatchCommand(patchCommands))
        break
      }
      case 'createGroup': {
        const { group } = options as ICreateGroupCommandOpts
        this._historyMgr.execute(new CreateGroupCommand(this, group))
        break
      }
      case 'unGroup': {
        const { group } = options as IUnGroupCommandOpts
        this._historyMgr.execute(new UnGroupCommand(this, group))
        break
      }
      case 'dragOutToGroup': {
        // 将一个节点从一个组拖到另一个组
        const { targetGroup, node, offsetX, offsetY } = options as IDragOutToGroupCommandOpts
        const patchCommands: Command[] = []
        patchCommands.push(new DragOutToGroupCommand(this, targetGroup, node))
        patchCommands.push(new MoveNodeCommand(this, node, offsetX, offsetY))
        this._historyMgr.execute(new PatchCommand(patchCommands))
        break
      }
      case 'removeNodeFromGroup': {
        // 将一个节点从一个组移除
        const { node, offsetX, offsetY } = options as IRemoveNodeFromGroupCommandOpts
        const patchCommands: Command[] = []
        patchCommands.push(new RemoveNodeFromGroupCommand(this, node))
        patchCommands.push(new MoveNodeCommand(this, node, offsetX, offsetY))
        this._historyMgr.execute(new PatchCommand(patchCommands))
        break
      }
      case 'dragEnterToGroup': {
        // 将一个节点从外部拖入一个组
        const { targetGroup, node, offsetX, offsetY } = options as IDragEnterToGroupCommandOpts
        const patchCommands: Command[] = []
        patchCommands.push(new DragEnterToGroupCommand(this, targetGroup, node))
        patchCommands.push(new MoveNodeCommand(this, node, offsetX, offsetY))
        this._historyMgr.execute(new PatchCommand(patchCommands))
        break
      }
      case 'updateShapeProperty': {
        const { shape, shapeConfig, oldShapeConfig } = options as IUpdateShapePropertyCommandOpts
        this._historyMgr.execute(
          new UpdateShapePropertyCommand(this, shape, shapeConfig, oldShapeConfig)
        )
        break
      }
      default:
        break
    }

    this.updateMiniMap$.next()
  }
  getNodeById(id: number) {
    const nodes = this._storageMgr.getNodes()

    return nodes.filter(n => n.id === id)[0]
  }

  getPointByIndex(node: IShape | INodeGroup, index: number): IAnchorPoint | undefined {
    return node.anchor.getBarByIndex(index)
  }

  initFlowChart(data: IExportData) {
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
          image,
          width, // for Image
          height // for Image
        },
        shape,
        z
      }: IExportShape) => {
        const config: { x: number; y: number; image?: string } = { x, y }

        const newShape = this._shapeMgr.createShape(type, config)
        this._shapeMgr.addShapeToEditor(newShape)

        newShape.setZ(z)
        newShape.updateShape({
          fill,
          stroke,
          lineWidth,
          lineDash,
          text,
          fontColor,
          fontSize,
          fontStyle,
          fontWeight,
          textPosition
        })
        // newShape.setStyle({
        //   fill,
        //   stroke,
        //   lineWidth,
        //   lineDash
        // })
        // newShape
        //   .getTextContent()
        //   .setStyle({ text, fill: fontColor, fontSize, fontStyle, fontWeight })
        // newShape.setTextConfig({ position: textPosition })
        if (type === 'image') {
          newShape.attr('style', { width, height, image })
        } else {
          newShape.setShape(shape)
        }
        newShape.anchor.refresh()
        newShape.id = id
        newShape.unActive()
      }
    )

    this.initGroup(groups, shapes)

    connections.forEach((conn: IExportConnection) => {
      const fromNode = this.getNodeById(conn.fromNode)
      const toNode = this.getNodeById(conn.toNode)

      const fromAnchorPoint = this.getPointByIndex(fromNode, conn.fromPoint)
      const toAnchorPoint = this.getPointByIndex(toNode, conn.toPoint)

      if (!fromAnchorPoint || !toAnchorPoint) return

      this._connectionMgr.setConnectionType(conn.type)
      const connection = this._connectionMgr.createConnection(fromAnchorPoint, toAnchorPoint)
      this._connectionMgr.addConnectionToEditor(connection)
      connection.setStyle(conn.style)

      if (conn.type === ConnectionType.BezierCurve) {
        connection.setBezierCurve(conn.controlPoint1!, conn.controlPoint2!)
      }
    })
  }

  initGroup(groups: IExportGroup[], shapes: IExportShape[]) {
    const {
      groupTree,
      groupMap
    }: { groupTree: IGroupTreeNode[]; groupMap: Map<number, IGroupTreeNode> } =
      flatGroupArrayToTree(groups)

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
      if (groupItem && groupItem.children.length === 0) {
        // 最底层的group，由shape组成
        const childIds = getChildShapesByGroupId(gId, shapes).map(s => s.id)
        const childShapes = this._storageMgr.getShapes().filter(s => childIds.includes(s.id))
        childs = childShapes
      } else {
        const childGroupIds = groupItem?.children.map((c: IGroupTreeNode) => c.id) || []
        const childGroups = this._storageMgr.getGroups().filter(g => childGroupIds.includes(g.id))
        const childIds = getChildShapesByGroupId(gId, shapes).map(s => s.id)
        const childShapes = this._storageMgr.getShapes().filter(s => childIds.includes(s.id))
        childs = [...childGroups, ...childShapes]
      }
      const newGroup = this._groupMgr.createGroup(childs, gId)
      this._groupMgr.addGroupToEditor(newGroup)

      newGroup.unActive()
      if (groupItem) {
        newGroup.setZ(groupItem.z)
        newGroup.setStyle(groupItem.style)
      }
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
