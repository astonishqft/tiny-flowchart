import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IInduceShape {
  x = 0
  y = 0
  width = 0
  height = 0
  direct = 'right'
}

export type IInduceProps = PathProps & { shape: IInduceShape }

const CustomInduce = Path.extend({
  type: 'custom-induce',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    direct: 'right'
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height, direct } = shape
    if (direct === 'right') {
      ctx.moveTo(x, y + height / 2)
      ctx.lineTo(x + width / 2, y + height / 2)
      ctx.moveTo(x + width, y)
      ctx.lineTo(x + width / 2, y)
      ctx.lineTo(x + width / 2, y + height)
      ctx.lineTo(x + width, y + height)
    } else if (direct === 'left') {
      ctx.moveTo(x, y)
      ctx.lineTo(x + width / 2, y)
      ctx.lineTo(x + width / 2, y + height)
      ctx.lineTo(x, y + height)
      ctx.moveTo(x + width / 2, y + height / 2)
      ctx.lineTo(x + width, y + height / 2)
    } else if (direct === 'top') {
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + height / 2)
      ctx.lineTo(x + width, y + height / 2)
      ctx.lineTo(x + width, y)
      ctx.moveTo(x + width / 2, y + height / 2)
      ctx.lineTo(x + width / 2, y + height)
    } else if (direct === 'bottom') {
      ctx.moveTo(x + width / 2, y)
      ctx.lineTo(x + width / 2, y + height / 2)
      ctx.moveTo(x, y + height)
      ctx.lineTo(x, y + height / 2)
      ctx.lineTo(x + width, y + height / 2)
      ctx.lineTo(x + width, y + height)
    }
  }
})

class Induce extends CustomInduce {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IInduceShape }) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 4, y, index: 1, direct: 'top' },
      { x: x + width / 2, y, index: 2, direct: 'top' },
      { x: x + (width * 3) / 4, y, index: 3, direct: 'top' },
      { x: x + width / 4, y: y + height, index: 4, direct: 'bottom' },
      { x: x + width / 2, y: y + height, index: 5, direct: 'bottom' },
      { x: x + (width * 3) / 4, y: y + height, index: 6, direct: 'bottom' },
      { x, y: y + height / 4, index: 7, direct: 'left' },
      { x, y: y + height / 2, index: 8, direct: 'left' },
      { x, y: y + (height * 3) / 4, index: 9, direct: 'left' }
    ]
  }
}

export { Induce }
