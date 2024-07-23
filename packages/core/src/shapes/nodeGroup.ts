import * as zrender from 'zrender'
import type { IShape, IAnchor } from './index'
import type { Anchor } from '../anchor'

export type IZrenderGroup = zrender.Rect & {
  nodeType: string
}

export interface INodeGroup extends IShape {
  boundingBox: zrender.BoundingRect 
  shapes: IShape[]
  canRemove: boolean
  updateBoundingBox(x: number, y: number, width: number, height: number): void
  refresh(): void
  getBoundingBox(): zrender.BoundingRect
  removeShapeFromGroup(shape: IShape): void
  setIntersectStatus(intersect: boolean): void
}

class NodeGroup extends zrender.Group {
  nodeType = 'nodeGroup'
  groupRect: IZrenderGroup | null = null
  groupHead: IZrenderGroup | null = null
  textContent: zrender.Text | null = null
  boundingBox: zrender.BoundingRect
  shapes: IShape[]
  headHeight: number = 30 // 头部高度
  padding = 20
  selected = false
  anchors: IAnchor[] = []
  anchor?: Anchor
  canRemove: boolean = false
  oldX: number = 0
  oldY: number = 0

  constructor(boundingBox: zrender.BoundingRect, shapes: IShape[]) {
    super()
    this.boundingBox = boundingBox
    this.shapes = shapes

    this.shapes.forEach(shape => {
      shape.parentGroup = this
    })

    this.create()
  }

  create() {
    this.groupRect = new zrender.Rect({
      style: {
        fill: '#fafafa',
        lineWidth: 1,
        stroke: '#ccc',
        lineDash: [4, 2]
      },
      z: 1
    }) as IZrenderGroup

    this.groupRect.nodeType = 'nodeGroup'

    this.textContent = new zrender.Text({
      style: {
        text: '新建分组',
        fill: '#333',
        fontSize: 12,
        fontFamily: 'Arial',
        padding: [6, 6]
      },
      z: 1
    })

    this.groupHead = new zrender.Rect({
      style: {
        fill: '#fafafa',
        lineWidth: 1,
        stroke: '#ccc',
        lineDash: [4, 2]
      },
      textContent: this.textContent,
      textConfig: {
        position: 'insideLeft'
      },
      z: 1
    }) as IZrenderGroup

    this.groupHead.nodeType = 'nodeGroup'

    this.add(this.groupRect)
    this.add(this.groupHead)
    this.refresh()
  }

  refresh() {
    const { x, y, width, height } = this.boundingBox
    this.groupRect?.attr({
      shape: {
        x: 0,
        y: 0,
        width: width + this.padding * 2,
        height: height + this.headHeight + this.padding * 2
      }
    })

    this.groupHead?.attr({
      shape: {
        x: 0,
        y: 0,
        width: width + this.padding * 2,
        height: this.headHeight
      }
    })

    this.attr('x', x - this.padding)
    this.attr('y', y - this.padding - this.headHeight)

    this.createAnchors()
    this.setCommonStyle()
  }

  setCommonStyle() {
    this.groupRect?.attr({
      style: {
        stroke: '#ccc'
      }
    })
  }

  setCanRemoveStyle () {
    this.groupRect?.attr({
      style: {
        stroke: '#f00'
      }
    })
  }

  updateBoundingBox(x: number, y: number, width: number, height: number) {
    this.boundingBox.x = x
    this.boundingBox.y = y
    this.boundingBox.width = width
    this.boundingBox.height = height
  }

  createAnchors() {
    this.anchors = []
    let g = new zrender.Group()
    let box= g.getBoundingRect([this])
    let t1 = { x: box.x + box.width / 4, y: box.y, index: 1, node: this, direct: 'top' }
    let t2 = { x: box.x + box.width / 2, y: box.y, index: 2, node: this, direct: 'top' }
    let t3 = { x: box.x + box.width / 4 * 3, y: box.y, index: 3, node: this, direct: 'top' }
    let r1 = { x: box.x + box.width, y: box.y + box.height / 4, index: 4, node: this, direct: 'right' }
    let r2 = { x: box.x + box.width, y: box.y + box.height / 2, index: 5, node: this, direct: 'right' }
    let r3 = { x: box.x + box.width, y: box.y + box.height / 4 * 3, index: 6, node: this, direct: 'right' }
    let b1 = { x: box.x + box.width / 4, y: box.y + box.height, index: 7, node: this, direct: 'bottom' }
    let b2 = { x: box.x + box.width / 2, y: box.y + box.height, index: 8, node: this, direct: 'bottom' }
    let b3 = { x: box.x + box.width / 4 * 3, y: box.y + box.height, index: 9, node: this, direct: 'bottom' }
    let l1 = { x: box.x, y: box.y + box.height / 4, index: 10, node: this, direct: 'left' }
    let l2 = { x: box.x, y: box.y + box.height / 2, index: 11, node: this, direct: 'left' }
    let l3 = { x: box.x, y: box.y + box.height / 4 * 3, index: 12, node: this, direct: 'left' }
    this.anchors.push(t1, t2, t3, r1, r2, r3, b1, b2, b3, l1, l2, l3)
  }

  getAnchorByIndex(index: number) {
    return this.anchors.filter(item => item.index == index)[0]
  }

  getAnchors() {
    return this.anchors
  }

  active() {
    this.selected = true
    // this.groupRect!.attr({
    //   style:{
    //     // shadowColor: 'yellow',
    //     // shadowBlur: 3
    //   }
    // })
    this.anchor?.show()
    this.shapes.forEach(shape => {
      shape.unActive()
    })
  }
  unActive() {
    this.selected = false
    // this.groupRect!.attr({
    //   style:{
    //     shadowColor: '',
    //     shadowBlur: 0
    //   }
    // })
    this.anchor?.hide()
  }

  getBoundingBox() {
    const g = new zrender.Group()
    const boundingBox: zrender.BoundingRect = g.getBoundingRect([this])
    boundingBox.x = this.x
    boundingBox.y = this.y

    return boundingBox
  }

  removeShapeFromGroup(shape: IShape) {
    this.shapes = this.shapes.filter(item => item !== shape)

    shape.parentGroup = undefined

  }

  setIntersectStatus(intersect: boolean) {
    if (!intersect) {
      this.setCanRemoveStyle()
      this.canRemove = true
    } else {
      this.setCommonStyle()
      this.canRemove = false
    }
  }
}

export { NodeGroup }
