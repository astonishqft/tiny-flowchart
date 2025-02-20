import { Group, Line, BezierCurve, Polyline, Polygon, Text, Circle, vector } from './'
import OrthogonalConnector from '@ioceditor/orthogonal-connector'
import { ConnectionType } from './shapes'

import type {
  IAnchor,
  IConnection,
  IControlPoint,
  IAnchorPoint,
  IExportConnectionStyle,
  INode,
  LineDashStyle,
  StrokeStyle
} from './shapes'
import type { FontStyle, FontWeight, ElementEvent } from './'
import type { IIocEditor } from './iocEditor'
import type { ISettingManage } from './settingManage'
class Connection extends Group implements IConnection {
  private _line: Line | BezierCurve | Polyline | null = null
  private _controlLine1: Line | null = null
  private _controlLine2: Line | null = null
  private _ortogonalLinePoints: number[][] = []
  private _arrow: Polygon | null = null
  private _textPoints: number[] = []
  private _lineText: Text | null = null
  // style
  private _stroke: StrokeStyle = '#333'
  private _lineWidth: number = 1
  private _lineDash: LineDashStyle = 'solid'
  private _lineTextFontSize: number = 12
  private _lineTextFontColor: string = '#333'
  private _lineTextFontStyle: FontStyle = 'normal'
  private _lineTextFontWeight: FontWeight = 'normal'
  private _iocEditor: IIocEditor
  private _settingMgr: ISettingManage
  private _connectionSelectColor: string
  private _oldStroke: StrokeStyle = '#333'
  private _oldConnectionWidth = 1

  controlPoint1: IControlPoint | null = null
  controlPoint2: IControlPoint | null = null

  fromAnchorPoint: IAnchorPoint
  toAnchorPoint: IAnchorPoint
  fromNode: INode
  toNode: INode
  fromPoint: IAnchor
  toPoint: IAnchor
  connectionType: ConnectionType = ConnectionType.Line
  selected: boolean = false
  constructor(
    iocEditor: IIocEditor,
    fromAnchorPoint: IAnchorPoint,
    toAnchorPoint: IAnchorPoint,
    type: ConnectionType
  ) {
    super()
    this._iocEditor = iocEditor
    this._settingMgr = iocEditor._settingMgr
    this._connectionSelectColor = this._settingMgr.get('connectionSelectColor')
    this.fromAnchorPoint = fromAnchorPoint
    this.toAnchorPoint = toAnchorPoint
    this.fromNode = fromAnchorPoint.node
    this.fromPoint = fromAnchorPoint.point
    this.toNode = toAnchorPoint.node
    this.toPoint = toAnchorPoint.point
    this.connectionType = type
    this.createConnection()
  }

  setFromNode(fromNode: INode) {
    this.fromNode = fromNode
  }

  setToNode(toNode: INode) {
    this.toNode = toNode
  }

  setFromPoint(point: IAnchor) {
    this.fromPoint = point
  }

  setToPoint(point: IAnchor) {
    this.toPoint = point
  }

  active() {
    this.toggleControlLines(true)
    this.setLineStyle(this._connectionSelectColor, this._lineWidth * 2)
    this.selected = true
  }

  unActive() {
    this.toggleControlLines(false)
    this.setLineStyle(this._oldStroke, this._oldConnectionWidth)
    this.selected = false
  }

  private toggleControlLines(show: boolean) {
    if (this._controlLine1 && this._controlLine2 && this.controlPoint1 && this.controlPoint2) {
      show ? this._controlLine1.show() : this._controlLine1.hide()
      show ? this._controlLine2.show() : this._controlLine2.hide()
      show ? this.controlPoint1.show() : this.controlPoint1.hide()
      show ? this.controlPoint2.show() : this.controlPoint2.hide()
    }
  }

  private setLineStyle(stroke: StrokeStyle, lineWidth: number) {
    this._line?.setStyle({ stroke, lineWidth })
    this._arrow?.setStyle({ fill: stroke })
  }

