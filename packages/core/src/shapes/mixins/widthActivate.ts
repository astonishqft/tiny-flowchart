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
      this.setActiveState(true)
      this.attr({
        style: {
          shadowColor: '#29b7f3',
          shadowBlur: 2
        }
      })
    }

    unActive() {
      this.setActiveState(false)
      this.attr({
        style: {
          shadowColor: 'none',
          shadowBlur: 0
        }
      })
    }

    private setActiveState(state: boolean) {
      this.selected = state
      state ? this.anchor.show() : this.anchor.hide()
    }
  }
}

export { WidthActivate }
