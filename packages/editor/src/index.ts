import IocEditor from './IocEditor.vue'
import type { App } from 'vue'
import { container } from '@ioceditor/core'
import './assets/main.css'

export default {
  install(app: App) {
    app.provide('iocEditor', container)
    app.component('IocEditor', IocEditor)
  }
}
