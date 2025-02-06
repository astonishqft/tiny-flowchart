import hotkeys from 'hotkeys-js'
import { Disposable } from './disposable'

import type { IIocEditor } from './iocEditor'

class HotKeysManager extends Disposable {
  private _iocEditor: IIocEditor
  constructor(iocEditor: IIocEditor) {
    super()
    this._iocEditor = iocEditor
    this.init()
  }

  init() {
    hotkeys('⌘+z, ctrl+z', (event: KeyboardEvent) => {
      event.preventDefault()
      this._iocEditor.undo()
    })

    hotkeys('⌘+y, ctrl+y', (event: KeyboardEvent) => {
      event.preventDefault()
      this._iocEditor.redo()
    })

    hotkeys('⌘+s, ctrl+s', (event: KeyboardEvent) => {
      event.preventDefault()
      this._iocEditor.save()
    })

    hotkeys('⌘+c, ctrl+c', (event: KeyboardEvent) => {
      event.preventDefault()
      this._iocEditor.copy()
    })

    hotkeys('⌘+v, ctrl+v', (event: KeyboardEvent) => {
      event.preventDefault()
      this._iocEditor.paste()
    })
  }
}

export { HotKeysManager }
