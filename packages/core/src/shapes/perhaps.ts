import { getBoundingBox } from '@/utils'
import { Path } from '@/index'
import type { IAnchor, PathProps } from '@/index'

export class IPerhapsShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

export interface IPerhapsProps extends PathProps {
  shape: IPerhapsShape
}
const CustomPerhaps = Path.extend({
  type: 'custom-perhaps',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: IPerhapsShape) => {
    const { x, y, width, height } = shape
    const k = 0.5522848
    const cx = x + width / 2
    const cy = y + height / 2
    const a = width / 2
    const b = height / 2
    const ox = a * k // 水平控制点偏移量
    const oy = b * k // 垂直控制点偏移量
    // 从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
    ctx.moveTo(cx - a, cy)
    ctx.bezierCurveTo(cx - a, cy - oy, cx - ox, cy - b, cx, cy - b)
    ctx.bezierCurveTo(cx + ox, cy - b, cx + a, cy - oy, cx + a, cy)
    ctx.bezierCurveTo(cx + a, cy + oy, cx + ox, cy + b, cx, cy + b)
    ctx.bezierCurveTo(cx - ox, cy + b, cx - a, cy + oy, cx - a, cy)
    ctx.closePath()
    ctx.moveTo(cx, y)
    ctx.lineTo(cx, y + height)
    ctx.moveTo(x, cy)
    ctx.lineTo(x + width, cy)

    return
  }
})

class Perhaps extends CustomPerhaps {
  anchors: IAnchor[] = []
  constructor(data: IPerhapsProps) {
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

export { Perhaps }
