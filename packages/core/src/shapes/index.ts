import { Group, Text as ZText, Circle as ZCircle } from '../'
import { WidthActivate } from './mixins/widthActivate'
import { WidthAnchor } from './mixins/widthAnchor'
import { WidthCommon } from './mixins/widthCommon'
import { Rect } from './rect'
import { Circle } from './circle'
import { Text } from './text'
import { Image } from './image'
import { Square } from './square'
import { Diamond } from './diamond'

import type { INodeGroup } from './nodeGroup'
import type {
  BuiltinTextPosition,
  FontStyle,
  TextProps,
  FontWeight,
  LinearGradientObject,
  PatternObject,
  RadialGradientObject,
  Displayable,
  RectProps,
  EllipseProps,
  ImageProps,
  ElementTextConfig
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

export interface IExportShapeStyle {
  fill?: FillStyle
  stroke?: StrokeStyle
  lineWidth?: number
  lineDash?: LineDashStyle
  fontColor?: string
  text?: string
  fontSize?: number
  fontWeight?: FontWeight
  fontStyle?: FontStyle
  textPosition?: BuiltinTextPosition | (number | string)[] | undefined
  image?: string
  width?: number
  height?: number
  backgroundColor?: string
}

export interface IExportShape {
  x: number
  y: number
  style: IExportShapeStyle
  type: string
  id: number
  z: number
  shape?: Dictionary<any>
  parent?: number
}

export interface IExportGroupStyle {
  fill?: FillStyle
  stroke?: StrokeStyle
  lineWidth?: number | undefined
  lineDash?: LineDashStyle
  fontColor?: string | undefined
  fontSize?: number | string | undefined
  text?: string | undefined
  fontWeight?: FontWeight | undefined
  fontStyle?: FontStyle | undefined
  textPosition?: BuiltinTextPosition | (number | string)[] | undefined
}

export interface IExportGroup {
  style: IExportGroupStyle
  id: number
  z: number
  parent?: number
}

export interface IConnection extends Group {
  selected: boolean
  fromNode: INode
  toNode: INode | null
  fromPoint: IAnchor | null
  toPoint: IAnchor | null
  controlPoint1: IControlPoint | null
  controlPoint2: IControlPoint | null
  connectionType: ConnectionType
  setFromPoint(point: IAnchor): void
  setToPoint(point: IAnchor): void
  refresh(): void
  active(): void
  unActive(): void
  getLineWidth(): number | undefined
  getLineColor(): string | undefined
  getLineDash(): number[]
  getLineTextContent(): string | undefined
  getLineTextFontSize(): number | string | undefined
  getLineTextFontColor(): string | undefined
  getLineFontStyle(): FontStyle | undefined
  getLineFontWeight(): FontWeight | undefined
  getId(): number
  getConnectionType(): ConnectionType
  getLineText(): ZText | null
  setStyle(style: IExportConnectionStyle): void
  setConnectionType(type: ConnectionType): void
  setBezierCurve(controlPoint1: (number | undefined)[], controlPoint2: (number | undefined)[]): void
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

export type IControlPoint = ZCircle & {
  mark: string
}

export interface IShape extends Displayable, IWidthActivate, IWidthAnchor, IWidthCommon {
  anchors: IAnchor[]
  parentGroup?: INodeGroup
  nodeType: NodeType
  createAnchors(): void
  getExportData(): IExportShape
}

export type INode = IShape | INodeGroup

type IShapeProps = RectProps | EllipseProps | ImageProps | TextProps

export interface IShapeConfig {
  [key: string]: IShapeProps
}

export interface IShapeMap {
  [key: string]: Constructor<any>
}

export interface IShapeTextConfig {
  textContent: ZText
  textConfig: ElementTextConfig
}

export interface IAnchor {
  x: number
  y: number
  direct: string
  index: number
}

export interface IAnchorPoint extends Circle {
  point: IAnchor
  node: INode
  mark: string
  oldFillColor: string
  anch: IAnchorPoint
}

export interface IExportData {
  shapes: IExportShape[]
  connections: IExportConnection[]
  groups: IExportGroup[]
}

export const shapeConfig: IShapeConfig = {
  square: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80,
      r: 4
    },
    z: 1
  },
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
      width: 100,
      height: 60,
      r: 4
    },
    z: 1
  },
  circle: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      cx: 40,
      cy: 40,
      rx: 40,
      ry: 40
    },
    z: 1
  },
  diamond: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      x: 0,
      y: 0,
      width: 100,
      height: 60
    },
    z: 1
  },
  text: {
    style: {
      text: 'Text',
      fill: '#333', // 文本颜色
      backgroundColor: '#fff', // 文本背景色
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    z: 1
  },
  image: {
    style: {
      x: 0,
      y: 0,
      image: '',
      width: 120,
      height: 80
    },
    z: 1
  }
}

const getShapeTextConfig = (): IShapeTextConfig => {
  return {
    textContent: new ZText({
      style: {
        text: 'title',
        fill: '#333',
        fontSize: 12,
        fontFamily: 'Arial'
      },
      z: 11,
      silent: true
    }),
    textConfig: {
      position: 'inside'
    }
  }
}

export const shapes: IShapeMap = {
  rect: Rect,
  circle: Circle,
  text: Text,
  image: Image,
  square: Square,
  diamond: Diamond
}

export const getShape = (type: string, option: { x: number; y: number; image?: string }) => {
  let config: IShapeProps = { ...shapeConfig[type], ...getShapeTextConfig() }
  if (type === 'text') {
    config = { ...shapeConfig[type] }
  } else if (type === 'image') {
    ;(config as ImageProps).style!.image = option.image
    config.textConfig!.position = 'bottom'
  }
  const Shape = WidthAnchor(WidthActivate(WidthCommon(shapes[type])))
  const shape = new Shape(config)
  shape.updatePosition([option.x, option.y])

  return shape
}
