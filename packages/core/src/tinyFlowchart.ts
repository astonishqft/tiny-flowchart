import { Subject } from 'rxjs'
import { util, init } from '@/index'
import { Disposable } from '@/disposable'
import { SceneManage } from '@/sceneManage'
import { ShapeManage } from '@/shapeManage'
import { ViewPortManage } from '@/viewPortManage'
import { ConnectionManage } from '@/connectionManage'
import { StorageManage } from '@/storageManage'
import { GroupManage } from '@/groupManage'
import { ZoomManage } from '@/zoomManage'
import { DragFrameManage } from '@/dragFrameManage'
import { RefLineManage } from '@/refLineManage'
import { SelectFrameManage } from '@/selectFrameManage'
import { SettingManage } from '@/settingManage'
import { ControlFrameManage } from '@/controlFrameManage'
import { HistoryManage } from '@/history/historyManage'
import { HotKeysManager } from '@/hotKeysManage'
import { NodeEventManage } from '@/nodeEventManage'

import {
  downloadFile,
  groupArray2Tree,
  getChildShapesByGroupId,
  getAllRelatedGroups
} from '@/utils'
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
  ClearCommand,
  SetTopCommand,
  SetBottomCommand
} from './history/commands'

import type {
  ZRenderType,
  IRefLineManage,
  IDragFrameManage,
  IGroupManage,
  IZoomManage,
  IViewPortManage,
  IConnectionManage,
  ISceneManage,
  IShapeManage,
  IStorageManage,
  ISelectFrameManage,
  ISettingManage,
  IHistoryManage,
  IControlFrameManage,
  IExportShape,
  IShape,
  INode,
  IExportData,
  IConnection,
  IExportConnection,
  IExportGroup,
  INodeGroup
} from '@/index'
import type { IIocEditorConfig } from './settingManage'
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
  IClearCommandOpts,
  ISetZLevelCommandOpts
} from './history/commands'

import { ConnectionType, NodeType } from './shapes'
import type { IGroupTreeNode } from './utils'
import type { ISceneDragMoveOpts, ISceneDragStartOpts, IUpdateZoomOpts, Dictionary } from './types'
import type { ICommand } from './history/historyManage'
import type { INodeEventManage } from '@/nodeEventManage'

export interface ITinyFlowchart {
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
  _nodeEventMgr: INodeEventManage
  _zoomMgr: IZoomManage
  _zr: ZRenderType
  _dom: HTMLElement
  _pasteOffset: number
  updateMessage$: Subject<{ info: string; type: string }>
  updateZoom$: Subject<IUpdateZoomOpts>
  updateMiniMap$: Subject<void>
  updateMiniMapVisible$: Subject<boolean>
  sceneDragStart$: Subject<ISceneDragStartOpts>
  sceneDragMove$: Subject<ISceneDragMoveOpts>
  sceneDragEnd$: Subject<void>
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
  setTop(): void
  setBottom(): void
  createGroup(): void
  unGroup(): void
  delete(): void
  clear(): void
  save(): void
  exportPicture(): void
  copy(): void
  paste(): void
  selectAll(): void
  unActive(): void
}

