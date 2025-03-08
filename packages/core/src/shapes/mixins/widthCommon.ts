import { BoundingRect, NodeType } from '@/index'
import { getBoundingBox } from '@/utils'

import type { Element, FontStyle, FontWeight } from '@/index'
import type { IExportShape, IExportShapeStyle } from '@/shapes'
import type { INodeGroup } from '@/shapes/nodeGroup'
import type { Constructor, Dictionary, SafeDisplayable } from '@/types'

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
  updateShapeStyle(config: IExportShapeStyle): void
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
      const { width, height } = getBoundingBox([this as unknown as Element])

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
        shape: this.shape
      }
      if (this.parentGroup) {
        exportData.parent = this.parentGroup.id
      }

      return exportData
    }

    private getStyleData() {
      if (this.type === 'text') {
        return {
          fill: this.style.fill,
          text: this.style.text,
          fontSize: this.style.fontSize,
          backgroundColor: this.style.backgroundColor,
          fontWeight: this.style.fontWeight,
          fontStyle: this.style.fontStyle
        }
      } else if (this.type === 'image') {
        const textContent = this.getTextContent().style

        return {
          image: this.style.image,
          width: this.style.width,
          height: this.style.height,
          fontColor: textContent.fill as string,
          text: textContent.text as string,
          fontSize: textContent.fontSize as number,
          fontWeight: textContent.fontWeight as FontWeight,
          fontStyle: textContent.fontStyle as FontStyle,
          textPosition: this.textConfig!.position
        }
      } else {
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
    }

    updateShapeStyle(config: IExportShapeStyle) {
      if (this.type === 'text') {
        this.setShapeStyle(config)
      } else {
        this.getTextContent().setStyle(this.getTextStyle(config))
        this.setShapeStyle(config)
        this.setTextConfig({ position: config.textPosition })
      }
    }

    private getTextStyle(config: IExportShapeStyle) {
      const { text, fontColor, fontSize, fontStyle, fontWeight } = config

      return { text, fill: fontColor, fontSize, fontStyle, fontWeight }
    }

    private setShapeStyle(config: IExportShapeStyle) {
      const {
        fill,
        stroke,
        lineWidth,
        lineDash,
        image,
        width,
        height,
        text,
        fontSize,
        fontWeight,
        fontStyle,
        backgroundColor
      } = config

      if (this.type === 'image' && image) {
        this.setStyle({ width, height, image })
      } else if (this.type === 'text') {
        this.setStyle({
          text,
          fill,
          fontSize,
          fontWeight,
          fontStyle,
          backgroundColor
        })
      } else {
        this.setStyle({ fill, stroke, lineWidth, lineDash })
      }
    }
  }
}

export { WidthCommon }
