import * as zrender from 'zrender'
import type { IShape } from '../types/interfaces/i-shape'

class Circle extends zrender.Ellipse implements IShape {
  selected = false
  nodeType = 'node'
  constructor(data: zrender.CircleProps) {
    super(data)
  }

  createAnchors(): void {
      
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
      style:{
        shadowColor: '',
        shadowBlur: 0
      }
    })
  }
}

export { Circle }
