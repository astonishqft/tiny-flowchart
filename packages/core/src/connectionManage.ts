import { injectable, inject } from 'inversify'
import { Subject, Observable } from 'rxjs'
import { Disposable } from './disposable'
import { Connection } from './connection'
import { ConnectionType } from './connection'
import IDENTIFIER from './constants/identifiers'
import type { IDisposable } from './disposable'
import type { IConnection } from './connection'
import type { IShape } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'

export interface IConnectionManage extends IDisposable {
  createConnection(fromNode: IShape): IConnection
  getConnectionByShape(shape: IShape): IConnection[]
  setConnectionType(type: ConnectionType): void
  refreshConnection(shape: IShape): void
  removeConnection(connection: IConnection): void
  updateConnectionType$: Observable<ConnectionType>
  clear(): void
}

@injectable()
class ConnectionManage extends Disposable {
  private _connectionType: ConnectionType = ConnectionType.OrtogonalLine
  updateConnectionType$ = new Subject<ConnectionType>()
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortMgr: IViewPortManage,
    @inject(IDENTIFIER.STORAGE_MANAGE) private _storageMgr: IStorageManage
  ) {
    super()
    this._disposables.push(this.updateConnectionType$)
  }

  setConnectionType(type: ConnectionType): void {
    this._connectionType = type
  }

  createConnection(fromNode: IShape): IConnection {
    const sceneWidth = this._viewPortMgr.getSceneWidth()
    const sceneHeight = this._viewPortMgr.getSceneHeight()
    const conn: IConnection = new Connection(fromNode, this._connectionType, sceneWidth, sceneHeight)

    this._storageMgr.addConnection(conn)
    this._viewPortMgr.addElementToViewPort(conn)
    return conn
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

  // TODO
  changeConnection(Connection: IConnection, type: ConnectionType) {
    // const conn = this._connections.filter(c => c === Connection)[0]
    // conn.setConnectionType(type)
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
