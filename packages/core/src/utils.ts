import type { IShape } from './shapes'
import * as zrender from 'zrender'

export const getClosestValInSortedArr = (
  sortedArr: number[],
  target: number,
) => {
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
  return Math.abs(sortedArr[right] - target) <=
    Math.abs(sortedArr[left] - target)
    ? sortedArr[right]
    : sortedArr[left]
}

export const isEqualNum = (num1: number, num2: number) => {
  return Math.abs(num1 - num2) < 0.00001
}

export const getMinPosition = (shapes: IShape[]): number[] => {
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

export const getMinZLevel = (shapes: IShape[]) => {
  let minZLevel = Infinity
  shapes.forEach(shape => {
    if (shape.z! < minZLevel) {
      minZLevel = shape.z!
    }
  })

  return minZLevel
}

export const getBoundingRect = (shapes: IShape[]): zrender.BoundingRect => {
  const g = new zrender.Group()
  return g.getBoundingRect(shapes)
}

export const isEnter = (a: zrender.BoundingRect, b: zrender.BoundingRect) => {
  const centerX = a.x + a.width / 2
  const centerY = a.y + a.height / 2

  return centerX >= b.x && centerX <= (b.x + b.width) && centerY >= b.y && centerY <= (b.y + b.height)
}

export const isLeave = (a: zrender.BoundingRect, b: zrender.BoundingRect) => {
  return ((a.x + a.width) < b.x) || (a.x  > (b.x + b.width)) || ((a.y + a.height) < b.y) || (a.y > (b.y + b.height))
}
