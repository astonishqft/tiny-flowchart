import * as zrender from 'zrender'

import { Rect } from './rect'
import { Circle } from './circle'

export interface IShapeConfig {
  [key: string]: zrender.RectProps | zrender.EllipseProps
}

export interface IShape {
  [key: string]: any
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

const getShapeTextConfig = () => {
  return {
    textContent: new zrender.Text({
      style: {
        text: 'title',
        fill: '#333',
        fontSize: 12,
        fontFamily: 'Arial'

      },
      z: 11
    }),
    textConfig: {
      position: 'inside'
    }
  }
}

export const shapes: IShape = {
  rect: Rect,
  circle: Circle
}

export const getShape = (type: string, option: { x: number, y: number }) => {
  const config = { ...shapeConfig[type], ...getShapeTextConfig() }

  const shape = new shapes[type](config)
  shape.x = option.x
  shape.y = option.y
  return shape
}
