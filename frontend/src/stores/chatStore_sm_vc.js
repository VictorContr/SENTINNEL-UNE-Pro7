// ══════════════════════════════════════════════════════════════════
// chatStore_sm_vc.js — Store de Chat en Tiempo Real (Socket.io)
// Sprint 5: Resiliencia y QA — Estado de conexión, Typing Indicator,
//            y Notificaciones de Error de servidor via Quasar Notify.
//
// Responsabilidades centrales:
//   1. Gestionar el ciclo de vida de la conexión WebSocket autenticada.
//   2. Exponer `estadoConexion_sm_vc` ('online' | 'offline' | 'reconnecting')
//      para que la UI muestre banners de alerta reactivos.
//   3. Escuchar `typing_status_sm_vc` del backend y exponer `alguienEscribiendo_sm_vc`
//      para el indicador visual de "Escribiendo...".
//   4. Interceptar el evento `error_sm_vc` del gateway y mostrarlo como
//      notificación Quasar (roja) para feedback inmediato al usuario.
//   5. Inyectar mensajes recibidos (`message_received_sm_vc`) directamente
//      al `conversacionStore_sm_vc`, manteniendo una sola fuente de verdad.
//   6. Exponer `salirDeSala_sm_vc` para que `onUnmounted` de las vistas Page
//      lo llame y prevenga conexiones huérfanas (memory leaks de sockets).
//
// Patrón de seguridad:
//   - El JWT se transmite en el handshake `auth.token`, nunca en la URL.
//   - `salirDeSala_sm_vc` verifica existencia antes de emitir/desconectar
//     para hacer la limpieza idempotente.
//
// Stack: Pinia Composition API + socket.io-client + Quasar Notify.
// Convención: sufijo _sm_vc en todo identificador.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { io } from "socket.io-client";
import { LocalStorage, Notify } from "quasar";
import { useAuthStore } from "src/stores/authStore";

// ── Resolución robusta de la URL base del backend ──────────────────
// `process.env.API_URL` tiene el formato "http://host:port/api".
// Socket.io necesita la base sin el path "/api", por lo que la removemos.
// Si la variable no está definida, caemos al default de desarrollo.
const _resolverUrlWs_sm_vc = () => {
  const apiUrl_sm_vc = process.env.API_URL || "http://localhost:4000/api";
  // Remover el sufijo "/api" si está presente para obtener la base del servidor
  return apiUrl_sm_vc.replace(/\/api\/?$/, "");
};

const WS_BASE_URL_sm_vc = _resolverUrlWs_sm_vc();

// ── Namespace del Gateway (debe coincidir con @WebSocketGateway en backend) ──
const WS_NAMESPACE_sm_vc = "chat_sm_vc";

// ── Tiempo máximo (ms) que puede mantenerse el estado "escribiendo" sin renovarse ──
// Si el backend deja de enviar señales de typing, limpiamos automáticamente.
const TYPING_TIMEOUT_MS_sm_vc = 3500;

