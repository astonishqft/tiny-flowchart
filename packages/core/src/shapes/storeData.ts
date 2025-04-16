import { Path, PathProps } from '@/index'

import type { IAnchor } from '@/index'
import { getBoundingBox } from '@/utils'
export class IStoreDataShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomStoreData = Path.extend({
  type: 'custom-store-data',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IStoreDataShape) => {
    const { x, y, width, height } = shape

    ctx.moveTo(x + 5, y)
    ctx.lineTo(x + width - 5, y)
    ctx.quadraticCurveTo(x + width - 10, y + height / 6, x + width - 10, y + height / 2)
    ctx.quadraticCurveTo(x + width - 10, y + (height * 5) / 6, x + width - 5, y + height)
    ctx.lineTo(x + 5, y + height)
    ctx.quadraticCurveTo(x, y + (height * 5) / 6, x, y + height / 2)
    ctx.quadraticCurveTo(x, y + height / 6, x + 5, y)
    ctx.closePath()

    return
  }
})

class StoreData extends CustomStoreData {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IStoreDataShape }) {
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

export { StoreData }
