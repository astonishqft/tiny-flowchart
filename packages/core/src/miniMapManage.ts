import { Rect } from '@/index'
import { Disposable } from './disposable'

import type {
  Element,
  IDisposable,
  IStorageManage,
  IViewPortManage,
  IExportData,
  IIocEditor
} from '@/index'
import type { ISceneDragMoveOpts, IUpdateZoomOpts } from './types'

export interface IMiniMapManage extends IDisposable {
  refreshMap(data: IExportData): void
  getMiniMapFramePosition(): number[]
  updateMiniMapFramePosition(offsetX: number, offsetY: number): void
  updateOldPosition(): void
  getScaleRatio(): number
  getZoomScale(): number
}

class MiniMapManage extends Disposable implements IMiniMapManage {
  private _iocEditor: IIocEditor
  private _parentIocEditor: IIocEditor
  private _storageMgr: IStorageManage
  private _viewPortMgr: IViewPortManage
  private _containerWidth: number
  private _containerHeight: number
  private _scaleRatio: number = 1

  private _centerX: number = 0
  private _centerY: number = 0

  private _oldMapFrameLeft: number = 0
  private _oldMapFrameTop: number = 0

  private _miniMapFrame: Rect

  constructor(iocEditor: IIocEditor, parentIocEditor: IIocEditor) {
    super()
    this._iocEditor = iocEditor
    this._parentIocEditor = parentIocEditor
    this._storageMgr = iocEditor._storageMgr
    this._viewPortMgr = iocEditor._viewPortMgr

    this._containerWidth = this._viewPortMgr.getSceneWidth() || window.innerWidth
    this._containerHeight = this._viewPortMgr.getSceneHeight() || window.innerHeight

    this._miniMapFrame = new Rect({
      shape: { x: 0, y: 0, width: 0, height: 0 },
      style: {
        fill: '#30303033',
        stroke: 'blue',
        strokeNoScale: true
      },
      z: 10000
    })

    this._iocEditor._zr.add(this._miniMapFrame)

    this.initEventSubscriptions()
  }

  private initEventSubscriptions() {
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
    this._miniMapFrame.attr({ x, y })
  }

  updateMiniMapFrameScale(scale: number) {
    this._miniMapFrame.attr({ scaleX: scale, scaleY: scale })
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

    this._scaleRatio = Math.max(this._containerWidth / width, this._containerHeight / height)

    const sceneWidth = this._parentIocEditor._viewPortMgr.getSceneWidth() || window.innerWidth
    const sceneHeight = this._parentIocEditor._viewPortMgr.getSceneHeight() || window.innerHeight

    const left = -x * this._scaleRatio
    const top = -y * this._scaleRatio
    const scale = this.getMiniMapFrameScale() || 1

    this._viewPortMgr.getViewPort().attr({
      x: left,
      y: top,
      scaleX: this._scaleRatio,
      scaleY: this._scaleRatio
    })

    const { x: pX, y: pY } = this._parentIocEditor._viewPortMgr.getViewPort()

    this.setMiniMapFrameSize(sceneWidth * this._scaleRatio, sceneHeight * this._scaleRatio)
    this.updateMiniMapFramePosition(
      left - pX * this._scaleRatio * scale,
      top - pY * this._scaleRatio * scale
    )

    this.updateOldPosition()
    this.setNodeFontSize()
  }

  setNodeFontSize() {
    const updateFontSize = (shape: Element) => {
      const textContent = shape.getTextContent()
      if (textContent) {
        textContent.setStyle({
          fontSize: (textContent.style.fontSize as number) * this._scaleRatio
        })
      }
    }

    this._storageMgr.getShapes().forEach(updateFontSize)
    this._storageMgr.getGroups().forEach(group => {
      const groupHead = group.groupHead
      if (groupHead) {
        updateFontSize(groupHead)
      }
    })
  }

  updateOldPosition() {
    const sceneWidth = this._parentIocEditor._viewPortMgr.getSceneWidth() || window.innerWidth
    const sceneHeight = this._parentIocEditor._viewPortMgr.getSceneHeight() || window.innerHeight
    const scale = this.getMiniMapFrameScale() || 1
    this._oldMapFrameLeft = this.getMiniMapFramePosition()[0]
    this._oldMapFrameTop = this.getMiniMapFramePosition()[1]
    this._centerX = this._oldMapFrameLeft + ((sceneWidth * this._scaleRatio) / 2) * scale
    this._centerY = this._oldMapFrameTop + ((sceneHeight * this._scaleRatio) / 2) * scale
  }
}

export { MiniMapManage }
