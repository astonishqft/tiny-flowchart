import * as zrender from 'zrender'
import type { IAnchorPoint, INode, IAnchor } from './shapes'

class Anchor {
  private _radius: number = 4
  shape: INode
  bars: IAnchorPoint[]

  constructor(shape: INode) {
    this.shape = shape
    this.bars = []
    this.create()
  }

  create() {
    this.shape.getAnchors().forEach(p => this.createCircle(p))
  }

  private createCircle(p: IAnchor) {
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

    this.addCircleEvents(circle)
    this.bars.push(circle)
  }

  private addCircleEvents(circle: IAnchorPoint) {
    circle.on('mouseover', () => this.onMouseOver(circle))
    circle.on('mouseout', () => this.onMouseOut(circle))
    circle.on('mousedown', () => this.onMouseDown(circle))
  }

  private onMouseOver(circle: IAnchorPoint) {
    circle.oldFillColor = circle.style.fill as string
    circle.attr({
      style: {
        fill: 'rgb(0,181,237)',
        shadowColor: '#1971c2',
        shadowBlur: 2
      }
    })
    this.show()
  }

  private onMouseOut(circle: IAnchorPoint) {
    circle.attr({
      style: {
        fill: circle.oldFillColor,
        shadowBlur: 0
      }
    })
    if (!this.shape.selected) {
      this.hide()
    }
  }

  private onMouseDown(circle: IAnchorPoint) {
    circle.attr({
      style: {
        fill: 'rgb(0,181,237)'
      }
    })
  }

  getBarByIndex(index: number) {
    return this.bars.find(bar => bar.point.index === index)
  }

  show() {
    this.bars.forEach(b => b.show())
  }

  hide() {
    this.bars.forEach(b => b.hide())
  }

  refresh() {
    this.shape.createAnchors()
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
