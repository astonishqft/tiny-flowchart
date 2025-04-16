import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IDirectDataShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomDirectData = Path.extend({
  type: 'custom-direct-data',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape
    const w = x + width

    ctx.moveTo(x + 5, y)
    ctx.lineTo(w - 5, y)
    ctx.quadraticCurveTo(w, y + height / 6, w, y + height / 2)
    ctx.quadraticCurveTo(w, y + (height * 5) / 6, w - 5, y + height)
    ctx.lineTo(x + 5, y + height)
    ctx.quadraticCurveTo(x, y + (height * 5) / 6, x, y + height / 2)
    ctx.quadraticCurveTo(x, y + height / 6, x + 5, y)
    ctx.closePath()

    ctx.moveTo(w - 5, y + height)
    ctx.quadraticCurveTo(x + width - 10, y + (height * 5) / 6, w - 10, y + height / 2)
    ctx.quadraticCurveTo(x + width - 10, y + height / 6, w - 5, y)
  }
})

class DirectData extends CustomDirectData {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IDirectDataShape }) {
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

export { DirectData }
