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
import { IocEditor } from './iocEditor'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'
import { SelectFrameManage } from './selectFrameManage'
import { GroupManage } from './groupManage'
import { ConnectionType, NodeType } from './shapes'
import { MiniMapManage } from './miniMapManage'

import type { IIocEditor } from './iocEditor'
import type { ISceneManage } from './sceneManage'
import type { IZoomManage } from './zoomManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IGroupManage } from './groupManage'
import type { ISettingManage } from './settingManage'
import type { IGridManage } from './gridManage'
import type {
  IConnection,
  IShape,
  INode,
  IExportShapeStyle,
  IExportGroupStyle,
  IExportConnectionStyle,
  LineDashStyle
} from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IMiniMapManage } from './miniMapManage'
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
  ElementTextConfig
} from 'zrender'

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
  EllipseProps,
  ImageProps,
  CircleProps,
  ElementEvent,
  FontStyle,
  FontWeight,
  PatternObject,
  LinearGradientObject,
  RadialGradientObject,
  ZRenderType,
  ElementTextConfig,
  ISceneManage,
  IZoomManage,
  IConnectionManage,
  ISelectFrameManage,
  IGroupManage,
  IMiniMapManage,
  IShapeManage,
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
