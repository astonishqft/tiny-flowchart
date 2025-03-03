import { Ellipse, BoundingRect } from '@/index'
import { getBoundingBox } from '@/utils'

import type { IAnchor, CircleProps } from '@/index'

class Circle extends Ellipse {
  anchors: IAnchor[] = []

  constructor(data: CircleProps) {
    super(data)
    this.createAnchors()
  }

  getPoint(x: number, box: BoundingRect) {
    const a = box.width / 2
    const b = box.height / 2
    //椭圆公式 计算y值
    const y = Math.sqrt(b * b * Math.sqrt(1 - (x * x) / (a * a)))

    return y
  }

  createAnchors() {
    this.anchors = []
    const box = getBoundingBox([this])
    const cy = box.y + box.height / 2

    const t = {
      x: box.x + box.width / 2,
      y: box.y,
      index: 1,
      direct: 'top'
    }
    const r = {
      x: box.x + box.width,
      y: box.y + box.height / 2,
      index: 2,
      direct: 'right'
    }
    const b = {
      x: box.x + box.width / 2,
      y: box.y + box.height,
      index: 3,
      direct: 'bottom'
    }
    const l = {
      x: box.x,
      y: box.y + box.height / 2,
      index: 4,
      direct: 'left'
    }
    this.anchors.push(t, r, b, l)

    const point = this.getPoint(box.width / 4, box)

    const p1 = {
      x: box.x + (box.width * 3) / 4,
      y: cy + point - 2,
      index: 5,
      direct: 'right'
    }
    const p2 = {
      x: box.x + (box.width * 3) / 4,
      y: cy - point + 2,
      index: 6,
      direct: 'right'
    }
    const p3 = {
      x: box.x + box.width / 4,
      y: cy + point - 2,
      index: 7,
      direct: 'left'
    }
    const p4 = {
      x: box.x + box.width / 4,
      y: cy - point + 2,
      index: 8,
      direct: 'left'
    }

    this.anchors.push(p1, p2, p3, p4)
  }
}

export { Circle }
