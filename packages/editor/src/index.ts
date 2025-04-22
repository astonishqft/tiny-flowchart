import TinyFlowchart from './TinyFlowchart.vue'
import type { App } from 'vue'
import './assets/main.css'

export default {
  install(app: App) {
    app.component('TinyFlowchart', TinyFlowchart)
  }
}
