import { Rect } from '@/index'
import { Disposable } from './disposable'

import type {
  Element,
  IDisposable,
  IStorageManage,
  IViewPortManage,
  IExportData,
  ITinyFlowchart
} from '@/index'
import type { ISceneDragMoveOpts, IUpdateZoomOpts } from './types'

export interface IMiniMapManage extends IDisposable {
  refreshMap(data: IExportData): void
  getMiniMapFramePosition(): number[]
  updateMiniMapFramePosition(offsetX: number, offsetY: number): void
  updateOldPosition(): void
  getScaleRatio(): number
  getZoomScale(): number
  setVisible(visible: boolean): void
}

class MiniMapManage extends Disposable implements IMiniMapManage {
  private _tinyFlowchart: ITinyFlowchart
  private _parentTinyFlowchart: ITinyFlowchart
  private _storageMgr: IStorageManage
  private _viewPortMgr: IViewPortManage
  private _containerWidth: number
  private _containerHeight: number
  private _scaleRatio: number = 1
  private _containerRatio: number = 1

  private _centerX: number = 0
  private _centerY: number = 0

  private _oldMapFrameLeft: number = 0
  private _oldMapFrameTop: number = 0

  private _miniMapFrame: Rect

  constructor(tinyFlowchart: ITinyFlowchart, parentTinyFlowchart: ITinyFlowchart) {
    super()
    this._tinyFlowchart = tinyFlowchart
    this._parentTinyFlowchart = parentTinyFlowchart
    this._storageMgr = tinyFlowchart._storageMgr
    this._viewPortMgr = tinyFlowchart._viewPortMgr

    this._containerWidth = this._viewPortMgr.getSceneWidth() || window.innerWidth
    this._containerHeight = this._viewPortMgr.getSceneHeight() || window.innerHeight

    this._containerRatio = this._containerWidth / this._containerHeight

    this._miniMapFrame = new Rect({
      shape: { x: 0, y: 0, width: 0, height: 0 },
      style: {
        fill: '#30303033',
        stroke: 'blue',
        opacity: 0.5,
        strokeNoScale: true
      },
      z: 10000
    })

    this._tinyFlowchart._zr.add(this._miniMapFrame)

    this.initEventSubscriptions()
  }

  private initEventSubscriptions() {
    this._parentTinyFlowchart.sceneDragMove$.subscribe(
      ({ offsetX, offsetY }: ISceneDragMoveOpts) => {
        const scale = this.getMiniMapFrameScale()
        this.updateMiniMapFramePosition(
          this._oldMapFrameLeft - offsetX * this._scaleRatio * scale,
          this._oldMapFrameTop - offsetY * this._scaleRatio * scale
        )
      }
    )

    this._parentTinyFlowchart.sceneDragEnd$.subscribe(() => {
      this.updateOldPosition()
    })

    this._parentTinyFlowchart.updateZoom$.subscribe(({ zoom }: IUpdateZoomOpts) => {
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
    this._tinyFlowchart.initFlowChart(data)
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

    const sceneWidth = this._parentTinyFlowchart._viewPortMgr.getSceneWidth() as number
    const sceneHeight = this._parentTinyFlowchart._viewPortMgr.getSceneHeight() as number

    const left = -x * this._scaleRatio
    const top = -y * this._scaleRatio
    const scale = this.getMiniMapFrameScale() || 1
    this._viewPortMgr.getViewPort().attr('x', left)
    this._viewPortMgr.getViewPort().attr('y', top)
    this._viewPortMgr.getViewPort().attr('scaleX', this._scaleRatio)
    this._viewPortMgr.getViewPort().attr('scaleY', this._scaleRatio)

    const { x: pX, y: pY } = this._parentTinyFlowchart._viewPortMgr.getViewPort()

    this.setMiniMapFrameSize(sceneWidth * this._scaleRatio, sceneHeight * this._scaleRatio)
    this.updateMiniMapFramePosition(
      left - pX * this._scaleRatio * scale,
      top - pY * this._scaleRatio * scale
    )

    this.updateOldPosition()

    // fix: https://github.com/apache/echarts/issues/12261 zrender特性，节点中的文字不随节点一起放大缩小
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
    const sceneWidth = this._parentTinyFlowchart._viewPortMgr.getSceneWidth() || window.innerWidth
    const sceneHeight =
      this._parentTinyFlowchart._viewPortMgr.getSceneHeight() || window.innerHeight
    const scale = this.getMiniMapFrameScale() || 1
    this._oldMapFrameLeft = this.getMiniMapFramePosition()[0]
    this._oldMapFrameTop = this.getMiniMapFramePosition()[1]
    this._centerX = this._oldMapFrameLeft + ((sceneWidth * this._scaleRatio) / 2) * scale
    this._centerY = this._oldMapFrameTop + ((sceneHeight * this._scaleRatio) / 2) * scale
  }

  setVisible(visible: boolean) {
    this._tinyFlowchart._dom.parentElement!.style.display = visible ? 'block' : 'none'
  }
}

export { MiniMapManage }
