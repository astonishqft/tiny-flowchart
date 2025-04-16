import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class ITriangleShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface ITriangleProps extends PathProps {
  shape: ITriangleShape
}

export const CustomTriangle = Path.extend({
  type: 'custom-triangle',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: ITriangleShape) => {
    const { x, y, width, height } = shape

    ctx.moveTo(x + (1 / 2) * width, y)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x, y + height)
    ctx.closePath()

    ctx.closePath()

    return
  }
})

class Triangle extends CustomTriangle {
  anchors: IAnchor[] = []

  constructor(data: ITriangleProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + (1 / 2) * width, y, index: 1, direct: 'top' },
      { x: x + (3 / 4) * width, y: y + height / 2, index: 2, direct: 'right' },
      { x: x + (1 / 2) * width, y: y + height, index: 3, direct: 'bottom' },
      { x: x + (1 / 4) * width, y: y + height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Triangle }
