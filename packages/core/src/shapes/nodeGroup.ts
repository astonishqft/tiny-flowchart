import * as zrender from 'zrender'
import { getBoundingRect } from '../utils'

import type { IShape, IAnchor, IExportGroup, IBaseShape, IExportGroupStyle } from './index'
import type { Anchor } from '../anchor'

export interface INodeGroup extends zrender.Group, IBaseShape {
  boundingBox: zrender.BoundingRect
  shapes: (IShape | INodeGroup)[]
  canRemove: boolean
  refresh(): void
  getBoundingBox(): zrender.BoundingRect
  removeShapeFromGroup(shape: IShape): void
  resizeNodeGroup(): void
  setAlertStyle(): void
  setCommonStyle(): void
  setZ(z: number): void
  z: number
  groupRect: zrender.Rect | null
  groupHead: zrender.Rect | null
  getExportData(): IExportGroup
  setStyle(style: IExportGroupStyle): void
}

class NodeGroup extends zrender.Group implements INodeGroup {
  nodeType = 'nodeGroup'
  groupRect: zrender.Rect | null = null
  groupHead: zrender.Rect | null = null
  textContent: zrender.Text | null = null
  headLine: zrender.Line | null = null
  boundingBox: zrender.BoundingRect
  shapes: (IShape | INodeGroup)[]
  headHeight: number = 30 // 头部高度
  padding = 20
  selected = false
  anchors: IAnchor[] = []
  anchor?: Anchor
  canRemove: boolean = false
  oldX: number = 0
  oldY: number = 0
  z = 1
  parentGroup: INodeGroup | undefined = undefined

  constructor(boundingBox: zrender.BoundingRect, shapes: (IShape | INodeGroup)[]) {
    super()
    this.boundingBox = boundingBox
    this.shapes = shapes

    this.shapes.forEach(shape => {
      shape.parentGroup = this as INodeGroup
    })

    this.create()
  }

  create() {
    this.groupRect = new zrender.Rect({
      style: {
        fill: '#fafafa',
        lineWidth: 1,
        stroke: '#ccc'
      },
      shape: {
        r: [3]
      },
      z: this.z
    })

    this.textContent = new zrender.Text({
      style: {
        text: '新建分组',
        fill: '#333',
        fontSize: 12,
        fontFamily: 'Arial',
        padding: [6, 6]
      },
      z: this.z
    })

    this.groupHead = new zrender.Rect({
      style: {
        fill: '#fafafa',
        lineWidth: 0,
        stroke: '#ccc'
      },
      textContent: this.textContent,
      textConfig: {
        position: 'insideLeft'
      },
      z: this.z
    })

    this.headLine = new zrender.Line({
      style: {
        fill: '#fafafa',
        lineWidth: 1,
        stroke: '#ccc'
      },
      z: this.z
    })

    this.add(this.groupRect)
    this.add(this.groupHead)
    this.add(this.headLine)
    this.refresh()
  }

  setZ(z: number) {
    this.z = z
    this.groupRect?.attr('z', z)
    this.groupHead?.attr('z', z)
    this.textContent?.attr('z', z)
    this.headLine?.attr('z', z)
    this.shapes.forEach(s => (s as unknown as zrender.Displayable).attr('z', z + 1))
  }

