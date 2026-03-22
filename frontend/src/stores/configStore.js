// ══════════════════════════════════════════════════════════════════
// configStore.js — Gestión de tema Light/Dark con persistencia.
// Controla la clase CSS 'dark' en el documentElement y sincroniza
// con el plugin Dark de Quasar. Persistencia en localStorage.
// ══════════════════════════════════════════════════════════════════

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'

const STORAGE_KEY_sm_vc = 'sentinnel_theme'

export const useConfigStore = defineStore('config', () => {
  const isDark_sm_vc = ref(false)
  let $q_sm_vc = null

  const applyTheme_sm_vc = (dark_sm_vc) => {
    if (dark_sm_vc) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    if ($q_sm_vc) $q_sm_vc.dark.set(dark_sm_vc)
  }

  const initTheme_sm_vc = () => {
    $q_sm_vc = useQuasar()
    const saved_sm_vc = localStorage.getItem(STORAGE_KEY_sm_vc)
    isDark_sm_vc.value = saved_sm_vc === 'dark'
    applyTheme_sm_vc(isDark_sm_vc.value)
  }

  const toggleTheme_sm_vc = () => {
    isDark_sm_vc.value = !isDark_sm_vc.value
    localStorage.setItem(STORAGE_KEY_sm_vc, isDark_sm_vc.value ? 'dark' : 'light')
    applyTheme_sm_vc(isDark_sm_vc.value)
  }

  return {
    isDark_sm_vc,
    initTheme_sm_vc,
    toggleTheme_sm_vc
  }
})