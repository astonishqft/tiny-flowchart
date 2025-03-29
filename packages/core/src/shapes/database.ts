import { Path } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor, PathProps } from '@/index'

const ZDatabase = Path.extend({
  type: 'database',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const x = shape.x
    const y = shape.y
    const height = shape.height
    const width = shape.width
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

class Database extends ZDatabase {
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

export { Database }
