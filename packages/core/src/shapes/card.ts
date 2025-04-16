import { getBoundingBox } from '@/utils'
import { Path, PathProps } from '@/index'

import type { IAnchor } from '@/index'

export class ICardShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

const CustomCard = Path.extend({
  type: 'custom-card',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape
    ctx.moveTo(x + 15, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x, y + height)
    ctx.lineTo(x, y + 15)
    ctx.closePath()

    return
  }
})

class Card extends CustomCard {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: ICardShape }) {
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

export { Card }
