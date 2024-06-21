import 'reflect-metadata'

import { IocEditor } from './iocEditor'
import * as zrender from 'zrender'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'
import container from './config/iocConfig'
import IDENTIFIER from './constants/identifiers'
import { ConnectionType } from './connection'
import type { ISceneManage } from './sceneManage'
import type { IZoomManage } from './zoomManage'
import type { IConnectionManage } from './connectionManage'

zrender.registerPainter('canvas', CanvasPainter)

export { IocEditor, container, IDENTIFIER, ConnectionType }
export type { ISceneManage, IZoomManage, IConnectionManage }
