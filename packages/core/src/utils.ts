import { Group } from './'

import type { BoundingRect, Element } from './'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IExportGroup, IExportGroupStyle, IExportShape, INode } from './shapes'

export const getClosestValInSortedArr = (sortedArr: number[], target: number) => {
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

export const isEqualNum = (num1: number, num2: number) => {
  return Math.abs(num1 - num2) < 0.00001
}

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

export const getMinZLevel = (shapes: INode[]) => {
  let minZLevel = Infinity
  shapes.forEach(shape => {
    if (shape.z! < minZLevel) {
      minZLevel = shape.z!
    }
  })

  return minZLevel
}

export const getGroupMaxZLevel = (groups: INodeGroup[]) => {
  let maxZLevel = -Infinity
  groups.forEach(g => {
    if (g.z > maxZLevel) {
      maxZLevel = g.z
    }
  })

  return maxZLevel
}

export const isEnter = (a: BoundingRect, b: BoundingRect) => {
  const centerX = a.x + a.width / 2
  const centerY = a.y + a.height / 2
  // 如果a的尺寸大于b的尺寸则直接返回false
  if (a.width >= b.width || a.height >= b.height) {
    return false
  }

  return centerX >= b.x && centerX <= b.x + b.width && centerY >= b.y && centerY <= b.y + b.height
}

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
