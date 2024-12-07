import { Subject } from 'rxjs'
import { Disposable } from './disposable'
import type { IDisposable } from './disposable'
import { IocEditor } from './iocEditor'

export interface IIocEditorConfig {
  zoomStep: number
  zoomMax: number
  zoomMin: number
  gridStep: number
  magneticSpacing: number // 磁吸最小吸附距离
  refPointSize: number // 磁吸点大小
  refLineColor: string // 参考线的颜色
  selectFrameColor: string // 选中框的颜色
  showGrid: boolean
  enableMiniMap?: boolean
  parent?: IocEditor
}

export interface ISettingManage extends IDisposable {
  setDefaultConfig(config: Partial<IIocEditorConfig>): void
  updatedSetting$: Subject<Partial<IIocEditorConfig>>
  set<K extends keyof IIocEditorConfig>(key: K, value: IIocEditorConfig[K]): void
  get<K extends keyof IIocEditorConfig>(key: K): IIocEditorConfig[K]
}

class SettingManage extends Disposable {
  private config: IIocEditorConfig = {
    zoomStep: 0.07,
    zoomMin: 0.3,
    zoomMax: 4,
    gridStep: 20,
    showGrid: true,
    magneticSpacing: 5,
    refPointSize: 2,
    refLineColor: '#fa5252',
    selectFrameColor: '#1971c2'
  }
  updatedSetting$ = new Subject<Partial<IIocEditorConfig>>()
  constructor() {
    super()
    this._disposables.push(this.updatedSetting$)
  }

  setDefaultConfig(config: Partial<IIocEditorConfig>) {
    this.config = { ...this.config, ...config }
  }

  set<K extends keyof IIocEditorConfig>(key: K, value: IIocEditorConfig[K]) {
    this.config[key] = value
    this.updatedSetting$.next({ [key]: value })
  }

  get<K extends keyof IIocEditorConfig>(key: K) {
    return this.config[key]
  }
}

export { SettingManage }
