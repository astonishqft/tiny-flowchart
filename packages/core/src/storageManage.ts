import type { INodeGroup } from './shapes/nodeGroup'
import type { IConnection, IShape, INode } from './shapes'

export interface IStorageManage {
  addShape(shape: IShape): void
  removeShape(shape: IShape): void
  addGroup(group: INodeGroup): void
  removeGroup(group: INodeGroup): void
  getShapes(): IShape[]
  getGroups(): INodeGroup[]
  getConnections(): IConnection[]
  addConnection(connection: IConnection): void
  removeConnection(connection: IConnection): void
  clearShapes(): void
  clearGroups(): void
  clearConnections(): void
  getActiveShapes(): IShape[]
  getActiveGroups(): INodeGroup[]
  getNodes(): INode[]
  getActiveNodes(): INode[]
  getActiveConnections(): IConnection[]
}

class StorageManage {
  private _shapes: IShape[] = []
  private _groups: INodeGroup[] = []
  private _connections: IConnection[] = []

  addShape(shape: IShape) {
    this._shapes.push(shape)
  }

  removeShape(shape: IShape) {
    this._shapes = this._shapes.filter(item => item.id !== shape.id)
  }

  clearShapes() {
    this._shapes.length = 0 // 更高效的清空数组
  }

  addGroup(group: INodeGroup) {
    this._groups.push(group)
  }

  removeGroup(group: INodeGroup) {
    this._groups = this._groups.filter(item => item.id !== group.id)
  }

  clearGroups() {
    this._groups.length = 0 // 更高效的清空数组
  }

  addConnection(connection: IConnection) {
    this._connections.push(connection)
  }

  removeConnection(connection: IConnection) {
    this._connections = this._connections.filter(item => item !== connection)
  }

  clearConnections() {
    this._connections.length = 0 // 更高效的清空数组
  }

  getShapes() {
    return this._shapes
  }

  getGroups() {
    return this._groups
  }

  getConnections() {
    return this._connections
  }

  getNodes() {
    return [...this._shapes, ...this._groups]
  }

  getActiveShapes() {
    return this._shapes.filter(shape => shape.selected)
  }

  getActiveGroups(): INodeGroup[] {
    return this._groups.filter(group => group.selected)
  }

  getActiveNodes() {
    return this.getNodes().filter(node => node.selected)
  }

  getActiveConnections() {
    return this._connections.filter(connection => connection.selected)
  }
}

export { StorageManage }
