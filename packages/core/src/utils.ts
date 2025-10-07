import { Group } from '@/index'

import type { BoundingRect, Element } from '@/index'
import type { INodeGroup } from '@/shapes/nodeGroup'
import type { IExportGroup, IExportGroupStyle, IExportShape, INode } from '@/shapes'

/**
 * 获取有序数组中最接近目标值的元素
 *
 * @param sortedArr - 有序数组
 * @param target - 目标值
 * @returns 有序数组中最接近目标值的元素
 */
export const getClosestLine = (sortedArr: number[], target: number) => {
  if (sortedArr.length === 0) {
    throw new Error('sortedArr can not be empty')
  }
  if (sortedArr.length === 1) {
    return sortedArr[0]
  }

  let left = 0
  let right = sortedArr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)

    if (sortedArr[mid] === target) {
      return sortedArr[mid]
    } else if (sortedArr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  // check if left or right is out of bound
  if (left >= sortedArr.length) {
    return sortedArr[right]
  }
  if (right < 0) {
    return sortedArr[left]
  }

  // check which one is closer
  return Math.abs(sortedArr[right] - target) <= Math.abs(sortedArr[left] - target)
    ? sortedArr[right]
    : sortedArr[left]
}

// isEqualNum 函数的目的是判断两个数字是否在一个非常小的容差范围内相等。具体来说，它使用了一个阈值（在这里是
// 0.00001
// 0.00001）来比较两个数字的差异，以避免由于浮点数精度问题导致的错误判断。
export const isEqualNum = (num1: number, num2: number) => {
  return Math.abs(num1 - num2) <= 1.5
}

/**
 * 获取形状数组中最小的位置坐标
 *
 * @param shapes - 形状数组
 * @returns 包含最小x和最小y坐标的数组
 */
export const getMinPosition = (shapes: INode[]): number[] => {
  let minX = Infinity
  let minY = Infinity
  shapes.forEach(shape => {
    if (shape.x < minX) {
      minX = shape.x
    }
    if (shape.y < minY) {
      minY = shape.y
    }
  })

  return [minX, minY]
}

/**
 * 获取形状数组中最低层级的层级值
 *
 * @param shapes - 形状数组
 * @returns 最低层级的层级值
 */
export const getMinZLevel = (shapes: INode[]) => {
  let minZLevel = Infinity
  shapes.forEach(shape => {
    if (shape.z! < minZLevel) {
      minZLevel = shape.z!
    }
  })

  return minZLevel
}

/**
 * 获取分组数组中最高层级的分组的层级值
 *
 * @param groups - 分组数组
 * @returns 最高层级的分组的层级值
 */
export const getGroupMaxZLevel = (groups: INodeGroup[]) => {
  let maxZLevel = -Infinity
  groups.forEach(g => {
    if (g.z > maxZLevel) {
      maxZLevel = g.z
    }
  })

  return maxZLevel
}

/**
 * 判断一个矩形是否完全进入另一个矩形
 *
 * @param a - 第一个矩形
 * @param b - 第二个矩形
 * @returns 如果第一个矩形完全进入第二个矩形，则返回true；否则返回false
 */
export const isEnter = (a: BoundingRect, b: BoundingRect) => {
  const centerX = a.x + a.width / 2
  const centerY = a.y + a.height / 2
  // 如果a的尺寸大于b的尺寸则直接返回false
  if (a.width >= b.width || a.height >= b.height) {
    return false
  }

  return centerX >= b.x && centerX <= b.x + b.width && centerY >= b.y && centerY <= b.y + b.height
}

/**
 * 获取最高层级的分组
 *
 * @param groups - 分组数组
 * @returns 最高层级的分组
 */
export const getTopGroup = (groups: INodeGroup[]): INodeGroup => {
  if (groups.length === 1) {
    return groups[0]
  }
  let maxGroup = groups[0]
  groups.forEach((g: INodeGroup) => {
    if (g.z > maxGroup.z) {
      maxGroup = g
    }
  })

  return maxGroup
}

/**
 * 下载文件
 *
 * @param content - 文件内容
 * @param filename - 文件名
 */
