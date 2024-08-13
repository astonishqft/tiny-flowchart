import { injectable } from 'inversify'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IShape } from './shapes'
import type { IConnection } from './connection'

export interface IStorageManage {
  addShape(shape: IShape): void
  addGroup(group: INodeGroup): void
  getShapes(): IShape[]
  getGroups(): INodeGroup[]
  getConnections(): IConnection[]
  addConnection(connection: IConnection): void
  setZoom(zoom: number): void
  getZoom(): number
  clearShapes(): void
  clearConnections(): void
  getActiveShapes(): IShape[]
  getActiveGroups(): INodeGroup[]
}

@injectable()
class StorageManage {
  _shapes: IShape[] = []
  _groups: INodeGroup[] = []
  _connections: IConnection[] = []
  _zoom: number = 1
  addShape(shape: IShape) {
    this._shapes.push(shape)
  }

  clearShapes() {
    this._shapes = []
  }
  addGroup(group: INodeGroup) {
    this._groups.push(group)
  }
  getShapes() {
    return this._shapes
  }
  getGroups() {
    return this._groups
  }

  addConnection(connection: IConnection) {
    this._connections.push(connection)
  }

  getConnections() {
    return this._connections
  }

  clearConnections() {
    this._connections = []
  }

  setZoom(zoom: number) {
    this._zoom = zoom
  }

  getZoom() {
    return this._zoom
  }

  getActiveShapes() {
    return this.getShapes().filter((shape: IShape) => {
      return shape.selected
    })
  }

  getActiveGroups(): INodeGroup[] {
    return this._groups.filter((group: INodeGroup) => {
      return group.selected
    })
  }
}

export { StorageManage }
