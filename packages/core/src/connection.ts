import * as zrender from 'zrender'

import type { IShape, IAnchor } from './shapes'

export interface IConnection {
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

class Connection extends zrender.Group {
  private _tempConnection: zrender.Line
  private _connectionType: ConnectionType = ConnectionType.Line
  private _line: zrender.Line | zrender.BezierCurve | zrender.Polyline | null = null
  private _controlPoint1: zrender.Circle | null = null
  private _controlPoint2: zrender.Circle | null = null
  private _controlLine1: zrender.Line | null = null
  private _controlLine2: zrender.Line | null = null
  fromNode: IShape
  toNode: IShape | null = null
  fromPoint: IAnchor | null = null
  toPoint: IAnchor | null = null
  constructor(fromNode: IShape, type: ConnectionType) {
    super()
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
      silent: true // 禁止触发事件，否则会导致拖拽，节点无法响应mouseover事件
    })

    this.fromNode = fromNode
    this._connectionType = type

    this.add(this._tempConnection)
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

  createConnection() {
    switch(this._connectionType) {
      case ConnectionType.Line:
        this._line = new zrender.Line({
          shape: {
            x1: this.fromPoint!.x,
            y1: this.fromPoint!.y,
            x2: this.toPoint!.x,
            y2: this.toPoint!.y
          },
          style: {
            lineWidth: 1,
            stroke: '#333'
          }
        })
        break
      case ConnectionType.BezierCurve:
        const [cpx1, cpy1] = this.calcControlPoint(this.fromPoint!)
        const [cpx2, cpy2] = this.calcControlPoint(this.toPoint!)

        this._line = new zrender.BezierCurve({
          shape: {
            x1: this.fromPoint!.x,
            y1: this.fromPoint!.y,
            x2: this.toPoint!.x,
            y2: this.toPoint!.y,
            cpx1,
            cpy1,
            cpx2,
            cpy2
          }
        })

        this._controlPoint1 = new zrender.Circle({
          style: {
            fill: 'red'
          },
          shape: {
            r: 4,
            cx: cpx1,
            cy: cpy1
          },
          z: 40,
          draggable: true
        })

        this._controlPoint2 = new zrender.Circle({
          style: {
            fill: 'red'
          },
          shape: {
            r: 4,
            cx: cpx2,
            cy: cpy2
          },
          z: 40,
          draggable: true
        })

        this._controlLine1 = new zrender.Line({
          style: {
            stroke: '#ccc'
          },
          shape: {
            x1: this.fromPoint!.x,
            y1: this.fromPoint!.y,
            x2: cpx1,
            y2: cpy1
          },
          z: 39
        })

        this._controlLine2 = new zrender.Line({
          style: {
            stroke: '#ccc'
          },
          shape: {
            x1: this.toPoint!.x,
            y1: this.toPoint!.y,
            x2: cpx2,
            y2: cpy2
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
        })

        this._controlPoint2.on('drag', (e: zrender.ElementEvent) => {
          const { x, y, shape: { cx, cy} } = e.target as zrender.Circle

          this._controlLine2!.attr({
            shape: {
              x2: x + cx,
              y2: y + cy
            }
          })
        })
    
        break
      case ConnectionType.OrtogonalLine:
        // this._connectionType = new zrender.Polyline({
        //   shape: {
            
        //   }
        // })
        break
      default:
        break
    }
    if (this._line) {
      this.add(this._line!)
    }
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
        break
      case ConnectionType.BezierCurve:
        const [cpx1, cpy1] = this.calcControlPoint(this.fromPoint!)
        const [cpx2, cpy2] = this.calcControlPoint(this.toPoint!);
        (this._line as zrender.BezierCurve).attr({
          shape: {
            x1: this.fromPoint!.x,
            y1: this.fromPoint!.y,
            x2: this.toPoint!.x,
            y2: this.toPoint!.y,
            cpx1,
            cpy1,
            cpx2,
            cpy2
          }
        })
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
            x2: cpx1,
            y2: cpy1
          }
        })
        this._controlLine2?.attr({
          shape: {
            x1: this.toPoint!.x,
            y1: this.toPoint!.y,
            x2: cpx2,
            y2: cpy2
          }
        })
        break
      default:
        break
    }
  }

  connect(node: IShape) {
    this.toNode = node
    this.createConnection()
  }
}

export { Connection }
