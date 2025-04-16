import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IManualInputShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomManualInput = Path.extend({
  type: 'custom-manual-input',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape
    ctx.moveTo(x, y + 16)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x, y + height)
    ctx.closePath()

    return
  }
})

class ManualInput extends CustomManualInput {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IManualInputShape }) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 2, y, index: 1, direct: 'top' },
      { x: x + width, y: y + height / 2, index: 2, direct: 'right' },
      { x: x + width / 2, y: y + height, index: 3, direct: 'bottom' },
      { x, y: y + height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { ManualInput }
