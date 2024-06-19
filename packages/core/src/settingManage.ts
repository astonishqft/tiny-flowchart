import { injectable } from 'inversify'
import { Subject, Observable } from 'rxjs'
import { Disposable } from './disposable'
import type { IDisposable } from './disposable'

export interface IIocEditorConfig {
  zoomStep: number
  zoomMax: number
  zoomMin: number
  gridStep: number
}

export interface ISettingManage extends IDisposable {
  setDefaultConfig(config: IIocEditorConfig): void;
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
    gridStep: 20 
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
