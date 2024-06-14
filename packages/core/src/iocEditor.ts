

import IDENTIFIER from './constants/identifiers'
import container from './config/ioc_config'
import * as zrender from 'zrender'
import type { IIocEditorConfig } from './types/interfaces/i-ioc-editor-config'
import type { ILayerManage } from './layerManage'
import type { IShapeManage } from './shapeManage'
import type { IEventManage } from './eventManage'
import type { IDragFrameManage } from './dragFrameManage'

export class IocEditor {
  _zr: zrender.ZRenderType
  private get _layer(): ILayerManage {
    return container.get<ILayerManage>(IDENTIFIER.LAYER_MANAGE)
  }

  private get _shapeManage(): IShapeManage {
    return container.get<IShapeManage>(IDENTIFIER.SHAPE_MANAGE)
  }

  private get _eventManage(): IEventManage {
    return container.get<IEventManage>(IDENTIFIER.EVENT_MANAGE)
  }

  private get _dragFrameManage(): IDragFrameManage {
    return container.get<IDragFrameManage>(IDENTIFIER.DRAG_FRAME_MANAGE)
  }

  constructor(config: IIocEditorConfig) {
    this._zr = this._layer.initZrender(config.container)
    this._eventManage.initEvent()
    this._dragFrameManage.addSelfToLayer(this._zr)
  }

  addShape(type: string, options: { x: number, y: number }) {
    this._shapeManage.addShape(type, options)
  }

  destroy() {
    this._shapeManage.destroy()
  }
}
