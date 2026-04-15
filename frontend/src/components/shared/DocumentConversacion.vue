<!-- ══════════════════════════════════════════════════════════════════
     DocumentConversacion.vue — Orquestador Polimórfico de Diálogos.
     (resto del bloque de documentación sin cambios)
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="doc-chat-root_sm_vc">
    <q-banner
      v-if="
        chatStore_sm_vc.estadoConexion_sm_vc === 'offline' ||
        chatStore_sm_vc.estadoConexion_sm_vc === 'reconnecting'
      "
      class="banner-conexion_sm_vc"
      dense
      inline-actions
    >
      <template #avatar>
        <q-icon
          :name="
            chatStore_sm_vc.estadoConexion_sm_vc === 'reconnecting'
              ? 'sync'
              : 'wifi_off'
          "
          :class="
            chatStore_sm_vc.estadoConexion_sm_vc === 'reconnecting'
              ? 'icon-spin_sm_vc'
              : ''
          "
          size="18px"
        />
      </template>
      <span class="banner-conexion-texto_sm_vc">
        <template
          v-if="chatStore_sm_vc.estadoConexion_sm_vc === 'reconnecting'"
        >
          Intentando reconectar al chat en tiempo real...
        </template>
        <template v-else>
          Conexión perdida. Los mensajes nuevos no se reciben en tiempo real.
        </template>
      </span>
    </q-banner>

    <div
      v-if="conversacionStore_sm_vc.cargando_sm_vc"
      class="loading-state_sm_vc"
    >
      <q-spinner-dots color="teal-3" size="36px" />
      <span class="loading-label_sm_vc">Cargando trazabilidad...</span>
    </div>

    <div
      v-else-if="conversacionStore_sm_vc.error_sm_vc"
      class="error-state_sm_vc"
    >
      <q-icon name="error_outline" size="28px" color="negative" />
      <span>{{ conversacionStore_sm_vc.error_sm_vc }}</span>
    </div>

    <div v-else-if="!idEstudianteFinal_sm_vc" class="error-state_sm_vc">
      <q-icon name="person_off" size="28px" color="blue-grey-7" />
      <span>No se pudo determinar el estudiante. Refresca la página.</span>
    </div>

    <template v-else>
      <div
        v-if="esAdmin_sm_vc && props.modoVista_sm_vc === 'CHAT'"
        class="admin-banner_sm_vc"
        role="status"
        aria-live="polite"
      >
        <q-icon name="admin_panel_settings" size="16px" color="warning" />
        <span>
          <strong>Modo Supervisor</strong> — Estás visualizando como
          Administrador. Esta conversación es de <em>solo lectura</em>.
        </span>
      </div>

      <ConvHeader
        :materia="materia_sm_vc"
        :estado-progreso="estadoProgreso"
        :total-mensajes="mensajesOrdenados_sm_vc.length"
      />

      <ConvMessages
        :mensajes="mensajesOrdenados_sm_vc"
        :requisitos="requisitos_sm_vc"
        :readonly="!puedeEscribir_sm_vc"
      />

      <transition name="typing-fade_sm_vc">
        <div
          v-if="
            chatStore_sm_vc.alguienEscribiendo_sm_vc &&
            props.modoVista_sm_vc === 'CHAT'
          "
          class="typing-indicator_sm_vc"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span class="typing-dots_sm_vc">
            <span class="typing-dot_sm_vc" />
            <span class="typing-dot_sm_vc" />
            <span class="typing-dot_sm_vc" />
          </span>
          <span class="typing-label_sm_vc">Alguien está escribiendo</span>
        </div>
      </transition>

      <template v-if="puedeEscribir_sm_vc">
        <div
          v-if="!requisitos_sm_vc || requisitos_sm_vc.length === 0"
          class="q-pa-md flex flex-center"
        >
          <q-spinner-dots color="teal-3" size="24px" />
          <span
            class="q-ml-sm text-caption"
            style="color: var(--sn-texto-apagado)"
          >
            Cargando requisitos de la materia...
          </span>
        </div>

        <template v-else>
          <ConvFormEstudiante
            v-if="userRol_sm_vc === 'ESTUDIANTE'"
            :requisitos="requisitos_sm_vc"
            :materia-id="props.materiaId"
            :estudiante-id="idEstudianteFinal_sm_vc"
            :bloqueado_sm_vc="!chatStore_sm_vc.conectado_sm_vc"
            :mensajes="mensajesOrdenados_sm_vc"
            :requisitos-aprobados-iniciales="requisitosAprobadosIniciales_sm_vc"
            @enviar="handleEnviarInforme_sm_vc"
          />

          <ConvFormProfesor
            v-else-if="userRol_sm_vc === 'PROFESOR'"
            :requisitos="requisitos_sm_vc"
            :materia-id="props.materiaId"
            :estudiante-id="idEstudianteFinal_sm_vc"
            :requisitos-aprobados-iniciales="requisitosAprobadosIniciales_sm_vc"
            :mensajes="mensajesOrdenados_sm_vc"
            :bloqueado_sm_vc="!chatStore_sm_vc.conectado_sm_vc"
            @responder="handleResponderCorreccion_sm_vc"
            @guardar-requisitos="handleGuardarRequisitos_sm_vc"
          />
        </template>
      </template>

      <div
        v-else-if="estadoProgreso === 'APROBADO' && !esAdmin_sm_vc"
        class="readonly-banner_sm_vc"
      >
        <q-icon name="check_circle" size="14px" color="teal-3" />
        <span>Materia aprobada — Historial de solo lectura.</span>
      </div>

      <div
        v-else-if="props.modoVista_sm_vc === 'TRAZABILIDAD'"
        class="readonly-banner_sm_vc"
      >
        <q-icon name="history" size="14px" color="grey-5" />
        <span>Modo Trazabilidad — Vista de auditoría. Solo lectura.</span>
      </div>

      <div
        v-else-if="props.modoVista_sm_vc === 'HISTORIAL'"
        class="readonly-banner_sm_vc"
      >
        <q-icon name="inventory_2" size="14px" color="grey-5" />
        <span>Historial archivado — Esta conversación está cerrada.</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from "vue";
