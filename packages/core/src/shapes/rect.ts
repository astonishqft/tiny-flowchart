import * as zrender from 'zrender'
import type { IShape } from '../types/interfaces/i-shape'

class Rect extends zrender.Rect implements IShape {
  selected = false
  nodeType = 'node'
  constructor(data: zrender.RectProps) {
    super(data)
  }

  createAnchors() {

  }

  active() {
    this.selected = true
    this.attr({
      style:{
        shadowColor: 'yellow',
        shadowBlur: 3
      }
    })
  }

  unActive() {
    this.selected = false
    this.attr({
      style: {
        shadowColor: '',
        shadowBlur: 0
      }
    })
  }
}

export { Rect }
