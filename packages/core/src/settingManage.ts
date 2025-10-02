import { Subject } from 'rxjs'
import { Disposable } from '@/disposable'

import type { IDisposable, ITinyFlowchart } from '@/index'

export interface ITinyFlowchartConfig {
  zoomStep: number
  zoomMax: number
  zoomMin: number
  gridStep: number
  nodeStrokeColor: string // 节点边框颜色
  nodeFillColor: string // 节点填充颜色
  nodeStrokeWidth: number // 节点边框宽度
  magneticSpacing: number // 磁吸最小吸附距离
  connectionWidth: number // 连接线宽度
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

export const defaultSettingConfig: ITinyFlowchartConfig = {
  zoomStep: 0.07,
  zoomMin: 0.3,
  zoomMax: 4,
  gridStep: 20,
  showGrid: true,
  magneticSpacing: 5,
  refPointSize: 2,
  nodeStrokeColor: '#000',
  nodeFillColor: '#fff',
  refLineColor: '#29b7f3',
  selectFrameColor: '#1971c2',
  controlFrameColor: '#29b7f3',
  connectionSelectColor: '#29b7f3',
  connectionColor: '#000',
  groupActiveColor: '#29b7f3',
  nodeStrokeWidth: 1,
  connectionWidth: 1,
  enableGrid: true,
  pasteOffset: 40
}

export interface ISettingManage extends IDisposable {
  setDefaultConfig(config: Partial<ITinyFlowchartConfig>): void
  updatedSetting$: Subject<Partial<ITinyFlowchartConfig>>
  set<K extends keyof ITinyFlowchartConfig>(key: K, value: ITinyFlowchartConfig[K]): void
  get<K extends keyof ITinyFlowchartConfig>(key: K): ITinyFlowchartConfig[K]
}

class SettingManage extends Disposable {
  private config: ITinyFlowchartConfig = defaultSettingConfig

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
