import { Disposable } from '@/disposable'
import { GridManage } from '@/gridManage'
import { Group } from './'

import type { ISceneDragMoveOpts, IUpdateZoomOpts } from './types'
import type {
  ITinyFlowchart,
  IDisposable,
  IGridManage,
  ISettingManage,
  ZRenderType,
  Element,
  BoundingRect
} from '@/index'

export interface IViewPortManage extends IDisposable {
  _gridMgr?: IGridManage
  setPosition(x: number, y: number): void
  getPosition(): number[]
  addSelfToZr(zr: ZRenderType): void
  removeElementFromViewPort(element: Element): void
  addElementToViewPort(element: Element): void
  getViewPort(): Group
  setScale(x: number, y: number): void
  getScale(): number[]
  getSceneWidth(): number | undefined
  getSceneHeight(): number | undefined
  getBoundingRect(includeChildren: Element[]): BoundingRect
  getZoom(): number
  mapSceneToViewPort(x: number, y: number): number[]
}

class ViewPortManage extends Disposable {
  private _viewPort: Group = new Group()
  private _tinyFlowchart: ITinyFlowchart
  private _settingMgr: ISettingManage
  private _currentZoom = 1
  _gridMgr?: IGridManage

  constructor(tinyFlowchart: ITinyFlowchart) {
    super()
    this._tinyFlowchart = tinyFlowchart
    this._settingMgr = tinyFlowchart._settingMgr

    const enableMiniMap = this._settingMgr.get('enableMiniMap')
    const enableGrid = this._settingMgr.get('enableGrid')

    if (!enableMiniMap && enableGrid) {
      this._gridMgr = new GridManage(tinyFlowchart, this)
    }

    this._tinyFlowchart.sceneDragMove$.subscribe(({ x, y }: ISceneDragMoveOpts) => {
      this.setPosition(x, y)
    })

    this._tinyFlowchart.updateZoom$.subscribe(
      ({ zoom, offsetX, offsetY, currentZoom }: IUpdateZoomOpts) => {
        this._currentZoom = currentZoom
        this.setZoom(zoom, offsetX, offsetY)
      }
    )
  }

  getViewPort(): Group {
    return this._viewPort
  }

  getBoundingRect(includeChildren: Element[]) {
    return this._viewPort.getBoundingRect(includeChildren)
  }

  setZoom(zoom: number, offsetX: number, offsetY: number) {
    const [scaleX, scaleY] = this.getScale()
    const [positionX, positionY] = this.getPosition()
    this._gridMgr?.resizePool()
    this.setScale(scaleX * zoom, scaleY * zoom)
    this.setPosition(zoom * positionX + offsetX, zoom * positionY + offsetY)
  }

  getZoom() {
    return this._currentZoom
  }

  setScale(x: number, y: number) {
    this._viewPort.attr('scaleX', x)
    this._viewPort.attr('scaleY', y)
    this._gridMgr?.setScale(x, y)
  }

  getScale() {
    return [this._viewPort.scaleX, this._viewPort.scaleY]
  }

  setPosition(x: number, y: number) {
    this._viewPort.attr('x', x)
    this._viewPort.attr('y', y)
    this._gridMgr?.setPosition(x, y)
    this._gridMgr?.drawGrid()
  }

  getPosition() {
    return [this._viewPort.x, this._viewPort.y]
  }

  addSelfToZr(zr: ZRenderType) {
    zr.add(this._viewPort)
  }

  removeElementFromViewPort(element: Element) {
    this._viewPort.remove(element)
  }

  addElementToViewPort(element: Element) {
    this._viewPort.add(element)
  }

  getSceneWidth() {
    return this._tinyFlowchart._zr.getWidth()
  }

  getSceneHeight() {
    return this._tinyFlowchart._zr.getHeight()
  }

  /**
   * 将场景坐标转换为视口坐标
   *
   * 此函数用于根据当前的位置和缩放因子，将场景中的坐标(x, y)转换为视口中的坐标
   * 它首先获取当前的坐标位置和缩放因子，然后使用这些信息将传入的场景坐标映射到视口坐标系中
   *
   * @param x 场景中的x坐标
   * @param y 场景中的y坐标
   * @returns 返回转换后的视口坐标[x, y]
   */
  mapSceneToViewPort(x: number, y: number) {
    const [positionX, positionY] = this.getPosition()
    const [scaleX, scaleY] = this.getScale()

    return [(x - positionX) / scaleX, (y - positionY) / scaleY]
  }
}

export { ViewPortManage }
