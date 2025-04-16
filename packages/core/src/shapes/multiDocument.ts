import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IMultiDocumentShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

const CustomMultiDocument = Path.extend({
  type: 'custom-multidocument',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx: CanvasRenderingContext2D, shape: IMultiDocumentShape) {
    const { x, y, width, height } = shape
    buildPath(ctx, x + 8, y, width - 8, height - 22)
    buildPath(ctx, x + 4, y + 4, width - 8, height - 22)
    buildPath1(ctx, x, y + 8, width - 8, height - 8)

    return
  }
})

function buildPath1(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width, y + height - 14)
  ctx.quadraticCurveTo(x + (width / 4) * 3, y + height - 20, x + width / 2, y + height - 14)
  ctx.quadraticCurveTo(x + width / 4, y + height, x, y + height - 7)
  ctx.lineTo(x, y)
  ctx.closePath()
}

function buildPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width, y + height)
  ctx.lineTo(x + width - 4, y + height)
  ctx.lineTo(x + width - 4, y + 4)
  ctx.lineTo(x, y + 4)
  ctx.closePath()
}

class MultiDocument extends CustomMultiDocument {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IMultiDocumentShape }) {
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

export { MultiDocument }
