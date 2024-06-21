import { injectable } from 'inversify'
import { Subject, Observable } from 'rxjs'
import { Disposable } from './disposable'
import { Connection } from './connection'

import type { IDisposable } from './disposable'
import type { IConnection } from './connection'
import type { IShape } from './shapes'
import { ConnectionType } from './connection'

export interface IConnectionManage extends IDisposable {
  createConnection(fromNode: IShape): IConnection
  getConnectionByShape(shape: IShape): IConnection[]
  setConnectionType(type: ConnectionType): void
  updateConnectionType$: Observable<ConnectionType>
  addConnection(connection: IConnection): void
}

@injectable()
class ConnectionManage extends Disposable {
  private _connections: IConnection[] = []
  private _connectionType: ConnectionType = ConnectionType.Line
  updateConnectionType$ = new Subject<ConnectionType>()
  constructor() {
    super()
    this._disposables.push(this.updateConnectionType$)
  }

  setConnectionType(type: ConnectionType): void {
    this._connectionType = type
    console.log('切换连线类型', this._connectionType)
  }

  createConnection(fromNode: IShape): IConnection {
    const conn: IConnection = new Connection(fromNode, this._connectionType)

    return conn
  }

  getConnectionByShape(shape: IShape) {
    const conns: IConnection[] = []
    this._connections.forEach((connection: IConnection) => {
      if (connection.fromNode === shape || connection.toNode === shape) {
        conns.push(connection)
      }
    })

    return conns
  }

  // TODO
  changeConnection(Connection: IConnection, type: ConnectionType) {
    const conn = this._connections.filter(c => c === Connection)[0]
    // conn.setConnectionType(type)
  }

  addConnection(connection: IConnection) {
    this._connections.push(connection)
  }

  getConnections() {
    return this._connections
  }
}

export { ConnectionManage }
