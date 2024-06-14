import * as zrender from 'zrender'
import { injectable } from 'inversify'

export interface IDragFrameManage {
  addSelfToLayer(zr: zrender.ZRenderType): void
}

@injectable()
class DragFrameManage {
  constructor() {
 
  }

  addSelfToLayer(zr: zrender. ZRenderType) {
    const frame = new zrender.Rect({
      shape: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      },
      style: {
        fill: 'red'
      }
    })
    zr.add(frame) 
  }
}

export { DragFrameManage }
