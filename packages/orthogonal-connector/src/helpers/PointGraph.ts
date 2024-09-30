import { distance, IPoint } from './Rectangle'

type Direction = 'v' | 'h'

class PointNode {
  public distance = Number.MAX_SAFE_INTEGER
  public shortestPath: PointNode[] = []
  public adjacentNodes: Map<PointNode, number> = new Map() // 相邻节点
  constructor(public data: IPoint) {}
}

export class PointGraph {
  private index: { [x: string]: { [y: string]: PointNode } } = {}

  add(p: IPoint) {
    const { x, y } = p
    const xs = x.toString(),
      ys = y.toString()

    if (!(xs in this.index)) {
      this.index[xs] = {}
    }
    if (!(ys in this.index[xs])) {
      this.index[xs][ys] = new PointNode(p)
    }
  }

  /**
   * 获取unsettledNodes中距离最短的节点
   * @param unsettledNodes 未解决的节点集合
   * @returns 距离最短的节点
   */
  private getLowestDistanceNode(unsettledNodes: Set<PointNode>): PointNode {
    let lowestDistanceNode: PointNode | null = null
    let lowestDistance = Number.MAX_SAFE_INTEGER
    for (const node of unsettledNodes) {
      const nodeDistance = node.distance
      if (nodeDistance < lowestDistance) {
        lowestDistance = nodeDistance
        lowestDistanceNode = node
      }
    }
    return lowestDistanceNode!
  }

  /**
   * 根据节点的最短路径长度判断路径方向
   * @param node 节点
   * @returns 路径方向或null
   */
  private inferPathDirection(node: PointNode): Direction | null {
    if (node.shortestPath.length == 0) {
      return null
    }

    return this.directionOfNodes(node.shortestPath[node.shortestPath.length - 1], node)
  }

  calculateShortestPathFromSource(graph: PointGraph, source: PointNode): PointGraph {
    source.distance = 0

    const settledNodes: Set<PointNode> = new Set() // 已经计算了最短路径的节点
    const unsettledNodes: Set<PointNode> = new Set() // 尚未计算最短路径的节点
    unsettledNodes.add(source)

    while (unsettledNodes.size != 0) {
      const currentNode = this.getLowestDistanceNode(unsettledNodes)
      unsettledNodes.delete(currentNode)

      for (const [adjacentNode, edgeWeight] of currentNode.adjacentNodes) {
        if (!settledNodes.has(adjacentNode)) {
          this.calculateMinimumDistance(adjacentNode, edgeWeight, currentNode)
          unsettledNodes.add(adjacentNode)
        }
      }
      settledNodes.add(currentNode)
    }

    return graph
  }

  /**
   * 计算最小距离
   * @param evaluationNode 评估节点(源节点的相邻节点)
   * @param edgeWeigh 边的权重
   * @param sourceNode 源节点
   */
  private calculateMinimumDistance(
    evaluationNode: PointNode,
    edgeWeigh: number,
    sourceNode: PointNode
  ) {
    const sourceDistance = sourceNode.distance
    const comingDirection = this.inferPathDirection(sourceNode)
    const goingDirection = this.directionOfNodes(sourceNode, evaluationNode)
    const changingDirection = comingDirection && goingDirection && comingDirection != goingDirection
    const extraWeight = changingDirection ? Math.pow(edgeWeigh + 1, 2) : 0

    if (sourceDistance + edgeWeigh + extraWeight < evaluationNode.distance) {
      evaluationNode.distance = sourceDistance + edgeWeigh + extraWeight
      const shortestPath: PointNode[] = [...sourceNode.shortestPath]
      shortestPath.push(sourceNode)
      evaluationNode.shortestPath = shortestPath
    }
  }

  private directionOf(a: IPoint, b: IPoint): Direction | null {
    if (a.x === b.x) {
      return 'h'
    } else if (a.y === b.y) {
      return 'v'
    } else {
      return null
    }
  }

  private directionOfNodes(a: PointNode, b: PointNode): Direction | null {
    return this.directionOf(a.data, b.data)
  }

  connect(a: IPoint, b: IPoint) {
    const nodeA = this.get(a)
    const nodeB = this.get(b)

    if (!nodeA || !nodeB) {
      throw new Error('A point was not found')
    }

    nodeA.adjacentNodes.set(nodeB, distance(a, b))
  }

  has(p: IPoint): boolean {
    const { x, y } = p
    const xs = x.toString(),
      ys = y.toString()
    return xs in this.index && ys in this.index[xs]
  }

  get(p: IPoint): PointNode | null {
    const { x, y } = p
    const xs = x.toString(),
      ys = y.toString()

    if (xs in this.index && ys in this.index[xs]) {
      return this.index[xs][ys]
    }

    return null
  }
}
