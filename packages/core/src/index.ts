import 'reflect-metadata'

import { IocEditor } from './iocEditor'
import * as zrender from 'zrender'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'
import container from './config/iocConfig'
import IDENTIFIER from './constants/identifiers'
import type { ISceneManage } from './sceneManage'
import type { IZoomManage } from './zoomManage'

zrender.registerPainter('canvas', CanvasPainter)

export { IocEditor, container, IDENTIFIER }
export type { ISceneManage, IZoomManage }
