import { Path, PathProps } from '@/index'
import type { IAnchor } from '@/index'
import { getBoundingBox } from '@/utils'
import { buildRoundRectPath } from '@/utils'
export class IPreRectShape {
  x = 0
  y = 0
  width = 0
  height = 0
  r = 0
}

const CustomPreRect = Path.extend({
  type: 'custom-preRect',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    r: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IPreRectShape) => {
    const { x, y, width, height } = shape
    const r = 2
    shape.r = r
    buildRoundRectPath(ctx, shape)
    const x1 = x + width / 10
    const x2 = x + (width / 10) * 9
    ctx.moveTo(x1, y)
    ctx.lineTo(x1, y + height)
    ctx.moveTo(x2, y)
    ctx.lineTo(x2, y + height)
    ctx.closePath()

    return
  }
})

class PreRect extends CustomPreRect {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IPreRectShape }) {
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

export { PreRect }
