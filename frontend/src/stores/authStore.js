import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalStorage, Notify } from 'quasar'
import {
  login_sm_vc,
  cambiarClaveInicial_sm_vc as cambiarClaveService_sm_vc,
} from 'src/services/authService'

/**
 * SENTINNEL – authStore
 * Manejo global de autenticación JWT y estado de sesión.
 */
export const useAuthStore = defineStore('auth', () => {
  /* ── State ─────────────────────────────────────────────────── */
  const user_sm_vc    = ref(null)
  const token_sm_vc   = ref(null)
  const loading_sm_vc = ref(false)
  const error_sm_vc   = ref(null)

  /* ── Hydrate from localStorage ──────────────────────────────── */
  const _hidratar_sm_vc = () => {
    try {
      const stored_sm_vc = LocalStorage.getItem('sentinnel_session')
      if (stored_sm_vc) {
        const parsed_sm_vc =
          typeof stored_sm_vc === 'string'
            ? JSON.parse(stored_sm_vc)
            : stored_sm_vc
        user_sm_vc.value  = parsed_sm_vc.user
        token_sm_vc.value = parsed_sm_vc.token
      }
    } catch {
      LocalStorage.remove('sentinnel_session')
    }
  }
  _hidratar_sm_vc()

  /* ── Getters ─────────────────────────────────────────────────
   *
   * FIX #7: Se agrega el getter puede_hacer_deploy_sm_vc
   *
   * Lee el flag desde el perfil de estudiante anidado en el
   * objeto de usuario que devuelve el endpoint /auth/login.
   * Esto evita que los componentes accedan a
   * `auth.user?.estudiante_sm_vc?.puede_hacer_deploy_sm_vc`
   * directamente (código frágil y difícil de mantener).
   * ────────────────────────────────────────────────────────── */
  const is_authenticated_sm_vc = computed(() => !!token_sm_vc.value && !!user_sm_vc.value)

  const rol_sm_vc = computed(() => user_sm_vc.value?.rol_sm_vc ?? null)

  const is_admin_sm_vc      = computed(() =>
    rol_sm_vc.value === 'ADMINISTRADOR' || rol_sm_vc.value === 'ADMIN'
  )
  const is_profesor_sm_vc   = computed(() => rol_sm_vc.value === 'PROFESOR')
  const is_estudiante_sm_vc = computed(() => rol_sm_vc.value === 'ESTUDIANTE')

  /**
   * FIX #7 — Getter centralizado para el flag de deploy.
   *
   * El backend devuelve el perfil de estudiante anidado como
   * `user.estudiante_sm_vc` en el response del login. Este getter
   * lo normaliza para que router y componentes lo usen de forma
   * uniforme sin acoplarse a la estructura interna del objeto.
   */
  const puede_hacer_deploy_sm_vc = computed(() =>
    user_sm_vc.value?.estudiante_sm_vc?.puede_hacer_deploy_sm_vc === true
  )

  const nombreCorto_sm_vc = computed(() => {
    if (!user_sm_vc.value?.nombre_sm_vc) return ''
    return user_sm_vc.value.nombre_sm_vc.split(' ')[0]
  })

  /* ── Actions ─────────────────────────────────────────────────── */
  const action_login_sm_vc = async (correo_input_sm_vc, clave_input_sm_vc) => {
    loading_sm_vc.value = true
    error_sm_vc.value   = null

    try {
      const data_sm_vc = await login_sm_vc(
        correo_input_sm_vc.trim().toLowerCase(),
        clave_input_sm_vc,
      )

      if (data_sm_vc.requires_password_change) {
        return {
          requires_password_change: true,
          user: data_sm_vc.user_sm_vc || data_sm_vc.usuario_sm_vc,
        }
      }

      user_sm_vc.value  = data_sm_vc.user_sm_vc  || data_sm_vc.usuario_sm_vc || data_sm_vc.user
      token_sm_vc.value = data_sm_vc.access_token_sm_vc || data_sm_vc.token || data_sm_vc.access_token

      LocalStorage.set(
        'sentinnel_session',
        JSON.stringify({ user: user_sm_vc.value, token: token_sm_vc.value }),
      )
      LocalStorage.set('token_sm_vc', token_sm_vc.value)

      Notify.create({
        message: `Bienvenido, ${user_sm_vc.value?.nombre_sm_vc || ''}`,
        color:   'positive',
        icon:    'check_circle',
      })

      return true
    } catch (err_sm_vc) {
      error_sm_vc.value =
        err_sm_vc.response?.data?.message ||
        err_sm_vc?.message ||
        'Error inesperado al iniciar sesión.'
      Notify.create({ message: error_sm_vc.value, color: 'negative', icon: 'error' })
      return false
    } finally {
      // FIX reactividad: siempre se libera el estado de carga
      loading_sm_vc.value = false
    }
  }

  const cambiar_clave_inicial_sm_vc = async (
    correo_sm_vc,
    clave_temporal_sm_vc,
    nueva_clave_sm_vc,
  ) => {
    loading_sm_vc.value = true
    error_sm_vc.value   = null
    try {
      const resp_sm_vc = await cambiarClaveService_sm_vc(
        correo_sm_vc,
        clave_temporal_sm_vc,
        nueva_clave_sm_vc,
      )
      Notify.create({
        message: resp_sm_vc.message || 'Contraseña cambiada exitosamente.',
        color:   'positive',
      })
      return true
    } catch (err_sm_vc) {
      error_sm_vc.value =
        err_sm_vc.response?.data?.message ||
        err_sm_vc?.message ||
        'Error al cambiar la contraseña.'
      Notify.create({ message: error_sm_vc.value, color: 'negative', icon: 'error' })
      return false
    } finally {
      loading_sm_vc.value = false
    }
  }

  const logout_sm_vc = () => {
    user_sm_vc.value  = null
    token_sm_vc.value = null
    LocalStorage.remove('sentinnel_session')
    LocalStorage.remove('token_sm_vc')
    Notify.create({
      message: 'Sesión finalizada correctamente',
      color:   'info',
      icon:    'info',
    })
  }

  return {
    /* State */
    user_sm_vc,
    token_sm_vc,
    loading_sm_vc,
    error_sm_vc,

    /* Getters */
    is_authenticated_sm_vc,
    rol_sm_vc,
    is_admin_sm_vc,
    is_profesor_sm_vc,
    is_estudiante_sm_vc,
    puede_hacer_deploy_sm_vc,   // ← FIX #7
    nombreCorto_sm_vc,

    /* Alias legacy (usado en MainLayout.vue como auth.nombreCorto) */
    get nombreCorto() { return nombreCorto_sm_vc.value },

    /* Actions */
    login_sm_vc:                action_login_sm_vc,
    logout_sm_vc,
    cambiar_clave_inicial_sm_vc,
  }
})