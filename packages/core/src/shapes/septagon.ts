import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'
export class ISeptagonShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface ISeptagonProps extends PathProps {
  shape: ISeptagonShape
}

export const CustomSeptagon = Path.extend({
  type: 'custom-septagon',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: ISeptagonShape) => {
    const { x, y, width, height } = shape

    ctx.moveTo(x + width * 0.5, y)
    ctx.lineTo(x + width * 0.9, y + height * 0.16)
    ctx.lineTo(x + width, y + height * 0.7)
    ctx.lineTo(x + width * 0.75, y + height)
    ctx.lineTo(x + width * 0.25, y + height)
    ctx.lineTo(x, y + height * 0.7)
    ctx.lineTo(x + width * 0.1, y + height * 0.16)

    ctx.closePath()

    return
  }
})

// 七边形
class Septagon extends CustomSeptagon {
  anchors: IAnchor[] = []

  constructor(data: ISeptagonProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 2, y: y, index: 1, direct: 'top' },
      { x: x + width * 0.9, y: y + height * 0.16, index: 2, direct: 'right' },
      { x: x + width, y: y + height * 0.7, index: 3, direct: 'right' },
      { x: x + width * 0.75, y: y + height, index: 4, direct: 'bottom' },
      { x: x + width * 0.25, y: y + height, index: 5, direct: 'bottom' },
      { x: x, y: y + height * 0.7, index: 6, direct: 'left' },
      { x: x + width * 0.1, y: y + height * 0.16, index: 7, direct: 'left' }
    ]
  }
}

export { Septagon }
