import { getBoundingBox } from '@/utils'
import { Path, PathProps } from '@/index'

import type { IAnchor } from '@/index'

export class IArrowBottomShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

const CustomArrowBottom = Path.extend({
  type: 'custom-arrow-bottom',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape

    const y1 = y + height - 36
    const x1 = x + width / 5
    const x2 = x + (width / 5) * 4

    ctx.moveTo(x1, y)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x, y1)
    ctx.lineTo(x + width / 2, y + height)
    ctx.lineTo(x + width, y1)
    ctx.lineTo(x2, y1)
    ctx.lineTo(x2, y)
    ctx.closePath()
  }
})

class ArrowBottom extends CustomArrowBottom {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IArrowBottomShape }) {
    super(data)
    this.createAnchors()
  }
  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])
    this.anchors = []
    const t = { x: x + width / 2, y: y, index: 1, node: this, direct: 'top' }
    const r = { x: x + width, y: y + height / 2, index: 2, node: this, direct: 'right' }
    const b = { x: x + width / 2, y: y + height, index: 3, node: this, direct: 'bottom' }
    const l = { x: x, y: y + height / 2, index: 4, node: this, direct: 'left' }
    this.anchors.push(t, r, b, l)
  }
}

export { ArrowBottom }
