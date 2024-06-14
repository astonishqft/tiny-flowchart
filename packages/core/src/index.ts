import 'reflect-metadata'

import { IocEditor } from './iocEditor'
import * as zrender from 'zrender'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'

zrender.registerPainter('canvas', CanvasPainter)

export { IocEditor }
