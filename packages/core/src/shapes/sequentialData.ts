import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class IOrdinalDataShape {
  x = 0
  y = 0
  width = 0
  height = 0
}
const CustomSequentialData = Path.extend({
  type: 'custom-sequential-data',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx: CanvasRenderingContext2D, shape: IOrdinalDataShape) {
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
    ctx.moveTo(cx, y + height)
    ctx.lineTo(x + width, y + height)

    return
  }
})

class SequentialData extends CustomSequentialData {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IOrdinalDataShape }) {
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

export { SequentialData }
