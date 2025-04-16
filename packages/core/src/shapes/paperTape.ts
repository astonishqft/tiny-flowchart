import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IPaperTapeShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomPaperTape = Path.extend({
  type: 'custom-paper-bag',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx: CanvasRenderingContext2D, shape: IPaperTapeShape) {
    const { x, y, width, height } = shape
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + width / 4, y + 10, x + width / 2, y)
    ctx.quadraticCurveTo(x + (width * 3) / 4, y - 10, x + width, y)
    ctx.lineTo(x + width, y + height)
    ctx.quadraticCurveTo(x + (width * 3) / 4, y + height - 10, x + width / 2, y + height)
    ctx.quadraticCurveTo(x + width / 4, y + height + 10, x, y + height)
    ctx.closePath()

    return
  }
})

class PaperTape extends CustomPaperTape {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IPaperTapeShape }) {
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

export { PaperTape }
