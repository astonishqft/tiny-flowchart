import 'reflect-metadata'

import { IocEditor } from './iocEditor'
import * as zrender from 'zrender'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'
import container from './config/iocConfig'
import IDENTIFIER from './constants/identifiers'
import { SelectFrameManage } from './selectFrameManage'
import { GroupManage } from './groupManage'
import { ConnectionType } from './connection'

import type { ISceneManage } from './sceneManage'
import type { IZoomManage } from './zoomManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IGroupManage  } from './groupManage'
import type { ISettingManage } from './settingManage'
import type { IGridManage } from './gridManage'
import type { IShape } from './shapes'
import type { IConnection } from './connection'
import type { INodeGroup } from './shapes/nodeGroup'
import type { FontStyle, FontWeight, BuiltinTextPosition } from 'zrender/lib/core/types'

type Displayable = zrender.Displayable

zrender.registerPainter('canvas', CanvasPainter)

export { IocEditor, container, IDENTIFIER, SelectFrameManage, GroupManage, ConnectionType }
export type {
  ISceneManage,
  IZoomManage,
  IConnectionManage,
  ISelectFrameManage,
  IGroupManage,
  IShapeManage,
  INodeGroup,
  IShape,
  IConnection,
  Displayable,
  FontStyle,
  FontWeight,
  BuiltinTextPosition,
  ISettingManage,
  IGridManage
}