import { useQuasar } from "quasar";
import { usePasantiasStore } from "src/stores/pasantiasStore";
import { useAuthStore } from "src/stores/authStore";
import { useConversacionStore_sm_vc } from "src/stores/conversacionStore";
import { useChatStore_sm_vc } from "src/stores/chatStore_sm_vc";

import ConvHeader from "./conv/ConvHeader.vue";
import ConvMessages from "./conv/ConvMessages.vue";
import ConvFormEstudiante from "./conv/ConvFormEstudiante.vue";
import ConvFormProfesor from "./conv/ConvFormProfesor.vue";

/* ── Props ── */
const props = defineProps({
  materiaId: { type: [String, Number], default: null },
  estudianteId: { type: [String, Number], default: null },
  estadoProgreso: { type: String, default: null },
  modoVista_sm_vc: {
    type: String,
    default: "CHAT",
    validator: (v) => ["CHAT", "TRAZABILIDAD", "HISTORIAL"].includes(v),
  },
});

const emit = defineEmits(["mensajeEnviado"]);

/* ── Stores ── */
const pasantiasStore_sm_vc = usePasantiasStore();
const auth_sm_vc = useAuthStore();
const conversacionStore_sm_vc = useConversacionStore_sm_vc();
const chatStore_sm_vc = useChatStore_sm_vc();
const $q_sm_vc = useQuasar();

/* ── Computed: Identidad ── */
const userRol_sm_vc = computed(() => auth_sm_vc.user_sm_vc?.rol_sm_vc ?? null);

const esAdmin_sm_vc = computed(
  () =>
    userRol_sm_vc.value === "ADMIN" || userRol_sm_vc.value === "ADMINISTRADOR",
);

