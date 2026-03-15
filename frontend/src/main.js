/**
 * SENTINNEL — main.js
 * Bootstrap de la aplicación Vue 3 + Quasar + Pinia + Vue Router
 *
 * Dependencias requeridas (package.json):
 *   vue@^3.4, quasar@^2.16, pinia@^2.1, vue-router@^4.3
 *   @quasar/extras (Material Icons)
 *
 * Instrucciones de instalación:
 *   npm create quasar@latest  (elegir Vue 3 + Vite + SPA)
 *   npm install pinia
 *   # Copiar src/ de este proyecto sobre el scaffolding generado
 */

import { createApp } from 'vue'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

/* ── Quasar CSS & Icons ── */
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

/* ── Create app ── */
const app = createApp(App)

/* ── Pinia ── */
const pinia = createPinia()
app.use(pinia)

/* ── Quasar ── */
app.use(Quasar, {
  plugins: { Notify, Dialog, Loading },
  config: {
    dark: true,
    brand: {
      primary:   '#6fffe9',
      secondary: '#5bc0be',
      accent:    '#6fffe9',
      dark:      '#0b132b',
      positive:  '#6fffe9',
      negative:  '#ff4b6e',
      info:      '#7ec8e3',
      warning:   '#f0a500'
    },
    notify: {
      position: 'top-right',
      timeout: 3000,
      textColor: 'white',
      classes: 'sntnl-notify'
    },
    loading: {
      backgroundColor: '#0b132b',
      spinnerColor: 'teal-3',
      messageColor: 'grey-4'
    }
  }
})

/* ── Router ── */
app.use(router)

/* ── Mount ── */
app.mount('#app')
