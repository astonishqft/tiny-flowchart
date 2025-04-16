import { Path } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor, PathProps } from '@/index'

const ZTrapezoid = Path.extend({
  type: 'trapezoid',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx, shape) => {
    const { x, y, width, height } = shape
    const offset = width * 0.2
    ctx.moveTo(x + offset, y)
    ctx.lineTo(x + width - offset, y)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x, y + height)
    ctx.closePath()
  }
})

class Trapezoid extends ZTrapezoid {
  anchors: IAnchor[] = []

  constructor(
    data: PathProps & { shape: { x: number; y: number; width: number; height: number } }
  ) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])
    const offset = width * 0.2
    this.anchors = [
      { x: x + width / 2, y, index: 1, direct: 'top' },
      { x: x + width - offset * 0.5, y: y + height / 2, index: 2, direct: 'right' },
      { x: x + width / 2, y: y + height, index: 3, direct: 'bottom' },
      { x: x + offset * 0.5, y: y + height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Trapezoid }
