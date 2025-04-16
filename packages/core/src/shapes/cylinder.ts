import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class ICylinderShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomCylinder = Path.extend({
  type: 'custom-cylinder',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape
    ctx.moveTo(x, y + 5)
    ctx.quadraticCurveTo(x + width / 6, y, x + width / 2, y)
    ctx.quadraticCurveTo(x + (width * 5) / 6, y, x + width, y + 5)

    ctx.lineTo(x + width, y + height - 5)
    ctx.quadraticCurveTo(x + (width * 5) / 6, y + height, x + width / 2, y + height)
    ctx.quadraticCurveTo(x + width / 6, y + height, x, y + height - 5)
    ctx.closePath()

    ctx.moveTo(x + width, y + 5)
    ctx.quadraticCurveTo(x + (width * 5) / 6, y + 10, x + width / 2, y + 10)
    ctx.quadraticCurveTo(x + width / 6, y + 10, x, y + 5)
  }
})

class Cylinder extends CustomCylinder {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: ICylinderShape }) {
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

export { Cylinder }
