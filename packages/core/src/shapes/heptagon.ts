import { getBoundingBox } from '@/utils'
import { Path, PathProps } from '@/index'

import type { IAnchor } from '@/index'

export class IHeptagonShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface IHeptagonProps extends PathProps {
  shape: IHeptagonShape
}

export const CustomHeptagon = Path.extend({
  type: 'custom-heptagon',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IHeptagonShape) => {
    const { x, y, width, height } = shape

    ctx.moveTo(x + width * 0.3, y)
    ctx.lineTo(x + width * 0.7, y)
    ctx.lineTo(x + width, y + height * 0.3)
    ctx.lineTo(x + width, y + height * 0.7)
    ctx.lineTo(x + width * 0.7, y + height)
    ctx.lineTo(x + width * 0.3, y + height)
    ctx.lineTo(x, y + height * 0.7)
    ctx.lineTo(x, y + height * 0.3)
    ctx.closePath()

    ctx.closePath()

    return
  }
})
// 八边形
class Heptagon extends CustomHeptagon {
  anchors: IAnchor[] = []

  constructor(data: IHeptagonProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width * 0.3, y, index: 1, direct: 'top' },
      { x: x + width * 0.7, y, index: 2, direct: 'top' },
      { x: x + width, y: y + height * 0.3, index: 3, direct: 'right' },
      { x: x + width, y: y + height * 0.7, index: 4, direct: 'right' },
      { x: x + width * 0.7, y: y + height, index: 5, direct: 'bottom' },
      { x: x + width * 0.3, y: y + height, index: 6, direct: 'bottom' },
      { x: x, y: y + height * 0.7, index: 7, direct: 'left' },
      { x: x, y: y + height * 0.3, index: 8, direct: 'left' }
    ]
  }
}

export { Heptagon }
