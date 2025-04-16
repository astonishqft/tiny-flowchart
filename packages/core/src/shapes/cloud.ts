import { Path, PathProps } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor } from '@/index'

export class ICloudShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

const CustomCloud = Path.extend({
  type: 'custom-cloud',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape
    const r = 20
    const nw = Math.floor(width / r)
    const nh = Math.floor(height / r)
    let x1 = 0
    let y1 = 0
    let cpx = 0
    let cpy = 0
    ctx.moveTo(x, y)
    for (let i = 1; i <= nw; i++) {
      x1 = x + i * r
      y1 = y
      cpx = x1 - r / 2
      cpy = y1 - r / 2
      ctx.quadraticCurveTo(cpx, cpy, x1, y1)
    }
    if (width % r !== 0) {
      const r1 = width - nw * r
      cpx = x1 + r1 / 2
      cpy = y - r / 2
      ctx.quadraticCurveTo(cpx, cpy, x + width, y)
    }
    for (let i = 1; i <= nh; i++) {
      x1 = x + width
      y1 = y + i * r
      cpx = x1 + r / 2
      cpy = y1 - r / 2
      ctx.quadraticCurveTo(cpx, cpy, x1, y1)
    }
    if (height % r !== 0) {
      const r1 = height - nh * r
      cpx = x1 + r / 2
      cpy = y1 + r1 / 2
      ctx.quadraticCurveTo(cpx, cpy, x + width, y + height)
    }
    for (let i = 1; i <= nw; i++) {
      x1 = x + width - r * i
      y1 = y + height
      cpx = x1 + r / 2
      cpy = y1 + r / 2
      ctx.quadraticCurveTo(cpx, cpy, x1, y1)
    }
    if (width % r !== 0) {
      const r1 = width - nw * r
      cpx = x1 - r1 / 2
      cpy = y1 + r / 2
      ctx.quadraticCurveTo(cpx, cpy, x, y + height)
    }
    for (let i = 1; i <= nh; i++) {
      x1 = x
      y1 = y + height - i * r
      cpx = x1 - r / 2
      cpy = y1 + r / 2
      ctx.quadraticCurveTo(cpx, cpy, x1, y1)
    }
    if (height % r !== 0) {
      const r1 = height - nh * r
      cpx = x1 - r / 2
      cpy = y1 - r1 / 2
      ctx.quadraticCurveTo(cpx, cpy, x, y)
    }
    ctx.closePath()
  }
})

class Cloud extends CustomCloud {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: ICloudShape }) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    const t = { x: x + width / 2, y, index: 1, node: this, direct: 'top' }
    const r = { x: x + width, y: y + height / 2, index: 2, node: this, direct: 'right' }
    const b = { x: x + width / 2, y: y + height, index: 3, node: this, direct: 'bottom' }
    const l = { x, y: y + height / 2, index: 4, node: this, direct: 'left' }
    this.anchors.push(t, r, b, l)
  }
}

export { Cloud }
