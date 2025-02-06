import type { IAnchorPoint } from '..'
import type { Constructor, SafeDisplayable } from '../../types'

export type ActivatableConstructor = Constructor<SafeDisplayable & { anchor: IAnchorPoint }>

export interface IWidthActivate {
  selected: boolean
  active(): void
  unActive(): void
}
function WidthActivate<TBase extends ActivatableConstructor>(Base: TBase) {
  return class extends Base {
    selected = false

    constructor(...args: any[]) {
      super(...args)
    }

    active() {
      this.selected = true
      this.anchor.show()
    }

    unActive() {
      this.selected = false
      this.anchor.hide()
    }
  }
}

export { WidthActivate }
