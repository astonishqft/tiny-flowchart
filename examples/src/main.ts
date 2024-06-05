import './assets/main.css'

import IocEditor from '@ioceditor/editor'
import '@ioceditor/editor/dist/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(IocEditor)

app.mount('#app')
