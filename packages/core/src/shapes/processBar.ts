import { getBoundingBox } from '@/utils'
import { Path } from '@/index'
import type { IAnchor, PathProps } from '@/index'

export class IProcessBarShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface IProcessBarProps extends PathProps {
  shape: IProcessBarShape
}

const CustomProcessBar = Path.extend({
  type: 'custom-process-bar',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IProcessBarShape) => {
    const { x, y, width, height } = shape
    ctx.moveTo(x, y)
    ctx.lineTo(x + width - 20, y)
    ctx.lineTo(x + width, y + height / 2)
    ctx.lineTo(x + width - 20, y + height)
    ctx.lineTo(x, y + height)
    ctx.lineTo(x + 20, y + height / 2)
    ctx.closePath()
  }
})

class ProcessBar extends CustomProcessBar {
  anchors: IAnchor[] = []
  constructor(data: IProcessBarProps) {
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

export { ProcessBar }
