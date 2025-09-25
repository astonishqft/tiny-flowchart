import hotkeys from 'hotkeys-js'
import { Disposable } from '@/disposable'

import type { ITinyFlowchart } from '@/index'

class HotKeysManager extends Disposable {
  private _tinyFlowchart: ITinyFlowchart

  constructor(tinyFlowchart: ITinyFlowchart) {
    super()
    this._tinyFlowchart = tinyFlowchart
    this.init()
  }

  private init() {
    const keyBindings: { [key: string]: () => void } = {
      '⌘+z, ctrl+z': () => this._tinyFlowchart.undo(),
      '⌘+y, ctrl+y': () => this._tinyFlowchart.redo(),
      '⌘+s, ctrl+s': () => this._tinyFlowchart.save(),
      '⌘+c, ctrl+c': () => this._tinyFlowchart.copy(),
      '⌘+v, ctrl+v': () => this._tinyFlowchart.paste(),
      '⌘+a, ctrl+a': () => this._tinyFlowchart.selectAll(),
      '⌘+Backspace, ctrl+Backspace, delete': () => this._tinyFlowchart.delete()
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
