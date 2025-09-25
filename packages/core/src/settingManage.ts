import { Subject } from 'rxjs'
import { Disposable } from '@/disposable'

import type { IDisposable, ITinyFlowchart } from '@/index'

export interface ITinyFlowchartConfig {
  zoomStep: number
  zoomMax: number
  zoomMin: number
  gridStep: number
  magneticSpacing: number // 磁吸最小吸附距离
  refPointSize: number // 磁吸点大小
  refLineColor: string // 参考线的颜色
  selectFrameColor: string // 选中框的颜色
  controlFrameColor: string // 控制框的颜色
  connectionSelectColor: string // 连接线选中框的颜色
  connectionColor: string // 连接线的颜色
  groupActiveColor: string // 组选中框的颜色
  showGrid: boolean
  pasteOffset: number // 粘贴偏移量
  enableMiniMap?: boolean
  enableGrid?: boolean
  parent?: ITinyFlowchart
}

export interface ISettingManage extends IDisposable {
  setDefaultConfig(config: Partial<ITinyFlowchartConfig>): void
  updatedSetting$: Subject<Partial<ITinyFlowchartConfig>>
  set<K extends keyof ITinyFlowchartConfig>(key: K, value: ITinyFlowchartConfig[K]): void
  get<K extends keyof ITinyFlowchartConfig>(key: K): ITinyFlowchartConfig[K]
}

class SettingManage extends Disposable {
  private config: ITinyFlowchartConfig = {
    zoomStep: 0.07,
    zoomMin: 0.3,
    zoomMax: 4,
    gridStep: 20,
    showGrid: true,
    magneticSpacing: 5,
    refPointSize: 2,
    refLineColor: '#29b7f3',
    selectFrameColor: '#1971c2',
    controlFrameColor: '#29b7f3',
    connectionSelectColor: '#29b7f3',
    connectionColor: '#a3b2c0',
    groupActiveColor: '#29b7f3',
    enableGrid: true,
    pasteOffset: 40
  }

  updatedSetting$ = new Subject<Partial<ITinyFlowchartConfig>>()

  constructor() {
    super()
    this._disposables.push(this.updatedSetting$)
  }

  setDefaultConfig(config: Partial<ITinyFlowchartConfig>) {
    this.config = { ...this.config, ...config }
  }

  set<K extends keyof ITinyFlowchartConfig>(key: K, value: ITinyFlowchartConfig[K]) {
    this.config[key] = value
    this.updatedSetting$.next({ [key]: value })
  }

  get<K extends keyof ITinyFlowchartConfig>(key: K): ITinyFlowchartConfig[K] {
    return this.config[key]
  }
}

export { SettingManage }
