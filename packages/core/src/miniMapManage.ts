import * as zrender from 'zrender'
import { IocEditor } from './iocEditor'
import { Disposable } from './disposable'

import type { IDisposable } from './disposable'
import type { IStorageManage } from './storageManage'
import type { IViewPortManage } from './viewPortManage'
import type { ISceneDragMoveOpts, IUpdateZoomOpts } from './types'

import type { IExportData } from './shapes'

export interface IMiniMapManage extends IDisposable {
  refreshMap(data: IExportData): void
  getMiniMapFramePosition(): number[]
  updateMiniMapFramePosition(offsetX: number, offsetY: number): void
  updateOldPosition(): void
  getScaleRatio(): number
  getZoomScale(): number
}

class MiniMapManage extends Disposable implements IMiniMapManage {
  private _iocEditor: IocEditor
  private _parentIocEditor: IocEditor
  private _storageMgr: IStorageManage
  private _viewPortMgr: IViewPortManage
  private _containerWidth: number = 0
  private _containerHeight: number = 0
  private _containerRatio: number = 1
  private _scaleRatio = 1

  private _centerX = 0
  private _centerY = 0

  private _oldMapFrameLeft = 0
  private _oldMapFrameTop = 0

  private _miniMapFrame: zrender.Rect
  constructor(iocEditor: IocEditor, parentIocEditor: IocEditor) {
    super()
    this._iocEditor = iocEditor
    this._parentIocEditor = parentIocEditor
    this._storageMgr = iocEditor._storageMgr
    this._viewPortMgr = iocEditor._viewPortMgr

    this._containerWidth = this._viewPortMgr.getSceneWidth()
    this._containerHeight = this._viewPortMgr.getSceneHeight()

    this._containerRatio = this._containerWidth / this._containerHeight

    this._miniMapFrame = new zrender.Rect({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      style: {
        fill: '#30303033',
        stroke: 'blue'
      },
      z: 10000
    })

    this._iocEditor._zr.add(this._miniMapFrame)

    this._parentIocEditor.sceneDragMove$.subscribe(({ offsetX, offsetY }: ISceneDragMoveOpts) => {
      const scale = this.getMiniMapFrameScale()
      this.updateMiniMapFramePosition(
        this._oldMapFrameLeft - offsetX * this._scaleRatio * scale,
        this._oldMapFrameTop - offsetY * this._scaleRatio * scale
      )
    })

    this._parentIocEditor.sceneDragEnd$.subscribe(() => {
      this.updateOldPosition()
    })

    this._parentIocEditor.updateZoom$.subscribe(({ zoom }: IUpdateZoomOpts) => {
      const offsetX = this._centerX * (1 - zoom)
      const offsetY = this._centerY * (1 - zoom)

      const oldScale = this.getMiniMapFrameScale()
      const [oldX, oldY] = this.getMiniMapFramePosition()

      this.updateMiniMapFrameScale(oldScale / zoom)
      this.updateMiniMapFramePosition(oldX / zoom - offsetX / zoom, oldY / zoom - offsetY / zoom)

      this.updateOldPosition()
    })
  }

  updateMiniMapFramePosition(x: number, y: number) {
    this._miniMapFrame.attr('x', x)
    this._miniMapFrame.attr('y', y)
  }

  updateMiniMapFrameScale(scale: number) {
    this._miniMapFrame.attr('scaleX', scale)
    this._miniMapFrame.attr('scaleY', scale)
  }

  setMiniMapFrameSize(width: number, height: number) {
    this._miniMapFrame.attr('shape', { width, height })
  }

  getMiniMapFrameScale() {
    return this._miniMapFrame.scaleX
  }

  getMiniMapFramePosition() {
    return [this._miniMapFrame.x, this._miniMapFrame.y]
  }

  getScaleRatio() {
    return this._scaleRatio
  }

  getZoomScale() {
    return this.getMiniMapFrameScale()
  }

  refreshMap(data: IExportData) {
    this._iocEditor.initFlowChart(data)
    const { x, y, width, height } = this._viewPortMgr.getBoundingRect([
      ...this._storageMgr.getNodes(),
      ...this._storageMgr.getConnections()
    ])

    const miniMapRatio = width / height

    if (miniMapRatio > this._containerRatio) {
      this._scaleRatio = this._containerWidth / width
    } else {
      this._scaleRatio = this._containerHeight / height
    }

    const sceneWidth = this._parentIocEditor!._viewPortMgr.getSceneWidth()
    const sceneHeight = this._parentIocEditor!._viewPortMgr.getSceneHeight()

    const left = -x * this._scaleRatio
    const top = -y * this._scaleRatio
    const scale = this.getMiniMapFrameScale() || 1
    this._viewPortMgr.getViewPort().attr('x', left)
    this._viewPortMgr.getViewPort().attr('y', top)
    this._viewPortMgr.getViewPort().attr('scaleX', this._scaleRatio)
    this._viewPortMgr.getViewPort().attr('scaleY', this._scaleRatio)

    const { x: pX, y: pY } = this._parentIocEditor._viewPortMgr.getViewPort()

    this.setMiniMapFrameSize(sceneWidth * this._scaleRatio, sceneHeight * this._scaleRatio)
    this.updateMiniMapFramePosition(
      left - pX * this._scaleRatio * scale,
      top - pY * this._scaleRatio * scale
    )

    this.updateOldPosition()
  }

  updateOldPosition() {
    const sceneWidth = this._parentIocEditor!._viewPortMgr.getSceneWidth()
    const sceneHeight = this._parentIocEditor!._viewPortMgr.getSceneHeight()
    const scale = this.getMiniMapFrameScale() || 1
    this._oldMapFrameLeft = this.getMiniMapFramePosition()[0]
    this._oldMapFrameTop = this.getMiniMapFramePosition()[1]
    this._centerX = this._oldMapFrameLeft + ((sceneWidth * this._scaleRatio) / 2) * scale
    this._centerY = this._oldMapFrameTop + ((sceneHeight * this._scaleRatio) / 2) * scale
  }
}

export { MiniMapManage }
