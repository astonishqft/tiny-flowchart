import {
  registerPainter,
  Line,
  Rect,
  Circle,
  BezierCurve,
  Polygon,
  Polyline,
  Text,
  Group,
  BoundingRect,
  Image,
  Ellipse,
  util,
  init,
  vector
} from 'zrender'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'
import { IocEditor } from '@/iocEditor'
import { SelectFrameManage } from '@/selectFrameManage'
import { GroupManage } from '@/groupManage'
import { ConnectionType, NodeType } from '@/shapes'
import { MiniMapManage } from '@/miniMapManage'

import type { IIocEditor } from '@/iocEditor'
import type { ISceneManage } from '@/sceneManage'
import type { IZoomManage } from '@/zoomManage'
import type { IShapeManage } from '@/shapeManage'
import type { IConnectionManage } from '@/connectionManage'
import type { ISelectFrameManage } from '@/selectFrameManage'
import type { IGroupManage } from '@/groupManage'
import type { ISettingManage } from '@/settingManage'
import type { IGridManage } from '@/gridManage'
import type { IViewPortManage } from '@/viewPortManage'
import type { IStorageManage } from '@/storageManage'
import type { IControlFrameManage } from '@/controlFrameManage'
import type { IDragFrameManage } from '@/dragFrameManage'
import type { IRefLineManage } from '@/refLineManage'
import type { IDisposable } from '@/disposable'
import type {
  IConnection,
  IShape,
  INode,
  IExportShapeStyle,
  IExportGroupStyle,
  IExportConnectionStyle,
  LineDashStyle,
  IAnchorPoint,
  IControlPoint,
  IExportData,
  IExportShape,
  IExportConnection,
  IExportGroup,
  IAnchor,
  StrokeStyle
} from '@/shapes'
import type { INodeGroup } from '@/shapes/nodeGroup'
import type { IMiniMapManage } from '@/miniMapManage'
import type { IHistoryManage } from '@/history/historyManage'
import type { BuiltinTextPosition, FontStyle, FontWeight } from 'zrender/src/core/types.js'
import type {
  LinearGradientObject,
  PatternObject,
  RadialGradientObject,
  Element,
  ElementEvent,
  Displayable,
  ZRenderType,
  RectProps,
  EllipseProps,
  ImageProps,
  CircleProps,
  ElementTextConfig,
  TextProps
} from 'zrender'
import type { ICommand } from '@/history/historyManage'
import type { IWidthActivate } from '@/shapes/mixins/widthActivate'
import type { IWidthAnchor } from '@/shapes/mixins/widthAnchor'

registerPainter('canvas', CanvasPainter)

export {
  BoundingRect,
  Group,
  Line,
  Circle,
  Rect,
  Polygon,
  Polyline,
  BezierCurve,
  Image,
  Ellipse,
  Text,
  util,
  init,
  vector,
  IocEditor,
  SelectFrameManage,
  GroupManage,
  ConnectionType,
  NodeType,
  MiniMapManage
}

export type {
  Displayable,
  Element,
  RectProps,
  TextProps,
  EllipseProps,
  ImageProps,
  CircleProps,
  ElementEvent,
  FontStyle,
  FontWeight,
  PatternObject,
  LinearGradientObject,
  RadialGradientObject,
  StrokeStyle,
  ZRenderType,
  ElementTextConfig,
  ICommand,
  ISceneManage,
  IZoomManage,
  IConnectionManage,
  ISelectFrameManage,
  IViewPortManage,
  IHistoryManage,
  IRefLineManage,
  IDragFrameManage,
  IStorageManage,
  IControlFrameManage,
  IDisposable,
  IGroupManage,
  IAnchorPoint,
  IControlPoint,
  IExportData,
  IExportShape,
  IExportConnection,
  IExportGroup,
  IMiniMapManage,
  IShapeManage,
  IAnchor,
  IWidthActivate,
  IWidthAnchor,
  INodeGroup,
  IShape,
  INode,
  IConnection,
  BuiltinTextPosition,
  ISettingManage,
  IGridManage,
  IIocEditor,
  IExportShapeStyle,
  IExportGroupStyle,
  IExportConnectionStyle,
  LineDashStyle
}
