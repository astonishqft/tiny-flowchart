import * as zrender from 'zrender'
import { WidthActivate } from './mixins/widthActivate'
import { WidthAnchor } from './mixins/widthAnchor'
import { WidthCommon } from './mixins/widthCommon'
import { Rect } from './rect'
import { Circle } from './circle'
import { Image } from './image'
import type { INodeGroup } from './nodeGroup'
import type {
  BuiltinTextPosition,
  FontStyle,
  FontWeight,
  LinearGradientObject,
  PatternObject,
  RadialGradientObject
} from '../index'

import type { Constructor, Dictionary } from '../types'
import type { IWidthActivate } from './mixins/widthActivate'
import type { IWidthAnchor } from './mixins/widthAnchor'
import type { IWidthCommon } from './mixins/widthCommon'

export type FillStyle =
  | string
  | PatternObject
  | LinearGradientObject
  | RadialGradientObject
  | undefined
export type StrokeStyle =
  | string
  | PatternObject
  | LinearGradientObject
  | RadialGradientObject
  | undefined
export type LineDashStyle = false | number[] | 'solid' | 'dashed' | 'dotted' | undefined

export interface IExportConnectionStyle {
  stroke: StrokeStyle
  lineWidth: number | undefined
  lineDash: LineDashStyle
  fontColor: string | undefined
  text: string | undefined
  fontSize: number | string | undefined
  fontWeight: FontWeight | undefined
  fontStyle: FontStyle | undefined
  textPosition: number[]
}

export interface IExportConnection {
  controlPoint1?: (number | undefined)[]
  controlPoint2?: (number | undefined)[]
  controlLine1?: (number | undefined)[]
  controlLine2?: (number | undefined)[]
  type: ConnectionType
  id: number
  fromPoint: number
  toPoint: number
  fromNode: number
  toNode: number
  style: IExportConnectionStyle
}

export interface IExportData {
  shapes: any[]
  connections: any[]
  groups: any[]
}

export interface IExportShapeStyle {
  fill: FillStyle
  stroke: StrokeStyle
  lineWidth: number
  lineDash: LineDashStyle
  fontColor: string
  text: string
  fontSize: number
  fontWeight: FontWeight
  fontStyle: FontStyle
  textPosition: BuiltinTextPosition | (number | string)[] | undefined
  image?: string
  width?: number // for Image
  height?: number // for Image
}

export interface IExportShape {
  x: number
  y: number
  style: IExportShapeStyle
  shape: Dictionary<any>
  type: string
  id: number
  z: number
  parent?: number
}

export interface IExportGroupStyle {
  fill: FillStyle
  stroke: StrokeStyle
  lineWidth: number | undefined
  lineDash: LineDashStyle
  fontColor: string | undefined
  fontSize: number | string | undefined
  text: string | undefined
  fontWeight: FontWeight | undefined
  fontStyle: FontStyle | undefined
  textPosition: BuiltinTextPosition | (number | string)[] | undefined
}

export interface IExportGroup {
  style: IExportGroupStyle
  id: number
  z: number
  parent?: number
}

export interface IConnection extends zrender.Group {
  fromNode: IShape | INodeGroup
  toNode: IShape | INodeGroup | null
  fromPoint: IAnchor | null
  toPoint: IAnchor | null
  cancelConnect(): void
  move(x: number, y: number): void
  connect(node: IShape | INodeGroup): void
  setFromPoint(point: IAnchor): void
  setToPoint(point: IAnchor): void
  refresh(): void
  active(): void
  unActive(): void
  setLineWidth(lineWidth: number): void
  getLineWidth(): number | undefined
  setLineColor(color: string): void
  getLineColor(): string | undefined
  setLineDash(type: number[]): void
  getLineDash(): number[]
  getLineType(): ConnectionType
  setLineType(type: ConnectionType): void
  setLineTextContent(content: string): void
  getLineTextContent(): string | undefined
  setLineTextFontSize(size: number | undefined): void
  getLineTextFontSize(): number | string | undefined
  setLineFontStyle(style: FontStyle): void
  setLineFontWeight(weight: FontWeight): void
  setLineTextFontColor(color: string | undefined): void
  getLineTextFontColor(): string | undefined
  getLineFontStyle(): FontStyle | undefined
  getLineFontWeight(): FontWeight | undefined
  getId(): number
  getConnectionType(): ConnectionType
  getLineText(): zrender.Text | null
  setStyle(style: IExportConnectionStyle): void
  setConnectionType(type: ConnectionType): void
  setBezierCurve(
    fromPoint: IAnchor,
    toPoint: IAnchor,
    controlPoint1: (number | undefined)[],
    controlPoint2: (number | undefined)[]
  ): void
  getExportData(): IExportConnection
}

export enum ConnectionType {
  Line,
  OrtogonalLine,
  BezierCurve
}

export enum NodeType {
  Group = 'Group',
  Shape = 'Shape'
}

export type IControlPoint = zrender.Circle & {
  mark: string
}

export interface IShape extends zrender.Displayable, IWidthActivate, IWidthAnchor, IWidthCommon {
  parentGroup?: INodeGroup
  anchors: IAnchor[]
  createAnchors(): void
}

type IShapeProps = zrender.RectProps | zrender.EllipseProps | zrender.ImageProps

export interface IShapeConfig {
  [key: string]: IShapeProps
}

export interface IShapeMap {
  [key: string]: Constructor<any>
}

export interface IShapeTextConfig {
  textContent: zrender.Text
  textConfig: zrender.ElementTextConfig
}

export interface IAnchor {
  x: number
  y: number
  direct: string
  index: number
}

export interface IAnchorPoint extends zrender.Circle {
  point: IAnchor
  node: IShape | INodeGroup
  mark: string
  oldFillColor: string
  anch: IAnchorPoint
}

export const shapeConfig: IShapeConfig = {
  rect: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      x: 0,
      y: 0,
      width: 60,
      height: 60
    },
    z: 2
  },
  circle: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      cx: 30,
      cy: 30,
      rx: 30,
      ry: 30
    },
    z: 2
  },
  image: {
    style: {
      x: 0,
      y: 0,
      image: '',
      width: 120,
      height: 80
    },
    z: 2
  }
}

const getShapeTextConfig = (): IShapeTextConfig => {
  return {
    textContent: new zrender.Text({
      style: {
        text: 'title',
        fill: '#333',
        fontSize: 12,
        fontFamily: 'Arial'
      },
      z: 11,
      cursor: 'move'
    }),
    textConfig: {
      position: 'inside'
    }
  }
}

export const shapes: IShapeMap = {
  rect: Rect,
  circle: Circle,
  image: Image
}

export const getShape = (type: string, option: { x: number; y: number; image?: string }) => {
  const config: IShapeProps = { ...shapeConfig[type], ...getShapeTextConfig() }
  if (type === 'image') {
    ;(config as zrender.ImageProps).style!.image = option.image
    config.textConfig!.position = 'bottom'
  }
  const Shape = WidthAnchor(WidthActivate(WidthCommon(shapes[type])))
  const shape = new Shape(config)
  shape.setXy(option.x, option.y)

  return shape
}