  calcControlPoint(anchorPoint: IAnchor): number[] {
    const { direct, x, y } = anchorPoint
    const offset = 80
    const directions: { [key: string]: number[] } = {
      top: [x, y - offset],
      right: [x + offset, y],
      bottom: [x, y + offset],
      left: [x - offset, y]
    }

    return directions[direct] || []
  }

  generateOrtogonalLinePath() {
    const fromNodeBoundingBox = this.fromNode.getBoundingRect()
    const fromNodeX = this.fromNode.x
    const fromNodeY = this.fromNode.y
    const toNodeBoundingBox = this.toNode.getBoundingRect()
    const toNodeX = this.toNode.x
    const toNodeY = this.toNode.y

    const paths = OrthogonalConnector.connect({
      shapeA: {
        x: this.fromPoint.x,
        y: this.fromPoint.y,
        direction: this.fromPoint.direct,
        boundingBox: {
          x: fromNodeX + fromNodeBoundingBox.x,
          y: fromNodeBoundingBox.y + fromNodeY,
          width: fromNodeBoundingBox.width,
          height: fromNodeBoundingBox.height
        }
      },
      shapeB: {
        x: this.toPoint.x,
        y: this.toPoint.y,
        direction: this.toPoint.direct,
        boundingBox: {
          x: toNodeX + toNodeBoundingBox.x,
          y: toNodeBoundingBox.y + toNodeY,
          width: toNodeBoundingBox.width,
          height: toNodeBoundingBox.height
        }
      },
      shapeHorizontalMargin: 10,
      shapeVerticalMargin: 10,
      globalBoundsMargin: 10
    })

    this._ortogonalLinePoints = []

    paths.forEach((p: { x: number; y: number }) => {
      this._ortogonalLinePoints.push([p.x, p.y])
    })
  }

  createConnection() {
    this._arrow = new Polygon({
      style: {
        fill: '#000'
      },
      z: 40
    })

    this.add(this._arrow)
    this._lineText = new Text({
      style: {
        text: this.getLineTextContent(),
        fill: this._lineTextFontColor,
        fontSize: this._lineTextFontSize,
        fontFamily: 'Arial',
        verticalAlign: 'middle',
        backgroundColor: '#fff',
        fontWeight: this._lineTextFontWeight,
        fontStyle: this._lineTextFontStyle,
        align: 'center',
        padding: [4, 4, 4, 4]
      },
      z: 50
    })

    this.getLineTextContent() ? this._lineText.show() : this._lineText.hide()
    this.add(this._lineText)

    this._oldStroke = this._stroke
    this._oldConnectionWidth = this._lineWidth

    this.createLine()
    this.refresh()

    this.refresh()
  }

  private createLine() {
    const lineStyle = {
      lineWidth: this._lineWidth,
      stroke: this._stroke,
      lineDash: this._lineDash
    }

    switch (this.connectionType) {
      case ConnectionType.Line:
        this._line = new Line({ style: lineStyle, z: 4 })
        break
      case ConnectionType.BezierCurve:
        this.createBezierCurve(lineStyle)
        break
      case ConnectionType.OrtogonalLine:
        this._line = new Polyline({ style: lineStyle, z: 4 })
        break
      default:
        break
    }

    if (this._line) {
      this.add(this._line)
    }
  }

  private createBezierCurve(lineStyle: any) {
    this._line = new BezierCurve({ style: lineStyle, z: 4 })

    this.controlPoint1 = this.createControlPoint()
    this.controlPoint2 = this.createControlPoint()
    this._controlLine1 = this.createControlLine()
    this._controlLine2 = this.createControlLine()

    this.add(this.controlPoint1)
    this.add(this.controlPoint2)
    this.add(this._controlLine1)
    this.add(this._controlLine2)

    this.setupControlPointEvents(this.controlPoint1)
    this.setupControlPointEvents(this.controlPoint2)
  }

