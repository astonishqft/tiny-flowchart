import { inject, injectable} from 'inversify'
import IDENTIFIER from './constants/identifiers'
import type { IShapeManage } from './shapeManage'

export interface IEventManage {
  initEvent(): void;
}

@injectable()
class EventManage {
  constructor(@inject(IDENTIFIER.SHAPE_MANAGE) private _shapeManage: IShapeManage) {

  }

  initEvent() {
    this._shapeManage.clickShape$.subscribe(shape => {
      shape.active()
    })
  }
}

export { EventManage }
