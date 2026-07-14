import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import EmojiPlugin from './plugins/emoji'

const app = createApp(App)

app.use(EmojiPlugin)

app.mount('#app')