  private createControlPoint(): IControlPoint {
    return new Circle({
      style: { fill: 'red' },
      shape: { r: 4 },
      z: 40,
      draggable: true
    }) as IControlPoint
  }

  private createControlLine(): Line {
    return new Line({ style: { stroke: '#ccc' }, z: 39 })
  }

  private setupControlPointEvents(controlPoint: IControlPoint) {
    let oldControlPoint: number[] = []

    controlPoint.on('dragstart', () => {
      oldControlPoint = [controlPoint.x, controlPoint.y]
    })

    controlPoint.on('dragend', () => {
      this._iocEditor.execute('updateControlPoint', {
        connection: this,
        controlPoint1: [this.controlPoint1!.x, this.controlPoint1!.y],
        controlPoint2: [this.controlPoint2!.x, this.controlPoint2!.y],
        oldControlPoint1: oldControlPoint,
        oldControlPoint2: [this.controlPoint2!.x, this.controlPoint2!.y]
      })
    })

    controlPoint.on('drag', (e: ElementEvent) => {
      const {
        x,
        y,
        shape: { cx, cy }
      } = e.target as Circle
      this.updateControlLine(controlPoint, x, y, cx, cy)
      this.renderText()
    })
  }

  private updateControlLine(
    controlPoint: IControlPoint,
    x: number,
    y: number,
    cx: number,
    cy: number
  ) {
    const controlLine =
      controlPoint === this.controlPoint1 ? this._controlLine1 : this._controlLine2
    controlLine?.attr({ shape: { x2: x + cx, y2: y + cy } })

    if (controlPoint === this.controlPoint1) {
      ;(this._line as BezierCurve).setShape({ cpx1: x + cx, cpy1: y + cy })
    } else {
      ;(this._line as BezierCurve).setShape({ cpx2: x + cx, cpy2: y + cy })
      this.renderArrow([x + cx, y + cy])
    }
  }

  refresh() {
    switch (this.connectionType) {
      case ConnectionType.Line:
        ;(this._line as Line).attr({
          shape: {
            x1: this.fromPoint.x,
            y1: this.fromPoint.y,
            x2: this.toPoint.x,
            y2: this.toPoint.y
          }
        })

        this.renderArrow([this.fromPoint.x, this.fromPoint.y])
        break
      case ConnectionType.BezierCurve:
        this.setBezierCurve(
          [this.controlPoint1!.x, this.controlPoint1!.y],
          [this.controlPoint2!.x, this.controlPoint2!.y]
        )
        break
      case ConnectionType.OrtogonalLine:
        this.generateOrtogonalLinePath()
        ;(this._line as Polyline).attr({
          shape: {
            points: this._ortogonalLinePoints
          }
        })

        this.renderArrow(this._ortogonalLinePoints[this._ortogonalLinePoints.length - 2])
        break
      default:
        break
    }
    this.renderText()
  }

  // 绘制连接线箭头
  renderArrow(preNode: number[]) {
    if (!preNode) return
    const arrowLength = 10
    const offsetAngle = Math.PI / 8
    const [x1, y1] = preNode

    const { x: x2, y: y2 } = this.toPoint
    const p1 = [x2, y2]

    const angle = Math.atan2(y2 - y1, x2 - x1)
    const p2 = [
      x2 - arrowLength * Math.cos(angle + offsetAngle),
      y2 - arrowLength * Math.sin(angle + offsetAngle)
    ]
    const p3 = [
      x2 - arrowLength * Math.cos(angle - offsetAngle),
      y2 - arrowLength * Math.sin(angle - offsetAngle)
    ]

    this._arrow?.attr({ shape: { points: [p1, p2, p3] } })
  }