const idEstudianteFinal_sm_vc = computed(() => {
  const rol_sm_vc = userRol_sm_vc.value;
  if (rol_sm_vc === "ESTUDIANTE")
    return auth_sm_vc.user_sm_vc?.estudiante_sm_vc?.id_sm_vc ?? null;
  if (
    rol_sm_vc === "PROFESOR" ||
    rol_sm_vc === "ADMINISTRADOR" ||
    rol_sm_vc === "ADMIN"
  ) {
    return props.estudianteId ?? null;
  }
  return props.estudianteId ?? auth_sm_vc.user_sm_vc?.estudiante_sm_vc?.id_sm_vc ?? null;
});

/* ── Computed: Control de escritura ── */
const puedeEscribir_sm_vc = computed(() => {
  const rol_sm_vc = userRol_sm_vc.value;
  const esModoChat_sm_vc = props.modoVista_sm_vc === "CHAT";
  const estaAprobada_sm_vc = props.estadoProgreso === "APROBADO";
  if (esAdmin_sm_vc.value) return false;
  if (rol_sm_vc === "ESTUDIANTE")
    return esModoChat_sm_vc && !estaAprobada_sm_vc;
  if (rol_sm_vc === "PROFESOR") return esModoChat_sm_vc && !estaAprobada_sm_vc;
  return false;
});

/* ── Carga de datos ── */
const cargarDatos_sm_vc = () => {
  const id_sm_vc = idEstudianteFinal_sm_vc.value;
  if (!id_sm_vc) return;
  conversacionStore_sm_vc.obtenerConversacion_sm_vc(
    id_sm_vc,
    props.materiaId ?? null,
  );
};

/* ══════════════════════════════════════════════════════════════
 *  [FIX] RACE CONDITION — Unión a sala WebSocket diferida.
 *
 *  PROBLEMA ANTERIOR:
 *    onMounted llamaba a chatStore_sm_vc.unirASala_sm_vc() de forma
 *    síncrona, pero el socket podía aún no estar conectado en ese
 *    instante (la handshake JWT es asíncrona), causando que el
 *    emit 'join_conversation_sm_vc' se perdiera silenciosamente.
 *
 *  SOLUCIÓN:
 *    Se observa el computed `conectado_sm_vc` del chatStore.
 *    Cuando pase a `true` (socket listo), se ejecuta la unión.
 *    `immediate: true` garantiza que si el socket YA estaba activo
 *    al montar el componente, la unión ocurre de inmediato.
 *    El watcher también re-une la sala si el socket se reconecta
 *    automáticamente tras una caída de red.
 * ══════════════════════════════════════════════════════════════ */
onMounted(() => {
  cargarDatos_sm_vc();
  chatStore_sm_vc.conectar_sm_vc();
  // [FIX] unirASala_sm_vc se movió al watcher de conectado_sm_vc
  // para evitar la race condition del handshake JWT asíncrono.
});

onUnmounted(() => {
  chatStore_sm_vc.salirDeSala_sm_vc();
});

/* ── [FIX] Watcher: unir a sala solo cuando el socket esté listo ── */
watch(
  () => chatStore_sm_vc.conectado_sm_vc,
  (conectado_sm_vc) => {
    if (conectado_sm_vc && idEstudianteFinal_sm_vc.value) {
      chatStore_sm_vc.unirASala_sm_vc(
        idEstudianteFinal_sm_vc.value,
        props.materiaId ?? null,
      );
    }
  },
  // immediate: true → si el socket ya estaba conectado al montar, se une de inmediato
  { immediate: true },
);

/* ── Watchers de contexto (sin cambios) ── */
watch(idEstudianteFinal_sm_vc, (nuevoId_sm_vc, viejoId_sm_vc) => {
  if (nuevoId_sm_vc && nuevoId_sm_vc !== viejoId_sm_vc) {
    conversacionStore_sm_vc.limpiarConversaciones_sm_vc();
    cargarDatos_sm_vc();
  }
});

watch(
  () => props.materiaId,
  (nuevaMateria_sm_vc, viejaMateria_sm_vc) => {
    if (String(nuevaMateria_sm_vc) !== String(viejaMateria_sm_vc)) {
      conversacionStore_sm_vc.limpiarConversaciones_sm_vc();
      cargarDatos_sm_vc();
    }
  },
);