export const downloadFile = (content: string, filename: string) => {
  const a = document.createElement('a')
  const blob = new Blob([content])
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

export interface IGroupTreeNode {
  id: number
  style: IExportGroupStyle
  children: IGroupTreeNode[]
  z: number
}

/**
 * 将分组数组转换为分组树
 *
 * @param flatArray - 分组数组
 * @returns 分组树对象，包含分组树节点数组和分组映射
 */
export const groupArray2Tree = (flatArray: IExportGroup[]) => {
  const map = new Map()
  flatArray.forEach(item => {
    map.set(item.id, { id: item.id, z: item.z, style: item.style, children: [] })
  })

  function buildTree(node: IGroupTreeNode) {
    flatArray.forEach((item: IExportGroup) => {
      if (item.parent === node.id) {
        const childNode = map.get(item.id)
        node.children.push(buildTree(childNode))
      }
    })

    return node
  }

  const groupTree = flatArray
    .filter(item => item.parent === undefined)
    .map(rootNode => buildTree(map.get(rootNode.id)))

  return {
    groupTree,
    groupMap: map
  }
}

/**
 * 将分组树转换为分组数组
 *
 * @param treeNode - 分组树节点数组
 * @returns 分组数组
 */
export const groupTree2Array = (treeNode: IGroupTreeNode[]) => {
  const result: number[] = []
  function traverse(node: IGroupTreeNode) {
    result.push(node.id)

    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  treeNode.forEach(traverse)

  return result.reverse()
}

export const getChildShapesByGroupId = (groupId: number, shapes: IExportShape[]) => {
  return shapes.filter(shape => shape.parent === groupId)
}

export const getBoundingBox = <T extends Element>(nodes: T[]): BoundingRect => {
  const g = new Group()

  return g.getBoundingRect(nodes)
}

/**
 * 获取所有相关的分组（包括子分组）
 *
 * @param targetGroup - 目标分组数组
 * @param allGroups - 所有分组数组
 * @returns 所有相关的分组数组
 */
export const getAllRelatedGroups = (targetGroup: IExportGroup[], allGroups: IExportGroup[]) => {
  const relatedGroups: IExportGroup[] = []

  const findChildren = (parentId: number) => {
    allGroups.forEach(group => {
      if (group.parent === parentId) {
        relatedGroups.push(group)
        findChildren(group.id) // 递归查找子节点
      }
    })
  }

  targetGroup.forEach(g => {
    relatedGroups.push(g)
    findChildren(g.id)
  })

  return relatedGroups
}
/**
 * 计算两个向量间的曼哈顿距离
 *
 * @param a - 第一个向量
 * @param b - 第二个向量
 * @returns 两个向量间的距离
 */
export function manhattanDistance(a: Vector, b: Vector): number {
  return (a as number[]).reduce((sum, v, i) => sum + Math.abs(v - b[i]), 0)
}

export type Point = [number, number]

/**
 * 根据给定的半径计算出不共线的三点生成贝塞尔曲线的控制点，以模拟接近圆弧
 *
 * @param prevPoint - 前一个点
 * @param midPoint - 中间点
 * @param nextPoint - 后一个点
 * @param radius - 圆角半径
 * @returns 返回控制点
 */
export function getBorderRadiusPoints(
  prevPoint: Point,
  midPoint: Point,
  nextPoint: Point,
  radius: number
): [Point, Point] {
  const d0 = manhattanDistance(prevPoint, midPoint)
  const d1 = manhattanDistance(nextPoint, midPoint)
  // 取给定的半径和最小半径之间的较小值 | use the smaller value between the given radius and the minimum radius
  const r = Math.min(radius, Math.min(d0, d1) / 2)
  const ps: Point = [
    midPoint[0] - (r / d0) * (midPoint[0] - prevPoint[0]),
    midPoint[1] - (r / d0) * (midPoint[1] - prevPoint[1])
  ]
  const pt: Point = [
    midPoint[0] - (r / d1) * (midPoint[0] - nextPoint[0]),
    midPoint[1] - (r / d1) * (midPoint[1] - nextPoint[1])
  ]

  return [ps, pt]
}

export type PathArray = [string, number?, number?, number?, number?][]
/**
 * 生成折线路径
 *
 * @param points - 折线的点数组
 * @param radius - 圆角半径，默认值为 0
 * @param z - 是否闭合路径，默认值为 false
 * @returns 折线路径数组
 */
export function getPolylinePath(points: Point[], radius = 0, z = false): PathArray {
  if (points.length === 0) return []
  const sourcePoint = points[0]
  const targetPoint = points[points.length - 1]
  const controlPoints = points.slice(1, points.length - 1)
  const pathArray: PathArray = [['M', sourcePoint[0], sourcePoint[1]]]
  controlPoints.forEach((midPoint, i) => {
    const prevPoint = controlPoints[i - 1] || sourcePoint
    const nextPoint = controlPoints[i + 1] || targetPoint
    // 使用 isCollinear 函数检查前一个点、当前点和下一个点是否共线。如果不共线且 radius 大于 0，则需要绘制圆角。
    if (!isCollinear(prevPoint, midPoint, nextPoint) && radius) {
      const [ps, pt] = getBorderRadiusPoints(prevPoint, midPoint, nextPoint, radius)
      pathArray.push(
        ['L', ps[0], ps[1]],
        ['Q', midPoint[0], midPoint[1], pt[0], pt[1]],
        ['L', pt[0], pt[1]]
      )
    } else {
      pathArray.push(['L', midPoint[0], midPoint[1]])
    }
  })
  pathArray.push(['L', targetPoint[0], targetPoint[1]])
  if (z) pathArray.push(['Z'])

  return pathArray
}

/**
 * 判断是否三点共线
 *
 * @param p1 - 第一个点
 * @param p2 - 第二个点
 * @param p3 - 第三个点
 * @returns 是否三点共线
 */
export function isCollinear(p1: Point, p2: Point, p3: Point): boolean {
  return isLinesParallel([p1, p2], [p2, p3])
}

export type LineSegment = [Point, Point]

export type Vector = [number, number]

/**
 * 判断两条线段是否平行
 *
 * @param l1 - 第一条线段
 * @param l2 - 第二条线段
 * @returns 是否平行
 */
export function isLinesParallel(l1: LineSegment, l2: LineSegment): boolean {
  const [p1, p2] = l1
  const [p3, p4] = l2
  const v1 = subtract(p1, p2)
  const v2 = subtract(p3, p4)

  return cross(v1, v2) === 0
}

/**
 * 两个向量求差
 *
 * @param a - 第一个向量
 * @param b - 第二个向量
 * @returns 两个向量的差
 */
export function subtract(a: Vector, b: Vector): Vector {
  return a.map((v, i) => v - b[i]) as Vector
}

/**
 * 两个二维向量求叉积
 *
 * @param a - 第一个向量
 * @param b - 第二个向量
 * @returns 两个向量的叉积
 */
export function cross(a: Vector, b: Vector): number {
  return a[0] * b[1] - a[1] * b[0]
}

/**
 * 构建圆角矩形路径
 *
 * @param ctx - 画布上下文
 * @param shape - 矩形参数，包含 x、y、width、height、r 四个属性
 */
export function buildRoundRectPath(
  ctx: CanvasRenderingContext2D,
  shape: { x: number; y: number; width: number; height: number; r: number }
) {
  let x = shape.x
  let y = shape.y
  let width = shape.width
  let height = shape.height
  const r = shape.r
  let r1
  let r2
  let r3
  let r4

  if (width < 0) {
    x = x + width
    width = -width
  }
  if (height < 0) {
    y = y + height
    height = -height
  }

  if (typeof r === 'number') {
    r1 = r2 = r3 = r4 = r
  } else {
    r1 = r2 = r3 = r4 = 0
  }

  let total
  if (r1 + r2 > width) {
    total = r1 + r2
    r1 *= width / total
    r2 *= width / total
  }
  if (r3 + r4 > width) {
    total = r3 + r4
    r3 *= width / total
    r4 *= width / total
  }
  if (r2 + r3 > height) {
    total = r2 + r3
    r2 *= height / total
    r3 *= height / total
  }
  if (r1 + r4 > height) {
    total = r1 + r4
    r1 *= height / total
    r4 *= height / total
  }
  ctx.moveTo(x + r1, y)
  ctx.lineTo(x + width - r2, y)
  r2 !== 0 && ctx.arc(x + width - r2, y + r2, r2, -Math.PI / 2, 0)
  ctx.lineTo(x + width, y + height - r3)
  r3 !== 0 && ctx.arc(x + width - r3, y + height - r3, r3, 0, Math.PI / 2)
  ctx.lineTo(x + r4, y + height)
  r4 !== 0 && ctx.arc(x + r4, y + height - r4, r4, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y + r1)
  r1 !== 0 && ctx.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5)
}

/**
 * 获取优先级最高的节点（z值最大，z值相同时取原数组最后一个）
 * @param nodes 节点数组
 * @returns 优先级最高的节点
 */
export const getTopPriorityNode = (nodes: INode[]): INode => {
  // 按z值降序排序
  const sortedNodes = [...nodes].sort((a, b) => {
    return (b.z || 0) - (a.z || 0)
  })

  // 如果只有一个节点或第一个和第二个节点z值不同，直接返回第一个
  if (nodes.length === 1 || sortedNodes[0].z !== sortedNodes[1]?.z) {
    return sortedNodes[0]
  }

  // z值相同的情况，从原始数组中找出所有z值等于最大值的节点，并返回最后一个
  const maxZ = sortedNodes[0].z || 0
  const sameZNodes = nodes.filter(node => (node.z || 0) === maxZ)

  return sameZNodes[sameZNodes.length - 1]
}
