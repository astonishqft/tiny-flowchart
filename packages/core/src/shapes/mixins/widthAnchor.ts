import type { Constructor, SafeDisplayable } from '../../types'
import type { IAnchor } from '../index'
import type { Anchor } from '../../anchor'

export type AnchorableConstructor = Constructor<SafeDisplayable & { anchors: IAnchor[] }>

export interface IWidthAnchor {
  anchor: Anchor
  getAnchorByIndex(index: number): IAnchor
  getAnchors(): IAnchor[]
}

function WidthAnchor<TBase extends AnchorableConstructor>(Base: TBase) {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args)
    }

    getAnchorByIndex(index: number) {
      return this.anchors.filter((item: IAnchor) => item.index == index)[0]
    }

    getAnchors() {
      return this.anchors.slice()
    }
  }
}

export { WidthAnchor }
