import { Rectangle, type Rect, makePt, IPoint, BasicCardinalPoint } from './helpers/Rectangle'
import { PointGraph } from './helpers/PointGraph'
import Grid from './Grid'

type BendDirection = BasicCardinalPoint | 'unknown' | 'none'

interface ConnectorPoint {
  x: number // 锚点横坐标
  y: number // 锚点纵坐标
  direction: string // 锚点方向
  boundingBox: Rect
}

export interface Line {
  a: IPoint
  b: IPoint
}

export interface IConnectotOpts {
  shapeA: ConnectorPoint
  shapeB: ConnectorPoint
  shapeHorizontalMargin: number // 控制连接线与shape之间的距离
  shapeVerticalMargin: number
  globalBoundsMargin: number
  globalBounds: Rect
}

interface IAuxiliaryData {
  hRulers: number[]
  vRulers: number[]
  spots: IPoint[]
  grid: Rectangle[]
  connections: any[]
}

// 返回一个指示锚点是否属于垂直轴的标志
function isVerticalDirection(direction: string): boolean {
  return direction === 'top' || direction === 'bottom'
}

function reducePoints(points: IPoint[]): IPoint[] {
  const result: IPoint[] = []
  const map = new Map<number, number[]>()

  points.forEach(p => {
    const { x, y } = p
    const arr: number[] = map.get(y) || map.set(y, []).get(y)!

    if (arr.indexOf(x) < 0) {
      arr.push(x)
    }
  })

  for (const [y, xs] of map) {
    for (const x of xs) {
      result.push(makePt(x, y))
    }
  }

  return result
}

function rulersToGrid(verticals: number[], horizontals: number[], bounds: Rectangle): Grid {
  const result: Grid = new Grid()
  verticals.sort((a, b) => a - b)
  horizontals.sort((a, b) => a - b)

  let lastX = bounds.left
  let lastY = bounds.top
  let column = 0
  let row = 0

  for (const y of horizontals) {
    for (const x of verticals) {
      result.set(row, column++, Rectangle.fromLTRB(lastX, lastY, x, y))
      lastX = x
    }

    // Last cell of the row
    result.set(row, column, Rectangle.fromLTRB(lastX, lastY, bounds.right, y))
    lastX = bounds.left
    lastY = y
    column = 0
    row++
  }

  lastX = bounds.left

  // Last row of cells
  for (const x of verticals) {
    result.set(row, column++, Rectangle.fromLTRB(lastX, lastY, x, bounds.bottom))
    lastX = x
  }

  // Last cell of last row
  result.set(row, column, Rectangle.fromLTRB(lastX, lastY, bounds.right, bounds.bottom))

  return result
}

function gridToSpots(grid: Grid, obstacles: Rectangle[]): IPoint[] {
  // 过滤所有和shape有交点的参考点
  const obstacleCollision = (p: IPoint) => obstacles.filter(o => o.contains(p)).length > 0
  const gridPoints: IPoint[] = []

  for (const [row, data] of grid.data) {
    const firstRow = row === 0
    const lastRow = row === grid.rows - 1

    for (const [col, r] of data) {
      const firstCol = col === 0
      const lastCol = col === grid.columns - 1
      const nw = firstCol && firstRow
      const ne = firstRow && lastCol
      const se = lastRow && lastCol
      const sw = lastRow && firstCol

      if (nw || ne || se || sw) {
        // 如果是四个顶点的话，就将顶点的坐标加入到 gridPoints 中(这中间的可能会存在重合，暂时先不考虑，后面再去重)
        gridPoints.push(r.northWest, r.northEast, r.southWest, r.southEast)
      } else if (firstRow) {
        gridPoints.push(r.northWest, r.north, r.northEast) // 边缘网格
      } else if (lastRow) {
        gridPoints.push(r.southEast, r.south, r.southWest) // 边缘网格
      } else if (firstCol) {
        gridPoints.push(r.northWest, r.west, r.southWest) // 边缘网格
      } else if (lastCol) {
        gridPoints.push(r.northEast, r.east, r.southEast) // 边缘网格
      } else {
        // 剩下来的网格都默认为内部网格，将其八个点都添加进来
        gridPoints.push(
          r.northWest,
          r.north,
          r.northEast,
          r.east,
          r.southEast,
          r.south,
          r.southWest,
          r.west,
          r.center
        )
      }
    }
  }

  // 过滤掉和shape重合的点就是我们想要的相关参考点
  return reducePoints(gridPoints).filter(p => !obstacleCollision(p)) // 过滤掉所有重复的点和两个shape有交集的点
}