export const useChatStore_sm_vc = defineStore("chat_sm_vc", () => {
  /* ══════════════════════════════════════════════════════════════
   *  STATE
   * ══════════════════════════════════════════════════════════════ */

  /** Instancia activa de socket.io-client. null = sin conexión. */
  const socket_sm_vc = ref(null);

  /**
   * Estado de la conexión WebSocket. Valores posibles:
   *   'online'       → Socket conectado y operativo.
   *   'offline'      → Desconectado (pérdida de red, cierre del servidor, etc.).
   *   'reconnecting' → Socket intentando reconectar automáticamente.
   *
   * Este estado se usa en la UI para mostrar el banner de alerta amarillo/rojo.
   */
  const estadoConexion_sm_vc = ref("offline");

  /**
   * Mapa reactivo de usuarios que están escribiendo actualmente en la sala.
   * Clave: `userId` (número del sub del JWT del remitente).
   * Valor: `true` (están escribiendo) — la clave se elimina cuando paran.
   *
   * Uso: `Object.keys(escribiendo_sm_vc.value).length > 0` indica actividad.
   */
  const escribiendo_sm_vc = ref({});

  /**
   * Mapa interno de timers para auto-limpiar el estado "escribiendo".
   * Si no llega una señal de `isTyping: false` del backend en TYPING_TIMEOUT_MS_sm_vc,
   * el usuario se elimina del mapa automáticamente.
   */
  const _timerEscribiendo_sm_vc = ref({});

  /**
   * Identificador de la sala activa.
   * Formato: `conv:${estudianteId}:${materiaId || 'global'}`
   * null = sin sala activa.
   */
  const salaActual_sm_vc = ref(null);

  /** true mientras se establece la conexión inicial al servidor. */
  const conectando_sm_vc = ref(false);

  /** Último error WS capturado (string o null). */
  const errorWs_sm_vc = ref(null);

  /* ══════════════════════════════════════════════════════════════
   *  COMPUTED
   * ══════════════════════════════════════════════════════════════ */

  /**
   * true si al menos un usuario en la sala está escribiendo actualmente.
   * Útil para el indicador visual "Alguien está escribiendo...".
   * Computed reactivo: se actualiza automáticamente cuando cambia `escribiendo_sm_vc`.
   */
  const alguienEscribiendo_sm_vc = computed(
    () => Object.keys(escribiendo_sm_vc.value).length > 0,
  );

  /**
   * true cuando el socket está conectado y operativo.
   * Derivado de `estadoConexion_sm_vc` para simplificar templates.
   */
  const conectado_sm_vc = computed(
    () => estadoConexion_sm_vc.value === "online",
  );

  /* ══════════════════════════════════════════════════════════════
   *  ACTIONS
   * ══════════════════════════════════════════════════════════════ */

  /**
   * Establece la conexión WebSocket con el namespace `chat_sm_vc`.
   *
   * - Lee el JWT desde `LocalStorage` usando la clave canónica del proyecto.
   * - Inyecta el token en el `auth` del handshake (nunca en la URL).
   * - Registra TODOS los listeners globales de ciclo de vida y eventos.
   *
   * IDEMPOTENTE: si el socket ya está activo y conectado, no crea un duplicado.
   *
   * @returns {void}
   */
  const conectar_sm_vc = () => {
    // Prevenir conexiones duplicadas si ya hay un socket activo
    if (socket_sm_vc.value?.connected) return;

    const token_sm_vc = LocalStorage.getItem("token_sm_vc");

    if (!token_sm_vc) {
      console.warn(
        "[ChatStore] No se encontró token JWT. Abortando conexión WS.",
      );
      errorWs_sm_vc.value = "Sin token de autenticación.";
      return;
    }

    conectando_sm_vc.value = true;
    errorWs_sm_vc.value = null;

    // Inicializar el socket con el namespace correcto y el JWT en el handshake
    socket_sm_vc.value = io(`${WS_BASE_URL_sm_vc}/${WS_NAMESPACE_sm_vc}`, {
      // [FIX] Autenticación DINÁMICA: callback se ejecuta en cada intento de conexión/reconexión
      // Esto evita el "token fantasma" cuando el JWT se renueva tras logout/login
      auth: (cb_sm_vc) => {
        const tokenFresco_sm_vc = LocalStorage.getItem("token_sm_vc");
        cb_sm_vc({ token: tokenFresco_sm_vc });
      },
      // Reconexión automática con backoff exponencial (max 5 intentos, 2s de espera inicial)
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      // Forzar nueva conexión si ya existe una previa (evita reusar socket con token viejo)
      forceNew: true,
      // Usar websocket primero (más eficiente que polling)
      transports: ["websocket"],
    });

    // ══════════════════════════════════════════════════════════════
    // LISTENERS DE CICLO DE VIDA (Sprint 5: Resiliencia)
    // ══════════════════════════════════════════════════════════════

    /**
     * connect — Socket conectado exitosamente al servidor.
     * Marca el estado como 'online' y limpia cualquier error previo.
     */
    socket_sm_vc.value.on("connect", () => {
      estadoConexion_sm_vc.value = "online";
      conectando_sm_vc.value = false;
      errorWs_sm_vc.value = null;
      console.info(
        `[ChatStore] Conectado al namespace /${WS_NAMESPACE_sm_vc}. ` +
          `Socket ID: ${socket_sm_vc.value.id}`,
      );
    });

    /**
     * disconnect — Socket desconectado del servidor.
     *
     * Razones comunes:
     *   'io server disconnect' → El servidor cerró la conexión explícitamente (JWT expirado).
     *   'transport close'      → Pérdida de red del cliente.
     *   'ping timeout'         → El servidor no respondió al ping a tiempo.
     *
     * Estado → 'offline'. Socket.io intentará reconectar automáticamente
     * (a menos que el servidor haya cerrado la conexión intencionalmente).
     *
     * [SECURITY] Si el servidor desconectó explícitamente, verificamos si es
     * por JWT expirado comparando con el estado del error previo.
     */
    socket_sm_vc.value.on("disconnect", (razon_sm_vc) => {
      estadoConexion_sm_vc.value = "offline";
      // Limpiar indicadores de escritura al perder la conexión
      escribiendo_sm_vc.value = {};
      console.info(`[ChatStore] Desconectado. Razón: ${razon_sm_vc}`);

      // Si el servidor forzó la desconexión y hay error de JWT, manejar sesión expirada
      if (
        razon_sm_vc === "io server disconnect" &&
        errorWs_sm_vc.value?.includes("jwt")
      ) {
        manejarSesionExpirada_sm_vc();
      }
    });

    /**
     * connect_error — Error al intentar conectar o reconectar.
     *
     * Ocurre cuando el servidor rechaza el handshake (JWT inválido/expirado)
     * o cuando no hay red disponible durante un intento de reconexión.
     * Estado → 'reconnecting' para indicar que Socket.io está reintentando.
     *
     * [SECURITY] Si el error es JWT expirado o Unauthorized, forzamos logout
     * para evitar que el usuario permanezca en la app con un token inválido.
     */
    socket_sm_vc.value.on("connect_error", (err_sm_vc) => {
      const mensajeError_sm_vc = err_sm_vc?.message || "";

      // Detectar si el error es por JWT expirado o no autorizado
      if (
        mensajeError_sm_vc.includes("jwt expired") ||
        mensajeError_sm_vc.includes("Unauthorized") ||
        mensajeError_sm_vc.includes("Token inválido")
      ) {
        console.error(
          "[ChatStore] JWT expirado o inválido. Forzando logout...",
        );
        manejarSesionExpirada_sm_vc();
        return;
      }

      estadoConexion_sm_vc.value = "reconnecting";
      conectando_sm_vc.value = false;
      errorWs_sm_vc.value =
        mensajeError_sm_vc || "Error de conexión al servidor de chat.";
      console.error("[ChatStore] Error de conexión WS:", mensajeError_sm_vc);
    });

    /**
     * reconnect_attempt — Socket.io está intentando reconectar activamente.
     * El contador `intento_sm_vc` indica cuántos intentos ha realizado ya.
     */
    socket_sm_vc.value.io.on("reconnect_attempt", (intento_sm_vc) => {
      estadoConexion_sm_vc.value = "reconnecting";
      console.info(
        `[ChatStore] Reintentando conexión... (intento ${intento_sm_vc}/5)`,
      );
    });

    /**
     * reconnect_failed — Todos los intentos de reconexión agotados.
     * Pasamos a 'offline' definitivo hasta que el usuario recargue.
     */
    socket_sm_vc.value.io.on("reconnect_failed", () => {
      estadoConexion_sm_vc.value = "offline";
      console.warn("[ChatStore] Todos los intentos de reconexión fallaron.");
    });

    // ══════════════════════════════════════════════════════════════
    // LISTENERS DE MENSAJES Y EVENTOS DE NEGOCIO
    // ══════════════════════════════════════════════════════════════

    /**
     * message_received_sm_vc — Nuevo mensaje en tiempo real (broadcast a sala).
     *
     * El backend emite este evento a TODOS los clientes de la sala cuando un
     * mensaje es persistido en BD. Inyectamos el mensaje directamente al
     * conversacionStore para mantener una sola fuente de verdad reactiva.
     */
    socket_sm_vc.value.on("message_received_sm_vc", (mensaje_sm_vc) => {
      console.log("📡 [WS BROADCAST] Payload crudo recibido:", mensaje_sm_vc);
      _inyectarMensajeEnStore_sm_vc(mensaje_sm_vc);
    });

    /**
     * message_ack_sm_vc — Confirmación de que el mensaje fue guardado en BD.
     *
     * [FIX] El backend envía este ACK al remitente justo después de persistir.
     * Usamos el mensaje devuelto (ya con ID de BD) para actualizar la UI.
     */
    socket_sm_vc.value.on("message_ack_sm_vc", (ack_sm_vc) => {
      console.log("📨 [WS ACK] Payload crudo recibido:", ack_sm_vc);
      if (ack_sm_vc?.mensaje_sm_vc) {
        _inyectarMensajeEnStore_sm_vc(ack_sm_vc.mensaje_sm_vc);
      }
    });

    /**
     * error_sm_vc — Evento de error estandarizado del Gateway.
     *
     * [Sprint 4] Se emite cuando el backend bloquea una acción no autorizada,
     * como un ADMIN intentando escribir un mensaje.
     *
     * Acción: Mostrar notificación Quasar de tipo 'negative' (roja) para dar
     * feedback visual inmediato al usuario, sin interrumpir la UI.
     */
    socket_sm_vc.value.on("error_sm_vc", (errorPayload_sm_vc) => {
      const mensaje_sm_vc =
        errorPayload_sm_vc?.message_sm_vc ||
        "Acción no permitida por el servidor.";
      const codigo_sm_vc = errorPayload_sm_vc?.code_sm_vc || "ERROR";

      console.warn("[ChatStore] Error del Gateway:", errorPayload_sm_vc);

      // Mostrar notificación Quasar roja con el mensaje del error del servidor
      Notify.create({
        type: "negative",
        message: mensaje_sm_vc,
        caption: `Código: ${codigo_sm_vc}`,
        icon: "block",
        position: "top-right",
        timeout: 4000,
        progress: true,
        actions: [{ icon: "close", color: "white", round: true }],
      });
    });

    /**
     * typing_status_sm_vc — El backend retransmite el estado de escritura de otro usuario.
     *
     * Payload recibido:
     *   { userId_sm_vc, rol_sm_vc, isTyping_sm_vc, timestamp_sm_vc }
     *
     * Estrategia: Mantenemos el mapa `escribiendo_sm_vc` con los IDs de los
     * usuarios que están escribiendo. Si `isTyping_sm_vc === false` o el timer
     * expira, eliminamos la entrada del mapa.
     */
    socket_sm_vc.value.on("typing_status_sm_vc", (payload_sm_vc) => {
      const userId_sm_vc = String(payload_sm_vc?.userId_sm_vc);
      if (!userId_sm_vc) return;

      if (payload_sm_vc.isTyping_sm_vc) {
        // Marcar al usuario como "escribiendo"
        escribiendo_sm_vc.value = {
          ...escribiendo_sm_vc.value,
          [userId_sm_vc]: true,
        };

        // Cancelar el timer anterior si existía (el usuario sigue escribiendo)
        if (_timerEscribiendo_sm_vc.value[userId_sm_vc]) {
          clearTimeout(_timerEscribiendo_sm_vc.value[userId_sm_vc]);
        }

        // Auto-limpiar si no llega señal de "dejé de escribir" en TYPING_TIMEOUT_MS_sm_vc
        _timerEscribiendo_sm_vc.value[userId_sm_vc] = setTimeout(() => {
          _limpiarEscribiendoUsuario_sm_vc(userId_sm_vc);
        }, TYPING_TIMEOUT_MS_sm_vc);
      } else {
        // El usuario indicó explícitamente que dejó de escribir
        _limpiarEscribiendoUsuario_sm_vc(userId_sm_vc);
      }
    });
  };

  /**
   * unirASala_sm_vc — Une al usuario a una sala de conversación específica.
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
      console.warn(
        "[ChatStore] Intento de unirASala sin conexión activa. Conectar primero.",
      );
      return;
    }

    // Construir el identificador de sala (debe coincidir con el del backend)
    const roomId_sm_vc = `conv:${estudianteId_sm_vc}:${materiaId_sm_vc || "global"}`;

    // Si ya estamos en esta sala, no reemitir el evento
    if (salaActual_sm_vc.value === roomId_sm_vc) return;

    // Si estábamos en otra sala, salir primero (limpieza preventiva)
    if (salaActual_sm_vc.value) {
      socket_sm_vc.value.emit("leave_conversation_sm_vc", {
        estudianteId_sm_vc: Number(estudianteId_sm_vc),
        materiaId_sm_vc: materiaId_sm_vc ? Number(materiaId_sm_vc) : null,
      });
    }

    // Emitir la solicitud de unirse a la nueva sala
    socket_sm_vc.value.emit("join_conversation_sm_vc", {
      estudianteId_sm_vc: Number(estudianteId_sm_vc),
      materiaId_sm_vc: materiaId_sm_vc ? Number(materiaId_sm_vc) : null,
    });

    salaActual_sm_vc.value = roomId_sm_vc;
    // Limpiar estado de escritura al cambiar de sala
    escribiendo_sm_vc.value = {};
    console.info(`[ChatStore] Unido a sala: ${roomId_sm_vc}`);
  };

  /**
   * enviarMensaje_sm_vc — Emite un mensaje de texto a través del WebSocket.
   *
   * El backend persiste el mensaje en BD y luego hace broadcast
   * al resto de participantes de la sala vía `message_received_sm_vc`.
   *
   * @param {string} contenido_sm_vc - Texto del mensaje.
   * @param {number} estudianteId_sm_vc - ID del estudiante (requerido por el backend).
   * @param {number|string|null} materiaId_sm_vc - ID de la materia de contexto.
   * @param {number|null} documentoId_sm_vc - ID del documento adjunto (opcional).
   * @returns {void}
   */
  const enviarMensaje_sm_vc = (
    contenido_sm_vc,
    estudianteId_sm_vc,
    materiaId_sm_vc = null,
    documentoId_sm_vc = null,
  ) => {
    if (!socket_sm_vc.value?.connected) {
      console.warn("[ChatStore] Intento de enviarMensaje sin conexión activa.");
      return;
    }

    // [FIX] Validar estudianteId_sm_vc — el backend lo requiere para registrar el mensaje
    if (!estudianteId_sm_vc) {
      console.error(
        "[ChatStore] estudianteId_sm_vc es requerido para enviar mensaje.",
      );
      return;
    }

    // Construir el payload del mensaje según el DTO del backend (SendMessageDto_sm_vc)
    const payload_sm_vc = {
      contenido_sm_vc,
      estudianteId_sm_vc: Number(estudianteId_sm_vc),
      materiaId_sm_vc: materiaId_sm_vc ? Number(materiaId_sm_vc) : null,
      tipo: documentoId_sm_vc ? "DOCUMENTO" : "TEXTO",
    };

    // Incluir el ID del documento si viene adjunto (sprint 3: archivos)
    if (documentoId_sm_vc) {
      payload_sm_vc.documentoId_sm_vc = Number(documentoId_sm_vc);
    }

    socket_sm_vc.value.emit("send_message_sm_vc", payload_sm_vc);
  };

  /**
   * emitirEscribiendo_sm_vc — Notifica al servidor que el usuario está (o dejó de) escribir.
   *
   * El backend recibe este evento via `@SubscribeMessage('typing_sm_vc')` y lo
   * retransmite a los demás miembros de la sala como `typing_status_sm_vc`.
   *
   * Se recomienda llamar con `true` al escribir y con `false` al enviar o limpiar
   * el campo de texto. Implementar debounce en el componente llamador para evitar
   * saturar el socket con eventos.
   *
   * @param {boolean} estaEscribiendo_sm_vc - true = escribiendo, false = paró.
   * @param {number} estudianteId_sm_vc - ID del estudiante de la sala activa.
   * @param {number|null} materiaId_sm_vc - ID de la materia de la sala activa.
   * @returns {void}
   */
  const emitirEscribiendo_sm_vc = (
    estaEscribiendo_sm_vc,
    estudianteId_sm_vc,
    materiaId_sm_vc = null,
  ) => {
    if (!socket_sm_vc.value?.connected) return;

    socket_sm_vc.value.emit("typing_sm_vc", {
      isTyping_sm_vc: estaEscribiendo_sm_vc,
      estudianteId_sm_vc: Number(estudianteId_sm_vc),
      materiaId_sm_vc: materiaId_sm_vc ? Number(materiaId_sm_vc) : null,
    });
  };

  /**
   * salirDeSala_sm_vc — Sale de la sala actual y desconecta el socket.
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
    if (!socket_sm_vc.value) return;

    // Notificar al backend que salimos de la sala antes de desconectar
    if (salaActual_sm_vc.value && socket_sm_vc.value.connected) {
      socket_sm_vc.value.emit("leave_conversation_sm_vc");
    }

    // Cancelar todos los timers de escritura pendientes (evitar memory leaks)
    Object.values(_timerEscribiendo_sm_vc.value).forEach(clearTimeout);

    // Desconectar y limpiar el estado local
    socket_sm_vc.value.disconnect();
    socket_sm_vc.value = null;
    salaActual_sm_vc.value = null;
    estadoConexion_sm_vc.value = "offline";
    escribiendo_sm_vc.value = {};
    _timerEscribiendo_sm_vc.value = {};

    console.info("[ChatStore] Socket desconectado y sala limpiada.");
  };

  /* ══════════════════════════════════════════════════════════════
   *  HELPERS PRIVADOS
   * ══════════════════════════════════════════════════════════════ */

  /**
   * _limpiarEscribiendoUsuario_sm_vc — Elimina a un usuario del mapa de escritura
   * y cancela su timer asociado. Función pura de limpieza reactiva.
   *
   * @param {string} userId_sm_vc - ID del usuario a eliminar del mapa.
   */
  const _limpiarEscribiendoUsuario_sm_vc = (userId_sm_vc) => {
    // Cancelar el timer de auto-limpieza si existe
    if (_timerEscribiendo_sm_vc.value[userId_sm_vc]) {
      clearTimeout(_timerEscribiendo_sm_vc.value[userId_sm_vc]);
      const timers_sm_vc = { ..._timerEscribiendo_sm_vc.value };
      delete timers_sm_vc[userId_sm_vc];
      _timerEscribiendo_sm_vc.value = timers_sm_vc;
    }

    // Eliminar del mapa reactivo (Vue detecta el cambio via nuevo objeto)
    const mapa_sm_vc = { ...escribiendo_sm_vc.value };
    delete mapa_sm_vc[userId_sm_vc];
    escribiendo_sm_vc.value = mapa_sm_vc;
  };

  /**
   * _inyectarMensajeEnStore_sm_vc — Agrega un mensaje recibido por WebSocket
   * al `conversacionStore_sm_vc`.
   *
   * Usamos importación dinámica para evitar dependencias circulares entre stores.
   * El mensaje se agrega al final del array `conversaciones_sm_vc` del store,
   * que es la fuente de verdad para todos los componentes de chat.
   *
   * [FIX] Detectar si el payload es un array (Par de Nodos: DOCUMENTO + TEXTO)
   * y usar spread operator para empujar elementos individuales, no el array completo.
   *
   * @param {object|array} payload_sm_vc - Objeto mensaje o array de nodos formateado por el backend.
   * @returns {void}
   */
  const _inyectarMensajeEnStore_sm_vc = (payload_sm_vc) => {
    import("src/stores/conversacionStore")
      .then(({ useConversacionStore_sm_vc }) => {
        const store_sm_vc = useConversacionStore_sm_vc();
        // Asegurar reactividad con desempaquetado de array
        if (Array.isArray(payload_sm_vc)) {
          store_sm_vc.conversaciones_sm_vc.push(...payload_sm_vc);
        } else {
          store_sm_vc.conversaciones_sm_vc.push(payload_sm_vc);
        }
        console.log(
          "✅ Inyección exitosa. Total:",
          store_sm_vc.conversaciones_sm_vc.length,
        );
      })
      .catch((err_sm_vc) => {
        console.error("❌ ERROR FATAL EN PINIA:", err_sm_vc);
      });
  };

  /**
   * manejarSesionExpirada_sm_vc — Limpieza de emergencia cuando el JWT expira.
   *
   * [SECURITY] Esta función se invoca cuando el backend rechaza la conexión
   * WebSocket por token expirado (error 'jwt expired' o 'Unauthorized').
   * Realiza:
   *   1. Desconexión inmediata del socket.
   *   2. Notificación visual al usuario vía Quasar Notify.
   *   3. Llamada al logout_sm_vc del authStore para limpiar estado y redirigir.
   *
   * @returns {void}
   */
  const manejarSesionExpirada_sm_vc = () => {
    // 1. Desconectar el socket y limpiar estado local
    if (socket_sm_vc.value) {
      socket_sm_vc.value.disconnect();
      socket_sm_vc.value = null;
    }
    salaActual_sm_vc.value = null;
    estadoConexion_sm_vc.value = "offline";
    escribiendo_sm_vc.value = {};
    Object.values(_timerEscribiendo_sm_vc.value).forEach(clearTimeout);
    _timerEscribiendo_sm_vc.value = {};

    // 2. Notificación visual obligatoria (Reglas UI/UX del proyecto)
    Notify.create({
      type: "negative",
      message:
        "Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.",
      icon: "lock_clock",
      position: "top-right",
      timeout: 5000,
      progress: true,
      actions: [{ icon: "close", color: "white", round: true }],
    });

    // 3. Ejecutar logout del auth store (limpia token, redirige a login)
    try {
      const authStore_sm_vc = useAuthStore();
      authStore_sm_vc.logout_sm_vc("jwt_expirado_ws");
    } catch (err_sm_vc) {
      console.error("[ChatStore] Error al ejecutar logout:", err_sm_vc);
      // Fallback: forzar recarga a login si el store falla
      window.location.href = "/login";
    }
  };

  /* ══════════════════════════════════════════════════════════════
   *  RETURN (API pública del store)
   * ══════════════════════════════════════════════════════════════ */
  return {
    /* ── Estado reactivo ── */
    socket_sm_vc,
    /** Estado de conexión: 'online' | 'offline' | 'reconnecting' */
    estadoConexion_sm_vc,
    /** true cuando estadoConexion_sm_vc === 'online' */
    conectado_sm_vc,
    conectando_sm_vc,
    salaActual_sm_vc,
    errorWs_sm_vc,
    /** Mapa de usuarios escribiendo: { [userId]: true } */
    escribiendo_sm_vc,
    /** true si al menos un usuario de la sala está escribiendo */
    alguienEscribiendo_sm_vc,

    /* ── Actions ── */
    conectar_sm_vc,
    unirASala_sm_vc,
    enviarMensaje_sm_vc,
    /** Emite el evento typing_sm_vc al servidor con el estado de escritura */
    emitirEscribiendo_sm_vc,
    salirDeSala_sm_vc, // ⬅ EXPUESTO para onUnmounted en vistas Page
  };
});
