import { Path } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor, PathProps } from '@/index'

const ZDiamond = Path.extend({
  type: 'diamond',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx, shape) => {
    const x = shape.x
    const y = shape.y
    const height = shape.height
    const width = shape.width
    ctx.moveTo(x + width / 2, y)
    ctx.lineTo(x + width, y + height / 2)
    ctx.lineTo(x + width / 2, y + height)
    ctx.lineTo(x, y + height / 2)
    ctx.closePath()
  }
})

class Diamond extends ZDiamond {
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

export { Diamond }
