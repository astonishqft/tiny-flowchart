import { getBoundingBox } from '@/utils'
import { Path, PathProps } from '@/index'

import type { IAnchor } from '@/index'

export class IStoreShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomStore = Path.extend({
  type: 'custom-store',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IStoreShape) => {
    const { x, y, width, height } = shape
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x, y + height)
    ctx.closePath()
    ctx.moveTo(x + 10, y)
    ctx.lineTo(x + 10, y + height)
    ctx.moveTo(x, y + 10)
    ctx.lineTo(x + width, y + 10)

    return
  }
})

class Store extends CustomStore {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IStoreShape }) {
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

export { Store }
