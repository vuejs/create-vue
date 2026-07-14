import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import ParticlesPlugin from './plugins/particles'

const app = createApp(App)

app.use(ParticlesPlugin)

app.mount('#app')
