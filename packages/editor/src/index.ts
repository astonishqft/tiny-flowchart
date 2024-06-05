import IocEditor from './IocEditor.vue'
import type { App } from 'vue'

export default {
  install(app: App) {
    app.component('IocEditor', IocEditor)
  }
}
