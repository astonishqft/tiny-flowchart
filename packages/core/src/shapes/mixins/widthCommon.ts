import { BoundingRect, Group } from '../..'
import { NodeType } from '../../index'

import type { Element } from '../..'
import type { IExportShape, IExportShapeStyle } from '..'
import type { INodeGroup } from '../nodeGroup'
import type { FontStyle, FontWeight } from '../../index'
import type { Constructor, Dictionary, SafeDisplayable } from '../../types'

export type CommonConstructor = Constructor<SafeDisplayable>

export interface IWidthCommon {
  type: string
  oldX: number
  oldY: number
  nodeType: NodeType
  getPosition(): number[]
  setOldPosition(): void
  getBoundingBox(): BoundingRect
  setType(type: string): void
  getExportData(): IExportShape
  setZ(z: number): void
  updatePosition(pos: number[]): void
  setCursor(type: string): void
  setShape(shapeConfig: Dictionary<any>): void
  updateShape(config: IExportShapeStyle): void
}

function WidthCommon<TBase extends CommonConstructor>(Base: TBase) {
  return class extends Base {
    nodeType = NodeType.Shape
    oldX: number = 0
    oldY: number = 0
    parentGroup?: INodeGroup

    constructor(...args: any[]) {
      super(...args)
    }

    setType(type: string) {
      this.type = type
    }

    setCursor(type: string) {
      this.attr('cursor', type)
    }

    setOldPosition() {
      this.oldX = this.x
      this.oldY = this.y
    }

    getBoundingBox() {
      const g = new Group()
      const { width, height } = g.getBoundingRect([this as unknown as Element])

      return new BoundingRect(this.x, this.y, width, height)
    }

    setZ(z: number) {
      this.attr('z', z)
    }

    updatePosition(pos: number[]) {
      this.attr('x', pos[0])
      this.attr('y', pos[1])
    }

    getExportData() {
      const exportData: IExportShape = {
        x: this.x,
        y: this.y,
        id: this.id,
        type: this.type,
        z: this.z,
        style: this.getStyleData(),
        shape: this.shape,
        ...(this.parentGroup && { parent: this.parentGroup.id })
      }

      if (this.type === 'image') {
        this.addImageData(exportData)
      }

      return exportData
    }

    private getStyleData() {
      const textContent = this.getTextContent().style

      return {
        fill: this.style.fill,
        stroke: this.style.stroke,
        lineWidth: this.style.lineWidth,
        lineDash: this.style.lineDash,
        fontColor: textContent.fill as string,
        text: textContent.text as string,
        fontSize: textContent.fontSize as number,
        fontWeight: textContent.fontWeight as FontWeight,
        fontStyle: textContent.fontStyle as FontStyle,
        textPosition: this.textConfig!.position
      }
    }

    private addImageData(exportData: IExportShape) {
      exportData.style.image = this.style.image
      exportData.style.width = this.style.width
      exportData.style.height = this.style.height
    }

    updateShape(config: IExportShapeStyle) {
      this.getTextContent().setStyle(this.getTextStyle(config))
      this.setShapeStyle(config)
      this.setTextConfig({ position: config.textPosition })
    }

    private getTextStyle(config: IExportShapeStyle) {
      const { text, fontColor, fontSize, fontStyle, fontWeight } = config

      return { text, fill: fontColor, fontSize, fontStyle, fontWeight }
    }

    private setShapeStyle(config: IExportShapeStyle) {
      const { fill, stroke, lineWidth, lineDash, image, width, height } = config

      if (this.type === 'image' && image) {
        this.setStyle({ width, height, image })
      } else {
        this.setStyle({ fill, stroke, lineWidth, lineDash })
      }
    }
  }
}

export { WidthCommon }
