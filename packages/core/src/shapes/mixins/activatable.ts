import * as zrender from 'zrender'

import type { Constructor } from '../../types'

interface IBase {
  attr(key: string, value: any): void
}

function Activatable<TBase extends Constructor<IBase>>(Base: TBase) {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args)
    }
    public isActivated = false

    activate() {
      this.attr('x', 100)
    }

    deactivate() {
      this.isActivated = false
    }
  }
}

export { Activatable }
