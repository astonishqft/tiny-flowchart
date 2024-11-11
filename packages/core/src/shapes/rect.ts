import * as zrender from 'zrender'
import type { IAnchor } from './index'

class Rect extends zrender.Rect {
  anchors: IAnchor[] = []

  constructor(data: zrender.RectProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    this.anchors = []
    const g = new zrender.Group()
    const box = g.getBoundingRect([this])
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
  }
}

export { Rect }