function createGraph(spots: IPoint[]): {
  graph: PointGraph
  connections: Line[]
} {
  const hotXs: number[] = []
  const hotYs: number[] = []
  const graph = new PointGraph()
  const connections: Line[] = []

  spots.forEach(p => {
    const { x, y } = p
    if (hotXs.indexOf(x) < 0) hotXs.push(x) // 找到所有相关节点的横坐标的集合
    if (hotYs.indexOf(y) < 0) hotYs.push(y) // 找到所有相关节点的纵坐标的集合
    graph.add(p)
  })

  hotXs.sort((a, b) => a - b)
  hotYs.sort((a, b) => a - b)

  const inHotIndex = (p: IPoint): boolean => graph.has(p)

  for (let i = 0; i < hotYs.length; i++) {
    for (let j = 0; j < hotXs.length; j++) {
      const b = makePt(hotXs[j], hotYs[i])
      if (!inHotIndex(b)) continue
      if (j > 0) {
        // 连接水平线
        const a = makePt(hotXs[j - 1], hotYs[i])
        if (inHotIndex(a)) {
          graph.connect(a, b)
          graph.connect(b, a)
          connections.push({ a, b })
        }
      }

      if (i > 0) {
        // 连接垂直线
        const a = makePt(hotXs[j], hotYs[i - 1])
        if (inHotIndex(a)) {
          graph.connect(a, b)
          graph.connect(b, a)
          connections.push({ a, b })
        }
      }
    }
  }

  return { graph, connections }
}

function shortestPath(graph: PointGraph, origin: IPoint, destination: IPoint): IPoint[] {
  const originNode = graph.get(origin)
  const destinationNode = graph.get(destination)

  if (!originNode) {
    throw new Error(`Origin node {${origin.x},${origin.y}} not found`)
  }

  if (!destinationNode) {
    throw new Error(`Origin node {${origin.x},${origin.y}} not found`)
  }

  graph.calculateShortestPathFromSource(graph, originNode)

  return destinationNode.shortestPath.map(n => n.data)
}

function extrudeCp(
  cp: ConnectorPoint,
  shapeHorizontalMargin: number,
  shapeVerticalMargin: number
): IPoint {
  const { x, y, boundingBox } = cp
  switch (cp.direction) {
    case 'top':
      return makePt(x, boundingBox.y - shapeVerticalMargin)
    case 'right':
      return makePt(boundingBox.x + boundingBox.width + shapeHorizontalMargin, y)
    case 'bottom':
      return makePt(x, boundingBox.y + boundingBox.height + shapeVerticalMargin)
    case 'left':
      return makePt(boundingBox.x - shapeHorizontalMargin, y)
    default:
      return makePt(x, y)
  }
}

function getBend(a: IPoint, b: IPoint, c: IPoint): BendDirection {
  const equalX = a.x === b.x && b.x === c.x
  const equalY = a.y === b.y && b.y === c.y
  const segment1Horizontal = a.y === b.y
  const segment1Vertical = a.x === b.x
  const segment2Horizontal = b.y === c.y
  const segment2Vertical = b.x === c.x

  if (equalX || equalY) {
    return 'none'
  }

  if (!(segment1Vertical || segment1Horizontal) || !(segment2Vertical || segment2Horizontal)) {
    return 'unknown'
  }

  if (segment1Horizontal && segment2Vertical) {
    return c.y > b.y ? 's' : 'n'
  } else if (segment1Vertical && segment2Horizontal) {
    return c.x > b.x ? 'e' : 'w'
  }

  throw new Error('Nope')
}

function simplifyPath(points: IPoint[]): IPoint[] {
  if (points.length <= 2) {
    return points
  }

  const r: IPoint[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const cur = points[i]

    if (i === points.length - 1) {
      r.push(cur)
      break
    }

    const prev = points[i - 1]
    const next = points[i + 1]
    const bend = getBend(prev, cur, next)

    if (bend !== 'none') {
      r.push(cur)
    }
  }
  return r
}

class OrthogonalConnector {
  static readonly auxiliaryData: IAuxiliaryData = {
    hRulers: [],
    vRulers: [],
    spots: [],
    grid: [],
    connections: []
  }

