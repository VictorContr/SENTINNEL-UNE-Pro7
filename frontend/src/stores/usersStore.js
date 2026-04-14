import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { findAll_sm_vc, findOne_sm_vc, toggleBan_sm_vc, create_sm_vc, update_sm_vc } from 'src/services/usersService'
import { getDetalleEstudiante_sm_vc } from 'src/services/estudiantesService'

/**
 * SENTINNEL - usersStore
 * Administra el estado global de los usuarios desde la vista de ADMIN.
 */

export const useUsersStore = defineStore('users', () => {
  /* ─ Estado ─ */
  const usuarios_sm_vc = ref([])
  const usuarioActual_sm_vc = ref(null)
  const cargando_usuarios_sm_vc = ref(false)
  const error_usuarios_sm_vc = ref(null)

  /* ─ Acciones ─ */
  
  /**
   * Obtiene la lista completa de usuarios
   */
  const fetch_usuarios_sm_vc = async () => {
    cargando_usuarios_sm_vc.value = true
    error_usuarios_sm_vc.value = null
    try {
      const data_sm_vc = await findAll_sm_vc()
      // Si el backend retorna un objeto paginado con usuarios_sm_vc, extraemos el arreglo.
      usuarios_sm_vc.value = Array.isArray(data_sm_vc) ? data_sm_vc : (data_sm_vc.usuarios_sm_vc || [])
    } catch (err_sm_vc) {
      error_usuarios_sm_vc.value = err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al obtener usuarios.'
      Notify.create({ message: error_usuarios_sm_vc.value, color: 'negative', icon: 'error' })
    } finally {
      cargando_usuarios_sm_vc.value = false
    }
  }

  /**
   * Obtiene detalles de un usuario
   * @param {string} id_sm_vc
   */
  const fetch_usuario_sm_vc = async (id_sm_vc) => {
    cargando_usuarios_sm_vc.value = true
    error_usuarios_sm_vc.value = null
    try {
      const data_sm_vc = await findOne_sm_vc(id_sm_vc)
      usuarioActual_sm_vc.value = data_sm_vc
      return data_sm_vc
    } catch (err_sm_vc) {
      error_usuarios_sm_vc.value = err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al buscar el usuario.'
      Notify.create({ message: error_usuarios_sm_vc.value, color: 'negative', icon: 'error' })
      return null
    } finally {
      cargando_usuarios_sm_vc.value = false
    }
  }

  /**
   * Crea un usuario
   * @param {Object} datos_sm_vc
   */
  const create_usuario_sm_vc = async (datos_sm_vc) => {
    cargando_usuarios_sm_vc.value = true
    error_usuarios_sm_vc.value = null
    try {
      const nuevo_sm_vc = await create_sm_vc(datos_sm_vc)
      usuarios_sm_vc.value.unshift(nuevo_sm_vc)
      return nuevo_sm_vc
    } catch (err_sm_vc) {
      error_usuarios_sm_vc.value = err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al crear usuario.'
      Notify.create({ message: error_usuarios_sm_vc.value, color: 'negative', icon: 'error' })
      return null
    } finally {
      cargando_usuarios_sm_vc.value = false
    }
  }

  /**
   * Actualiza un usuario
   * @param {Object} datos_sm_vc
   */
  const update_usuario_sm_vc = async (datos_sm_vc) => {
    const { id_sm_vc, ...payload_sm_vc } = datos_sm_vc
    
    // Saneamiento de payload para evitar error 400
    delete payload_sm_vc.fecha_creacion_sm_vc
    if (!payload_sm_vc.clave_sm_vc) {
      delete payload_sm_vc.clave_sm_vc
    }

    cargando_usuarios_sm_vc.value = true
    error_usuarios_sm_vc.value = null
    try {
      const editado_sm_vc = await update_sm_vc(id_sm_vc, payload_sm_vc)
      const idx_sm_vc = usuarios_sm_vc.value.findIndex(u => u.id_sm_vc === id_sm_vc || u.id === id_sm_vc)
      if (idx_sm_vc !== -1) {
        usuarios_sm_vc.value[idx_sm_vc] = { ...usuarios_sm_vc.value[idx_sm_vc], ...editado_sm_vc }
      }
      return editado_sm_vc
    } catch (err_sm_vc) {
      error_usuarios_sm_vc.value = err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al actualizar usuario.'
      Notify.create({ message: error_usuarios_sm_vc.value, color: 'negative', icon: 'error' })
      return null
    } finally {
      cargando_usuarios_sm_vc.value = false
    }
  }

  /**
   * Cambia el estado (activo/inactivo) de un usuario
   * @param {string} id_sm_vc
   */
  const ban_usuario_sm_vc = async (id_sm_vc) => {
    cargando_usuarios_sm_vc.value = true
    error_usuarios_sm_vc.value = null
    try {
      const resp_sm_vc = await toggleBan_sm_vc(id_sm_vc)
      Notify.create({ message: 'Estado de usuario actualizado correctamente.', color: 'positive' })
      
      // Actualizamos localmente en la lista ref
      const idx_sm_vc = usuarios_sm_vc.value.findIndex(u_sm_vc => u_sm_vc.id_sm_vc === id_sm_vc || u_sm_vc.id === id_sm_vc)
      if (idx_sm_vc !== -1) {
        usuarios_sm_vc.value[idx_sm_vc] = { ...usuarios_sm_vc.value[idx_sm_vc], ...resp_sm_vc }
      }
      return true
    } catch (err_sm_vc) {
      error_usuarios_sm_vc.value = err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al actualizar estado del usuario.'
      Notify.create({ message: error_usuarios_sm_vc.value, color: 'negative', icon: 'error' })
      return false
    } finally {
      cargando_usuarios_sm_vc.value = false
    }
  }

  /**
   * Obtiene el perfil completo de un estudiante (incluyendo datos de usuario)
   * basado en el ID de la tabla Estudiante. Aplica Adapter Pattern para
   * aplanar la respuesta y mantener compatibilidad con usuarioActual_sm_vc.
   * @param {string|number} estudianteId_sm_vc
   */
  const fetch_perfil_estudiante_sm_vc = async (estudianteId_sm_vc) => {
    cargando_usuarios_sm_vc.value = true
    error_usuarios_sm_vc.value = null
    try {
      const data_sm_vc = await getDetalleEstudiante_sm_vc(estudianteId_sm_vc)
      
      // ADAPTER PATTERN: Aplanamos la estructura { usuario, ...estudiante }
      // para que consumible sea el mismo que usuarioActual_sm_vc.
      usuarioActual_sm_vc.value = {
        ...data_sm_vc.usuario,             // id_sm_vc, nombre, apellido, correo, rol
        estudiante_id_sm_vc: data_sm_vc.id_sm_vc,
        empresa_sm_vc:       data_sm_vc.empresa_sm_vc,
        profesor_id_sm_vc:   data_sm_vc.profesor_id_sm_vc,
        estudiante_sm_vc: {                // Metadatos adicionales para el header de trazabilidad
          profesorTutor:          data_sm_vc.profesor_tutor,
          tutor_empresarial_sm_vc: data_sm_vc.tutor_empresarial_sm_vc,
          empresa_sm_vc:           data_sm_vc.empresa_sm_vc,
          titulo_proyecto_sm_vc:   data_sm_vc.titulo_proyecto_sm_vc
        }
      }
      return usuarioActual_sm_vc.value
    } catch (err_sm_vc) {
      error_usuarios_sm_vc.value = err_sm_vc.response?.data?.message || err_sm_vc.message || 'Error al cargar perfil del estudiante.'
      Notify.create({ message: error_usuarios_sm_vc.value, color: 'negative', icon: 'error' })
      return null
    } finally {
      cargando_usuarios_sm_vc.value = false
    }
  }

  return {
    usuarios_sm_vc,
    usuarioActual_sm_vc,
    cargando_usuarios_sm_vc,
    error_usuarios_sm_vc,

    fetch_usuarios_sm_vc,
    fetch_usuario_sm_vc,
    fetch_perfil_estudiante_sm_vc,
    create_usuario_sm_vc,
    update_usuario_sm_vc,
    ban_usuario_sm_vc
  }
})
