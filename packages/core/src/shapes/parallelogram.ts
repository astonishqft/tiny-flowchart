import { Path } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor, PathProps } from '@/index'

// 平行四边形
const ZParallelogram = Path.extend({
  type: 'parallelogram',
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
    const offset = 15
    ctx.moveTo(x + offset, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width - offset, y + height)
    ctx.lineTo(x, y + height)
    ctx.closePath()
  }
})

class Parallelogram extends ZParallelogram {
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
      { x: box.x - 7.5 + box.width, y: box.y + box.height / 2, index: 2, direct: 'right' },
      { x: box.x + box.width / 2, y: box.y + box.height, index: 3, direct: 'bottom' },
      { x: box.x + 7.5, y: box.y + box.height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Parallelogram }
