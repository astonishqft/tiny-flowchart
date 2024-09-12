
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
  private get _sceneMgr(): ISceneManage {
    return container.get<ISceneManage>(IDENTIFIER.SCENE_MANAGE)
  }

  private get _shapeMgr(): IShapeManage {
    return container.get<IShapeManage>(IDENTIFIER.SHAPE_MANAGE)
  }

  private get _settingMgr(): ISettingManage {
    return container.get<ISettingManage>(IDENTIFIER.SETTING_MANAGE)
  }

  private get _gridMgr(): IGridManage {
    return container.get<IGridManage>(IDENTIFIER.GRID_MANAGE)
  }

  private get _viewPortMgr() {
    return container.get<any>(IDENTIFIER.VIEW_PORT_MANAGE)
  }

  initZr(dom: HTMLElement): zrender.ZRenderType {
    return zrender.init(dom)
  }

  constructor(dom: HTMLElement, config: Partial<IIocEditorConfig>) {
    this._settingMgr.setDefaultConfig(config)
    this._zr = this.initZr(dom)
    this._sceneMgr.init(this._zr)
  }

  addShape(type: string, options: { x: number, y: number }) {
    this._sceneMgr.addShape(type, options)
  }

  destroy() {
    this._sceneMgr.dispose()
    this._shapeMgr.dispose()
    this._gridMgr.dispose()
    this._viewPortMgr.dispose()
    this._settingMgr.dispose()
    this._zr.dispose()
  }
}
