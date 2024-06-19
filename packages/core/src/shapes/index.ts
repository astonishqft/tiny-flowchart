import * as zrender from 'zrender'

import { Rect } from './rect'
import { Circle } from './circle'
import type { Anchor } from '../anchor'

export interface IShape extends zrender.Element {
  selected: boolean
  nodeType: string
  anchors: IAnchor[]
  anchor?: Anchor
  oldX?: number
  oldY?: number
  createAnchors(): void
  active(): void
  unActive(): void
  getAnchors(): IAnchor[]
  getAnchorByIndex(index: number): IAnchor
}

export interface IShapeConfig {
  [key: string]: zrender.RectProps | zrender.EllipseProps
}

export interface IShapeMap {
  [key: string]: any
}

export interface IShapeTextConfig {
  textContent: zrender.Text
  textConfig: zrender.ElementTextConfig
}

export interface IAnchor {
  x: number
  y: number
  node: IShape
  direct: string
  index: number
}

export interface IAnchorPoint extends zrender.Circle {
  point: IAnchor
  node: IShape
  mark: string
  oldFillColor: string
  anch: zrender.Circle
}

export const shapeConfig: IShapeConfig = {
  rect: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      x: 0,
      y: 0,
      width: 60,
      height: 60
    }
  },
  circle: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      cx: 30,
      cy: 30,
      rx: 30,
      ry: 30
    }
  }
}

const getShapeTextConfig = (): IShapeTextConfig => {
  return {
    textContent: new zrender.Text({
      style: {
        text: 'title',
        fill: '#333',
        fontSize: 12,
        fontFamily: 'Arial'

      },
      z: 11,
      cursor: 'move'
    }),
    textConfig: {
      position: 'inside'
    }
  }
}

export const shapes: IShapeMap = {
  rect: Rect,
  circle: Circle
}

export const getShape = (type: string, option: { x: number, y: number }) => {
  const config = { ...shapeConfig[type], ...getShapeTextConfig() }

  const shape = new shapes[type](config)
  shape.attr('x', option.x)
  shape.attr('y', option.y)

  return shape
}
