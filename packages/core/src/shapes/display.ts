import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IDisplayShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomDisplay = Path.extend({
  type: 'custom-display',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape
    const r = height / 2
    ctx.moveTo(x + 16, y)
    ctx.lineTo(x + width - r, y)
    ctx.arc(x + width - r, y + r, r, -Math.PI / 2, Math.PI / 2, false)
    ctx.lineTo(x + 16, y + height)
    ctx.lineTo(x, y + height / 2)
    ctx.closePath()

    return
  }
})

class Display extends CustomDisplay {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IDisplayShape }) {
    super(data)
    this.createAnchors()
  }
  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 2, y, index: 1, direct: 'top' },
      { x: x + width, y: y + height / 2, index: 2, direct: 'right' },
      { x: x + width / 2, y: y + height, index: 3, direct: 'bottom' },
      { x, y: y + height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Display }
