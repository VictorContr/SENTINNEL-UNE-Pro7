import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * SENTINNEL – authStore
 * Simula autenticación JWT con roles y sesión persistente en localStorage.
 * Campos de usuario respetan la convención de sufijos Prisma (_sm_vc, _sm_int, etc.)
 */

/* ── Usuarios ficticios para el prototipo ── */
const MOCK_USERS_SEED_sm_vc = [
  {
    id_sm_vc: 'USR-001',
    nombre_sm_vc: 'Carlos Mendoza',
    correo_sm_vc: 'admin@une.edu.ve',
    clave_sm_vc: 'admin123',
    rol_sm_vc: 'ADMINISTRADOR',
    avatar_sm_vc: null,
    activo_sm_vc: true,
    cohorte_sm_vc: null,
    profesor_id_sm_vc: null
  },
  {
    id_sm_vc: 'USR-002',
    nombre_sm_vc: 'Prof. Ana Torres',
    correo_sm_vc: 'profesor@une.edu.ve',
    clave_sm_vc: 'prof123',
    rol_sm_vc: 'PROFESOR',
    avatar_sm_vc: null,
    activo_sm_vc: true,
    cohorte_sm_vc: null,
    profesor_id_sm_vc: null
  },
  {
    id_sm_vc: 'USR-003',
    nombre_sm_vc: 'Luis Ramírez',
    correo_sm_vc: 'estudiante@une.edu.ve',
    clave_sm_vc: 'est123',
    rol_sm_vc: 'ESTUDIANTE',
    avatar_sm_vc: null,
    activo_sm_vc: true,
    cohorte_sm_vc: '2024-A',
    profesor_id_sm_vc: 'USR-002'
  }
]

export const useAuthStore = defineStore('auth', () => {
  /* ── State ── */
  const user_sm_vc = ref(null)
  const token_sm_vc = ref(null)
  const loading_sm_vc = ref(false)
  const error_sm_vc = ref(null)

  /* ── Reactive copy of mock users (not mutating the seed) ── */
  const MOCK_USERS_sm_vc = ref(
    MOCK_USERS_SEED_sm_vc.map((u) => ({ ...u }))
  )

  /* ── Hydrate from localStorage ── */
  const _hidratar_sm_vc = () => {
    try {
      const stored_sm_vc = localStorage.getItem('sentinnel_session')
      if (stored_sm_vc) {
        const parsed_sm_vc = JSON.parse(stored_sm_vc)
        user_sm_vc.value = parsed_sm_vc.user
        token_sm_vc.value = parsed_sm_vc.token
      }
    } catch {
      localStorage.removeItem('sentinnel_session')
    }
  }
  _hidratar_sm_vc()

  /* ── Getters ── */
  const is_authenticated_sm_vc = computed(() => !!token_sm_vc.value && !!user_sm_vc.value)
  const rol_sm_vc = computed(() => user_sm_vc.value?.rol_sm_vc ?? null)
  const is_admin_sm_vc = computed(() => rol_sm_vc.value === 'ADMINISTRADOR')
  const is_profesor_sm_vc = computed(() => rol_sm_vc.value === 'PROFESOR')
  const is_estudiante_sm_vc = computed(() => rol_sm_vc.value === 'ESTUDIANTE')
  const nombre_corto_sm_vc = computed(() => {
    if (!user_sm_vc.value?.nombre_sm_vc) return ''
    return user_sm_vc.value.nombre_sm_vc.split(' ')[0]
  })

  /* ── Actions ── */
  async function login_sm_vc(correo_input_sm_vc, clave_input_sm_vc) {
    loading_sm_vc.value = true
    error_sm_vc.value = null

    try {
      /* Simular latencia de red */
      await new Promise((r) => setTimeout(r, 900))

      const found_sm_vc = MOCK_USERS_sm_vc.value.find(
        (u) =>
          u.correo_sm_vc === correo_input_sm_vc.trim().toLowerCase() &&
          u.clave_sm_vc === clave_input_sm_vc
      )

      if (!found_sm_vc) {
        error_sm_vc.value = 'Credenciales inválidas. Verifica tu correo y contraseña.'
        return false
      }

      if (!found_sm_vc.activo_sm_vc) {
        error_sm_vc.value = 'Tu cuenta ha sido revocada. Contacta al administrador.'
        return false
      }

      /* Generar token simulado */
      const fake_token_sm_vc = `sntnl_${btoa(found_sm_vc.id_sm_vc + ':' + Date.now())}`
      const safe_user_sm_vc = { ...found_sm_vc }
      delete safe_user_sm_vc.clave_sm_vc

      user_sm_vc.value = safe_user_sm_vc
      token_sm_vc.value = fake_token_sm_vc

      localStorage.setItem(
        'sentinnel_session',
        JSON.stringify({ user: safe_user_sm_vc, token: fake_token_sm_vc })
      )

      return true
    } catch (err_sm_vc) {
      error_sm_vc.value = err_sm_vc?.message || 'Error inesperado al iniciar sesión.'
      return false
    } finally {
      loading_sm_vc.value = false
    }
  }

  function logout_sm_vc() {
    user_sm_vc.value = null
    token_sm_vc.value = null
    localStorage.removeItem('sentinnel_session')
  }

  function ban_user_sm_vc(id_target_sm_vc) {
    /* Soft-delete: marca como inactivo en la copia reactiva */
    const usuario_sm_vc = MOCK_USERS_sm_vc.value.find((u) => u.id_sm_vc === id_target_sm_vc)
    if (usuario_sm_vc) {
      usuario_sm_vc.activo_sm_vc = !usuario_sm_vc.activo_sm_vc
    }
  }

  function crear_usuario_sm_vc(datos_sm_vc) {
    /* Acción mock: agrega un usuario al array reactivo local */
    const nuevo_sm_vc = {
      id_sm_vc: `USR-${String(MOCK_USERS_sm_vc.value.length + 1).padStart(3, '0')}`,
      nombre_sm_vc: datos_sm_vc.nombre_sm_vc,
      correo_sm_vc: datos_sm_vc.correo_sm_vc,
      clave_sm_vc: datos_sm_vc.clave_sm_vc || 'temp123',
      rol_sm_vc: datos_sm_vc.rol_sm_vc || 'ESTUDIANTE',
      avatar_sm_vc: null,
      activo_sm_vc: true,
      cohorte_sm_vc: datos_sm_vc.cohorte_sm_vc || null,
      profesor_id_sm_vc: datos_sm_vc.profesor_id_sm_vc || null
    }
    MOCK_USERS_sm_vc.value.push(nuevo_sm_vc)
    return nuevo_sm_vc
  }

  return {
    /* State */
    user: user_sm_vc,
    token_sm_vc,
    loading_sm_vc,
    error_sm_vc,
    MOCK_USERS: MOCK_USERS_sm_vc,

    /* Getters */
    isAuthenticated: is_authenticated_sm_vc,
    rol: rol_sm_vc,
    isAdmin: is_admin_sm_vc,
    isProfesor: is_profesor_sm_vc,
    isEstudiante: is_estudiante_sm_vc,
    nombreCorto: nombre_corto_sm_vc,

    /* Actions */
    login: login_sm_vc,
    logout: logout_sm_vc,
    banUser: ban_user_sm_vc,
    crearUsuario: crear_usuario_sm_vc
  }
})
