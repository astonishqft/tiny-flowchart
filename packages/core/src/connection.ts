import * as zrender from 'zrender'

import type { IAnchorPoint } from './shapes'

export interface IConnection {
  addSelfToViewPort(viewPort: zrender.Group): void
  cancel(): void
  move(x: number, y: number): void
  connect(anchor: IAnchorPoint): void
}

class Connection extends zrender.Group {
  private _tempConnection: zrender.Line
  private _fromAnchor: IAnchorPoint
  private _toAnchor: IAnchorPoint
  constructor(fromAnchor: IAnchorPoint) {
    super()
    this._tempConnection = new zrender.Line({
      shape: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
      },
      style: {
        stroke: '#000',
        lineWidth: 1
      },
      silent: true // 禁止触发事件，否则会导致拖拽，节点无法响应mouseover事件
    })

    this._fromAnchor = fromAnchor

    this.add(this._tempConnection)
  }

  move(x: number, y: number) {
    this._tempConnection.attr({
      shape: {
        x1: this._fromAnchor.anch.point.x,
        y1: this._fromAnchor.anch.point.y,
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

  connect(anchor: IAnchorPoint) {
    this._toAnchor = anchor
  }
}

export { Connection }
