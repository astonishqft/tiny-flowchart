import { getBoundingBox } from '@/utils'
import { Path, PathProps } from '@/index'
import { buildRoundRectPath } from '@/utils'

import type { IAnchor } from '@/index'

export class IAroundRectShape {
  x = 0
  y = 0
  width = 0
  height = 0
  r = 0
}

export interface IAroundRectProps extends PathProps {
  shape: IAroundRectShape
}

const CustomAroundRect = Path.extend({
  type: 'custom-around-rect',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    r: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IAroundRectShape) => {
    const { width, height } = shape
    const r = Math.max(width, height)
    shape.r = r
    buildRoundRectPath(ctx, shape)
    ctx.closePath()

    return
  }
})

class RoundRect extends CustomAroundRect {
  anchors: IAnchor[] = []
  constructor(data: IAroundRectProps) {
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

export { RoundRect }