export class TinyFlowchart implements ITinyFlowchart {
  _zr: ZRenderType
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
  _nodeEventMgr: INodeEventManage
  _copyData: IExportData = {
    shapes: [],
    connections: [],
    groups: []
  }
  _pasteOffset: number
  updateMessage$ = new Subject<{ info: string; type: string }>()
  updateZoom$ = new Subject<IUpdateZoomOpts>()
  updateMiniMap$ = new Subject<void>()
  updateMiniMapVisible$ = new Subject<boolean>()

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
    this._zr = init(dom)
    this._nodeEventMgr = new NodeEventManage(this)
    this._sceneMgr = new SceneManage(this)
    this._historyMgr = new HistoryManage()
    this._pasteOffset = this._settingMgr.get('pasteOffset')
    this._sceneMgr.init()
    this.initializeHotKeysAndFlowChart()
  }

  private initializeHotKeysAndFlowChart() {
    if (!this._settingMgr.get('enableMiniMap')) {
      new HotKeysManager(this)
      const savedFlow = localStorage.getItem('ioc-chart-flow')
      if (savedFlow) {
        setTimeout(() => {
          this.initFlowChart(JSON.parse(savedFlow))
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
    this.unActive()
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
    this.updateMessage$.next({ info: '保存成功', type: 'success' })
  }

  exportPicture() {
    const sceneWidth = this._viewPortMgr.getSceneWidth() || window.innerWidth
    const sceneHeight = this._viewPortMgr.getSceneHeight() || window.innerHeight
    const imageCanvasContainer = document.createElement('ioc-image-canvas') as HTMLCanvasElement
    imageCanvasContainer.style.width = sceneWidth + 'px'
    imageCanvasContainer.style.height = sceneHeight + 'px'

    const imageCanvas = new TinyFlowchart(imageCanvasContainer, {
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
      shapes: util.clone(activeShapes),
      groups: util.clone(allGroups),
      connections: util.clone(connections)
    }

    console.log('copyData', this._copyData)
  }

  paste() {
    this.execute('paste', this._copyData)
  }

  setTop() {
    const activeNodes = this._storageMgr.getActiveNodes()
    if (activeNodes.length === 0) return
    const level = Math.max(...this._storageMgr.getNodes().map(node => node.getZ()))
    this.execute('setTop', { activeNodes, level })
  }

  setBottom() {
    const activeNodes = this._storageMgr.getActiveNodes()
    if (activeNodes.length === 0) return
    const level = Math.min(...this._storageMgr.getNodes().map(node => node.getZ()))
    this.execute('setBottom', { activeNodes, level })
  }

  handleSetTop(options: ISetZLevelCommandOpts) {
    const { activeNodes, level } = options
    this._historyMgr.execute(new SetTopCommand(this, activeNodes, level))
  }

  handleSetBottom(options: ISetZLevelCommandOpts) {
    const { activeNodes, level } = options
    this._historyMgr.execute(new SetBottomCommand(this, activeNodes, level))
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
      | ISetZLevelCommandOpts
  ) {
    switch (type) {
      case 'addShape': {
        this.handleAddShape(options as IAddShapeCommandOpts)
        break
      }
      case 'addConnection': {
        this.handleAddConnection(options as IAddConnectionCommandOpts)
        break
      }
      case 'moveNodes': {
        this._historyMgr.execute(
          new PatchCommand(this.handleMoveNodes(options as IMoveNodeCommandOpts))
        )
        break
      }
      case 'createGroup': {
        this.handleCreateGroup(options as ICreateGroupCommandOpts)
        break
      }
      case 'unGroup': {
        this.handleUnGroup(options as IUnGroupCommandOpts)
        break
      }
      case 'dragOutToGroup': {
        this.handleDragOutToGroup(options as IDragOutToGroupCommandOpts)
        break
      }
      case 'removeNodeFromGroup': {
        this.handleRemoveNodeFromGroup(options as IRemoveNodeFromGroupCommandOpts)
        break
      }
      case 'dragEnterToGroup': {
        this.handleDragEnterToGroup(options as IDragEnterToGroupCommandOpts)
        break
      }
      case 'updateShapeProperty': {
        this.handleUpdateShapeProperty(options as IUpdateShapePropertyCommandOpts)
        break
      }
      case 'updateGroupProperty': {
        this.handleUpdateGroupProperty(options as IUpdateGroupPropertyCommandOpts)
        break
      }
      case 'updateConnectionProperty': {
        this.handleUpdateConnectionProperty(options as IUpdateConnectionPropertyCommandOpts)
        break
      }
      case 'changeConnectionType': {
        this.handleChangeConnectionType(options as IChangeConnectionTypeCommandOpts)
        break
      }
      case 'updateControlPoint': {
        this.handleUpdateControlPoint(options as IUpdateControlPointCommandOpts)
        break
      }
      case 'resizeShape': {
        this.handleResizeShape(options as IResizeShapeCommandOpts)
        break
      }
      case 'delete': {
        this.handleDelete(options as IDeleteNodeCommandOpts)
        break
      }
      case 'clear': {
        this.handleClear(options as IClearCommandOpts)
        break
      }
      case 'paste': {
        this.handlePaste(options as IExportData)
        break
      }
      case 'setTop': {
        this.handleSetTop(options as ISetZLevelCommandOpts)
        break
      }
      case 'setBottom': {
        this.handleSetBottom(options as ISetZLevelCommandOpts)
        break
      }
      default:
        break
    }

    this.updateMiniMap$.next()
  }

  private handleAddShape(options: IAddShapeCommandOpts) {
    this.unActive()
    const shape = this._shapeMgr.createShape(options.shapeType, options)
    this._historyMgr.execute(new AddShapeCommand(this, shape))
  }

  private handleAddConnection(options: IAddConnectionCommandOpts) {
    this._historyMgr.execute(new AddConnectionCommand(this, options.connection))
  }

  private handleMoveNodes(options: IMoveNodeCommandOpts) {
    const patchCommands: ICommand[] = []
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

    options.nodes.forEach((node: INode) => {
      if (node.nodeType === NodeType.Group) {
        moveGroup(node as INodeGroup, options.offsetX, options.offsetY)
      } else {
        const moveNodeCommand = new MoveNodeCommand(this, node, options.offsetX, options.offsetY)
        patchCommands.push(moveNodeCommand)
      }
    })

    return patchCommands
  }

  private handleCreateGroup(options: ICreateGroupCommandOpts) {
    this._historyMgr.execute(new CreateGroupCommand(this, options.group))
  }

  private handleUnGroup(options: IUnGroupCommandOpts) {
    this._historyMgr.execute(new UnGroupCommand(this, options.group))
  }

  private handleDragOutToGroup(options: IDragOutToGroupCommandOpts) {
    const patchCommands: ICommand[] = []
    patchCommands.push(new DragOutToGroupCommand(this, options.targetGroup, options.node))
    patchCommands.push(
      ...this.handleMoveNodes({
        nodes: [options.node],
        tinyFlowchart: this,
        offsetX: options.offsetX,
        offsetY: options.offsetY
      })
    )

    this._historyMgr.execute(new PatchCommand(patchCommands))
  }

  private handleRemoveNodeFromGroup(options: IRemoveNodeFromGroupCommandOpts) {
    const patchCommands: ICommand[] = []
    patchCommands.push(new RemoveNodeFromGroupCommand(this, options.node))
    patchCommands.push(
      ...this.handleMoveNodes({
        nodes: [options.node],
        tinyFlowchart: this,
        offsetX: options.offsetX,
        offsetY: options.offsetY
      })
    )

    this._historyMgr.execute(new PatchCommand(patchCommands))
  }

  private handleDragEnterToGroup(options: IDragEnterToGroupCommandOpts) {
    const patchCommands: ICommand[] = []
    patchCommands.push(new DragEnterToGroupCommand(this, options.targetGroup, options.node))
    patchCommands.push(
      ...this.handleMoveNodes({
        nodes: [options.node],
        tinyFlowchart: this,
        offsetX: options.offsetX,
        offsetY: options.offsetY
      })
    )

    this._historyMgr.execute(new PatchCommand(patchCommands))
  }

  private handleUpdateShapeProperty(options: IUpdateShapePropertyCommandOpts) {
    this._historyMgr.execute(
      new UpdateShapePropertyCommand(this, options.shape, options.shapeStyle, options.oldShapeStyle)
    )
  }

  private handleUpdateGroupProperty(options: IUpdateGroupPropertyCommandOpts) {
    this._historyMgr.execute(
      new UpdateGroupPropertyCommand(
        this,
        options.group,
        options.groupConfig,
        options.oldGroupConfig
      )
    )
  }

  private handleUpdateConnectionProperty(options: IUpdateConnectionPropertyCommandOpts) {
    this._historyMgr.execute(
      new UpdateConnectionPropertyCommand(
        this,
        options.connection,
        options.connectionConfig,
        options.oldConnectionConfig
      )
    )
  }

  private handleChangeConnectionType(options: IChangeConnectionTypeCommandOpts) {
    this._historyMgr.execute(
      new ChangeConnectionTypeCommand(
        this,
        options.connection,
        options.lineType,
        options.oldLineType
      )
    )
  }

  private handleUpdateControlPoint(options: IUpdateControlPointCommandOpts) {
    this._historyMgr.execute(
      new UpdateControlPointCommand(
        this,
        options.connection,
        options.controlPoint1,
        options.controlPoint2,
        options.oldControlPoint1,
        options.oldControlPoint2
      )
    )
  }

  private handleResizeShape(options: IResizeShapeCommandOpts) {
    this._historyMgr.execute(
      new ResizeShapeCommand(this, options.node, options.oldBoundingBox, options.boundingBox)
    )
  }

  private handleDelete(options: IDeleteNodeCommandOpts) {
    const patchCommands: ICommand[] = []
    const connections: IConnection[] = options.connections

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

    options.nodes.forEach(node => {
      if (node.nodeType === NodeType.Group) {
        deleteGroup(node as INodeGroup)
      } else {
        patchCommands.push(new DeleteNodeCommand(this, node))
        connections.push(...this._connectionMgr.getConnectionsByNodeId(node.id))
      }
    })

    this._connectionMgr.removeDuplicateConnections<IConnection>(connections).forEach(connection => {
      patchCommands.push(new DeleteConnectionCommand(this, connection))
    })

    this._historyMgr.execute(new PatchCommand(patchCommands))
  }

  private handleClear(options: IClearCommandOpts) {
    this._historyMgr.execute(new ClearCommand(this, options.exportData))
  }

  private handlePaste(options: IExportData) {
    const { shapes, groups, connections } = options as IExportData
    const [viewPortX, viewPortY] = this._viewPortMgr.getPosition()
    const zoom = this._viewPortMgr.getZoom()
    const offset = 40
    const patchCommands: ICommand[] = []
    const copyShapeMap = new Map<number, IShape>()
    this.unActive()
    shapes.forEach(s => {
      const oldId = s.id
      const newId = util.guid()

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

    const { groupTree }: { groupTree: IGroupTreeNode[]; groupMap: Map<number, IGroupTreeNode> } =
      groupArray2Tree(groups)

    const copyGroupMap = new Map<number, INodeGroup>()
    const createGroups = (treeNodes: IGroupTreeNode[]): void => {
      treeNodes.forEach((node: IGroupTreeNode) => {
        const childShapes = getChildShapesByGroupId(
          node.id,
          this._storageMgr.getShapes().map(s => s.getExportData())
        ).map(s => {
          const oldId = s.id
          const newId = util.guid()

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

        const newGroup = this._groupMgr.createGroup(childNodes, util.guid())
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
    shapes.forEach(({ type, id, x, y, style, shape, z }: IExportShape) => {
      const config: { x: number; y: number; image?: string } = { x, y }
      const newShape = this._shapeMgr.createShape(type, config)

      newShape.setZ(z)
      newShape.updateShapeStyle(style)
      newShape.setShape && newShape.setShape(shape!)
      newShape.anchor.refresh()
      newShape.id = id
      newShape.unActive()
      newShapes.push(newShape)
    })

    return newShapes
  }

  private createConnection(conn: IExportConnection, fromNode: INode, toNode: INode) {
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
    const exportData = this.getExportData()
    console.log('导出的数据为：', exportData)
    downloadFile(JSON.stringify(exportData, null, 2), 'ioc-chart-flow.json')
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

  unActive() {
    this._storageMgr.getNodes().forEach(node => {
      node.unActive()
    })
    this._connectionMgr.unActive()
    this._controlFrameMgr.unActive()
  }

  destroy() {
    this._sceneMgr.dispose()
    this._shapeMgr.dispose()
    this._viewPortMgr.dispose()
    this._dragFrameMgr.dispose()
    this._shapeMgr.dispose()
    this._groupMgr.dispose()
    this._settingMgr.dispose()
    this._nodeEventMgr.dispose()
    this._zr.dispose()
    this.updateZoom$.unsubscribe()
    this.sceneDragMove$.unsubscribe()
    this.updateMiniMap$.unsubscribe()
    this.updateMiniMapVisible$.unsubscribe()
  }

  offEvent() {
    this._zr.off()
  }
}
