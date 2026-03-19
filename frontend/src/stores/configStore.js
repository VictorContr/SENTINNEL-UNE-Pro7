/* ══════════════════════════════════════════════════════════
   configStore.js — Pinia Store para gestión del tema
   Controla Light/Dark mode con persistencia en localStorage
   ══════════════════════════════════════════════════════════ */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'

const STORAGE_KEY_VC = 'sentinnel_theme'

export const useConfigStore = defineStore('config', () => {
  /* ── Estado reactivo ── */
  const isDark_sm_vc = ref(false) // Light Mode por defecto

  /* ── Referencia interna al plugin de Quasar ── */
  let $q_vc = null

  /**
   * Aplica el tema al DOM y sincroniza con Quasar.
   * Se separa para reutilizar en init y toggle.
   */
  function applyTheme_sm_vc(dark_sm_vc) {
    // Clase CSS para que Tailwind v4 active sus variantes `dark:`
    if (dark_sm_vc) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Sincronizar con el plugin Dark de Quasar (controla body class y componentes internos)
    if ($q_vc) {
      $q_vc.dark.set(dark_sm_vc)
    }
  }

  /**
   * Inicializa el tema leyendo localStorage.
   * Debe llamarse desde App.vue o MainLayout.vue en setup/onMounted.
   * Recibe la instancia de $q para sincronizar Quasar.
   */
  function initTheme_sm_vc() {
    $q_vc = useQuasar()

    const saved_sm_vc = localStorage.getItem(STORAGE_KEY_VC)

    if (saved_sm_vc === 'dark') {
      isDark_sm_vc.value = true
    } else {
      // Si no hay preferencia guardada o es 'light', usar light (default)
      isDark_sm_vc.value = false
    }

    applyTheme_sm_vc(isDark_sm_vc.value)
  }

  /**
   * Alterna entre Light y Dark mode.
   * Persiste la preferencia en localStorage.
   */
  function toggleTheme_sm_vc() {
    isDark_sm_vc.value = !isDark_sm_vc.value

    // Persistir en localStorage
    localStorage.setItem(
      STORAGE_KEY_VC,
      isDark_sm_vc.value ? 'dark' : 'light'
    )

    applyTheme_sm_vc(isDark_sm_vc.value)
  }

  return {
    isDark_sm_vc,
    initTheme_sm_vc,
    toggleTheme_sm_vc
  }
})
