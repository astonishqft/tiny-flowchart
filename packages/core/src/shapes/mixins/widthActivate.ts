import type { IAnchorPoint } from '..'
import type { IControlFrame } from '../../controlFrame'
import type { Constructor, SafeDisplayable } from '../../types'

export type ActivatableConstructor = Constructor<
  SafeDisplayable & { anchor: IAnchorPoint; controlFrame: IControlFrame }
>

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
      this.setActiveState(true)
    }

    unActive() {
      this.setActiveState(false)
    }

    setActiveState(state: boolean) {
      this.selected = state
      if (state) {
        this.anchor.show()
        this.controlFrame.active()
      } else {
        this.anchor.hide()
        this.controlFrame.unActive()
      }
    }
  }
}

export { WidthActivate }
