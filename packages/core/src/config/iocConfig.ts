
import { Container } from 'inversify'
import IDENTIFIER from '../constants/identifiers'
import { ShapeManage } from '../shapeManage'
import { SceneManage } from '../sceneManage'
import { SettingManage } from '../settingManage'
import { DragFrameManage } from '../dragFrameManage'
import { GridManage } from '../gridManage'
import { ViewPortManage } from '../viewPortManage'
import { ZoomManage } from '../zoomManage'
import { ConnectionManage } from '../connectionManage'
import { RefLineManage } from '../refLineManage'
import { SelectFrameManage } from '../selectFrameManage'
import { GroupManage } from '../groupManage'
import { StorageManage } from '../storageManage'

import type { ISceneManage } from '../sceneManage'
import type { IShapeManage } from '../shapeManage'
import type { ISettingManage } from '../settingManage'
import type { IDragFrameManage } from '../dragFrameManage'
import type { IGridManage } from '../gridManage'
import type { IViewPortManage } from '../viewPortManage'
import type { IZoomManage } from '../zoomManage'
import type { IConnectionManage } from '../connectionManage'
import type { IRefLineManage } from '../refLineManage'
import type { ISelectFrameManage } from '../selectFrameManage'
import type { IGroupManage } from '../groupManage'
import type { IStorageManage } from '../storageManage'

// Added new feature to disable base class checking https://github.com/inversify/InversifyJS/pull/841
const container = new Container({ skipBaseClassChecks: true})
container.bind<ISettingManage>(IDENTIFIER.SETTING_MANAGE).to(SettingManage).inSingletonScope() // 指定作用域为单例

container.bind<ISceneManage>(IDENTIFIER.SCENE_MANAGE).to(SceneManage).inSingletonScope() // 指定作用域为单例
container.bind<IShapeManage>(IDENTIFIER.SHAPE_MANAGE).to(ShapeManage).inTransientScope()
container.bind<IDragFrameManage>(IDENTIFIER.DRAG_FRAME_MANAGE).to(DragFrameManage).inSingletonScope()
container.bind<IViewPortManage>(IDENTIFIER.VIEW_PORT_MANAGE).to(ViewPortManage).inSingletonScope()
container.bind<IGridManage>(IDENTIFIER.GRID_MANAGE).to(GridManage).inTransientScope()
container.bind<IZoomManage>(IDENTIFIER.ZOOM_MANAGE).to(ZoomManage).inTransientScope()
container.bind<IConnectionManage>(IDENTIFIER.CONNECTION_MANAGE).to(ConnectionManage).inTransientScope()
container.bind<IRefLineManage>(IDENTIFIER.REF_LINE_MANAGE).to(RefLineManage).inSingletonScope()
container.bind<ISelectFrameManage>(IDENTIFIER.SELECT_FRAME_MANAGE).to(SelectFrameManage).inSingletonScope()
container.bind<IGroupManage>(IDENTIFIER.GROUP_MANAGE).to(GroupManage).inTransientScope()
container.bind<IStorageManage>(IDENTIFIER.STORAGE_MANAGE).to(StorageManage).inSingletonScope()

export default container
