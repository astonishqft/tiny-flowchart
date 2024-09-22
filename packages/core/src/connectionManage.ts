import { Subject, Observable } from 'rxjs'
import { Disposable } from './disposable'
import { Connection } from './connection'
import { ConnectionType } from './connection'

import type { IDisposable } from './disposable'
import type { IConnection } from './connection'
import type { IShape, IAnchorPoint } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { IocEditor } from './iocEditor'

export interface IConnectionManage extends IDisposable {
  createConnection(fromNode: IShape): IConnection
  getConnectionByShape(shape: IShape): IConnection[]
  setConnectionType(type: ConnectionType): void
  refreshConnection(shape: IShape): void
  removeConnection(connection: IConnection): void
  connect(anchorPoint: IAnchorPoint): void
  updateConnectionType$: Observable<ConnectionType>
  updateSelectConnection$: Observable<IConnection>
  clear(): void
  unActiveConnections(): void
  cancelConnect(): void
}

class ConnectionManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  private _connectionType: ConnectionType = ConnectionType.OrtogonalLine
  updateConnectionType$ = new Subject<ConnectionType>()
  updateSelectConnection$ = new Subject<IConnection>()

  newConnection: IConnection | null = null
  constructor(iocEditor: IocEditor) {
    super()
    this._viewPortMgr = iocEditor._viewPortMgr
    this._storageMgr = iocEditor._storageMgr
    this._disposables.push(this.updateConnectionType$)
    this._disposables.push(this.updateSelectConnection$)
  }

  setConnectionType(type: ConnectionType): void {
    this._connectionType = type
  }

  createConnection(fromNode: IShape): IConnection {
    const sceneWidth = this._viewPortMgr.getSceneWidth()
    const sceneHeight = this._viewPortMgr.getSceneHeight()
    this.newConnection = new Connection(fromNode, this._connectionType, sceneWidth, sceneHeight)

    this._viewPortMgr.addElementToViewPort(this.newConnection)
    this.initEvent(this.newConnection)
    return this.newConnection
  }

  connect(anchorPoint: IAnchorPoint) {
    if (this.newConnection) {
      this.newConnection.setToPoint(anchorPoint.point)
      this.newConnection.connect(anchorPoint.node)
      this._storageMgr.addConnection(this.newConnection)
    }
  }

  cancelConnect() {
    if (this.newConnection) {
      this.newConnection.cancelConnect()
      this.newConnection = null
    }
  }

  unActiveConnections() {
    this._storageMgr.getConnections().forEach((conn: IConnection) => {
      conn.unActive()
    })
  }

  initEvent(conn: IConnection) {
    conn.on('click', () => {
      this.unActiveConnections()
      this.updateSelectConnection$.next(conn)
      conn.active()
    })
  }

  removeConnection(connection: IConnection) {
    this._viewPortMgr.removeElementFromViewPort(connection)
    this._storageMgr.removeConnection(connection)
  }

  getConnectionByShape(shape: IShape) {
    const conns: IConnection[] = []

    this._storageMgr.getConnections().forEach((connection: IConnection) => {
      if (connection.fromNode.id === shape.id || connection.toNode!.id === shape.id) {
        conns.push(connection)
      }
    })

    return conns
  }

  refreshConnection(shape: IShape) {
    shape.createAnchors()
    shape.anchor!.refresh()
    const conns = this.getConnectionByShape(shape)

    conns.forEach(conn => {
      if (conn.fromNode.id === shape.id) {
        const fromPoint = shape.getAnchorByIndex(conn.fromPoint!.index)
        conn.setFromPoint(fromPoint)
        conn.refresh()
      } else if (conn.toNode!.id === shape.id) {
        const toPoint = shape.getAnchorByIndex(conn.toPoint!.index)
        conn.setToPoint(toPoint)
        conn.refresh()
      }
    })
  }

  clear() {
    this._storageMgr.getConnections().forEach((c: IConnection) => {
      this._viewPortMgr.removeElementFromViewPort(c)
    })
    this._storageMgr.clearConnections()
  }

  getConnectionType(): ConnectionType {
    return this._connectionType
  }
}

export { ConnectionManage }
