import hotkeys from 'hotkeys-js'
import { Disposable } from '@/disposable'

import type { ITinyFlowchart } from '@/index'

class HotKeysManager extends Disposable {
  private _iocEditor: ITinyFlowchart

  constructor(tinyFlowchart: ITinyFlowchart) {
    super()
    this._iocEditor = tinyFlowchart
    this.init()
  }

  private init() {
    const keyBindings: { [key: string]: () => void } = {
      '⌘+z, ctrl+z': () => this._iocEditor.undo(),
      '⌘+y, ctrl+y': () => this._iocEditor.redo(),
      '⌘+s, ctrl+s': () => this._iocEditor.save(),
      '⌘+c, ctrl+c': () => this._iocEditor.copy(),
      '⌘+v, ctrl+v': () => this._iocEditor.paste(),
      '⌘+a, ctrl+a': () => this._iocEditor.selectAll(),
      '⌘+Backspace, ctrl+Backspace, delete': () => this._iocEditor.delete()
    }

    Object.keys(keyBindings).forEach(key => {
      hotkeys(key, (event: KeyboardEvent) => {
        event.preventDefault()
        keyBindings[key]()
      })
    })
  }
}

export { HotKeysManager }