  static connect(opts: IConnectotOpts): IPoint[] {
    const { shapeA, shapeB, globalBounds, globalBoundsMargin = 1 } = opts // globalBoundsMargin 最小设置为1

    let { shapeHorizontalMargin = 10, shapeVerticalMargin = 10 } = opts
    const verticals = []
    const horizontals = []
    const spots = []
    const rectA: Rectangle = Rectangle.fromRect(shapeA.boundingBox)
    const rectB: Rectangle = Rectangle.fromRect(shapeB.boundingBox)
    const shapeADirection = shapeA.direction
    const shapeBDirection = shapeB.direction

    let inflatedA = rectA.inflate(shapeHorizontalMargin, shapeVerticalMargin)
    let inflatedB = rectB.inflate(shapeHorizontalMargin, shapeVerticalMargin)

    if (inflatedA.intersects(inflatedB)) {
      // 这里不要忘了，后面的间距都应该置为0，否则会造成间距过大
      shapeHorizontalMargin = 0
      shapeVerticalMargin = 0
      inflatedA = rectA
      inflatedB = rectB
    }

    // 第一步：创建标尺层
    for (const shape of [inflatedA, inflatedB]) {
      horizontals.push(shape.top)
      horizontals.push(shape.bottom)
      verticals.push(shape.left)
      verticals.push(shape.right)
    }

    // 将 shapeA 和 shapeB 的锚点加入到标尺层
    isVerticalDirection(shapeADirection) ? verticals.push(shapeA.x) : horizontals.push(shapeA.y)
    isVerticalDirection(shapeBDirection) ? verticals.push(shapeB.x) : horizontals.push(shapeB.y)

    // 锚点(增加margin之后的伪起点加入到spots中)
    for (const anchor of [shapeA, shapeB]) {
      switch (anchor.direction) {
        case 'top':
          spots.push({
            x: anchor.x,
            y: anchor.boundingBox.y - shapeVerticalMargin
          })
          break
        case 'bottom':
          spots.push({
            x: anchor.x,
            y: anchor.boundingBox.y + anchor.boundingBox.height + shapeVerticalMargin
          })
          break
        case 'left':
          spots.push({
            x: anchor.boundingBox.x - shapeHorizontalMargin,
            y: anchor.y
          })
          break
        case 'right':
          spots.push({
            x: anchor.boundingBox.x + anchor.boundingBox.width + shapeHorizontalMargin,
            y: anchor.y
          })
          break
        default:
          break
      }
    }

    // 排序
    verticals.sort((a, b) => a - b)
    horizontals.sort((a, b) => a - b)

    // 第二步：创建网格层
    const inflatedBoundBox = inflatedA
      .union(inflatedB)
      .inflate(globalBoundsMargin, globalBoundsMargin)
    const shapeGlobalBoundBox: Rectangle = Rectangle.fromRect(globalBounds)

    const bounds = Rectangle.fromLTRB(
      Math.max(inflatedBoundBox.left, shapeGlobalBoundBox.left),
      Math.max(inflatedBoundBox.top, shapeGlobalBoundBox.top),
      Math.min(inflatedBoundBox.right, shapeGlobalBoundBox.right),
      Math.min(inflatedBoundBox.bottom, shapeGlobalBoundBox.bottom)
    )
    const grid = rulersToGrid(verticals, horizontals, bounds)

    // 第三步：创建参考点
    // 上一步中得到的网格可以分为三类：角网格、边缘网格和内部网格
    // 添加参考点的规则如下：
    // 1. 所有网格：为每个角添加点
    // 2. 内部网格：为边缘的中点以及网格的中心添加点
    // 3. 边缘网格：为中间、面向外部的边缘添加一个点
    // 4. 如果点与 shape 边缘重合，就忽略这个点
    const gridPoints = gridToSpots(grid, [inflatedA, inflatedB])
    spots.push(...gridPoints)

    // 第四步：创建路线
    // Create graph
    const { graph, connections } = createGraph(spots)

    this.auxiliaryData.hRulers = horizontals
    this.auxiliaryData.vRulers = verticals
    this.auxiliaryData.grid = grid.rectangles()
    this.auxiliaryData.spots = spots
    this.auxiliaryData.connections = connections

    const start = makePt(shapeA.x, shapeA.y)
    const end = makePt(shapeB.x, shapeB.y)

    const origin = extrudeCp(shapeA, shapeHorizontalMargin, shapeVerticalMargin)
    const destination = extrudeCp(shapeB, shapeHorizontalMargin, shapeVerticalMargin)

    const path = shortestPath(graph, origin, destination)

    if (path.length > 0) {
      return simplifyPath([start, ...path, end])
    } else {
      return []
    }
  }
}

export default OrthogonalConnector
