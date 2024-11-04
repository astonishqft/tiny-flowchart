import { Subject } from 'rxjs'
import { Disposable } from './disposable'
import { Connection } from './connection'
import { ConnectionType } from './shapes'

import type { IDisposable } from './disposable'
import type { IShape, IAnchorPoint, IConnection } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IViewPortManage } from './viewPortManage'
import type { IStorageManage } from './storageManage'
import type { IocEditor } from './iocEditor'

export interface IConnectionManage extends IDisposable {
  createConnection(fromAnchorPoint: IAnchorPoint): IConnection
  getConnectionByShape(shape: IShape | INodeGroup): IConnection[]
  setConnectionType(type: ConnectionType): void
  refreshConnection(shape: IShape | INodeGroup): void
  removeConnection(connection: IConnection): void
  connect(connection: IConnection, anchorPoint: IAnchorPoint): void
  updateConnectionType$: Subject<ConnectionType>
  updateSelectConnection$: Subject<IConnection>
  clear(): void
  unActiveConnections(): void
  cancelConnect(connection: IConnection): void
}

class ConnectionManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage
  private _connectionType: ConnectionType = ConnectionType.OrtogonalLine
  updateConnectionType$ = new Subject<ConnectionType>()
  updateSelectConnection$ = new Subject<IConnection>()
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

  createConnection(fromAnchorPoint: IAnchorPoint): IConnection {
    const sceneWidth = this._viewPortMgr.getSceneWidth()
    const sceneHeight = this._viewPortMgr.getSceneHeight()
    const connection = new Connection(
      fromAnchorPoint.node,
      this._connectionType,
      sceneWidth,
      sceneHeight
    )

    connection.setFromPoint(fromAnchorPoint?.point)

    this._viewPortMgr.addElementToViewPort(connection)
    this.initEvent(connection)
    return connection
  }

  connect(connection: IConnection, anchorPoint: IAnchorPoint) {
    if (connection) {
      connection.setToPoint(anchorPoint.point)
      connection.connect(anchorPoint.node)

      this._storageMgr.addConnection(connection)
    }
  }

  cancelConnect(connection: IConnection) {
    if (connection) {
      connection.cancelConnect()
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
    shape.createAnchors()
    shape.anchor!.refresh()
    const conns = this.getConnectionByShape(shape)

    conns.forEach(conn => {
      if (conn.fromNode.id === shape.id) {
        const fromPoint = shape.getAnchorByIndex!(conn.fromPoint!.index)
        conn.setFromPoint(fromPoint)
        conn.refresh()
      } else if (conn.toNode!.id === shape.id) {
        const toPoint = shape.getAnchorByIndex!(conn.toPoint!.index)
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
