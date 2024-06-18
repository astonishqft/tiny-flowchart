import 'reflect-metadata'

import { IocEditor } from './iocEditor'
import * as zrender from 'zrender'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'
import container from './config/ioc_config'
import IDENTIFIER from './constants/identifiers'
import type { ILayerManage } from './layerManage'

zrender.registerPainter('canvas', CanvasPainter)

export { IocEditor, container, IDENTIFIER }
export type { ILayerManage }
