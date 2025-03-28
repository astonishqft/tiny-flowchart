import { Group, BoundingRect, Rect, Line, Text, NodeType } from '@/index'
import { getMinPosition } from '@/utils'
import { Anchor } from '@/anchor'

import type {
  IAnchor,
  IExportGroup,
  IExportGroupStyle,
  IShape,
  StrokeStyle,
  INode,
  IIocEditor,
  IViewPortManage,
  ISettingManage,
  IWidthActivate,
  IWidthAnchor
} from '@/index'

export interface INodeGroup extends Group, IWidthActivate, IWidthAnchor {
  oldX: number
  oldY: number
  boundingBox: BoundingRect
  shapes: INode[]
  nodeType: NodeType
  oldStroke: StrokeStyle
  oldLineWidth: number | undefined
  z: number
  groupRect: Rect | null
  groupHead: Rect | null
  anchor: Anchor
  parentGroup?: INodeGroup
  refresh(): void
  createAnchors(): void
  setZ(z: number): void
  removeShapeFromGroup(shape: IShape): void
  resizeNodeGroup(): void
  setEnterStyle(): void
  setOldStyle(): void
  getExportData(): IExportGroup
  setStyle(style: IExportGroupStyle): void
  active(): void
  unActive(): void
  getBoundingBox(): BoundingRect
  getAnchors(): IAnchor[]
  getAnchorByIndex(index: number): IAnchor
  setOldPosition(): void
  setCursor(type: string): void
  updatePosition(pos: number[]): void
}

class NodeGroup extends Group implements INodeGroup {
  private _settingMgr: ISettingManage
  private _viewPortMgr: IViewPortManage
  nodeType = NodeType.Group
  groupRect: Rect | null = null
  groupHead: Rect | null = null
  textContent: Text | null = null
  headLine: Line | null = null
  boundingBox: BoundingRect
  shapes: INode[]
  headHeight: number = 30 // 头部高度
  padding = 20
  selected = false
  anchors: IAnchor[] = []
  oldX: number = 0
  oldY: number = 0
  oldStroke: StrokeStyle = '#ccc'
  oldLineWidth: number | undefined = 1
  z = 1
  anchor: Anchor
  groupActiveColor: string
  parentGroup?: INodeGroup

  constructor(shapes: INode[], iocEditor: IIocEditor) {
    super()
    this._settingMgr = iocEditor._settingMgr
    this._viewPortMgr = iocEditor._viewPortMgr
    this.shapes = shapes
    const [x, y] = getMinPosition(this.shapes)
    const { width, height } = this.getBoundingRect(this.shapes)
    this.boundingBox = new BoundingRect(x, y, width, height)
    this.shapes.forEach(shape => (shape.parentGroup = this))
    this.create()
    this.anchor = new Anchor(this)
    this.anchor.bars.forEach(bar => this._viewPortMgr.addElementToViewPort(bar))
    this.anchor.refresh()
    this.groupActiveColor = this._settingMgr.get('groupActiveColor')
  }

  create() {
    this.groupRect = new Rect({
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

    this.textContent = new Text({
      style: {
        text: '新建分组',
        fill: '#333',
        fontSize: 12,
        fontFamily: 'Arial',
        padding: [6, 6]
      },
      z: this.z
    })

    this.groupHead = new Rect({
      style: {
        fill: '#fafafa',
        lineWidth: 0,
        stroke: undefined
      },
      textContent: this.textContent,
      textConfig: {
        position: 'insideLeft'
      },
      z: this.z
    })

    this.headLine = new Line({
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
    this.shapes.forEach(s => s.setZ(z + 1))
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

    this.updatePosition([x - this.padding, y - this.padding - this.headHeight])

    this.createAnchors()
    this.setOldStyle()
  }

  createAnchors() {
    this.anchors = []
    const box = this.getBoundingBox()
    this.anchors = [
      // Top anchors
      { x: box.x + box.width / 4, y: box.y, index: 1, direct: 'top' },
      { x: box.x + box.width / 2, y: box.y, index: 2, direct: 'top' },
      { x: box.x + (box.width * 3) / 4, y: box.y, index: 3, direct: 'top' },
      // Right anchors
      { x: box.x + box.width, y: box.y + box.height / 4, index: 4, direct: 'right' },
      { x: box.x + box.width, y: box.y + box.height / 2, index: 5, direct: 'right' },
      { x: box.x + box.width, y: box.y + (box.height * 3) / 4, index: 6, direct: 'right' },
      // Bottom anchors
      { x: box.x + box.width / 4, y: box.y + box.height, index: 7, direct: 'bottom' },
      { x: box.x + box.width / 2, y: box.y + box.height, index: 8, direct: 'bottom' },
      { x: box.x + (box.width * 3) / 4, y: box.y + box.height, index: 9, direct: 'bottom' },
      // Left anchors
      { x: box.x, y: box.y + box.height / 4, index: 10, direct: 'left' },
      { x: box.x, y: box.y + box.height / 2, index: 11, direct: 'left' },
      { x: box.x, y: box.y + (box.height * 3) / 4, index: 12, direct: 'left' }
    ]
  }

  getAnchorByIndex(index: number) {
    return this.anchors.filter(item => item.index == index)[0]
  }

  getAnchors() {
    return this.anchors
  }

  setCursor(type: string) {
    this.groupRect?.attr('cursor', type)
  }

  active() {
    this.selected = true
    this.anchor.show()
    this.shapes.forEach(shape => shape.unActive && shape.unActive())
    this.groupRect?.attr({
      style: {
        shadowColor: '#29b7f3',
        shadowBlur: 2
      }
    })
  }

  unActive() {
    this.selected = false
    this.anchor.hide()
    this.groupRect?.attr({
      style: {
        shadowColor: 'none',
        shadowBlur: 0
      }
    })
  }

  setOldStyle() {
    this.groupRect?.attr({
      style: {
        lineWidth: this.oldLineWidth,
        stroke: this.oldStroke
      }
    })
  }

  setEnterStyle() {
    this.groupRect!.attr({
      style: {
        lineWidth: 2,
        stroke: 'red'
      }
    })
  }

  getBoundingBox() {
    const { width, height } = this.getBoundingRect()

    return new BoundingRect(this.x, this.y, width, height)
  }

  removeShapeFromGroup(shape: IShape | INodeGroup) {
    this.shapes = this.shapes.filter(item => item !== shape)
    shape.parentGroup = undefined
  }

  resizeNodeGroup() {
    this.boundingBox = this.getBoundingRect(this.shapes)
    this.refresh() // 重新计算组的大小
    this.anchor.refresh()
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
      },
      z: this.z
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
    this.oldStroke = stroke
    this.oldLineWidth = lineWidth
  }

  setOldPosition() {
    this.oldX = this.x
    this.oldY = this.y
    this.shapes.forEach(shape => shape.setOldPosition())
  }

  updatePosition(pos: number[]) {
    this.attr('x', pos[0])
    this.attr('y', pos[1])
  }
}

export { NodeGroup }
