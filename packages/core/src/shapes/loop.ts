import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class ILoopShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomLoop = Path.extend({
  type: 'custom-loop',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape
    ctx.moveTo(x + 16, y)
    ctx.lineTo(x + width - 16, y)
    ctx.lineTo(x + width, y + 16)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x, y + height)
    ctx.lineTo(x, y + 16)
    ctx.closePath()

    return
  }
})

class Loop extends CustomLoop {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: ILoopShape }) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 2, y, index: 1, direct: 'top' },
      { x: x + width, y: y + height / 2, index: 2, direct: 'right' },
      { x: x + width / 2, y: y + height, index: 3, direct: 'bottom' },
      { x: x, y: y + height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Loop }
