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
  groupArray2Tree,
  getChildShapesByGroupId,
  getAllRelatedGroups
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
  type IConnection,
  type IExportConnection,
  type IExportData,
  type IExportGroup,
  type IExportShape,
  type IShape,
  type INode
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
  _pasteOffset: number
  updateZoom$: Subject<IUpdateZoomOpts>
  updateMiniMap$: Subject<void>
  sceneDragStart$: Subject<ISceneDragStartOpts>
  addShape(options: IAddShapeCommandOpts): void
  execute(type: string, options: Dictionary<any>): void
  initFlowChart(data: IExportData): void
  initGroup(groups: IExportGroup[], shapes: IExportShape[]): void
  getExportData(): IExportData
  exportFile(): void
  openFile(): void
  destroy(): void
  offEvent(): void
  undo(): void
  redo(): void
  createGroup(): void
  unGroup(): void
  delete(): void
  clear(): void
  save(): void
  exportPicture(): void
  copy(): void
  paste(): void
  selectAll(): void
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
  _copyData: IExportData = {
    shapes: [],
    connections: [],
    groups: []
  }
  _pasteOffset: number
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
    this._pasteOffset = this._settingMgr.get('pasteOffset')
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

  selectAll() {
    this._storageMgr.getNodes().forEach(node => node.active())
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
    const { x, y, width } = imageCanvas._viewPortMgr.getBoundingRect([
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

  copy() {
    const activeShapes: IExportShape[] = this._storageMgr
      .getActiveShapes()
      .map(s => s.getExportData())
    const activeGroups: IExportGroup[] = this._storageMgr
      .getActiveGroups()
      .map(g => g.getExportData())
    // 需要递归的去找所有activeGroups以及其中嵌套的group
    const allGroups = getAllRelatedGroups(
      activeGroups,
      this._storageMgr.getGroups().map(g => g.getExportData())
    )

    const allGroupIds = allGroups.map(g => g.id)
    const allGroupChildShapesIds = this._storageMgr
      .getShapes()
      .filter(s => allGroupIds.includes(s.parentGroup?.id as number))
      .map(s => s.id)

    // 只复制连线两端同时与节点相连的连线
    const connections: IExportConnection[] = this._connectionMgr
      .getConnectionsInNodes(
        new Set([...activeShapes.map(n => n.id), ...allGroupIds, ...allGroupChildShapesIds])
      )
      .map(c => c.getExportData())

    this._copyData = {
      shapes: zrender.util.clone(activeShapes),
      groups: zrender.util.clone(allGroups),
      connections: zrender.util.clone(connections)
    }

    console.log('copyData', this._copyData)
  }

  paste() {
    this.execute('paste', this._copyData)
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
      | IExportData
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

        nodes.forEach((node: INode) => {
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
          connections.push(...this._connectionMgr.getConnectionsByNodeId(group.id))
          group.shapes.forEach(shape => {
            if (shape.nodeType === NodeType.Group) {
              deleteGroup(shape as INodeGroup)
            } else {
              patchCommands.push(new DeleteNodeCommand(this, shape))
              connections.push(...this._connectionMgr.getConnectionsByNodeId(shape.id))
            }
          })
        }

        nodes.forEach(node => {
          if (node.nodeType === NodeType.Group) {
            deleteGroup(node as INodeGroup)
          } else {
            patchCommands.push(new DeleteNodeCommand(this, node))
            connections.push(...this._connectionMgr.getConnectionsByNodeId(node.id))
          }
        })

        this._connectionMgr
          .removeDuplicateConnections<IConnection>(connections)
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
      case 'paste': {
        const { shapes, groups, connections } = options as IExportData
        const [viewPortX, viewPortY] = this._viewPortMgr.getPosition()
        const zoom = this._viewPortMgr.getZoom()
        const offset = 40
        const patchCommands: Command[] = []
        const copyShapeMap = new Map<number, IShape>()
        this._sceneMgr.unActive()
        shapes.forEach(s => {
          const oldId = s.id
          const newId = zrender.util.guid()

          const newShape = {
            ...s,
            id: newId,
            x: (s.x + offset) * zoom + viewPortX,
            y: (s.y + offset) * zoom + viewPortY
          }

          const shape = this.initShape([newShape])[0]
          shape.active()
          copyShapeMap.set(oldId, shape)
          patchCommands.push(new AddShapeCommand(this, shape))
        })

        const {
          groupTree
        }: { groupTree: IGroupTreeNode[]; groupMap: Map<number, IGroupTreeNode> } =
          groupArray2Tree(groups)

        const copyGroupMap = new Map<number, INodeGroup>()
        const createGroups = (treeNodes: IGroupTreeNode[]): void => {
          treeNodes.forEach((node: IGroupTreeNode) => {
            const childShapes = getChildShapesByGroupId(
              node.id,
              this._storageMgr.getShapes().map(s => s.getExportData())
            ).map(s => {
              const oldId = s.id
              const newId = zrender.util.guid()

              const newShape = {
                ...s,
                id: newId,
                x: (s.x + offset) * zoom + viewPortX,
                y: (s.y + offset) * zoom + viewPortY
              }
              const shape = this.initShape([newShape])[0]
              shape.active()
              copyShapeMap.set(oldId, shape)
              patchCommands.push(new AddShapeCommand(this, shape))

              return shape
            })

            if (node.children.length > 0) {
              createGroups(node.children)
            }

            const childGroups = node.children
              .map(c => copyGroupMap.get(c.id))
              .filter(group => group !== undefined)

            const childNodes = [...childGroups, ...childShapes]

            const newGroup = this._groupMgr.createGroup(childNodes, zrender.util.guid())
            copyGroupMap.set(node.id, newGroup)
            newGroup.active()
            newGroup.setZ(node.z + 1)
            newGroup.setStyle(node.style)

            patchCommands.push(new CreateGroupCommand(this, newGroup))
          })
        }

        createGroups(groupTree)

        const combinedMap = new Map<number, INode>()

        copyShapeMap.forEach((shape, oldId) => {
          combinedMap.set(oldId, shape)
        })

        copyGroupMap.forEach((group, oldId) => {
          combinedMap.set(oldId, group)
        })

        connections.forEach((conn: IExportConnection) => {
          const fromNode = combinedMap.get(conn.fromNode) as INode
          const toNode = combinedMap.get(conn.toNode) as INode

          const connection = this.createConnection(conn, fromNode, toNode)
          connection && patchCommands.push(new AddConnectionCommand(this, connection))
        })

        this._historyMgr.execute(new PatchCommand(patchCommands))
        break
      }
      default:
        break
    }

    this.updateMiniMap$.next()
  }

  initFlowChart(data: IExportData) {
    this._sceneMgr.clear()
    this._viewPortMgr.setPosition(0, 0)
    const { shapes = [], connections = [], groups = [] } = data
    this.initShape(shapes).forEach(shape => {
      this._shapeMgr.addShapeToEditor(shape)
    })
    this.initGroup(groups, shapes)
    this.initConnection(connections).forEach(connection => {
      this._connectionMgr.addConnectionToEditor(connection)
    })
  }

  initShape(shapes: IExportShape[]) {
    const newShapes: IShape[] = []
    shapes.forEach(({ type, id, x, y, style: shapeConfig, shape, z }: IExportShape) => {
      const config: { x: number; y: number; image?: string } = { x, y }
      const newShape = this._shapeMgr.createShape(type, config)

      newShape.setZ(z)
      newShape.updateShape(shapeConfig)
      if (type !== 'image') {
        newShape.setShape(shape)
      }
      newShape.anchor.refresh()
      newShape.id = id
      newShape.unActive()
      newShapes.push(newShape)
    })

    return newShapes
  }

  createConnection(conn: IExportConnection, fromNode: INode, toNode: INode) {
    const fromAnchorPoint = this._shapeMgr.getPointByIndex(fromNode, conn.fromPoint)
    const toAnchorPoint = this._shapeMgr.getPointByIndex(toNode, conn.toPoint)

    if (!fromAnchorPoint || !toAnchorPoint) return null

    this._connectionMgr.setConnectionType(conn.type)
    const connection = this._connectionMgr.createConnection(
      fromAnchorPoint,
      toAnchorPoint,
      conn.type
    )
    connection.setStyle(conn.style)

    if (conn.type === ConnectionType.BezierCurve) {
      connection.setBezierCurve(conn.controlPoint1!, conn.controlPoint2!)
    }

    return connection
  }

  initConnection(connections: IExportConnection[]) {
    const newConnections: IConnection[] = []
    connections.forEach((conn: IExportConnection) => {
      const fromNode = this._shapeMgr.getNodeById(conn.fromNode)
      const toNode = this._shapeMgr.getNodeById(conn.toNode)
      const connection = this.createConnection(conn, fromNode, toNode)
      connection && newConnections.push(connection)
    })

    return newConnections
  }

  initGroup(groups: IExportGroup[], shapes: IExportShape[]) {
    const { groupTree }: { groupTree: IGroupTreeNode[] } = groupArray2Tree(groups)
    // console.log('groupTree', JSON.stringify(groupTree, null, 2))

    // 创建Group的过程是从最底层Shapes开始创建，接着创建Shapes的父Group，再创建父Group的父Group(如果存在的话)
    // 通过递归的方式，确保从最底层的形状开始创建，逐步向上构建父组，保持组的层级关系
    const createGroups = (treeNodes: IGroupTreeNode[]): void => {
      treeNodes.forEach((node: IGroupTreeNode) => {
        const childIds = getChildShapesByGroupId(node.id, shapes).map(s => s.id)
        const childShapes = this._storageMgr.getShapes().filter(s => childIds.includes(s.id))

        // 递归创建子组
        if (node.children.length > 0) {
          createGroups(node.children)
        }

        const childGroups = this._storageMgr
          .getGroups()
          .filter(g => node.children.map(c => c.id).includes(g.id))

        const childNodes = [...childGroups, ...childShapes]

        const newGroup = this._groupMgr.createGroup(childNodes, node.id)
        this._groupMgr.addGroupToEditor(newGroup)

        newGroup.unActive()
        newGroup.setZ(node.z)
        newGroup.setStyle(node.style)
      })
    }

    createGroups(groupTree)
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
}