  getZ() {
    return this.z
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
        x: 1,
        y: 1,
        width: width + this.padding * 2 - 2,
        height: this.headHeight - 2
      }
    })

    this.headLine?.attr({
      shape: {
        x1: 0,
        y1: this.headHeight,
        x2: width + this.padding * 2,
        y2: this.headHeight
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
        lineWidth: 1,
        stroke: '#ccc'
      }
    })
  }

  createAnchors() {
    this.anchors = []
    const g = new zrender.Group()
    const box = g.getBoundingRect([this])
    const t1 = {
      x: box.x + box.width / 4,
      y: box.y,
      index: 1,
      node: this,
      direct: 'top'
    }
    const t2 = {
      x: box.x + box.width / 2,
      y: box.y,
      index: 2,
      node: this,
      direct: 'top'
    }
    const t3 = {
      x: box.x + (box.width / 4) * 3,
      y: box.y,
      index: 3,
      node: this,
      direct: 'top'
    }
    const r1 = {
      x: box.x + box.width,
      y: box.y + box.height / 4,
      index: 4,
      node: this,
      direct: 'right'
    }
    const r2 = {
      x: box.x + box.width,
      y: box.y + box.height / 2,
      index: 5,
      node: this,
      direct: 'right'
    }
    const r3 = {
      x: box.x + box.width,
      y: box.y + (box.height / 4) * 3,
      index: 6,
      node: this,
      direct: 'right'
    }
    const b1 = {
      x: box.x + box.width / 4,
      y: box.y + box.height,
      index: 7,
      node: this,
      direct: 'bottom'
    }
    const b2 = {
      x: box.x + box.width / 2,
      y: box.y + box.height,
      index: 8,
      node: this,
      direct: 'bottom'
    }
    const b3 = {
      x: box.x + (box.width / 4) * 3,
      y: box.y + box.height,
      index: 9,
      node: this,
      direct: 'bottom'
    }
    const l1 = {
      x: box.x,
      y: box.y + box.height / 4,
      index: 10,
      node: this,
      direct: 'left'
    }
    const l2 = {
      x: box.x,
      y: box.y + box.height / 2,
      index: 11,
      node: this,
      direct: 'left'
    }
    const l3 = {
      x: box.x,
      y: box.y + (box.height / 4) * 3,
      index: 12,
      node: this,
      direct: 'left'
    }
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
    this.groupRect!.attr({
      style: {
        shadowColor: '#1971c2',
        stroke: '#1971c2',
        shadowBlur: 1
      }
    })
    this.anchor?.show()
    this.shapes.forEach(shape => {
      shape.unActive()
    })
  }

  unActive() {
    this.selected = false
    this.groupRect!.attr({
      style: {
        shadowColor: '',
        shadowBlur: 0,
        stroke: '#333'
      }
    })
    this.anchor?.hide()
  }

  setAlertStyle() {
    this.groupRect!.attr({
      style: {
        lineWidth: 2,
        stroke: 'red'
      }
    })
  }

  getBoundingBox() {
    const g = new zrender.Group()
    const boundingBox: zrender.BoundingRect = g.getBoundingRect([this])
    boundingBox.x = this.x
    boundingBox.y = this.y

    return boundingBox
  }

  removeShapeFromGroup(shape: IShape | INodeGroup) {
    this.shapes = this.shapes.filter(item => item !== shape)

    shape.parentGroup = undefined
  }

  resizeNodeGroup() {
    this.boundingBox = getBoundingRect(this.shapes)
    this.refresh() // 重新计算组的大小
    this.createAnchors()
    this.anchor!.refresh()
  }

  getExportData() {
    const exportData: IExportGroup = {
      id: this.id,
      style: {
        fill: this.groupRect!.style.fill,
        lineWidth: this.groupRect!.style.lineWidth,
        stroke: this.groupRect!.style.stroke,
        lineDash: this.groupRect!.style.lineDash,
        fontColor: this.textContent?.style.fill,
        fontSize: this.textContent?.style.fontSize,
        text: this.textContent?.style.text,
        fontWeight: this.textContent?.style.fontWeight,
        fontStyle: this.textContent?.style.fontStyle,
        textPosition: this.groupHead?.textConfig?.position
      }
    }

    if (this.parentGroup) {
      exportData.parent = this.parentGroup.id
    }

    return exportData
  }

  setStyle({
    fill,
    stroke,
    lineWidth,
    lineDash,
    fontColor,
    fontSize,
    text,
    fontWeight,
    fontStyle,
    textPosition
  }: IExportGroupStyle) {
    fill && this.groupRect!.attr({ style: { fill } })
    stroke && this.groupRect!.attr({ style: { stroke } })
    lineWidth && this.groupRect!.attr({ style: { lineWidth } })
    lineDash && this.groupRect!.attr({ style: { lineDash } })
    fontColor && this.textContent!.attr({ style: { fill: fontColor } })
    fontSize && this.textContent!.attr({ style: { fontSize } })
    text && this.textContent!.attr({ style: { text } })
    fontWeight && this.textContent!.attr({ style: { fontWeight } })
    fontStyle && this.textContent!.attr({ style: { fontStyle } })
    textPosition &&
      this.groupHead?.setTextConfig({
        position: textPosition
      })
  }
}

export { NodeGroup }