  // 计算正交连线的中点坐标
  calcOrtogonalLineMidPoint() {
    if (this._ortogonalLinePoints.length === 0) {
      return [this.fromPoint.x, this.fromPoint.y]
    }

    const accList: number[] = [0]
    const directionList: string[] = []
    for (let i = 1; i < this._ortogonalLinePoints.length; i++) {
      const p1 = this._ortogonalLinePoints[i - 1]
      const p2 = this._ortogonalLinePoints[i]
      const dist = vector.dist(p1, p2)
      accList.push(accList[i - 1] + dist)
      directionList.push(p1[0] === p2[0] ? 'vertical' : 'horizontal')
    }

    const midLength = accList[accList.length - 1] / 2
    const index = accList.findIndex((length, i) => midLength <= length && i > 0)

    const currentDirection = directionList[index - 1]
    const preNode = this._ortogonalLinePoints[index - 1]
    const nextNode = this._ortogonalLinePoints[index]
    const offsetLength = midLength - accList[index - 1]

    return currentDirection === 'horizontal'
      ? [preNode[0] + offsetLength * (nextNode[0] - preNode[0] > 0 ? 1 : -1), preNode[1]]
      : [preNode[0], preNode[1] + offsetLength * (nextNode[1] - preNode[1] > 0 ? 1 : -1)]
  }

  renderText() {
    if (this.connectionType === ConnectionType.BezierCurve) {
      const point = this._line && (this._line as BezierCurve).pointAt(0.5)
      if (point) this._textPoints = point
    } else if (this.connectionType === ConnectionType.OrtogonalLine) {
      this._textPoints = this.calcOrtogonalLineMidPoint()
    } else {
      this._textPoints = [
        (this.fromPoint.x + this.toPoint.x) / 2,
        (this.fromPoint.y + this.toPoint.y) / 2
      ]
    }

    this._lineText?.setStyle({ x: this._textPoints[0], y: this._textPoints[1] })
  }

  getLineWidth() {
    return this._line?.style.lineWidth
  }

  getLineColor() {
    return this._line?.style.stroke as string | undefined
  }

  getLineDash() {
    return (this._line?.style.lineDash as number[]) || 'solid'
  }

  getLineType() {
    return this.connectionType
  }

  setConnectionType(type: ConnectionType) {
    this.connectionType = type
    const style = { ...this.getExportData().style }
    this.remove(this._line!)
    this.remove(this._arrow!)
    this.controlPoint1 && this.remove(this.controlPoint1)
    this.controlPoint2 && this.remove(this.controlPoint2)
    this._controlLine1 && this.remove(this._controlLine1)
    this._controlLine2 && this.remove(this._controlLine2)
    this._lineText && this.remove(this._lineText)
    this.createConnection()
    this.setStyle(style)
  }

  getLineTextContent() {
    return this._lineText?.style.text
  }

  getLineTextFontSize() {
    return this._lineText?.style.fontSize
  }

  getLineTextFontColor() {
    return this._lineText?.style.fill
  }

  getLineFontStyle() {
    return this._lineText?.style.fontStyle
  }

  getLineFontWeight() {
    return this._lineText?.style.fontWeight
  }

  getId() {
    return this.id
  }

  getConnectionType() {
    return this.connectionType
  }

  getLineText() {
    return this._lineText
  }

  getExportData() {
    const baseData = {
      type: this.connectionType,
      id: this.id,
      fromPoint: this.fromPoint.index,
      toPoint: this.toPoint.index,
      fromNode: this.fromNode.id,
      toNode: this.toNode.id,
      style: {
        lineWidth: this._line?.style.lineWidth,
        lineDash: this._line?.style.lineDash,
        stroke: this._line?.style.stroke,
        text: this._lineText?.style.text,
        fontSize: this._lineText?.style.fontSize,
        fontColor: this._lineText?.style.fill,
        fontStyle: this._lineText?.style.fontStyle,
        fontWeight: this._lineText?.style.fontWeight
      }
    }

    if (this.connectionType == ConnectionType.BezierCurve) {
      return {
        ...baseData,
        controlPoint1: [this.controlPoint1?.x, this.controlPoint1?.y],
        controlPoint2: [this.controlPoint2?.x, this.controlPoint2?.y],
        controlLine1: [
          this._controlLine1?.shape.x1,
          this._controlLine1?.shape.y1,
          this._controlLine1?.shape.x2,
          this._controlLine1?.shape.y2
        ],
        controlLine2: [
          this._controlLine2?.shape.x1,
          this._controlLine2?.shape.y1,
          this._controlLine2?.shape.x2,
          this._controlLine2?.shape.y2
        ]
      }
    }

    return baseData
  }

