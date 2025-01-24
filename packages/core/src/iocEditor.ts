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
import { HotKeysManager } from './hotKeysManage'
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
  UpdateShapePropertyCommand,
  UpdateGroupPropertyCommand,
  UpdateConnectionPropertyCommand,
  ChangeConnectionTypeCommand,
  UpdateControlPointCommand,
  ResizeShapeCommand,
  DeleteNodeCommand,
  DeleteConnectionCommand,
  ClearCommand
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
  IUpdateShapePropertyCommandOpts,
  IUpdateGroupPropertyCommandOpts,
  IUpdateConnectionPropertyCommandOpts,
  IChangeConnectionTypeCommandOpts,
  IUpdateControlPointCommandOpts,
  IResizeShapeCommandOpts,
  IDeleteNodeCommandOpts,
  IClearCommandOpts
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
  getExportData(): IExportData
  exportFile(): void
  openFile(): void
  destroy(): void
  offEvent(): void
  getBoundingBox(): zrender.BoundingRect
  undo(): void
  redo(): void
  createGroup(): void
  unGroup(): void
  delete(): void
  clear(): void
  save(): void
  exportPicture(): void
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
    if (!this._settingMgr.get('enableMiniMap')) {
      new HotKeysManager(this)
      if (localStorage.getItem('ioc-chart-flow')) {
        setTimeout(() => {
          this.initFlowChart(JSON.parse(localStorage.getItem('ioc-chart-flow') || '{}'))
          this.updateMiniMap$.next()
        }, 200)
      }
    }
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

  delete() {
    const activeNodes = this._storageMgr.getActiveNodes()
    const activeConnections = this._storageMgr.getActiveConnections()
    if (activeNodes.length < 1 && activeConnections.length < 1) return
    this._sceneMgr.unActive()
    this.execute('delete', { nodes: activeNodes, connections: activeConnections })
  }

  clear() {
    const exportData = this.getExportData()
    this.execute('clear', { exportData })
  }

  save() {
    const exportData = this.getExportData()
    localStorage.setItem('ioc-chart-flow', JSON.stringify(exportData))
  }

  exportPicture() {
    const sceneWidth = this._viewPortMgr.getSceneWidth()
    const sceneHeight = this._viewPortMgr.getSceneHeight()
    const imageCanvasContainer = document.createElement('ioc-image-canvas') as HTMLCanvasElement
    imageCanvasContainer.style.width = sceneWidth + 'px'
    imageCanvasContainer.style.height = sceneHeight + 'px'

    const imageCanvas = new IocEditor(imageCanvasContainer, {
      enableMiniMap: false,
      enableGrid: false
    })
    imageCanvas.offEvent()
    const exportData = this.getExportData()

    imageCanvas.initFlowChart(exportData)
    const { x, y, width, height } = imageCanvas._viewPortMgr.getBoundingRect([
      ...this._storageMgr.getNodes(),
      ...this._storageMgr.getConnections()
    ])

    const scaleRatio = sceneWidth / width

    const left = -x * scaleRatio
    const top = -y * scaleRatio

    imageCanvas._viewPortMgr.getViewPort().attr('x', left)
    imageCanvas._viewPortMgr.getViewPort().attr('y', top)
    imageCanvas._viewPortMgr.getViewPort().attr('scaleX', scaleRatio)
    imageCanvas._viewPortMgr.getViewPort().attr('scaleY', scaleRatio)

    ;(imageCanvas._zr.painter as any)
      .getRenderedCanvas({
        backgroundColor: 'transparent'
      })
      .toBlob((blob: Blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'ioc-chart-flow.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        // 释放 URL 对象
        window.URL.revokeObjectURL(url)
      }, 'image/png')
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
      | IUpdateConnectionPropertyCommandOpts
      | IChangeConnectionTypeCommandOpts
      | IUpdateControlPointCommandOpts
      | IResizeShapeCommandOpts
      | IDeleteNodeCommandOpts
      | IClearCommandOpts
  ) {
    switch (type) {
      case 'addShape': {
        this._sceneMgr.unActive()
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
      case 'moveNodes': {
        const { nodes, offsetX, offsetY } = options as IMoveNodeCommandOpts
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

        nodes.forEach((node: IShape | INodeGroup) => {
          if (node.nodeType === NodeType.Group) {
            moveGroup(node as INodeGroup, offsetX, offsetY)
          } else {
            const moveNodeCommand = new MoveNodeCommand(this, node, offsetX, offsetY)
            patchCommands.push(moveNodeCommand)
          }
        })

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
      case 'updateGroupProperty': {
        const { group, groupConfig, oldGroupConfig } = options as IUpdateGroupPropertyCommandOpts
        this._historyMgr.execute(
          new UpdateGroupPropertyCommand(this, group, groupConfig, oldGroupConfig)
        )
        break
      }
      case 'updateConnectionProperty': {
        const { connection, connectionConfig, oldConnectionConfig } =
          options as IUpdateConnectionPropertyCommandOpts
        this._historyMgr.execute(
          new UpdateConnectionPropertyCommand(
            this,
            connection,
            connectionConfig,
            oldConnectionConfig
          )
        )
        break
      }
      case 'changeConnectionType': {
        const { connection, lineType, oldLineType } = options as IChangeConnectionTypeCommandOpts
        this._historyMgr.execute(
          new ChangeConnectionTypeCommand(this, connection, lineType, oldLineType)
        )
        break
      }
      case 'updateControlPoint': {
        const { connection, controlPoint1, controlPoint2, oldControlPoint1, oldControlPoint2 } =
          options as IUpdateControlPointCommandOpts
        this._historyMgr.execute(
          new UpdateControlPointCommand(
            this,
            connection,
            controlPoint1,
            controlPoint2,
            oldControlPoint1,
            oldControlPoint2
          )
        )
        break
      }
      case 'resizeShape': {
        const { node, oldBoundingBox, boundingBox } = options as IResizeShapeCommandOpts
        this._historyMgr.execute(new ResizeShapeCommand(this, node, oldBoundingBox, boundingBox))
        break
      }
      case 'delete': {
        const { nodes, connections } = options as IDeleteNodeCommandOpts
        const patchCommands: Command[] = []

        const deleteGroup = (group: INodeGroup) => {
          patchCommands.push(new DeleteNodeCommand(this, group))
          connections.push(...this._connectionMgr.getConnectionsByShape(group))
          group.shapes.forEach(shape => {
            if (shape.nodeType === NodeType.Group) {
              deleteGroup(shape as INodeGroup)
            } else {
              patchCommands.push(new DeleteNodeCommand(this, shape))
              connections.push(...this._connectionMgr.getConnectionsByShape(shape))
            }
          })
        }

        nodes.forEach(node => {
          if (node.nodeType === NodeType.Group) {
            deleteGroup(node as INodeGroup)
          } else {
            patchCommands.push(new DeleteNodeCommand(this, node))
            connections.push(...this._connectionMgr.getConnectionsByShape(node))
          }
        })

        connections
          .filter(
            (connection, index, self) =>
              index === self.findIndex((c: IConnection) => c.id === connection.id)
          )
          .forEach(connection => {
            patchCommands.push(new DeleteConnectionCommand(this, connection))
          })

        this._historyMgr.execute(new PatchCommand(patchCommands))
        break
      }
      case 'clear': {
        const { exportData } = options as IClearCommandOpts
        this._historyMgr.execute(new ClearCommand(this, exportData))
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

    shapes.forEach(({ type, id, x, y, style: shapeConfig, shape, z }: IExportShape) => {
      const config: { x: number; y: number; image?: string } = { x, y }

      const newShape = this._shapeMgr.createShape(type, config)
      this._shapeMgr.addShapeToEditor(newShape)

      newShape.setZ(z)
      newShape.updateShape(shapeConfig)
      if (type !== 'image') {
        newShape.setShape(shape)
      }
      newShape.anchor.refresh()
      newShape.id = id
      newShape.unActive()
    })

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

  getExportData() {
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
    const str = JSON.stringify(this.getExportData(), null, 2)
    console.log('导出的数据为：', this.getExportData())
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
