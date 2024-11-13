import * as zrender from 'zrender'
import type { IAnchorPoint, IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'

class Anchor {
  private _radius: number = 4
  shape: IShape | INodeGroup
  bars: IAnchorPoint[]
  constructor(shape: IShape | INodeGroup) {
    this.shape = shape
    this.bars = []
    this.create()
  }
  create() {
    const points = this.shape.getAnchors()
    points.forEach(p => {
      const circle = new zrender.Circle({
        style: {
          fill: '#fff',
          stroke: 'rgb(0,181,237)',
          lineWidth: 1
        },
        shape: {
          cx: p.x,
          cy: p.y,
          r: this._radius
        },
        cursor: 'crosshair',
        z: 30001
      }) as IAnchorPoint
      circle.point = p
      circle.mark = 'anch'
      circle.node = this.shape
      circle.anch = circle
      circle.on('mouseover', () => {
        circle.oldFillColor = circle.style.fill as string
        circle.attr({
          style: {
            fill: 'rgb(0,181,237)',
            shadowColor: '#1971c2',
            shadowBlur: 2
          }
        })
        this.show()
      })

      circle.on('mouseout', () => {
        circle.attr({
          style: {
            fill: circle.oldFillColor,
            shadowBlur: 0
          }
        })
        if (this.shape.selected) return
        this.hide()
      })

      circle.on('mousedown', () => {
        circle.attr({
          style: {
            fill: 'rgb(0,181,237)'
          }
        })
      })

      this.bars.push(circle)
    })
  }

  getBarByIndex(index: number) {
    return this.bars.filter(bar => {
      return bar.point.index === index
    })[0]
  }

  show() {
    this.bars.forEach(b => {
      b.show()
    })
  }

  hide() {
    this.bars.forEach(b => {
      b.hide()
    })
  }

  refresh() {
    this.bars.forEach(bar => {
      const p = this.shape.getAnchorByIndex(bar.point.index)
      bar.attr({
        shape: {
          cx: p.x,
          cy: p.y
        }
      })
      bar.point = p
    })
  }
}

export { Anchor }
