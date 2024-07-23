import * as zrender from 'zrender'
import { IShape } from './shapes'
import type { IAnchorPoint } from './shapes'

class Anchor {
  shape: IShape
  bars: IAnchorPoint[]
  constructor(shape: IShape) {
    this.shape = shape
    this.bars = []
    this.create()
  }
  create() {
    const points = this.shape.getAnchors()
    points.forEach(p => {
      const circle: zrender.Circle = new zrender.Circle({
        style: {
          fill: '#fff',
          stroke: 'rgb(0,181,237)',
          lineWidth: 1
        },
        shape: {
          cx: p.x,
          cy: p.y,
          r: 3
        },
        cursor: 'crosshair',
        z: 30001
      });
      (circle as IAnchorPoint).point = p;
      (circle as IAnchorPoint).mark = 'anch';
      (circle as IAnchorPoint).node = this.shape;
      (circle as IAnchorPoint).anch = circle as IAnchorPoint
      circle.on('mouseover', () => {
        (circle as IAnchorPoint).oldFillColor = circle.style.fill as string
        circle.attr({
          style: {
            fill: 'rgb(0,181,237)'
          }
        })
        this.show()
      })

      circle.on('mouseout', () => {
        circle.attr({
          style: {
            fill: (circle as IAnchorPoint).oldFillColor
          }
        })
        this.hide()
      })

      circle.on('mousedown', () => {
        circle.attr({
          style: {
            fill: 'rgb(0,181,237)'
          }
        })
      })

      this.bars.push(circle as IAnchorPoint)
    })
  }

  getBarByIndex(index: number){
    return this.bars.filter(bar=>{return bar.point.index === index})[0]
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
      let p = this.shape.getAnchorByIndex(bar.point.index)
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
