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
        // 1. Prevenir conexiones duplicadas
        if (socket_sm_vc.value?.connected) return;

        const token_sm_vc = LocalStorage.getItem("token_sm_vc");
        if (!token_sm_vc) {
          console.warn("[ChatStore] No se encontró token JWT. Abortando conexión WS.");
          errorWs_sm_vc.value = "Sin token de autenticación.";
          return;
        }

        conectando_sm_vc.value = true;
        errorWs_sm_vc.value = null;

        // 2. Inicializar el socket
        socket_sm_vc.value = io(`${WS_BASE_URL_sm_vc}/${WS_NAMESPACE_sm_vc}`, {
          auth: (cb_sm_vc) => {
            const tokenFresco_sm_vc = LocalStorage.getItem("token_sm_vc");
            cb_sm_vc({ token: tokenFresco_sm_vc });
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
          forceNew: true,
          transports: ["websocket"],
        });

        // ══════════════════════════════════════════════════════════════
        // LISTENERS DE CICLO DE VIDA
        // ══════════════════════════════════════════════════════════════

        socket_sm_vc.value.on("connect", () => {
          estadoConexion_sm_vc.value = "online";
          conectando_sm_vc.value = false;
          errorWs_sm_vc.value = null;
          console.info(`[ChatStore] Conectado. ID: ${socket_sm_vc.value.id}`);
        });

        socket_sm_vc.value.on("disconnect", (razon_sm_vc) => {
          estadoConexion_sm_vc.value = "offline";
          escribiendo_sm_vc.value = {};
          if (razon_sm_vc === "io server disconnect" && errorWs_sm_vc.value?.includes("jwt")) {
            manejarSesionExpirada_sm_vc();
          }
        });

        socket_sm_vc.value.on("connect_error", (err_sm_vc) => {
          const msg = err_sm_vc?.message || "";
          if (msg.includes("jwt") || msg.includes("Unauthorized")) {
            manejarSesionExpirada_sm_vc();
            return;
          }
          estadoConexion_sm_vc.value = "reconnecting";
          conectando_sm_vc.value = false;
          errorWs_sm_vc.value = msg || "Error de conexión WS.";
        });

        // ══════════════════════════════════════════════════════════════
        // LISTENERS DE NEGOCIO (EL CORAZÓN DE LA REACTIVIDAD)
        // ══════════════════════════════════════════════════════════════

        /**
         * message_received_sm_vc: Recibir mensaje nuevo
         */
        socket_sm_vc.value.on("message_received_sm_vc", (mensaje_sm_vc) => {
          _inyectarMensajeEnStore_sm_vc(mensaje_sm_vc);
        });

        /**
         * message_ack_sm_vc: Confirmación de envío propio
         */
        socket_sm_vc.value.on("message_ack_sm_vc", (ack_sm_vc) => {
          if (ack_sm_vc?.mensaje_sm_vc) {
            _inyectarMensajeEnStore_sm_vc(ack_sm_vc.mensaje_sm_vc);
          }
        });

        /**
         * ✅ [FIX CRÍTICO] entrega_updated_sm_vc: Parcheo en tiempo real
         * Este listener es el que hace que el badge del documento cambie de color 
         * de azul (ENTREGADO) a verde/rojo sin recargar la página.
         */
        socket_sm_vc.value.on("entrega_updated_sm_vc", async (payload_sm_vc) => {
          console.log("🔄 [WS] Recibida actualización de entrega:", payload_sm_vc);

          try {
            // Importamos los stores necesarios
            const { useConversacionStore_sm_vc } = await import("src/stores/conversacionStore");
            const { usePasantiasStore } = await import("src/stores/pasantiasStore");
            
            const convStore = useConversacionStore_sm_vc();
            const pasStore = usePasantiasStore();

            // 🚨 Búsqueda estricta usando el documento_id_original
            const nodo = convStore.conversaciones_sm_vc.find(n => 
              n.tipo_nodo_sm_vc === 'DOCUMENTO' && 
              Number(n.documento_id_sm_vc) === Number(payload_sm_vc.documento_id_original)
            );

            if (nodo) {
              nodo.estado_sm_vc = payload_sm_vc.estado_sm_vc;
              console.log(`✅ [WS] Nodo ${nodo.id_sm_vc} parcheado a ${payload_sm_vc.estado_sm_vc}`);
            }

            // Refrescar progreso general
            if (payload_sm_vc.estudianteId_sm_vc) {
              pasStore.fetch_progreso_estudiante_sm_vc(payload_sm_vc.estudianteId_sm_vc);
            }
          } catch (err) {
            console.error("❌ Error en el parcheo reactivo del socket:", err);
          }
        });

        /**
         * error_sm_vc: Notificaciones de error del servidor
         */
        socket_sm_vc.value.on("error_sm_vc", (payload) => {
          Notify.create({
            type: "negative",
            message: payload?.message_sm_vc || "Error en la operación de chat.",
            position: "top-right"
          });
        });

        /**
         * typing_status_sm_vc: Indicador de 'escribiendo...'
         */
        socket_sm_vc.value.on("typing_status_sm_vc", (payload_sm_vc) => {
          const userId = String(payload_sm_vc?.userId_sm_vc);
          if (!userId) return;

          if (payload_sm_vc.isTyping_sm_vc) {
            escribiendo_sm_vc.value = { ...escribiendo_sm_vc.value, [userId]: true };
            if (_timerEscribiendo_sm_vc.value[userId]) clearTimeout(_timerEscribiendo_sm_vc.value[userId]);
            _timerEscribiendo_sm_vc.value[userId] = setTimeout(() => {
              _limpiarEscribiendoUsuario_sm_vc(userId);
            }, TYPING_TIMEOUT_MS_sm_vc);
          } else {
            _limpiarEscribiendoUsuario_sm_vc(userId);
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

        /**
         * [FIX] De-duplicado automático por id_sm_vc.
         *
         * El emisor recibe el mismo mensaje por DOS vías:
         *   1. `message_received_sm_vc` — Broadcast global a la sala (incluye al emisor).
         *   2. `message_ack_sm_vc`       — ACK privado de confirmación de persistencia en BD.
         *
         * Sin este guard, el mensaje aparece duplicado en la UI del que envió.
         * El receptor (estudiante) solo recibe el Broadcast, por lo que no sufre duplicados.
         *
         * Estrategia: antes de empujar, extraemos los IDs existentes en el store
         * y descartamos cualquier nodo cuyo id_sm_vc ya esté presente.
         */
        const idsExistentes_sm_vc = new Set(
          store_sm_vc.conversaciones_sm_vc.map((m) => m.id_sm_vc)
        );

        const nodosNuevos_sm_vc = Array.isArray(payload_sm_vc)
          ? payload_sm_vc.filter((n) => !idsExistentes_sm_vc.has(n.id_sm_vc))
          : (!idsExistentes_sm_vc.has(payload_sm_vc?.id_sm_vc) ? [payload_sm_vc] : []);

        if (nodosNuevos_sm_vc.length === 0) {
          console.log("🔁 [WS] Mensaje duplicado ignorado (id ya existe en store).");
          return;
        }

        store_sm_vc.conversaciones_sm_vc.push(...nodosNuevos_sm_vc);
        console.log(
          "✅ Inyección exitosa. Total:",
          store_sm_vc.conversaciones_sm_vc.length,
        );

        // [FIX] MISSION 1: REFETCH para actualizar estado global y requisitos.
        // Cuando llega un mensaje (especialmente evaluaciones del profesor), 
        // necesitamos refrescar la fuente de verdad (progreso) para bloquear el formulario pertinentemente.
        if (salaActual_sm_vc.value) {
          const partes_sm_vc = salaActual_sm_vc.value.split(":"); // formato: conv:{estudianteId}:{materiaId}
          if (partes_sm_vc.length >= 2) {
            const estId_sm_vc = partes_sm_vc[1];
            import("src/stores/pasantiasStore").then(({ usePasantiasStore }) => {
              usePasantiasStore()
                .fetch_progreso_estudiante_sm_vc(estId_sm_vc)
                .catch((e) => console.warn("[WS Refetch] Error refrescando progreso:", e));
            });
          }
        }
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
