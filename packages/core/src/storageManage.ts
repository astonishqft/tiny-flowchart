import type { INodeGroup } from './shapes/nodeGroup'
import type { IShape, IConnection } from './shapes'

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
  setZoom(zoom: number): void
  getZoom(): number
  clearShapes(): void
  clearGroups(): void
  clearConnections(): void
  getActiveShapes(): IShape[]
  getActiveGroups(): INodeGroup[]
  getNodes(): (IShape | INodeGroup)[]
  getActiveNodes(): (IShape | INodeGroup)[]
}

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

  removeShape(shape: IShape) {
    this._shapes = this._shapes.filter(item => item.id !== shape.id)
  }

  removeGroup(group: INodeGroup) {
    this._groups = this._groups.filter(item => item.id !== group.id)
  }

  getShapes() {
    return this._shapes
  }

  getGroups() {
    return this._groups
  }

  getNodes() {
    return [...this._shapes, ...this._groups]
  }

  addConnection(connection: IConnection) {
    this._connections.push(connection)
  }

  getConnections() {
    return this._connections
  }

  removeConnection(connection: IConnection) {
    this._connections = this._connections.filter(item => item !== connection)
  }

  clearConnections() {
    this._connections = []
  }

  clearGroups() {
    this._groups = []
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

  getActiveNodes() {
    return this.getNodes().filter((node: IShape | INodeGroup) => {
      return node.selected
    })
  }
}

export { StorageManage }
