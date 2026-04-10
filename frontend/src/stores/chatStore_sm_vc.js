// ══════════════════════════════════════════════════════════════════
// chatStore_sm_vc.js — Store de Chat en Tiempo Real (Socket.io)
//
// Responsabilidades centrales:
//   1. Gestionar el ciclo de vida de la conexión WebSocket autenticada.
//   2. Proveer `unirASala_sm_vc` / `salirDeSala_sm_vc` para que las vistas
//      puedan entrar y salir de conversaciones de forma explícita.
//   3. Inyectar los mensajes recibidos (`message_received_sm_vc`) directamente
//      al `conversacionStore_sm_vc`, manteniendo una sola fuente de verdad reactiva.
//   4. Exponer `salirDeSala_sm_vc` para que `onUnmounted` de las vistas Page
//      lo llame y prevenga conexiones huérfanas (memory leaks de sockets).
//
// Patrón de seguridad:
//   - El JWT se transmite en el handshake `auth.token`, nunca en la URL.
//   - `salirDeSala_sm_vc` verifica existencia antes de emitir/desconectar
//     para hacer la limpieza idempotente.
//
// Stack: Pinia Composition API + socket.io-client.
// Convención: sufijo _sm_vc en todo identificador (ver /stores/claude.md).
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'
import { LocalStorage } from 'quasar'

// ── Resolución robusta de la URL base del backend ──────────────────
// `process.env.API_URL` tiene el formato "http://host:port/api".
// Socket.io necesita la base sin el path "/api", por lo que la removemos.
// Si la variable no está definida, caemos al default de desarrollo.
const _resolverUrlWs_sm_vc = () => {
  const apiUrl_sm_vc = process.env.API_URL || 'http://localhost:4000/api'
  // Remover el sufijo "/api" si está presente para obtener la base del servidor
  return apiUrl_sm_vc.replace(/\/api\/?$/, '')
}

const WS_BASE_URL_sm_vc = _resolverUrlWs_sm_vc()

// ── Namespace del Gateway (debe coincidir con @WebSocketGateway en backend) ──
const WS_NAMESPACE_sm_vc = 'chat_sm_vc'

