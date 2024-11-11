import * as zrender from 'zrender'
import OrthogonalConnector from '@ioceditor/orthogonal-connector'
import { ConnectionType } from './shapes'

import type {
  IAnchor,
  IConnection,
  IControlPoint,
  IExportConnectionStyle,
  IShape,
  LineDashStyle
} from './shapes'
import type { FontStyle, FontWeight } from 'zrender/lib/core/types'
import type { INodeGroup } from './shapes/nodeGroup'

class Connection extends zrender.Group implements IConnection {
  private _tempConnection: zrender.Line
  private _connectionType: ConnectionType = ConnectionType.Line
  private _line: zrender.Line | zrender.BezierCurve | zrender.Polyline | null = null
  private _controlPoint1: IControlPoint | null = null
  private _controlPoint2: IControlPoint | null = null
  private _controlLine1: zrender.Line | null = null
  private _controlLine2: zrender.Line | null = null
  private _ortogonalLinePoints: number[][] = []
  private _sceneWidth
  private _sceneHeight
  private _arrow: zrender.Polygon | null = null
  private _textPoints: number[] = []
  private _lineText: zrender.Text | null = null
  // style
  private _stroke: string = '#333'
  private _lineWidth: number = 1
  private _lineDash: LineDashStyle = [0, 0]
  private _lineTextFontSize: number = 12
  private _lineTextFontColor: string = '#333'
  private _lineTextFontStyle: FontStyle = 'normal'
  private _lineTextFontWeight: FontWeight = 'normal'

  fromNode: IShape | INodeGroup
  toNode: IShape | INodeGroup | null = null
  fromPoint: IAnchor | null = null
  toPoint: IAnchor | null = null
  constructor(
    fromNode: IShape | INodeGroup,
    type: ConnectionType,
    sceneWidth: number,
    sceneHeight: number
  ) {
    super()
    this._sceneWidth = sceneWidth
    this._sceneHeight = sceneHeight
    this._tempConnection = new zrender.Line({
      shape: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      },
      style: {
        stroke: '#228be6',
        lineWidth: 1,
        lineDash: [4, 4]
      },
      silent: true, // 禁止触发事件，否则会导致拖拽，节点无法响应mouseover事件
      z: 4
    })

    this.fromNode = fromNode
    this._connectionType = type

