import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IHexagonShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface IHexagonProps extends PathProps {
  shape: IHexagonShape
}

export const CustomHexagon = Path.extend({
  type: 'custom-hexagon',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IHexagonShape) => {
    const { x, y, width, height } = shape

    ctx.moveTo(x + width * 0.25, y)
    ctx.lineTo(x + width * 0.75, y)
    ctx.lineTo(x + width, y + height / 2)
    ctx.lineTo(x + width * 0.75, y + height)
    ctx.lineTo(x + width * 0.25, y + height)
    ctx.lineTo(x, y + height / 2)
    ctx.closePath()

    ctx.closePath()

    return
  }
})

// 六边形
class Hexagon extends CustomHexagon {
  anchors: IAnchor[] = []

  constructor(data: IHexagonProps) {
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

export { Hexagon }
