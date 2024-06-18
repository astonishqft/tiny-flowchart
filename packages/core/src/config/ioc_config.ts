
import { Container } from 'inversify'
import { ShapeManage } from '../shapeManage'
import { LayerManage } from '../layerManage'
import type { IShapeManage } from '../shapeManage'

import IDENTIFIER from '../constants/identifiers'
import type { ILayerManage } from '../layerManage'

import { SettingManage } from '../settingManage'
import type { ISettingManage } from '../settingManage'

import { DragFrameManage } from '../dragFrameManage'
import type { IDragFrameManage } from '../dragFrameManage'

import { GridManage } from '../gridManage'
import type { IGridManage } from '../gridManage'

// Added new feature to disable base class checking https://github.com/inversify/InversifyJS/pull/841
const container = new Container({ skipBaseClassChecks: true})

container.bind<IShapeManage>(IDENTIFIER.SHAPE_MANAGE).to(ShapeManage).inSingletonScope() // 指定作用于为单例
container.bind<ILayerManage>(IDENTIFIER.LAYER_MANAGE).to(LayerManage).inSingletonScope() // 指定作用域为单例
container.bind<ISettingManage>(IDENTIFIER.SETTING_MANAGE).to(SettingManage).inSingletonScope() // 指定作用域为单例
container.bind<IDragFrameManage>(IDENTIFIER.DRAG_FRAME_MANAGE).to(DragFrameManage).inSingletonScope() // 指定作用域为单例
container.bind<IGridManage>(IDENTIFIER.GRID_MANAGE).to(GridManage).inSingletonScope() // 指定作用域为单例

export default container
