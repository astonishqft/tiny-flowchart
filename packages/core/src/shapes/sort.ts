import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'
export class ISortShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface ISortProps extends PathProps {
  shape: ISortShape
}

const CustomSort = Path.extend({
  type: 'custom-sort',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: ISortShape) => {
    const { x, y, width, height } = shape
    ctx.moveTo(x + width / 2, y)
    ctx.lineTo(x + width, y + height / 2)
    ctx.lineTo(x + width / 2, y + height)
    ctx.lineTo(x, y + height / 2)
    ctx.closePath()
    ctx.moveTo(x, y + height / 2)
    ctx.lineTo(x + width, y + height / 2)

    return
  }
})

class Sort extends CustomSort {
  anchors: IAnchor[] = []
  constructor(data: ISortProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const box = getBoundingBox([this])

    this.anchors = [
      { x: box.x + box.width / 2, y: box.y, index: 1, direct: 'top' },
      { x: box.x + box.width, y: box.y + box.height / 2, index: 2, direct: 'right' },
      { x: box.x + box.width / 2, y: box.y + box.height, index: 3, direct: 'bottom' },
      { x: box.x, y: box.y + box.height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Sort }
