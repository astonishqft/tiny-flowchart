import './assets/main.css'

import TinyFlowchart from '@tiny-flowchart/editor'
import '@tiny-flowchart/editor/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(TinyFlowchart)

app.mount('#app')