/* ── Computed: datos derivados para hijos ── */
const mensajesOrdenados_sm_vc = computed(() => {
  const lista_sm_vc = conversacionStore_sm_vc.conversaciones_sm_vc || [];
  return [...lista_sm_vc].sort(
    (a_sm_vc, b_sm_vc) =>
      new Date(a_sm_vc.fecha_creacion_sm_vc).getTime() -
      new Date(b_sm_vc.fecha_creacion_sm_vc).getTime(),
  );
});

const materia_sm_vc = computed(() => {
  if (!props.materiaId) return null;
  const enProgreso_sm_vc = pasantiasStore_sm_vc.miProgreso?.find(
    (m_sm_vc) => String(m_sm_vc.id_sm_vc) === String(props.materiaId),
  );
  return (
    enProgreso_sm_vc || pasantiasStore_sm_vc.getMateriaById(props.materiaId)
  );
});

const requisitos_sm_vc = computed(() => materia_sm_vc.value?.requisitos ?? []);

const requisitosAprobadosIniciales_sm_vc = computed(() => {
  if (!props.materiaId || !idEstudianteFinal_sm_vc.value) return [];
  const prog_sm_vc = pasantiasStore_sm_vc.progreso_sm_vc.find(
    (p_sm_vc) =>
      String(p_sm_vc.estudiante_id_sm_vc) ===
        String(idEstudianteFinal_sm_vc.value) &&
      String(p_sm_vc.materia_id_sm_vc) === String(props.materiaId),
  );
  return (prog_sm_vc?.requisitos_aprobados_detalle_sm_vc ?? []).map(
    (d_sm_vc) => d_sm_vc.requisito_id_sm_vc,
  );
});

/* ── Handler principal (sin cambios) ── */
const handleEnviarInforme_sm_vc = async (payload_sm_vc) => {
  const id_sm_vc = idEstudianteFinal_sm_vc.value;

  if (!id_sm_vc) {
    console.error(
      "[DocumentConversacion] No se pudo determinar el ID del estudiante.",
    );
    throw new Error("No se pudo determinar el ID del estudiante.");
  }

  let documentoGeneradoId_sm_vc = null;

  try {
    if (payload_sm_vc?.archivo_sm_vc) {
      const docRespuesta_sm_vc =
        await conversacionStore_sm_vc.subirDocumentoFisico_sm_vc(
          payload_sm_vc.archivo_sm_vc,
          id_sm_vc,
          payload_sm_vc.requisito_id_sm_vc ?? null,
          payload_sm_vc.tipo_documento_sm_vc ?? "ENTREGABLE_ESTUDIANTE",
        );

      documentoGeneradoId_sm_vc = docRespuesta_sm_vc?.id_sm_vc ?? null;

      if (!documentoGeneradoId_sm_vc) {
        throw new Error("El servidor no retornó un ID de documento válido.");
      }
    }

    const contenido_sm_vc =
      payload_sm_vc?.mensaje_sm_vc?.trim() ||
      (payload_sm_vc?.archivo_sm_vc
        ? `📄 ${payload_sm_vc.archivo_sm_vc.name} (${payload_sm_vc?.version_sm_vc ?? "v1.0"})`
        : "");

    if (!contenido_sm_vc) {
      console.warn(
        "[DocumentConversacion] Payload vacío — no se envía mensaje.",
      );
      return false;
    }

    chatStore_sm_vc.enviarMensaje_sm_vc(
      contenido_sm_vc,
      id_sm_vc,
      props.materiaId ?? null,
      documentoGeneradoId_sm_vc,
    );

    emit("mensajeEnviado", { documentoId_sm_vc: documentoGeneradoId_sm_vc });

    return true;
  } catch (err_sm_vc) {
    const msg_sm_vc =
      err_sm_vc?.response?.data?.message ||
      err_sm_vc?.message ||
      "Error al enviar el informe. Verifica el archivo e inténtalo de nuevo.";

    $q_sm_vc.notify({
      type: "negative",
      message: msg_sm_vc,
      icon: "error_outline",
      position: "top",
      timeout: 5000,
    });

    throw err_sm_vc;
  }
};

