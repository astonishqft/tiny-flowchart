import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IDocumentShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomDocument = Path.extend({
  type: 'custom-document',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape

    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y + height - 14)
    ctx.quadraticCurveTo(x + (width / 4) * 3, y + height - 20, x + width / 2, y + height - 14)
    ctx.quadraticCurveTo(x + width / 4, y + height, x, y + height - 7)
    ctx.lineTo(x, y)
    ctx.closePath()

    return
  }
})

class Document extends CustomDocument {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IDocumentShape }) {
    super(data)
    this.createAnchors()
  }
  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 2, y, index: 1, direct: 'top' },
      { x: x + width, y: y + height / 2, index: 2, direct: 'right' },
      { x: x + width / 2, y: y + height - 10, index: 3, direct: 'bottom' },
      { x: x, y: y + height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Document }
