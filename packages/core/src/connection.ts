import * as zrender from 'zrender'
import OrthogonalConnector from '@ioceditor/orthogonal-connector'
import type { IShape, IAnchor } from './shapes'

export interface IConnection extends zrender.Group {
  fromNode: IShape
  toNode: IShape | null
  fromPoint: IAnchor | null
  toPoint: IAnchor | null
  addSelfToViewPort(viewPort: zrender.Group): void
  cancel(): void
  move(x: number, y: number): void
  connect(node: IShape): void
  setFromPoint(point: IAnchor): void
  setToPoint(point: IAnchor): void
  refresh(): void
}

export enum ConnectionType {
  Line,
  OrtogonalLine,
  BezierCurve
}

export type IControlPoint = zrender.Circle & {
  mark: string
}

class Connection extends zrender.Group {
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
  fromNode: IShape
  toNode: IShape | null = null
  fromPoint: IAnchor | null = null
  toPoint: IAnchor | null = null
  constructor(fromNode: IShape, type: ConnectionType, sceneWidth: number, sceneHeight: number) {
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

  setFromNode(fromNode: IShape) {
    this.fromNode = fromNode
  }

  setToNode(toNode: IShape) {
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
        x1: this.fromPoint!.x,
        y1: this.fromPoint!.y,
        x2: x,
        y2: y
      }
    })
  }

  addSelfToViewPort(viewPort: zrender.Group) {
    viewPort.add(this)
  }

  cancel() {
    this.remove(this._tempConnection)
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
      globalBounds: { x: 0, y: 0, width: this._sceneWidth, height: this._sceneHeight }
    })

    this._ortogonalLinePoints = []

    paths.forEach((p: { x: number, y: number }) => {
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
    switch(this._connectionType) {
      case ConnectionType.Line:
        this._line = new zrender.Line({
          style: {
            lineWidth: 1,
            stroke: '#333'
          },
          z: 4
        })
        break
      case ConnectionType.BezierCurve:
        this._line = new zrender.BezierCurve({
          style: {
            lineWidth: 1,
            stroke: '#333'
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
        this._controlPoint2.mark = 'controlPoint'

        this._controlLine1 = new zrender.Line({
          style: {
            stroke: '#ccc'
          },
          z: 39
        })

        this._controlLine2 = new zrender.Line({
          style: {
            stroke: '#ccc'
          },
          z: 39
        })

        this.add(this._controlPoint1)
        this.add(this._controlPoint2)
        this.add(this._controlLine1)
        this.add(this._controlLine2)

        this._controlPoint1.on('drag', (e: zrender.ElementEvent) => {
          const { x, y, shape: { cx, cy} } = e.target as zrender.Circle

          this._controlLine1!.attr({
            shape: {
              x2: x + cx,
              y2: y + cy
            }
          })
          this._line && (this._line as zrender.BezierCurve).setShape({
            cpx1: x + cx,
            cpy1: y + cy
          })
        })

        this._controlPoint2.on('drag', (e: zrender.ElementEvent) => {
          const { x, y, shape: { cx, cy} } = e.target as zrender.Circle

          this._controlLine2!.attr({
            shape: {
              x2: x + cx,
              y2: y + cy
            }
          })

          this._line && (this._line as zrender.BezierCurve).setShape({
            cpx2: x + cx,
            cpy2: y + cy
          })

          this.renderArrow([x + cx, y + cy])
        })

        break
      case ConnectionType.OrtogonalLine:
        this._line = new zrender.Polyline({
          style: {
            lineWidth: 1,
            stroke: '#333'
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
        (this._line as zrender.Line).attr({
          shape: {
            x1: this.fromPoint!.x,
            y1: this.fromPoint!.y,
            x2: this.toPoint!.x,
            y2: this.toPoint!.y
          }
        })

        this.renderArrow([this.fromPoint!.x, this.fromPoint!.y])
        break
      case ConnectionType.BezierCurve:
        const [cpx1, cpy1] = this.calcControlPoint(this.fromPoint!)
        const [cpx2, cpy2] = this.calcControlPoint(this.toPoint!)

        this._controlPoint1!.attr({
          shape: {
            cx: cpx1,
            cy: cpy1
          }
        })
        this._controlPoint2!.attr({
          shape: {
            cx: cpx2,
            cy: cpy2
          }
        })
        this._controlLine1?.attr({
          shape: {
            x1: this.fromPoint!.x,
            y1: this.fromPoint!.y,
            x2: cpx1+this._controlPoint1!.x,
            y2: cpy1+this._controlPoint1!.y
          }
        })
        this._controlLine2?.attr({
          shape: {
            x1: this.toPoint!.x,
            y1: this.toPoint!.y,
            x2: cpx2+this._controlPoint2!.x,
            y2: cpy2+this._controlPoint2!.y
          }
        });
        (this._line as zrender.BezierCurve).attr({
          shape: {
            x1: this.fromPoint!.x,
            y1: this.fromPoint!.y,
            x2: this.toPoint!.x,
            y2: this.toPoint!.y,
            cpx1: cpx1 + this._controlPoint1!.x,
            cpy1: cpy1 + this._controlPoint1!.y,
            cpx2: cpx2 + this._controlPoint2!.x,
            cpy2: cpy2 + this._controlPoint2!.y
          }
        })

        this.renderArrow([cpx2 + this._controlPoint2!.x, cpy2 + this._controlPoint2!.y])
        break
      case ConnectionType.OrtogonalLine:
        this.generateOrtogonalLinePath();
        (this._line as zrender.Polyline).attr({
          shape: {
            points: this._ortogonalLinePoints
          }
        })

        this.renderArrow(this._ortogonalLinePoints[this._ortogonalLinePoints.length - 2])
        break
      default:
        break
    }
  }

  // 绘制连接线箭头
  renderArrow(preNode: number[]) {
    if (!preNode) return
    const arrowLength = 10
    const offsetAngle = Math.PI / 8
    const [x1 , y1] = preNode
  
    const { x: x2, y: y2 } = this.toPoint!
    const p1 = [x2, y2]
  
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const p2 = [x2 - arrowLength * Math.cos(angle + offsetAngle), y2 - arrowLength * Math.sin(angle + offsetAngle)]
    const p3 = [x2 - arrowLength * Math.cos(angle - offsetAngle), y2 - arrowLength * Math.sin(angle - offsetAngle)]
  
    this._arrow!.attr({
      shape: {
        points: [p1, p2, p3]
      }
    })
  }

  connect(node: IShape) {
    this.toNode = node
    this.createConnection()
  }
}

export { Connection }
