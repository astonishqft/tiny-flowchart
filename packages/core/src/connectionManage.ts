import { Subject } from 'rxjs'
import { Line, ConnectionType } from '@/index'
import { Disposable } from './disposable'
import { Connection } from './connection'

import type {
  IAnchorPoint,
  IConnection,
  INode,
  IDisposable,
  IViewPortManage,
  IStorageManage,
  ITinyFlowchart
} from '@/index'

export interface IConnectionManage extends IDisposable {
  updateConnectionType$: Subject<ConnectionType>
  updateSelectConnection$: Subject<IConnection>
  createConnection(
    fromAnchorPoint: IAnchorPoint,
    toAnchorPoint: IAnchorPoint,
    connectionType: ConnectionType
  ): IConnection
  createTmpConnection(fromAnchorPoint: IAnchorPoint): void
  moveTmpConnection(x: number, y: number): void
  removeTmpConnection(): void
  getConnectionsByNodeId(id: number): IConnection[]
  getUniqueConnections(connections: IConnection[]): IConnection[]
  refreshConnection(shape: INode): void
  addConnectionToEditor(connection: IConnection): void
  removeConnectionFromEditor(connection: IConnection): void
  clear(): void
  unActive(): void
  setConnectionType(type: ConnectionType): void
  getConnectionType(): ConnectionType
  removeDuplicateConnections<T extends { id: number }>(connections: T[]): T[]
  getConnectionsInNodes(nodeIds: Set<number>): IConnection[]
}

class ConnectionManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  private _iocEditor: ITinyFlowchart
  private _tempConnection: Line | null = null
  private _connectionType: ConnectionType = ConnectionType.OrtogonalLine
  updateConnectionType$ = new Subject<ConnectionType>()
  updateSelectConnection$ = new Subject<IConnection>()
  constructor(tinyFlowchart: ITinyFlowchart) {
    super()
    this._iocEditor = tinyFlowchart
    this._viewPortMgr = tinyFlowchart._viewPortMgr
    this._storageMgr = tinyFlowchart._storageMgr
    this._disposables.push(this.updateConnectionType$, this.updateSelectConnection$)
  }

  setConnectionType(type: ConnectionType): void {
    this._connectionType = type
  }

  getConnectionType(): ConnectionType {
    return this._connectionType
  }

  createTmpConnection(fromAnchorPoint: IAnchorPoint) {
    this._tempConnection = new Line({
      shape: {
        x1: fromAnchorPoint.point.x,
        y1: fromAnchorPoint.point.y,
        x2: fromAnchorPoint.point.x,
        y2: fromAnchorPoint.point.y
      },
      style: {
        stroke: '#228be6',
        lineWidth: 1,
        lineDash: [4, 4]
      },
      silent: true, // 禁止触发事件，否则会导致拖拽，节点无法响应mouseover事件
      z: 4
    })

    this._viewPortMgr.addElementToViewPort(this._tempConnection)
  }

  moveTmpConnection(x: number, y: number) {
    this._tempConnection!.attr({
      shape: {
        x2: x,
        y2: y
      }
    })
  }

  removeTmpConnection() {
    this._viewPortMgr.removeElementFromViewPort(this._tempConnection!)
    this._tempConnection = null
  }

  createConnection(
    fromAnchorPoint: IAnchorPoint,
    toAnchorPoint: IAnchorPoint,
    connectionType: ConnectionType
  ): IConnection {
    const connection = new Connection(
      this._iocEditor,
      fromAnchorPoint,
      toAnchorPoint,
      connectionType
    )

    this.initEvent(connection)

    return connection
  }

  addConnectionToEditor(connection: IConnection) {
    this._viewPortMgr.addElementToViewPort(connection)
    this._storageMgr.addConnection(connection)
  }

  unActive() {
    this._storageMgr.getConnections().forEach((conn: IConnection) => {
      conn.unActive()
    })
  }

  initEvent(conn: IConnection) {
    conn.on('click', () => {
      this._iocEditor.unActive()
      this.updateSelectConnection$.next(conn)
      conn.active()
    })
  }

  removeConnectionFromEditor(connection: IConnection) {
    this._viewPortMgr.removeElementFromViewPort(connection)
    this._storageMgr.removeConnection(connection)
  }

  refreshConnection(shape: INode) {
    shape.anchor.refresh()
    const conns = this.getConnectionsByNodeId(shape.id)

    conns.forEach(conn => {
      if (conn.fromNode.id === shape.id) {
        const fromPoint = shape.getAnchorByIndex(conn.fromPoint!.index)
        conn.setFromPoint(fromPoint)
      } else if (conn.toNode!.id === shape.id) {
        const toPoint = shape.getAnchorByIndex(conn.toPoint!.index)
        conn.setToPoint(toPoint)
      }
      conn.refresh()
    })
  }

  clear() {
    this._storageMgr.getConnections().forEach(c => this._viewPortMgr.removeElementFromViewPort(c))
    this._storageMgr.clearConnections()
  }

  getConnectionsByNodeId(id: number) {
    return this._storageMgr
      .getConnections()
      .filter(connection => connection.fromNode.id === id || connection.toNode!.id === id)
  }

  getUniqueConnections(connections: IConnection[]) {
    return Array.from(new Map(connections.map(conn => [conn.id, conn])).values())
  }

  removeDuplicateConnections<T extends { id: number }>(connections: T[]): T[] {
    const uniqueConnections = new Map<number, T>()

    connections.forEach(connection => {
      uniqueConnections.set(connection.id, connection)
    })

    return Array.from(uniqueConnections.values())
  }

  getConnectionsInNodes(nodesIds: Set<number>): IConnection[] {
    const connections = this._storageMgr.getConnections()

    return connections.filter(
      connection => nodesIds.has(connection.fromNode.id) && nodesIds.has(connection.toNode!.id)
    )
  }
}

export { ConnectionManage }
