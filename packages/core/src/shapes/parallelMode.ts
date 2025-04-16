import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IParallelModeShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomParallelMode = Path.extend({
  type: 'custom-parallel-model',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx: CanvasRenderingContext2D, shape: IParallelModeShape) {
    const { x, y, width, height } = shape
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.moveTo(x, y + height)
    ctx.lineTo(x + width, y + height)

    return
  }
})

class ParallelMode extends CustomParallelMode {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IParallelModeShape }) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 4, y, index: 1, direct: 'top' },
      { x: x + width / 2, y, index: 2, direct: 'top' },
      { x: x + (width * 3) / 4, y, index: 3, direct: 'top' },
      { x, y, index: 4, direct: 'top' },
      { x: x + width, y, index: 5, direct: 'top' },
      { x: x + width / 4, y: y + height, index: 6, direct: 'bottom' },
      { x: x + width / 2, y: y + height, index: 7, direct: 'bottom' },
      { x: x + (width * 3) / 4, y: y + height, index: 8, direct: 'bottom' },
      { x, y: y + height, index: 9, direct: 'bottom' },
      { x: x + width, y: y + height, index: 10, direct: 'bottom' }
    ]
  }
}

export { ParallelMode }
