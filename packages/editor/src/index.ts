import IocEditor from './IocEditor.vue'
import type { App } from 'vue'
import './assets/main.css'

export default {
  install(app: App) {
    app.component('IocEditor', IocEditor)
  }
}
