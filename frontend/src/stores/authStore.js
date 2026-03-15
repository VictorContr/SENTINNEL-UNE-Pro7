import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * SENTINNEL – authStore
 * Simula autenticación JWT con roles y sesión persistente en localStorage.
 * Campos de usuario respetan la convención de sufijos Prisma (_sm_vc, _sm_int, etc.)
 */

/* ── Usuarios ficticios para el prototipo ── */
const MOCK_USERS = [
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
  const user = ref(null)
  const token_sm_vc = ref(null)
  const loading_sm_vc = ref(false)
  const error_sm_vc = ref(null)

  /* ── Hydrate from localStorage ── */
  const _hydrate = () => {
    try {
      const stored = localStorage.getItem('sentinnel_session')
      if (stored) {
        const parsed = JSON.parse(stored)
        user.value = parsed.user
        token_sm_vc.value = parsed.token
      }
    } catch {
      localStorage.removeItem('sentinnel_session')
    }
  }
  _hydrate()

  /* ── Getters ── */
  const isAuthenticated = computed(() => !!token_sm_vc.value && !!user.value)
  const rol = computed(() => user.value?.rol_sm_vc ?? null)
  const isAdmin = computed(() => rol.value === 'ADMINISTRADOR')
  const isProfesor = computed(() => rol.value === 'PROFESOR')
  const isEstudiante = computed(() => rol.value === 'ESTUDIANTE')
  const nombreCorto = computed(() => {
    if (!user.value?.nombre_sm_vc) return ''
    return user.value.nombre_sm_vc.split(' ')[0]
  })

  /* ── Actions ── */
  async function login(correo_sm_vc_input, clave_sm_vc_input) {
    loading_sm_vc.value = true
    error_sm_vc.value = null

    /* Simular latencia de red */
    await new Promise((r) => setTimeout(r, 900))

    const found = MOCK_USERS.find(
      (u) =>
        u.correo_sm_vc === correo_sm_vc_input.trim().toLowerCase() &&
        u.clave_sm_vc === clave_sm_vc_input
    )

    if (!found) {
      error_sm_vc.value = 'Credenciales inválidas. Verifica tu correo y contraseña.'
      loading_sm_vc.value = false
      return false
    }

    if (!found.activo_sm_vc) {
      error_sm_vc.value = 'Tu cuenta ha sido revocada. Contacta al administrador.'
      loading_sm_vc.value = false
      return false
    }

    /* Generar token simulado */
    const fakeToken = `sntnl_${btoa(found.id_sm_vc + ':' + Date.now())}`
    const { clave_sm_vc: _, ...safeUser } = found

    user.value = safeUser
    token_sm_vc.value = fakeToken

    localStorage.setItem(
      'sentinnel_session',
      JSON.stringify({ user: safeUser, token: fakeToken })
    )

    loading_sm_vc.value = false
    return true
  }

  function logout() {
    user.value = null
    token_sm_vc.value = null
    localStorage.removeItem('sentinnel_session')
  }

  function banUser(id_sm_vc_target) {
    /* Solo para prototipo: marca el usuario como inactivo en la lista mock */
    const idx = MOCK_USERS.findIndex((u) => u.id_sm_vc === id_sm_vc_target)
    if (idx !== -1) MOCK_USERS[idx].activo_sm_vc = false
  }

  return {
    user,
    token_sm_vc,
    loading_sm_vc,
    error_sm_vc,
    isAuthenticated,
    rol,
    isAdmin,
    isProfesor,
    isEstudiante,
    nombreCorto,
    login,
    logout,
    banUser,
    MOCK_USERS
  }
})
