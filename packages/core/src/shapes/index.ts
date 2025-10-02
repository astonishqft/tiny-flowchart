import { Group, Text as ZText, Circle as ZCircle } from '../'
import { WidthActivate } from './mixins/widthActivate'
import { WidthAnchor } from './mixins/widthAnchor'
import { WidthCommon } from './mixins/widthCommon'
import { defaultSettingConfig } from '../settingManage'
import { Circle } from './circle'
import { Text } from './text'
import { Image } from './image'
import { Square } from './square'
import { Rect } from './rect'
import { Parallelogram } from './parallelogram'
import { Pentagon } from './pentagon'
import { Hexagon } from './hexagon'
import { Septagon } from './septagon'
import { Heptagon } from './heptagon'
import { Trapezoid } from './trapezoid'
import { Diamond } from './diamond'
import { Triangle } from './triangle'
import { Cloud } from './cloud'
import { ArrowRight } from './arrowRight'
import { ArrowLeft } from './arrowLeft'
import { ArrowTop } from './arrowTop'
import { ArrowBottom } from './arrowBottom'
import { RoundRect } from './aroundRect'
import { PreRect } from './preRect'
import { Document } from './document'
import { Delay } from './delay'
import { Card } from './card'
import { Cylinder } from './cylinder'
import { Prepare } from './prepare'
import { Loop } from './loop'
import { Perhaps } from './perhaps'
import { Collate } from './collate'
import { Sort } from './sort'
import { Display } from './display'
import { Store } from './store'
import { ManualInput } from './manualInput'
import { PaperTape } from './paperTape'
import { SequentialData } from './sequentialData'
import { ManualOperation } from './manualOperation'
import { DirectData } from './directData'
import { StoreData } from './storeData'
import { ParallelMode } from './parallelMode'
import { Annotation } from './annotation'
import { Induce } from './induce'
import { MultiDocument } from './multiDocument'
import { ProcessBar } from './processBar'

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
import type { IInduceProps } from './induce'

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

type IShapeProps = RectProps | EllipseProps | ImageProps | TextProps | IInduceProps

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

const getDefaultShapeConfig = (): IShapeProps => {
  return {
    style: {
      fill: defaultSettingConfig.nodeFillColor,
      stroke: defaultSettingConfig.nodeStrokeColor,
      lineWidth: defaultSettingConfig.nodeStrokeWidth
    },
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 40
    },
    z: 1
  }
}

export const shapeConfig: IShapeConfig = {
  text: {
    style: {
      text: 'Text',
      fill: '#333', // 文本颜色
      backgroundColor: '#fff', // 文本背景色
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    z: 2
  },
  square: {
    shape: {
      x: 0,
      y: 0,
      width: 60,
      height: 60,
      r: 4
    }
  },
  rect: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 40
    }
  },
  rectangle: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 40,
      r: 4
    }
  },
  circle: {
    shape: {
      cx: 30,
      cy: 30,
      rx: 30,
      ry: 30
    }
  },
  pentagon: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80
    }
  },
  hexagon: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80
    }
  },
  septagon: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80
    }
  },
  heptagon: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80
    }
  },
  trapezoid: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80
    }
  },
  triangle: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80
    }
  },
  image: {
    style: {
      x: 0,
      y: 0,
      image: '',
      width: 120,
      height: 80
    },
    textConfig: {
      position: 'bottom'
    }
  },
  // topo
  document: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 60
    }
  },
  multiDocument: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 60
    }
  },
  cylinder: {
    shape: {
      x: 0,
      y: 0,
      width: 60,
      height: 80
    }
  },
  processBar: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 40
    }
  },
  arrowRight: {
    textContent: undefined
  },
  arrowLeft: {
    textContent: undefined
  },
  arrowTop: {
    textContent: undefined,
    shape: {
      x: 0,
      y: 0,
      width: 40,
      height: 80
    }
  },
  arrowBottom: {
    textContent: undefined,
    shape: {
      x: 0,
      y: 0,
      width: 40,
      height: 80
    }
  },
  card: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80
    }
  },
  perhaps: {
    shape: {
      x: 0,
      y: 0,
      width: 30,
      height: 30
    },
    textConfig: {
      position: 'bottom'
    }
  },
  store: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 80
    }
  },
  collate: {
    shape: {
      x: 0,
      y: 0,
      width: 40,
      height: 30
    },
    textConfig: {
      position: 'bottom'
    }
  },
  sort: {
    shape: {
      x: 0,
      y: 0,
      width: 40,
      height: 40
    },
    textConfig: {
      position: 'bottom'
    }
  },
  sequentialData: {
    shape: {
      x: 0,
      y: 0,
      width: 60,
      height: 60
    }
  },
  parallelMode: {
    shape: {
      x: 0,
      y: 0,
      width: 80,
      height: 30
    },
    textContent: undefined
  },
  annotation: {
    shape: {
      x: 0,
      y: 0,
      width: 60,
      height: 80
    }
  },
  induce: {
    shape: {
      x: 0,
      y: 0,
      width: 50,
      height: 80,
      direct: 'right'
    },
    textContent: undefined
  }
}

const getDefaultShapeTextConfig = (): IShapeTextConfig => {
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
  text: Text,
  circle: Circle,
  rect: Rect,
  image: Image,
  square: Square,
  diamond: Diamond,
  parallelogram: Parallelogram,
  pentagon: Pentagon,
  hexagon: Hexagon,
  septagon: Septagon,
  heptagon: Heptagon,
  trapezoid: Trapezoid,
  triangle: Triangle,
  // topo
  rectangle: Rect,
  cloud: Cloud,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowTop: ArrowTop,
  arrowBottom: ArrowBottom,
  roundRect: RoundRect,
  preRect: PreRect,
  document: Document,
  multiDocument: MultiDocument,
  processBar: ProcessBar,
  delay: Delay,
  card: Card,
  cylinder: Cylinder,
  preparation: Prepare,
  loop: Loop,
  perhaps: Perhaps,
  collate: Collate,
  sort: Sort,
  display: Display,
  store: Store,
  manualInput: ManualInput,
  paperTape: PaperTape,
  sequentialData: SequentialData,
  manualOperation: ManualOperation,
  directData: DirectData,
  storeData: StoreData,
  parallelMode: ParallelMode,
  annotation: Annotation,
  induce: Induce
}

export const getShape = (type: string, option: { x: number; y: number; image?: string }) => {
  const config: IShapeProps = {
    ...getDefaultShapeTextConfig(),
    ...getDefaultShapeConfig(),
    ...(shapeConfig[type] || {})
  }
  if (type === 'text') {
    delete config.textConfig
    delete config.textContent
  } else if (type === 'image') {
    ;(config as ImageProps).style!.image = option.image
  }
  const Shape = WidthAnchor(WidthActivate(WidthCommon(shapes[type])))
  const shape = new Shape(config)
  shape.updatePosition([option.x, option.y])

  return shape
}
