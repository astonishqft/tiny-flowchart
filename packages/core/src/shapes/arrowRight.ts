import { getBoundingBox } from '@/utils'
import { Path, PathProps } from '@/index'

import type { IAnchor } from '@/index'

export class IArrowRightShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

const CustomArrowRight = Path.extend({
  type: 'custom-arrow-right',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape

    const x1 = x + width - 36
    const y1 = y + height / 5
    const y2 = y + (height / 5) * 4

    ctx.moveTo(x, y1)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x1, y)
    ctx.lineTo(x + width, y + height / 2)
    ctx.lineTo(x1, y + height)
    ctx.lineTo(x1, y2)
    ctx.lineTo(x, y2)
    ctx.closePath()
  }
})

class ArrowRight extends CustomArrowRight {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IArrowRightShape }) {
    super(data)
    this.createAnchors()
  }
  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])
    this.anchors = []
    const t = { x: x + width / 2, y: y + height / 5, index: 1, node: this, direct: 'top' }
    const r = { x: x + width, y: y + height / 2, index: 2, node: this, direct: 'right' }
    const b = { x: x + width / 2, y: y + (height / 5) * 4, index: 3, node: this, direct: 'bottom' }
    const l = { x: x, y: y + height / 2, index: 4, node: this, direct: 'left' }
    this.anchors.push(t, r, b, l)
  }
}

export { ArrowRight }
