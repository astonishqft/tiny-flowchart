import { Subject } from 'rxjs'
import * as zrender from 'zrender'
import { Disposable } from './disposable'
import { Connection } from './connection'
import { ConnectionType } from './shapes'

import type { IDisposable } from './disposable'
import type { IAnchorPoint, IConnection, IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { IIocEditor } from './iocEditor'

export interface IConnectionManage extends IDisposable {
  updateConnectionType$: Subject<ConnectionType>
  updateSelectConnection$: Subject<IConnection>
  createConnection(fromAnchorPoint: IAnchorPoint, toAnchorPoint: IAnchorPoint): IConnection
  createTmpConnection(fromAnchorPoint: IAnchorPoint): void
  moveTmpConnection(x: number, y: number): void
  removeTmpConnection(): void
  getConnectionByShape(shape: IShape | INodeGroup): IConnection[]
  setConnectionType(type: ConnectionType): void
  refreshConnection(shape: IShape | INodeGroup): void
  addConnectionToEditor(connection: IConnection): void
  removeConnectionFromEditor(connection: IConnection): void
  clear(): void
  unActiveConnections(): void
  getConnectionsByGroup(node: INodeGroup | IShape): IConnection[]
  getConnectionType(): ConnectionType
}

class ConnectionManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  private _iocEditor: IIocEditor
  private _tempConnection: zrender.Line | null = null
  private _connectionType: ConnectionType = ConnectionType.OrtogonalLine
  updateConnectionType$ = new Subject<ConnectionType>()
  updateSelectConnection$ = new Subject<IConnection>()
  constructor(iocEditor: IIocEditor) {
    super()
    this._iocEditor = iocEditor
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
    this._disposables.push(this.updateConnectionType$)
    this._disposables.push(this.updateSelectConnection$)
  }

  setConnectionType(type: ConnectionType): void {
    this._connectionType = type
  }

  createTmpConnection(fromAnchorPoint: IAnchorPoint) {
    this._tempConnection = new zrender.Line({
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

  createConnection(fromAnchorPoint: IAnchorPoint, toAnchorPoint: IAnchorPoint): IConnection {
    const connection = new Connection(
      this._iocEditor,
      fromAnchorPoint,
      toAnchorPoint,
      this._connectionType
    )

    this.initEvent(connection)

    return connection
  }

  addConnectionToEditor(connection: IConnection) {
    this._viewPortMgr.addElementToViewPort(connection)
    this._storageMgr.addConnection(connection)
  }

  unActiveConnections() {
    this._storageMgr.getConnections().forEach((conn: IConnection) => {
      conn.unActive()
    })
  }

  initEvent(conn: IConnection) {
    conn.on('click', () => {
      this.unActiveConnections()
      this._iocEditor._sceneMgr.unActive()
      this.updateSelectConnection$.next(conn)
      conn.active()
    })
  }

  removeConnectionFromEditor(connection: IConnection) {
    this._viewPortMgr.removeElementFromViewPort(connection)
    this._storageMgr.removeConnection(connection)
  }

  getConnectionByShape(shape: IShape | INodeGroup) {
    const conns: IConnection[] = []

    this._storageMgr.getConnections().forEach((connection: IConnection) => {
      if (connection.fromNode.id === shape.id || connection.toNode!.id === shape.id) {
        conns.push(connection)
      }
    })

    return conns
  }

  refreshConnection(shape: IShape | INodeGroup) {
    shape.anchor.refresh()
    const conns = this.getConnectionByShape(shape)

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

  getConnectionType(): ConnectionType {
    return this._connectionType
  }

  getConnectionsByGroup(node: INodeGroup | IShape) {
    return this._storageMgr
      .getConnections()
      .filter(connection => connection.fromNode.id === node.id || connection.toNode!.id === node.id)
  }
}

export { ConnectionManage }
