import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
import { createPinia, PiniaVuePlugin } from 'pinia'

import App from './App.vue'

Vue.use(VueCompositionAPI)
Vue.use(PiniaVuePlugin)

const app = new Vue({
  pinia: createPinia(),
  render: (h) => h(App)
})

app.$mount('#app')