/* ── Handlers de Profesor (sin cambios) ── */
const handleResponderCorreccion_sm_vc = (payload_sm_vc) => {
  const msg_sm_vc = pasantiasStore_sm_vc.responderCorreccion({
    estudiante_id_sm_vc: idEstudianteFinal_sm_vc.value,
    materia_id_sm_vc: props.materiaId,
    ...payload_sm_vc,
  });
  emit("mensajeEnviado", msg_sm_vc);
};

const handleGuardarRequisitos_sm_vc = async (payload_sm_vc) => {
  const msg_sm_vc = await pasantiasStore_sm_vc.aprobarRequisitosGranular({
    estudiante_id_sm_vc: parseInt(idEstudianteFinal_sm_vc.value, 10),
    materia_id_sm_vc: parseInt(props.materiaId, 10),
    requisitos_seleccionados_ids: payload_sm_vc.ids.map((id) =>
      parseInt(id, 10),
    ),
    nota_global_sm_dec: payload_sm_vc.nota_global,
    comentario_sm_vc: payload_sm_vc.comentario,
  });

  if (msg_sm_vc) {
    emit("mensajeEnviado", msg_sm_vc);
    await cargarDatos_sm_vc();
  }
};
</script>

<style scoped>
/* ── (todos los estilos sin cambios) ── */
.doc-chat-root_sm_vc {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: var(--sn-font-mono);
  width: 100%;
}
.banner-conexion_sm_vc {
  background: rgba(245, 158, 11, 0.1);
  border-bottom: 1px solid rgba(245, 158, 11, 0.3);
  color: #b45309;
  font-family: var(--sn-font-sans);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  padding: 0.45rem 1.25rem;
  min-height: 0;
}
.banner-conexion-texto_sm_vc { line-height: 1.4; }
.icon-spin_sm_vc { animation: sn-spin_sm_vc 1.2s linear infinite; }
@keyframes sn-spin_sm_vc {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.typing-indicator_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1.25rem 0.45rem;
  font-family: var(--sn-font-sans);
}
.typing-label_sm_vc {
  font-size: 0.68rem;
  color: var(--sn-texto-apagado, #9e9e9e);
  font-style: italic;
  letter-spacing: 0.02em;
  user-select: none;
}
.typing-dots_sm_vc { display: inline-flex; align-items: center; gap: 3px; }
.typing-dot_sm_vc {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--sn-texto-apagado, #9e9e9e);
  animation: sn-typing-bounce_sm_vc 1.2s ease-in-out infinite;
}
.typing-dot_sm_vc:nth-child(2) { animation-delay: 0.2s; }
.typing-dot_sm_vc:nth-child(3) { animation-delay: 0.4s; }
@keyframes sn-typing-bounce_sm_vc {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
.typing-fade_sm_vc-enter-active,
.typing-fade_sm_vc-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.typing-fade_sm_vc-enter-from,
.typing-fade_sm_vc-leave-to { opacity: 0; transform: translateY(4px); }
.loading-state_sm_vc {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.75rem; padding: 3rem 1.5rem;
}
.loading-label_sm_vc {
  font-size: 0.7rem; color: var(--sn-texto-apagado);
  letter-spacing: 0.08em; text-transform: uppercase;
  font-family: var(--sn-font-mono);
}
.error-state_sm_vc {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 10px; margin: 1rem;
  font-size: 0.78rem; color: var(--q-negative);
}
.admin-banner_sm_vc {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 1.25rem;
  background: rgba(255, 180, 0, 0.07);
  border-bottom: 1px solid rgba(255, 180, 0, 0.2);
  font-size: 0.7rem; color: #e8a000;
  font-family: var(--sn-font-sans); letter-spacing: 0.02em;
}
.admin-banner_sm_vc strong { font-weight: 700; }
.admin-banner_sm_vc em { font-style: normal; color: #ffd166; }
.readonly-banner_sm_vc {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(158, 158, 158, 0.04);
  border-top: 1px solid rgba(158, 158, 158, 0.12);
  font-size: 0.68rem; color: #616161;
  font-family: var(--sn-font-sans);
}
</style>