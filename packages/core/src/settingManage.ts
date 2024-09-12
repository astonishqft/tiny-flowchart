import { injectable } from 'inversify'
import { Subject, Observable } from 'rxjs'
import { Disposable } from './disposable'
import type { IDisposable } from './disposable'

export interface IIocEditorConfig {
  zoomStep: number
  zoomMax: number
  zoomMin: number
  gridStep: number
  magneticSpacing: number // 磁吸最小吸附距离
  refPointSize: number // 磁吸点大小
  refLineColor: string // 参考线的颜色
  selectFrameColor: string // 选中框的颜色
}

export interface ISettingManage extends IDisposable {
  setDefaultConfig(config: Partial<IIocEditorConfig>): void;
  updatedSetting$: Observable<Partial<IIocEditorConfig>>
  set<K extends keyof IIocEditorConfig>(key: K, value: IIocEditorConfig[K]): void
  get<K extends keyof IIocEditorConfig>(key: K): IIocEditorConfig[K]
}

@injectable()
class SettingManage extends Disposable {
  private config: IIocEditorConfig = {
    zoomStep: 0.07,
    zoomMin: 0.3,
    zoomMax: 4,
    gridStep: 20,
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
    this.config = {...this.config, ...config }
  }

  set<K extends keyof IIocEditorConfig>(key: K, value: IIocEditorConfig[K]) {
    this.config[key] = value
    this.updatedSetting$.next({[key]: value})
  }

  get<K extends keyof IIocEditorConfig>(key: K) {
    return this.config[key]
  }
}

export { SettingManage }
