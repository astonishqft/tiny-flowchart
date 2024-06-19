
import { Container } from 'inversify'
import IDENTIFIER from '../constants/identifiers'
import { ShapeManage } from '../shapeManage'
import { SceneManage } from '../sceneManage'
import { SettingManage } from '../settingManage'
import { DragFrameManage } from '../dragFrameManage'
import { GridManage } from '../gridManage'
import { ViewPortManage } from '../viewPortManage'
import { ZoomManage } from '../zoomManage'

import type { ISceneManage } from '../sceneManage'
import type { IShapeManage } from '../shapeManage'
import type { ISettingManage } from '../settingManage'
import type { IDragFrameManage } from '../dragFrameManage'
import type { IGridManage } from '../gridManage'
import type { IViewPortManage } from '../viewPortManage'
import type { IZoomManage } from '../zoomManage'

// Added new feature to disable base class checking https://github.com/inversify/InversifyJS/pull/841
const container = new Container({ skipBaseClassChecks: true})
container.bind<ISettingManage>(IDENTIFIER.SETTING_MANAGE).to(SettingManage).inSingletonScope() // 指定作用域为单例

container.bind<ISceneManage>(IDENTIFIER.SCENE_MANAGE).to(SceneManage).inSingletonScope() // 指定作用域为单例
container.bind<IShapeManage>(IDENTIFIER.SHAPE_MANAGE).to(ShapeManage).inSingletonScope() // 指定作用于为单例
container.bind<IDragFrameManage>(IDENTIFIER.DRAG_FRAME_MANAGE).to(DragFrameManage).inSingletonScope() // 指定作用域为单例
container.bind<IGridManage>(IDENTIFIER.GRID_MANAGE).to(GridManage).inSingletonScope() // 指定作用域为单例
container.bind<IViewPortManage>(IDENTIFIER.VIEW_PORT_MANAGE).to(ViewPortManage).inSingletonScope()
container.bind<IZoomManage>(IDENTIFIER.ZOOM_MANAGE).to(ZoomManage).inSingletonScope()

export default container
