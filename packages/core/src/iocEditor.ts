

import IDENTIFIER from './constants/identifiers'
import container from './config/ioc_config'
import * as zrender from 'zrender'
import type { ILayerManage } from './layerManage'
import type { IShapeManage } from './shapeManage'
import type { ISettingManage, IIocEditorConfig } from './settingManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IGridManage } from './gridManage'
import { Disposable } from './disposable'

export class IocEditor {
  _zr: zrender.ZRenderType
  _manageList: Disposable[] = []
  private get _layer(): ILayerManage {
    return container.get<ILayerManage>(IDENTIFIER.LAYER_MANAGE)
  }

  private get _shapeManage(): IShapeManage {
    return container.get<IShapeManage>(IDENTIFIER.SHAPE_MANAGE)
  }

  private get _settingManage(): ISettingManage {
    return container.get<ISettingManage>(IDENTIFIER.SETTING_MANAGE)
  }

  private get _dragFrameManage(): IDragFrameManage {
    return container.get<IDragFrameManage>(IDENTIFIER.DRAG_FRAME_MANAGE)
  }

  private get _gridManage(): IGridManage {
    return container.get<IGridManage>(IDENTIFIER.GRID_MANAGE)
  }

  constructor(dom: HTMLElement, config: IIocEditorConfig) {
    this._zr = this._layer.initZrender(dom)
    this._settingManage.setDefaultConfig(config) 
    this._dragFrameManage.addSelfToLayer(this._zr)
    this._gridManage.initGrid(this._layer)

    this._manageList.push(this._shapeManage, this._settingManage, this._dragFrameManage, this._gridManage)
  }

  addShape(type: string, options: { x: number, y: number }) {
    this._shapeManage.addShape(type, options)
  }

  destroy() {
    this._manageList.forEach(manage => manage.dispose())
  }
}
