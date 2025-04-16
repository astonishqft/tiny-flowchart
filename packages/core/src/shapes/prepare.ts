import { getBoundingBox } from '@/utils'
import { Path } from '@/index'
import type { IAnchor, PathProps } from '@/index'

export class IPrepareShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface IPrepareProps extends PathProps {
  shape: IPrepareShape
}

const CustomPrepare = Path.extend({
  type: 'custom-prepare',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IPrepareShape) => {
    const { x, y, width, height } = shape
    ctx.moveTo(x + 16, y)
    ctx.lineTo(x + width - 16, y)
    ctx.lineTo(x + width, y + height / 2)
    ctx.lineTo(x + width - 16, y + height)
    ctx.lineTo(x + 16, y + height)
    ctx.lineTo(x, y + height / 2)
    ctx.closePath()

    return
  }
})

class Prepare extends CustomPrepare {
  anchors: IAnchor[] = []
  constructor(data: IPrepareProps) {
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

export { Prepare }
