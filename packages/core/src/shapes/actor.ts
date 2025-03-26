import { Path } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor, PathProps } from '@/index'

const Person = Path.extend({
  type: 'actor',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx, shape) => {
    const { x, y, width, height } = shape

    ctx.beginPath()
    ctx.arc(x + width / 2, y + 10, 6, 0, Math.PI * 2, false)

    ctx.moveTo(x, y + 20)
    ctx.lineTo(x + width, y + 20)

    ctx.moveTo(x + width / 2, y + 16)
    ctx.lineTo(x + width / 2, y + (2 / 3) * height)

    ctx.moveTo(x + width / 2, y + (2 / 3) * height)
    ctx.lineTo(x, y + height)

    ctx.moveTo(x + width / 2, y + (2 / 3) * height)
    ctx.lineTo(x + width, y + height)

    ctx.closePath()
  }
})

class Actor extends Person {
  anchors: IAnchor[] = []

  constructor(
    data: PathProps & { shape: { x: number; y: number; width: number; height: number } }
  ) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const box = getBoundingBox([this])

    this.anchors = [
      { x: box.x + box.width / 2, y: box.y, index: 1, direct: 'top' },
      { x: box.x + box.width, y: box.y + box.height / 2, index: 2, direct: 'right' },
      { x: box.x + box.width / 2, y: box.y + box.height, index: 3, direct: 'bottom' },
      { x: box.x, y: box.y + box.height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Actor }
