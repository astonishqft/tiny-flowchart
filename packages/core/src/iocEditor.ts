
import * as zrender from 'zrender'
import IDENTIFIER from './constants/identifiers'
import container from './config/iocConfig'
import { Disposable } from './disposable'
import type { ISceneManage } from './sceneManage'
import type { IShapeManage } from './shapeManage'
import type { IGridManage } from './gridManage'
import type { ISettingManage, IIocEditorConfig } from './settingManage'

export class IocEditor {
  _zr: zrender.ZRenderType
  _manageList: Disposable[] = []
  private get _sceneManage(): ISceneManage {
    return container.get<ISceneManage>(IDENTIFIER.SCENE_MANAGE)
  }

  private get _shapeManage(): IShapeManage {
    return container.get<IShapeManage>(IDENTIFIER.SHAPE_MANAGE)
  }

  private get _settingManage(): ISettingManage {
    return container.get<ISettingManage>(IDENTIFIER.SETTING_MANAGE)
  }

  private get _gridManage(): IGridManage {
    return container.get<IGridManage>(IDENTIFIER.GRID_MANAGE)
  }

  private get _viewPortManage() {
    return container.get<any>(IDENTIFIER.VIEW_PORT_MANAGE)
  }

  initZr(dom: HTMLElement): zrender.ZRenderType {
    return zrender.init(dom)
  }

  constructor(dom: HTMLElement, config: IIocEditorConfig) {
    this._settingManage.setDefaultConfig(config)
    this._zr = this.initZr(dom)
    this._sceneManage.init(this._zr)
  }

  addShape(type: string, options: { x: number, y: number }) {
    this._sceneManage.addShape(type, options)
  }

  destroy() {
    this._sceneManage.dispose()
    this._shapeManage.dispose()
    this._gridManage.dispose()
    this._viewPortManage.dispose()
    this._settingManage.dispose()
    this._zr.dispose()
  }
}
