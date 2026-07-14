import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import ParticlesPlugin from './plugins/particles'
import { createPinia } from 'pinia'

const app = createApp(App)

app.use(ParticlesPlugin)
app.use(createPinia())

app.mount('#app')
