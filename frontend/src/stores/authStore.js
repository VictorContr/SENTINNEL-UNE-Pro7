// ══════════════════════════════════════════════════════════════════
// authStore.js — Autenticación Mock-First con sesión persistente.
// Toda la API pública lleva sufijo _sm_vc según convención SENTINNEL.
// Persistencia delegada a $q.LocalStorage (nunca window.localStorage).
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalStorage } from 'quasar'

/* Semilla de usuarios para el prototipo — no se muta directamente */
const SEMILLA_USUARIOS_sm_vc = [
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
  /* ── Estado reactivo ── */
  const user_sm_vc = ref(null)
  const token_sm_vc = ref(null)
  const loading_sm_vc = ref(false)
  const error_sm_vc = ref(null)

  /* Copia reactiva de mock; no muta la semilla original */
  const MOCK_USERS_sm_vc = ref(
    SEMILLA_USUARIOS_sm_vc.map((u_sm_vc) => ({ ...u_sm_vc }))
  )

  /* Hidratación desde $q.LocalStorage al montar el store */
  const _hidratar_sm_vc = () => {
    try {
      const sesion_sm_vc = LocalStorage.getItem('sentinnel_session')
      if (sesion_sm_vc) {
        const datos_sm_vc = JSON.parse(sesion_sm_vc)
        user_sm_vc.value = datos_sm_vc.user
        token_sm_vc.value = datos_sm_vc.token
      }
    } catch {
      LocalStorage.remove('sentinnel_session')
    }
  }
  _hidratar_sm_vc()

  /* ── Getters computados ── */
  const isAuthenticated_sm_vc = computed(
    () => !!token_sm_vc.value && !!user_sm_vc.value
  )
  const rol_sm_vc = computed(() => user_sm_vc.value?.rol_sm_vc ?? null)
  const isAdmin_sm_vc = computed(() => rol_sm_vc.value === 'ADMINISTRADOR')
  const isProfesor_sm_vc = computed(() => rol_sm_vc.value === 'PROFESOR')
  const isEstudiante_sm_vc = computed(() => rol_sm_vc.value === 'ESTUDIANTE')
  const nombreCorto_sm_vc = computed(() =>
    user_sm_vc.value?.nombre_sm_vc?.split(' ')[0] ?? ''
  )

  /* ── Acción: iniciar sesión con credenciales mock ── */
  const login_sm_vc = async (correo_sm_vc, clave_sm_vc) => {
    loading_sm_vc.value = true
    error_sm_vc.value = null

    try {
      /* Simula latencia de red */
      await new Promise((r) => setTimeout(r, 900))

      const encontrado_sm_vc = MOCK_USERS_sm_vc.value.find(
        (u_sm_vc) =>
          u_sm_vc.correo_sm_vc === correo_sm_vc.trim().toLowerCase() &&
          u_sm_vc.clave_sm_vc === clave_sm_vc
      )

      if (!encontrado_sm_vc) {
        error_sm_vc.value = 'Credenciales inválidas. Verifica tu correo y contraseña.'
        return false
      }
      if (!encontrado_sm_vc.activo_sm_vc) {
        error_sm_vc.value = 'Tu cuenta ha sido revocada. Contacta al administrador.'
        return false
      }

      const tokenSimulado_sm_vc = `sntnl_${btoa(encontrado_sm_vc.id_sm_vc + ':' + Date.now())}`
      const usuarioSeguro_sm_vc = { ...encontrado_sm_vc }
      delete usuarioSeguro_sm_vc.clave_sm_vc

      user_sm_vc.value = usuarioSeguro_sm_vc
      token_sm_vc.value = tokenSimulado_sm_vc

      /* Persistencia vía Quasar LocalStorage — jamás window.localStorage */
      LocalStorage.set(
        'sentinnel_session',
        JSON.stringify({ user: usuarioSeguro_sm_vc, token: tokenSimulado_sm_vc })
      )

      return true
    } catch (err_sm_vc) {
      error_sm_vc.value = err_sm_vc?.message || 'Error inesperado al iniciar sesión.'
      return false
    } finally {
      loading_sm_vc.value = false
    }
  }

  /* ── Acción: cerrar sesión y limpiar persistencia ── */
  const logout_sm_vc = () => {
    user_sm_vc.value = null
    token_sm_vc.value = null
    LocalStorage.remove('sentinnel_session')
  }

  /* ── Acción: soft-delete — toggle activo del usuario ── */
  const banUser_sm_vc = (idObjetivo_sm_vc) => {
    const objetivo_sm_vc = MOCK_USERS_sm_vc.value.find(
      (u_sm_vc) => u_sm_vc.id_sm_vc === idObjetivo_sm_vc
    )
    if (objetivo_sm_vc) {
      objetivo_sm_vc.activo_sm_vc = !objetivo_sm_vc.activo_sm_vc
    }
  }

  /* ── Acción: agregar usuario al array reactivo mock ── */
  const crearUsuario_sm_vc = (datos_sm_vc) => {
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

  /* ── Acción: actualizar campos de usuario existente ── */
  const actualizarUsuario_sm_vc = (datos_sm_vc) => {
    const idx_sm_vc = MOCK_USERS_sm_vc.value.findIndex(
      (u_sm_vc) => u_sm_vc.id_sm_vc === datos_sm_vc.id_sm_vc
    )
    if (idx_sm_vc !== -1) {
      MOCK_USERS_sm_vc.value[idx_sm_vc] = {
        ...MOCK_USERS_sm_vc.value[idx_sm_vc],
        ...datos_sm_vc,
        id_sm_vc: MOCK_USERS_sm_vc.value[idx_sm_vc].id_sm_vc
      }
      return MOCK_USERS_sm_vc.value[idx_sm_vc]
    }
    throw new Error('Usuario no encontrado')
  }

  return {
    /* Estado */
    user_sm_vc,
    token_sm_vc,
    loading_sm_vc,
    error_sm_vc,
    MOCK_USERS_sm_vc,
    /* Getters */
    isAuthenticated_sm_vc,
    rol_sm_vc,
    isAdmin_sm_vc,
    isProfesor_sm_vc,
    isEstudiante_sm_vc,
    nombreCorto_sm_vc,
    /* Acciones */
    login_sm_vc,
    logout_sm_vc,
    banUser_sm_vc,
    crearUsuario_sm_vc,
    actualizarUsuario_sm_vc
  }
})