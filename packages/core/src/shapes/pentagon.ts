import { getBoundingBox } from '@/utils'
import { Path } from '@/index'
import type { IAnchor, PathProps } from '@/index'

export class IPentagonShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface IPentagonProps extends PathProps {
  shape: IPentagonShape
}

export const CustomPentagon = Path.extend({
  type: 'custom-pentagon',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IPentagonShape) => {
    const { x, y, width, height } = shape

    ctx.moveTo(x + (1 / 2) * width, y)
    ctx.lineTo(x + width, y + height * 0.4)
    ctx.lineTo(x + width * 0.75, y + height)
    ctx.lineTo(x + width * 0.25, y + height)
    ctx.lineTo(x, y + height * 0.4)
    ctx.closePath()

    return
  }
})

// 五边形
class Pentagon extends CustomPentagon {
  anchors: IAnchor[] = []
  constructor(data: IPentagonProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 2, y: y, index: 1, direct: 'top' },
      { x: x + width, y: y + height * 0.4, index: 2, direct: 'right' },
      { x: x + width / 2, y: y + height, index: 3, direct: 'bottom' },
      { x: x, y: y + height * 0.4, index: 4, direct: 'left' }
    ]
  }
}

export { Pentagon }
