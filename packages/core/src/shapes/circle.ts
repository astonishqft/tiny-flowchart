import * as zrender from 'zrender'
import type { IShape, IAnchor } from './index'
import type { Anchor } from '../anchor'

class Circle extends zrender.Ellipse implements IShape {
  selected = false
  nodeType = 'node'
  anchors: IAnchor[] = []
  anchor?: Anchor
  constructor(data: zrender.CircleProps) {
    super(data)
    this.createAnchors()
  }

  getPoint(x: number, box: zrender.BoundingRect){
    let a = box.width / 2
    let b = box.height / 2
    //椭圆公式 计算y值
    let y = Math.sqrt(b*b*Math.sqrt(1 - (x*x) / (a*a)))
    return y
  }

  createAnchors() {
    this.anchors = []
    let g = new zrender.Group()
    // 组内元素的子集。如果 includeChildren 未设置，则获取所有元素的包围盒，否则获得 includeChildren 的包围盒。
    // 也就是获取了this(图元本身)所在的包围盒，用来计算锚点
    let box = g.getBoundingRect([this])
    let cy=box.y+box.height/2

    let t = { x: box.x + box.width / 2, y: box.y, index: 1, node: this, direct: 'top' }
    let r = { x: box.x + box.width, y: box.y + box.height / 2, index: 2, node: this, direct: 'right' }
    let b = { x: box.x + box.width / 2, y: box.y + box.height, index: 3, node: this, direct: 'bottom' }
    let l = { x: box.x, y: box.y + box.height / 2, index: 4, node: this, direct: 'left' }
    this.anchors.push(t, r, b, l)

    let point=this.getPoint(box.width / 4, box)
    
    let p1 = { x: box.x + box.width*3/4, y: cy+point-2, index: 5, node: this, direct: 'right' }
    let p2 = { x: box.x + box.width*3/4, y: cy-point+2, index: 6, node: this, direct: 'right' }
    let p3 = { x: box.x + box.width/4, y: cy+point-2, index: 7, node: this, direct: 'left' }
    let p4 = { x: box.x + box.width/4, y: cy-point+2, index: 8, node: this, direct: 'left' }
    this.anchors.push(p1, p2, p3, p4)
  }

  active() {
    this.selected = true
    this.attr({
      style:{
        shadowColor: 'yellow',
        shadowBlur: 3
      }
    })
    this.anchor?.show()
  }

  unActive() {
    this.selected = false
    this.attr({
      style:{
        shadowColor: '',
        shadowBlur: 0
      }
    })
    this.anchor?.hide()
  }

  getAnchors() {
    return this.anchors.slice()
  }

  getAnchorByIndex(index: number) {
    return this.anchors.filter(item => item.index == index)[0]
  }
}

export { Circle }