  setStyle({
    stroke,
    lineWidth,
    lineDash,
    text,
    fontSize,
    fontColor,
    fontStyle,
    fontWeight
  }: IExportConnectionStyle) {
    this._line?.setStyle({
      stroke,
      lineWidth,
      lineDash
    })
    this._lineText?.setStyle({
      text,
      fontSize,
      fill: fontColor,
      fontStyle,
      fontWeight
    })

    this._arrow?.setStyle({
      fill: stroke
    })

    if (text) {
      this._lineText?.show()
      this.renderText()
    } else {
      this._lineText?.hide()
    }

    this._oldStroke = stroke
    this._oldConnectionWidth = lineWidth || 1
    this._lineWidth = lineWidth || 1
    this._stroke = stroke
  }

  setControlPoint1(position: number[]) {
    this.controlPoint1?.attr({
      shape: {
        cx: position[0],
        cy: position[1]
      }
    })
  }

  setControlPoint2(position: number[]) {
    this.controlPoint2?.attr({
      shape: {
        cx: position[0],
        cy: position[1]
      }
    })
  }

  setControlLine1(position: number[]) {
    this._controlLine1?.attr({
      shape: {
        x1: position[0],
        y1: position[1],
        x2: position[2],
        y2: position[3]
      }
    })
  }

  setControlLine2(position: number[]) {
    this._controlLine2?.attr({
      shape: {
        x1: position[0],
        y1: position[1],
        x2: position[2],
        y2: position[3]
      }
    })
  }

  setBezierCurve(controlPoint1: (number | undefined)[], controlPoint2: (number | undefined)[]) {
    const [cpx1, cpy1] = this.calcControlPoint(this.fromPoint)
    const [cpx2, cpy2] = this.calcControlPoint(this.toPoint)

    this.controlPoint1?.attr({
      shape: {
        cx: cpx1,
        cy: cpy1
      },
      x: controlPoint1[0]!,
      y: controlPoint1[1]!
    })

    this.controlPoint2?.attr({
      shape: {
        cx: cpx2,
        cy: cpy2
      },
      x: controlPoint2[0]!,
      y: controlPoint2[1]!
    })

    this._controlLine1?.attr({
      shape: {
        x1: this.fromPoint.x,
        y1: this.fromPoint.y,
        x2: cpx1 + controlPoint1[0]!,
        y2: cpy1 + controlPoint1[1]!
      }
    })

    this._controlLine2?.attr({
      shape: {
        x1: this.toPoint.x,
        y1: this.toPoint.y,
        x2: cpx2 + controlPoint2[0]!,
        y2: cpy2 + controlPoint2[1]!
      }
    })
    ;(this._line as BezierCurve).attr({
      shape: {
        x1: this.fromPoint.x,
        y1: this.fromPoint.y,
        x2: this.toPoint.x,
        y2: this.toPoint.y,
        cpx1: cpx1 + controlPoint1[0]!,
        cpy1: cpy1 + controlPoint1[1]!,
        cpx2: cpx2 + controlPoint2[0]!,
        cpy2: cpy2 + controlPoint2[1]!
      }
    })

    this.renderArrow([cpx2 + controlPoint2[0]!, cpy2 + controlPoint2[1]!])
  }
}

export { Connection }
