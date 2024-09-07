import 'reflect-metadata'

import { IocEditor } from './iocEditor'
import * as zrender from 'zrender'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'
import container from './config/iocConfig'
import IDENTIFIER from './constants/identifiers'
import { SelectFrameManage } from './selectFrameManage'
import { ConnectionType } from './connection'
import { GroupManage } from './groupManage'

import type { ISceneManage } from './sceneManage'
import type { IZoomManage } from './zoomManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IGroupManage  } from './groupManage'

zrender.registerPainter('canvas', CanvasPainter)

export { IocEditor, container, IDENTIFIER, ConnectionType, SelectFrameManage, GroupManage }
export type { ISceneManage, IZoomManage, IConnectionManage, ISelectFrameManage, IGroupManage, IShapeManage }