    this.add(this._tempConnection)
  }

  setFromNode(fromNode: IShape | INodeGroup) {
    this.fromNode = fromNode
  }

  setToNode(toNode: IShape | INodeGroup) {
    this.toNode = toNode
  }

  setFromPoint(point: IAnchor) {
    this.fromPoint = point
  }

  setToPoint(point: IAnchor) {
    this.toPoint = point
  }

  move(x: number, y: number) {
    this._tempConnection.attr({
      shape: {
        x1: this.fromPoint?.x,
        y1: this.fromPoint?.y,
        x2: x,
        y2: y
      }
    })
  }

  cancelConnect() {
    this.remove(this._tempConnection)
  }

  active() {
    if (this._controlLine1 && this._controlLine2 && this._controlPoint1 && this._controlPoint2) {
      this._controlLine1.show()
      this._controlLine2.show()
      this._controlPoint1.show()
      this._controlPoint2.show()
    }

    this._line?.setStyle({
      shadowColor: '#e85827',
      shadowBlur: 4
    })
  }

  unActive() {
    if (this._controlLine1 && this._controlLine2 && this._controlPoint1 && this._controlPoint2) {
      this._controlLine1.hide()
      this._controlLine2.hide()
      this._controlPoint1.hide()
      this._controlPoint2.hide()
    }

    this._line?.setStyle({
      shadowColor: 'none',
      shadowBlur: undefined
    })
  }

  calcControlPoint(anchorPoint: IAnchor): number[] {
    const { direct, x, y } = anchorPoint
    let point: number[] = []
    const offset = 80
    switch (direct) {
      case 'top':
        point = [x, y - offset]
        break
      case 'right':
        point = [x + offset, y]
        break
      case 'bottom':
        point = [x, y + offset]
        break
      case 'left':
        point = [x - offset, y]
        break
      default:
        break
    }

    return point
  }

  generateOrtogonalLinePath() {
    const fromNodeBoundingBox = this.fromNode.getBoundingRect()
    const fromNodeX = this.fromNode.x
    const fromNodeY = this.fromNode.y
    const toNodeBoundingBox = this.toNode!.getBoundingRect()
    const toNodeX = this.toNode!.x
    const toNodeY = this.toNode!.y

    const paths = OrthogonalConnector.connect({
      shapeA: {
        x: this.fromPoint!.x,
        y: this.fromPoint!.y,
        direction: this.fromPoint!.direct,
        boundingBox: {
          x: fromNodeX + fromNodeBoundingBox.x,
          y: fromNodeBoundingBox.y + fromNodeY,
          width: fromNodeBoundingBox.width,
          height: fromNodeBoundingBox.height
        }
      },
      shapeB: {
        x: this.toPoint!.x,
        y: this.toPoint!.y,
        direction: this.toPoint!.direct,
        boundingBox: {
          x: toNodeX + toNodeBoundingBox.x,
          y: toNodeBoundingBox.y + toNodeY,
          width: toNodeBoundingBox.width,
          height: toNodeBoundingBox.height
        }
      },
      shapeHorizontalMargin: 10,
      shapeVerticalMargin: 10,
      globalBoundsMargin: 10,
      globalBounds: {
        x: 0,
        y: 0,
        width: this._sceneWidth,
        height: this._sceneHeight
      }
    })

    this._ortogonalLinePoints = []

    paths.forEach((p: { x: number; y: number }) => {
      this._ortogonalLinePoints.push([p.x, p.y])
    })
  }

  createConnection() {
    this._arrow = new zrender.Polygon({
      style: {
        fill: '#000'
      },
      z: 40
    })

    this.add(this._arrow)
    this._lineText = new zrender.Text({
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

    switch (this._connectionType) {
      case ConnectionType.Line:
        this._line = new zrender.Line({
          style: {
            lineWidth: this._lineWidth,
            stroke: this._stroke,
            lineDash: this._lineDash
          },
          z: 4
        })
        break
      case ConnectionType.BezierCurve:
        this._line = new zrender.BezierCurve({
          style: {
            lineWidth: this._lineWidth,
            stroke: this._stroke,
            lineDash: this._lineDash
          },
          z: 4
        })

        this._controlPoint1 = new zrender.Circle({
          style: {
            fill: 'red'
          },
          shape: {
            r: 4
          },
          z: 40,
          draggable: true
        }) as IControlPoint
        this._controlPoint1.hide()
        this._controlPoint1.mark = 'controlPoint'

        this._controlPoint2 = new zrender.Circle({
          style: {
            fill: 'red'
          },
          shape: {
            r: 4
          },
          z: 40,
          draggable: true
        }) as IControlPoint
        this._controlPoint2.hide()
        this._controlPoint2.mark = 'controlPoint'

        this._controlLine1 = new zrender.Line({
          style: {
            stroke: '#ccc'
          },
          z: 39
        })
        this._controlLine1.hide()

        this._controlLine2 = new zrender.Line({
          style: {
            stroke: '#ccc'
          },
          z: 39
        })
        this._controlLine2.hide()

        this.add(this._controlPoint1)
        this.add(this._controlPoint2)
        this.add(this._controlLine1)
        this.add(this._controlLine2)

        this._controlPoint1.on('drag', (e: zrender.ElementEvent) => {
          const {
            x,
            y,
            shape: { cx, cy }
          } = e.target as zrender.Circle

          this._controlLine1?.attr({
            shape: {
              x2: x + cx,
              y2: y + cy
            }
          })
          this._line &&
            (this._line as zrender.BezierCurve).setShape({
              cpx1: x + cx,
              cpy1: y + cy
            })
          this.renderText()
        })

        this._controlPoint2.on('drag', (e: zrender.ElementEvent) => {
          const {
            x,
            y,
            shape: { cx, cy }
          } = e.target as zrender.Circle

          this._controlLine2?.attr({
            shape: {
              x2: x + cx,
              y2: y + cy
            }
          })

          this._line &&
            (this._line as zrender.BezierCurve).setShape({
              cpx2: x + cx,
              cpy2: y + cy
            })

          this.renderArrow([x + cx, y + cy])
          this.renderText()
        })

        break
      case ConnectionType.OrtogonalLine:
        this._line = new zrender.Polyline({
          style: {
            lineWidth: this._lineWidth,
            stroke: this._stroke,
            lineDash: this._lineDash
          },
          z: 4
        })
        break
      default:
        break
    }
    if (this._line) {
      this.add(this._line!)
    }

    this.refresh()
  }

  refresh() {
    switch (this._connectionType) {
      case ConnectionType.Line:
        ;(this._line as zrender.Line).attr({
          shape: {
            x1: this.fromPoint?.x,
            y1: this.fromPoint?.y,
            x2: this.toPoint?.x,
            y2: this.toPoint?.y
          }
        })

        this.renderArrow([this.fromPoint!.x, this.fromPoint!.y])
        break
      case ConnectionType.BezierCurve:
        this.setBezierCurve(
          this.fromPoint!,
          this.toPoint!,
          [this._controlPoint1!.x, this._controlPoint1!.y],
          [this._controlPoint2!.x, this._controlPoint2!.y]
        )
        break
      case ConnectionType.OrtogonalLine:
        this.generateOrtogonalLinePath()
        ;(this._line as zrender.Polyline).attr({
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

    const { x: x2, y: y2 } = this.toPoint!
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

    this._arrow!.attr({
      shape: {
        points: [p1, p2, p3]
      }
    })
  }

  connect(node: IShape | INodeGroup) {
    this.toNode = node
    this.createConnection()
  }

  // 计算正交连线的中点坐标
  calcOrtogonalLineMidPoint() {
    if (this._ortogonalLinePoints.length === 0) {
      return [this.fromPoint!.x, this.fromPoint!.y]
    }
    const accList: number[] = [0]
    const directionList = []
    for (let i = 1; i < this._ortogonalLinePoints.length; i++) {
      const p1 = this._ortogonalLinePoints[i - 1]
      const p2 = this._ortogonalLinePoints[i]
      const dist = zrender.vector.dist(p1, p2)
      accList.push(accList[i - 1] + dist)

      if (p1[0] === p2[0]) {
        directionList.push('vertical')
      } else {
        directionList.push('horizontal')
      }
    }

    const midLength = accList[accList.length - 1] / 2

    let index = 0
    for (let i = 1; i < accList.length; i++) {
      if (midLength <= accList[i]) {
        index = i
        break
      }
    }

    // 判断中点所在的线段的方向
    const currentDirection = directionList[index - 1]
    const preNode = this._ortogonalLinePoints[index - 1]
    const nextNode = this._ortogonalLinePoints[index]
    const offsetLength = midLength - accList[index - 1]

    if (currentDirection === 'horizontal') {
      const delta = nextNode[0] - preNode[0] > 0 ? 1 : -1

      return [preNode[0] + offsetLength * delta, preNode[1]]
    } else {
      const delta = nextNode[1] - preNode[1] > 0 ? 1 : -1

      return [preNode[0], preNode[1] + offsetLength * delta]
    }
  }

  renderText() {
    if (this._connectionType === ConnectionType.BezierCurve) {
      const point = this._line && (this._line as zrender.BezierCurve).pointAt(0.5)

      if (point) {
        this._textPoints = point
      }
    } else if (this._connectionType === ConnectionType.OrtogonalLine) {
      this._textPoints = this.calcOrtogonalLineMidPoint()
    } else {
      this._textPoints = [
        (this.fromPoint!.x + this.toPoint!.x) / 2,
        (this.fromPoint!.y + this.toPoint!.y) / 2
      ]
    }

    this._lineText?.setStyle({
      x: this._textPoints[0],
      y: this._textPoints[1]
    })
  }

  setLineWidth(lineWidth: number) {
    this._line?.setStyle({
      lineWidth
    })

    this._lineWidth = lineWidth
  }

  getLineWidth() {
    return this._line?.style.lineWidth
  }

  setLineColor(color: string) {
    this._line?.setStyle({
      stroke: color
    })

    this._stroke = color
  }

  getLineColor() {
    return this._line?.style.stroke as string | undefined
  }

  setLineDash(type: number[]) {
    this._line?.setStyle({
      lineDash: type
    })

    this._lineDash = type
  }

  getLineDash() {
    return (this._line?.style.lineDash as number[]) || [0, 0]
  }

  getLineType() {
    return this._connectionType
  }

  setLineType(type: ConnectionType) {
    this._connectionType = type
    this.remove(this._line!)
    this.remove(this._arrow!)
    if (this._controlPoint1) {
      this.remove(this._controlPoint1)
    }
    if (this._controlPoint2) {
      this.remove(this._controlPoint2)
    }
    if (this._controlLine1) {
      this.remove(this._controlLine1)
    }
    if (this._controlLine2) {
      this.remove(this._controlLine2)
    }
    if (this._lineText) {
      this.remove(this._lineText)
    }
    this.createConnection()
  }

  setLineTextContent(content: string) {
    this._lineText?.setStyle({
      text: content
    })
    this._lineText?.show()
  }

  getLineTextContent() {
    return this._lineText?.style.text
  }

  setLineTextFontSize(size: number | undefined) {
    this._lineText?.setStyle({
      fontSize: size
    })

    this._lineTextFontSize = size as number
  }

  getLineTextFontSize() {
    return this._lineText?.style.fontSize
  }

  setLineTextFontColor(color: string | undefined) {
    this._lineText?.setStyle({
      fill: color
    })

    this._lineTextFontColor = color as string
  }

  getLineTextFontColor() {
    return this._lineText?.style.fill
  }

  setLineFontStyle(style: FontStyle) {
    this._lineText?.setStyle({
      fontStyle: style
    })

    this._lineTextFontStyle = style
  }

  getLineFontStyle() {
    return this._lineText?.style.fontStyle
  }

  getLineFontWeight() {
    return this._lineText?.style.fontWeight
  }

  setLineFontWeight(weight: FontWeight) {
    this._lineText?.setStyle({
      fontWeight: weight
    })

    this._lineTextFontWeight = weight
  }

  getLineTextPosition() {
    return this._textPoints
  }

  getId() {
    return this.id
  }

  getConnectionType() {
    return this._connectionType
  }

  setConnectionType(type: ConnectionType) {
    this._connectionType = type
  }

  getLineText() {
    return this._lineText
  }

  getExportData() {
    const baseData = {
      type: this._connectionType,
      id: this.id,
      fromPoint: this.fromPoint!.index,
      toPoint: this.toPoint!.index,
      fromNode: this.fromNode!.id,
      toNode: this.toNode!.id,
      style: {
        lineWidth: this._line?.style.lineWidth,
        lineDash: this._line?.style.lineDash,
        stroke: this._line?.style.stroke,
        text: this._lineText?.style.text,
        fontSize: this._lineText?.style.fontSize,
        fontColor: this._lineText?.style.fill,
        fontStyle: this._lineText?.style.fontStyle,
        fontWeight: this._lineText?.style.fontWeight,
        textPosition: this._textPoints
      }
    }

    if (this._connectionType == ConnectionType.BezierCurve) {
      return {
        ...baseData,
        controlPoint1: [this._controlPoint1?.x, this._controlPoint1?.y],
        controlPoint2: [this._controlPoint2?.x, this._controlPoint2?.y],
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
    fontWeight,
    textPosition
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

    if (text) {
      this._textPoints = textPosition
      this._lineText?.show()
      this.renderText()
    } else {
      this._lineText?.hide()
    }
  }

  setControlPoint1(position: number[]) {
    this._controlPoint1?.attr({
      shape: {
        cx: position[0],
        cy: position[1]
      }
    })
  }

  setControlPoint2(position: number[]) {
    this._controlPoint2?.attr({
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

  setBezierCurve(
    fromPoint: IAnchor,
    toPoint: IAnchor,
    controlPoint1: (number | undefined)[],
    controlPoint2: (number | undefined)[]
  ) {
    const [cpx1, cpy1] = this.calcControlPoint(fromPoint)
    const [cpx2, cpy2] = this.calcControlPoint(toPoint)

    this._controlPoint1?.attr({
      shape: {
        cx: cpx1,
        cy: cpy1
      },
      x: controlPoint1[0]!,
      y: controlPoint1[1]!
    })

    this._controlPoint2?.attr({
      shape: {
        cx: cpx2,
        cy: cpy2
      },
      x: controlPoint2[0]!,
      y: controlPoint2[1]!
    })

    this._controlLine1?.attr({
      shape: {
        x1: fromPoint.x,
        y1: fromPoint.y,
        x2: cpx1 + controlPoint1[0]!,
        y2: cpy1 + controlPoint1[1]!
      }
    })

    this._controlLine2?.attr({
      shape: {
        x1: toPoint.x,
        y1: toPoint.y,
        x2: cpx2 + controlPoint2[0]!,
        y2: cpy2 + controlPoint2[1]!
      }
    })
    ;(this._line as zrender.BezierCurve).attr({
      shape: {
        x1: fromPoint!.x,
        y1: fromPoint!.y,
        x2: this.toPoint!.x,
        y2: this.toPoint!.y,
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