export const useChatStore_sm_vc = defineStore('chat_sm_vc', () => {
  /* ══════════════════════════════════════════════════════════════
   *  STATE
   * ══════════════════════════════════════════════════════════════ */

  /** Instancia activa de socket.io-client. null = sin conexión. */
  const socket_sm_vc = ref(null)

  /** true cuando el socket está conectado y el handshake fue exitoso. */
  const conectado_sm_vc = ref(false)

  /**
   * Identificador de la sala activa.
   * Formato: `conv:${estudianteId}:${materiaId || 'global'}`
   * null = sin sala activa.
   */
  const salaActual_sm_vc = ref(null)

  /** true mientras se establece la conexión inicial al servidor. */
  const conectando_sm_vc = ref(false)

  /** Último error WS capturado (string o null). */
  const errorWs_sm_vc = ref(null)

  /* ══════════════════════════════════════════════════════════════
   *  ACTIONS
   * ══════════════════════════════════════════════════════════════ */

  /**
   * Establece la conexión WebSocket con el namespace `chat_sm_vc`.
   *
   * - Lee el JWT desde `LocalStorage` usando la clave canónica del proyecto.
   * - Inyecta el token en el `auth` del handshake (nunca en la URL).
   * - Registra los listeners globales de `connect`, `disconnect` y
   *   `message_received_sm_vc` para recepción reactiva de mensajes.
   *
   * IDEMPOTENTE: si el socket ya está activo y conectado, no crea un duplicado.
   *
   * @returns {void}
   */
  const conectar_sm_vc = () => {
    // Prevenir conexiones duplicadas si ya hay un socket activo
    if (socket_sm_vc.value?.connected) return

    const token_sm_vc = LocalStorage.getItem('token_sm_vc')

    if (!token_sm_vc) {
      console.warn('[ChatStore] No se encontró token JWT. Abortando conexión WS.')
      errorWs_sm_vc.value = 'Sin token de autenticación.'
      return
    }

    conectando_sm_vc.value = true
    errorWs_sm_vc.value = null

    // Inicializar el socket con el namespace correcto y el JWT en el handshake
    socket_sm_vc.value = io(`${WS_BASE_URL_sm_vc}/${WS_NAMESPACE_sm_vc}`, {
      auth: {
        // El backend lee este campo en `client.handshake.auth.token`
        token: token_sm_vc,
      },
      // Evitar reconexión automática en el primer intento para dar feedback inmediato
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      // Usar websocket primero (más eficiente que polling)
      transports: ['websocket'],
    })

    /* ── Listener: Conexión exitosa ── */
    socket_sm_vc.value.on('connect', () => {
      conectado_sm_vc.value = true
      conectando_sm_vc.value = false
      errorWs_sm_vc.value = null
      console.info(`[ChatStore] Conectado al namespace /${WS_NAMESPACE_sm_vc}. Socket ID: ${socket_sm_vc.value.id}`)
    })

    /* ── Listener: Desconexión ── */
    socket_sm_vc.value.on('disconnect', (razon_sm_vc) => {
      conectado_sm_vc.value = false
      console.info(`[ChatStore] Desconectado. Razón: ${razon_sm_vc}`)
    })

    /* ── Listener: Error de conexión (ej. JWT inválido rechazado por backend) ── */
    socket_sm_vc.value.on('connect_error', (err_sm_vc) => {
      conectando_sm_vc.value = false
      conectado_sm_vc.value = false
      errorWs_sm_vc.value = err_sm_vc?.message || 'Error de conexión al servidor de chat.'
      console.error('[ChatStore] Error de conexión WS:', err_sm_vc?.message)
    })

    /* ── Listener: Nuevo mensaje en tiempo real ── */
    // El backend emite este evento a la sala cuando un mensaje es persistido en BD.
    // Inyectamos el mensaje directamente al conversacionStore para mantener una
    // sola fuente de verdad reactiva (evitamos duplicación de estado).
    socket_sm_vc.value.on('message_received_sm_vc', (mensaje_sm_vc) => {
      _inyectarMensajeEnStore_sm_vc(mensaje_sm_vc)
    })

    /* ── Listener: Errores de autorización del gateway ── */
    socket_sm_vc.value.on('error_sm_vc', (errorPayload_sm_vc) => {
      console.warn('[ChatStore] Error del Gateway:', errorPayload_sm_vc)
    })
  }

  /**
   * Une al usuario a una sala de conversación específica.
   *
   * Emite el evento `join_conversation_sm_vc` al backend, quien valida
   * los permisos según el rol del usuario antes de unirlo a la sala.
   * Actualiza `salaActual_sm_vc` con el ID construido localmente.
   *
   * PRECONDICIÓN: `conectar_sm_vc()` debe haber sido llamado antes.
   *
   * @param {number|string} estudianteId_sm_vc - ID del estudiante propietario de la sala.
   * @param {number|string|null} materiaId_sm_vc - ID de la materia. null = sala global.
   * @returns {void}
   */
  const unirASala_sm_vc = (estudianteId_sm_vc, materiaId_sm_vc = null) => {
    if (!socket_sm_vc.value?.connected) {
      console.warn('[ChatStore] Intento de unirASala sin conexión activa. Conectar primero.')
      return
    }

    // Construir el identificador de sala (debe coincidir con el del backend)
    const roomId_sm_vc = `conv:${estudianteId_sm_vc}:${materiaId_sm_vc || 'global'}`

    // Si ya estamos en esta sala, no reemitir el evento
    if (salaActual_sm_vc.value === roomId_sm_vc) return

    // Si estábamos en otra sala, salir primero (limpieza preventiva)
    if (salaActual_sm_vc.value) {
      socket_sm_vc.value.emit('leave_conversation_sm_vc', {
        estudianteId: estudianteId_sm_vc,
        materiaId: materiaId_sm_vc,
      })
    }

    // Emitir la solicitud de unirse a la nueva sala
    socket_sm_vc.value.emit('join_conversation_sm_vc', {
      estudianteId: Number(estudianteId_sm_vc),
      materiaId: materiaId_sm_vc ? Number(materiaId_sm_vc) : null,
    })

    salaActual_sm_vc.value = roomId_sm_vc
    console.info(`[ChatStore] Unido a sala: ${roomId_sm_vc}`)
  }

  /**
   * Emite un mensaje de texto a través del WebSocket.
   *
   * El backend persiste el mensaje en BD y luego hace broadcast
   * al resto de participantes de la sala vía `message_received_sm_vc`.
   *
   * @param {string} contenido_sm_vc - Texto del mensaje.
   * @param {number|string|null} materiaId_sm_vc - ID de la materia de contexto.
   * @param {number|null} documentoId_sm_vc - ID del documento adjunto (opcional).
   * @returns {void}
   */
  const enviarMensaje_sm_vc = (contenido_sm_vc, materiaId_sm_vc = null, documentoId_sm_vc = null) => {
    if (!socket_sm_vc.value?.connected) {
      console.warn('[ChatStore] Intento de enviarMensaje sin conexión activa.')
      return
    }

    // Construir el payload del mensaje según el DTO del backend (SendMessageDto_sm_vc)
    const payload_sm_vc = {
      contenido_sm_vc,
      materiaId: materiaId_sm_vc ? Number(materiaId_sm_vc) : null,
      tipo: documentoId_sm_vc ? 'DOCUMENTO' : 'TEXTO',
    }

    // Incluir el ID del documento si viene adjunto (sprint 3: archivos)
    if (documentoId_sm_vc) {
      payload_sm_vc.documentoId = Number(documentoId_sm_vc)
    }

    socket_sm_vc.value.emit('send_message_sm_vc', payload_sm_vc)
  }

  /**
   * Emite indicador de "escribiendo..." al resto de la sala.
   *
   * @param {boolean} estaEscribiendo_sm_vc - true = escribiendo, false = paró.
   * @returns {void}
   */
  const notificarEscribiendo_sm_vc = (estaEscribiendo_sm_vc) => {
    if (!socket_sm_vc.value?.connected) return
    socket_sm_vc.value.emit('typing_sm_vc', { isTyping: estaEscribiendo_sm_vc })
  }

  /**
   * Sale de la sala actual y desconecta el socket.
   *
   * DISEÑO CRÍTICO: Esta función está pensada para ser llamada desde
   * `onUnmounted` en las vistas Page. Al desmontar la página, se limpia
   * la conexión para evitar memory leaks y listeners huérfanos.
   *
   * IDEMPOTENTE: Si no hay socket o sala activa, no hace nada.
   *
   * @returns {void}
   */
  const salirDeSala_sm_vc = () => {
    if (!socket_sm_vc.value) return

    // Notificar al backend que salimos de la sala antes de desconectar
    if (salaActual_sm_vc.value && socket_sm_vc.value.connected) {
      socket_sm_vc.value.emit('leave_conversation_sm_vc')
    }

    // Desconectar y limpiar el estado local
    socket_sm_vc.value.disconnect()
    socket_sm_vc.value = null
    salaActual_sm_vc.value = null
    conectado_sm_vc.value = false

    console.info('[ChatStore] Socket desconectado y sala limpiada.')
  }

  /* ══════════════════════════════════════════════════════════════
   *  HELPERS PRIVADOS
   * ══════════════════════════════════════════════════════════════ */

  /**
   * Inyecta un mensaje recibido por WebSocket en el `conversacionStore_sm_vc`.
   *
   * Usamos importación dinámica para evitar dependencias circulares entre stores.
   * El mensaje se agrega al final del array `conversaciones_sm_vc` del store,
   * que es la fuente de verdad para todos los componentes de chat.
   *
   * @param {object} mensaje_sm_vc - Objeto mensaje formateado por el backend.
   * @returns {void}
   */
  const _inyectarMensajeEnStore_sm_vc = (mensaje_sm_vc) => {
    // Importación dinámica para evitar circular dependency store ↔ store
    import('src/stores/conversacionStore').then(({ useConversacionStore_sm_vc }) => {
      const conversacionStore_sm_vc = useConversacionStore_sm_vc()
      // Agregar el mensaje en tiempo real al array reactivo sin rehacer el fetch
      conversacionStore_sm_vc.conversaciones_sm_vc.push(mensaje_sm_vc)
    })
  }

  /* ══════════════════════════════════════════════════════════════
   *  RETURN (API pública del store)
   * ══════════════════════════════════════════════════════════════ */
  return {
    /* State (reactivo para que los componentes puedan observar) */
    socket_sm_vc,
    conectado_sm_vc,
    conectando_sm_vc,
    salaActual_sm_vc,
    errorWs_sm_vc,

    /* Actions */
    conectar_sm_vc,
    unirASala_sm_vc,
    enviarMensaje_sm_vc,
    notificarEscribiendo_sm_vc,
    salirDeSala_sm_vc, // ⬅ EXPUESTO para onUnmounted en vistas Page
  }
})
