<!-- ══════════════════════════════════════════════════════════════════
     ConvMessages.vue — Lista de mensajes en formato Chat Documental.
     Componente "Dumb": solo itera el array que recibe por prop.
     Renderiza dos tipos de nodo:
       • TEXTO    → Burbuja de chat estándar de Quasar (q-chat-message)
       • DOCUMENTO → Tarjeta de archivo con acciones (Descargar / Mock)
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="messages-container_sm_vc" ref="containerRef_sm_vc">

    <!-- ── Empty State ── -->
    <div v-if="mensajes.length === 0" class="empty-chat_sm_vc">
      <q-icon name="chat_bubble_outline" size="36px" color="blue-grey-8" />
      <p>Aún no hay documentos en esta conversación.</p>
      <p v-if="!readonly" class="empty-hint_sm_vc">
        El estudiante debe enviar la primera versión.
      </p>
    </div>

    <!-- ── Lista de mensajes ── -->
    <transition-group name="msg-slide" tag="div" class="messages-list_sm_vc">
      <q-chat-message
        v-for="msg in mensajes"
        :key="msg.id_sm_vc"
        :name="nombreRemitente_sm_vc(msg)"
        :stamp="formatDateTime_sm_vc(msg.fecha_creacion_sm_vc)"
        :sent="!msg.es_sistema_sm_vc"
        text-color="white"
        :bg-color="bgColor_sm_vc(msg)"
        size="8"
      >
        <!-- ── Slot Avatar ── -->
        <template #avatar>
          <q-avatar
            size="32px"
            :color="avatarColor_sm_vc(msg)"
            :text-color="$q.dark.isActive ? 'white' : 'dark'"
            class="q-mx-sm"
          >
            <q-icon :name="avatarIcono_sm_vc(msg)" size="20px" />
          </q-avatar>
        </template>

        <!-- ── Slot Name ── -->
        <template #name>
          <span class="role-text_sm_vc" :class="rolClass_sm_vc(msg)">
            {{ nombreRemitente_sm_vc(msg) }}
          </span>
        </template>

        <!-- ══ NODO TEXTO ══ -->
        <div v-if="msg.tipo_nodo_sm_vc === 'TEXTO'" class="message-text_sm_vc">
          {{ msg.contenido_sm_vc }}
        </div>

        <!-- ══ NODO DOCUMENTO ══ -->
        <div
          v-else-if="msg.tipo_nodo_sm_vc === 'DOCUMENTO'"
          class="file-card_sm_vc"
          :class="estadoCardClass_sm_vc(msg.estado_sm_vc)"
        >
          <!-- Franja lateral de color por estado -->
          <div class="file-type-strip_sm_vc" />

          <!-- Icono de estado -->
          <div class="file-icon-col_sm_vc">
            <div class="file-icon-bg_sm_vc">
              <q-icon
                :name="evalIcon_sm_vc(msg.estado_sm_vc)"
                size="22px"
                :color="colorIconoEstado_sm_vc(msg.estado_sm_vc)"
              />
            </div>
          </div>

          <!-- Cuerpo de la tarjeta -->
          <div class="file-body_sm_vc">
            <!-- Fila de nombre + badges -->
            <div class="file-name-row_sm_vc">
              <span class="file-name_sm_vc">{{ msg.archivo_nombre_sm_vc }}</span>
              <q-badge
                v-if="msg.mock_sm_vc"
                color="warning"
                label="MOCK"
                class="q-ml-xs"
                style="font-size: 0.52rem; font-weight: 700;"
              />
              <q-badge
                v-if="msg.estado_sm_vc"
                :color="colorBadge_sm_vc(msg.estado_sm_vc)"
                :label="msg.estado_sm_vc"
                class="q-ml-xs"
                style="font-size: 0.52rem; letter-spacing: .04em;"
              />
            </div>

            <!-- Fila de metadata: requisito y tamaño -->
            <div class="file-meta-row_sm_vc">
              <span class="file-type-label_sm_vc">
                {{ msg.requisito_id_sm_vc
                    ? getRequisitoNombre_sm_vc(msg.requisito_id_sm_vc)
                    : 'DOCUMENTO' }}
              </span>
              <span class="file-size_sm_vc">{{ msg.tamanio_sm_vc }}</span>
            </div>

            <!-- Aviso para archivos simulados -->
            <p v-if="msg.mock_sm_vc" class="file-comment_sm_vc">
              Archivo de demostración — no requiere descarga real.
            </p>
          </div>

          <!-- Columna de acciones -->
          <div class="file-actions-col_sm_vc">
            <!-- Mock: sólo botón informativo -->
            <q-btn
              v-if="msg.mock_sm_vc"
              flat round dense
              icon="info"
              color="amber-4"
              size="sm"
              @click="handleAccionArchivo_sm_vc(msg, 'info')"
            >
              <q-tooltip class="bg-dark text-caption">Archivo simulado</q-tooltip>
            </q-btn>

            <!-- Real: descarga + previsualización -->
            <template v-else>
              <!-- Descargar: spinner mientras el blob está en tránsito -->
              <q-btn
                flat round dense
                :icon="loadingAccion_sm_vc[msg.documento_id_sm_vc ?? msg.id_sm_vc] === 'descargar' ? '' : 'download'"
                :loading="loadingAccion_sm_vc[msg.documento_id_sm_vc ?? msg.id_sm_vc] === 'descargar'"
                :disable="!!loadingAccion_sm_vc[msg.documento_id_sm_vc ?? msg.id_sm_vc]"
                color="teal-3"
                size="sm"
                @click="handleAccionArchivo_sm_vc(msg, 'descargar')"
              >
                <q-tooltip class="bg-dark text-caption">Descargar</q-tooltip>
              </q-btn>
              <!-- Visualizar: spinner mientras abre el blob en pestaña -->
              <q-btn
                flat round dense
                :icon="loadingAccion_sm_vc[msg.documento_id_sm_vc ?? msg.id_sm_vc] === 'visualizar' ? '' : 'open_in_new'"
                :loading="loadingAccion_sm_vc[msg.documento_id_sm_vc ?? msg.id_sm_vc] === 'visualizar'"
                :disable="!!loadingAccion_sm_vc[msg.documento_id_sm_vc ?? msg.id_sm_vc]"
                color="grey-5"
                size="sm"
                @click="handleAccionArchivo_sm_vc(msg, 'visualizar')"
              >
                <q-tooltip class="bg-dark text-caption">Previsualizar</q-tooltip>
              </q-btn>
            </template>
          </div>
        </div>

      </q-chat-message>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import {
  descargarDocumento_sm_vc as svcDescargar_sm_vc,
  visualizarDocumento_sm_vc as svcVisualizar_sm_vc,
} from 'src/services/documentosService'

const $q = useQuasar()

/* ── Props ── */
const props = defineProps({
  mensajes:   { type: Array,   default: () => [] },
  requisitos: { type: Array,   default: () => [] },
  readonly:   { type: Boolean, default: false    },
})

/* ── Ref de scroll ── */
const containerRef_sm_vc = ref(null)

/**
 * Map de loading por mensaje: { [msgId]: 'descargar' | 'visualizar' | null }
 * Evita que el usuario dispare doble clic durante una petición en curso.
 */
const loadingAccion_sm_vc = ref({})

/* ── Auto-scroll al llegar un nuevo mensaje ── */
watch(
  () => props.mensajes.length,
  async () => {
    await nextTick()
    if (containerRef_sm_vc.value) {
      containerRef_sm_vc.value.scrollTop = containerRef_sm_vc.value.scrollHeight
    }
  },
)

/* ═══════════════════════════════
   HELPERS DE RENDERIZADO DE CHAT
   ═══════════════════════════════ */

/** Color de fondo del q-chat-message. Sistema → azul-gris | Estudiante → teal */
const bgColor_sm_vc = (msg_sm_vc) => {
  if (msg_sm_vc.es_sistema_sm_vc) {
    return $q.dark.isActive ? 'blue-grey-9' : 'blue-grey-8'
  }
  return $q.dark.isActive ? 'teal-10' : 'teal-8'
}

/** Color del avatar según origen del mensaje. */
const avatarColor_sm_vc = (msg_sm_vc) =>
  msg_sm_vc.es_sistema_sm_vc ? 'blue-grey-8' : 'teal-4'

/** Icono del avatar según tipo de mensaje. */
const avatarIcono_sm_vc = (msg_sm_vc) => {
  if (msg_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO') return 'description'
  return msg_sm_vc.es_sistema_sm_vc ? 'smart_toy' : 'person'
}

/** Nombre del remitente legible. */
const nombreRemitente_sm_vc = (msg_sm_vc) =>
  msg_sm_vc.es_sistema_sm_vc ? 'Sistema SENTINNEL' : 'Estudiante'

/** Clase CSS del label de nombre para colorearlo. */
const rolClass_sm_vc = (msg_sm_vc) =>
  msg_sm_vc.es_sistema_sm_vc ? 'role-sistema_sm_vc' : 'role-estudiante_sm_vc'

/* ═══════════════════════════════
   HELPERS DE DOCUMENTO
   ═══════════════════════════════ */

/** Clase CSS de la tarjeta según el estado de aprobación. */
const estadoCardClass_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO:           'file-card--aprobado_sm_vc',
    REPROBADO:          'file-card--reprobado_sm_vc',
    OBSERVACIONES:      'file-card--observado_sm_vc',
    EVALUACION_PARCIAL: 'file-card--parcial_sm_vc',
    ENTREGADO:          'file-card--entregado_sm_vc',
    PENDIENTE:          'file-card--pendiente_sm_vc',
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'file-card--pendiente_sm_vc'
}

/** Icono principal de la tarjeta de documento segun el estado. */
const evalIcon_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO:           'check_circle',
    REPROBADO:          'cancel',
    OBSERVACIONES:      'warning',
    EVALUACION_PARCIAL: 'fact_check',
    ENTREGADO:          'upload_file',
    PENDIENTE:          'schedule',
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'description'
}

/** Color del icono del documento. */
const colorIconoEstado_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO:           'positive',
    REPROBADO:          'negative',
    OBSERVACIONES:      'warning',
    EVALUACION_PARCIAL: 'info',
    ENTREGADO:          'light-blue-4',
    PENDIENTE:          'blue-grey-5',
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'light-blue-4'
}

/** Color del q-badge de estado. */
const colorBadge_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO:           'positive',
    REPROBADO:          'negative',
    OBSERVACIONES:      'warning',
    EVALUACION_PARCIAL: 'info',
    ENTREGADO:          'blue-5',
    PENDIENTE:          'blue-grey-7',
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'grey-7'
}

/**
 * Resuelve el nombre legible de un requisito por su ID.
 * Muestra el ID como fallback si no encuentra el match.
 */
const getRequisitoNombre_sm_vc = (id_sm_vc) =>
  props.requisitos.find((r) => r.id_sm_vc === id_sm_vc)?.nombre_sm_vc ?? `Requisito #${id_sm_vc}`

/** Formatea una fecha ISO a la localización venezolana. */
const formatDateTime_sm_vc = (iso_sm_vc) => {
  if (!iso_sm_vc) return ''
  return new Date(iso_sm_vc).toLocaleString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ═══════════════════════════════
   ACCIONES DE ARCHIVOS (SPRINT 3)
   ═══════════════════════════════ */

/**
 * Manejador unificado de acciones sobre tarjetas de archivo.
 *
 * MOCK:       Muestra notificación informativa y hace early return.
 *             No se llama al backend para archivos de simulación.
 *
 * 'descargar': Llama a documentosService.descargarDocumento_sm_vc
 *              que hace el GET con responseType:'blob' y usa
 *              createObjectURL para forzar el guardado en disco.
 *
 * 'visualizar': Llama a documentosService.visualizarDocumento_sm_vc
 *              que abre el Blob en una pestaña nueva (inline PDF).
 *
 * En ambos casos se gestiona estado de `loadingAccion_sm_vc[msgId]`
 * para deshabilitar el botón durante la petición y evitar doble clic.
 *
 * @param {Object} msg_sm_vc    — Objeto de mensaje de ConvMessages
 * @param {'info'|'descargar'|'visualizar'} accion_sm_vc
 */
const handleAccionArchivo_sm_vc = async (msg_sm_vc, accion_sm_vc) => {
  // ── Mock: solo informativo, sin backend ──
  if (msg_sm_vc.mock_sm_vc || accion_sm_vc === 'info') {
    $q.notify({
      type:     'info',
      message:  'Este es un documento de simulación para la demostración académica.',
      position: 'top',
      icon:     'info',
      timeout:  3000,
    })
    return
  }

  // ── Guard: necesitamos el documentoId para llamar al backend ──
  const documentoId_sm_vc = msg_sm_vc.documento_id_sm_vc ?? msg_sm_vc.id_sm_vc
  if (!documentoId_sm_vc) {
    $q.notify({
      type:    'warning',
      message: 'No se puede identificar el archivo. Recarga la conversación.',
      icon:    'warning',
      timeout: 3000,
    })
    return
  }

  // ── Guard: evitar doble clic ──
  if (loadingAccion_sm_vc.value[documentoId_sm_vc]) return

  loadingAccion_sm_vc.value = {
    ...loadingAccion_sm_vc.value,
    [documentoId_sm_vc]: accion_sm_vc,
  }

  try {
    if (accion_sm_vc === 'descargar') {
      await svcDescargar_sm_vc(
        documentoId_sm_vc,
        msg_sm_vc.archivo_nombre_sm_vc ?? 'documento_sentinnel.pdf',
      )
      $q.notify({
        type:     'positive',
        message:  `"${msg_sm_vc.archivo_nombre_sm_vc}" descargado correctamente.`,
        icon:     'download_done',
        position: 'top-right',
        timeout:  2500,
      })
    } else if (accion_sm_vc === 'visualizar') {
      await svcVisualizar_sm_vc(documentoId_sm_vc)
      // Sin notificación: la pestaña nueva es feedback suficiente
    }
  } catch (err_sm_vc) {
    // El servidor devuelve un mensaje de error para MOCK y archivos faltantes
    const mensajeError_sm_vc =
      err_sm_vc?.response?.data?.message ||
      'Error al obtener el archivo. Contacta al administrador.'

    $q.notify({
      type:     'negative',
      message:  mensajeError_sm_vc,
      icon:     'error_outline',
      position: 'top',
      timeout:  4000,
    })
  } finally {
    // Limpiar el estado de loading para este documento específico
    const nuevo_sm_vc = { ...loadingAccion_sm_vc.value }
    delete nuevo_sm_vc[documentoId_sm_vc]
    loadingAccion_sm_vc.value = nuevo_sm_vc
  }
}
</script>

<style scoped>
/* ── Contenedor general ── */
.messages-container_sm_vc {
  padding: 1.25rem;
  max-height: 480px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(111,255,233,.1) transparent;
}
.messages-list_sm_vc { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Empty State ── */
.empty-chat_sm_vc {
  display: flex; flex-direction: column; align-items: center;
  gap: .5rem; padding: 2.5rem; text-align: center;
}
.empty-chat_sm_vc p { font-size: .75rem; color: var(--sn-texto-apagado); margin: 0; }
.empty-hint_sm_vc { color: var(--sn-texto-dim) !important; font-size: .68rem !important; }

/* ── Labels de rol ── */
.role-text_sm_vc   { font-weight: 700; margin-bottom: 4px; display: inline-block; font-size: .72rem; }
.role-sistema_sm_vc   { color: #7ec8e3; }
.role-estudiante_sm_vc { color: #6fffe9; }

/* ── NODO TEXTO ── */
.message-text_sm_vc {
  font-size: .8rem; line-height: 1.6;
  font-family: var(--sn-font-sans);
}

/* ══ NODO DOCUMENTO ══ */
.file-card_sm_vc {
  display: flex; align-items: flex-start; gap: 0;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: 10px; overflow: hidden;
  min-width: 280px; max-width: 460px;
  transition: border-color .15s;
  margin-top: 6px;
}
.file-card_sm_vc:hover { border-color: var(--sn-borde-hover); }

/* Variantes por estado */
.file-card--aprobado_sm_vc   { border-color: rgba(20,184,166,.25); }
.file-card--reprobado_sm_vc  { border-color: rgba(239,68,68,.25); }
.file-card--observado_sm_vc  { border-color: rgba(245,158,11,.25); }
.file-card--parcial_sm_vc    { border-color: rgba(99,102,241,.25); }
.file-card--entregado_sm_vc  { border-color: rgba(59,130,246,.25); }
.file-card--pendiente_sm_vc  { border-color: rgba(126,200,227,.1); }

/* Franja lateral de color */
.file-type-strip_sm_vc { width: 3px; align-self: stretch; flex-shrink: 0; }
.file-card--aprobado_sm_vc  .file-type-strip_sm_vc { background: #14b8a6; }
.file-card--reprobado_sm_vc .file-type-strip_sm_vc { background: #ef4444; }
.file-card--observado_sm_vc .file-type-strip_sm_vc { background: #f59e0b; }
.file-card--parcial_sm_vc   .file-type-strip_sm_vc { background: #6366f1; }
.file-card--entregado_sm_vc .file-type-strip_sm_vc { background: #3b82f6; }
.file-card--pendiente_sm_vc .file-type-strip_sm_vc { background: #7ec8e3; }

/* Columna de icono */
.file-icon-col_sm_vc { padding: .875rem .75rem .875rem .875rem; flex-shrink: 0; }
.file-icon-bg_sm_vc {
  width: 38px; height: 38px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.04);
}

/* Cuerpo */
.file-body_sm_vc { flex: 1; padding: .875rem 0; min-width: 0; }
.file-name-row_sm_vc {
  display: flex; align-items: center; gap: .4rem;
  margin-bottom: 4px; flex-wrap: wrap;
}
.file-name_sm_vc {
  font-size: .78rem; font-weight: 600;
  color: var(--sn-texto-principal);
  word-break: break-word; font-family: var(--sn-font-sans);
}
.file-meta-row_sm_vc { display: flex; align-items: center; gap: .5rem; margin-bottom: 5px; }
.file-type-label_sm_vc {
  font-size: .55rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
  color: var(--sn-acento-sec); font-family: var(--sn-font-mono);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 200px;
}
.file-size_sm_vc {
  font-size: .6rem; color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono);
}
.file-comment_sm_vc {
  font-size: .6rem; color: rgba(245,158,11,.75);
  font-style: italic; margin: 0; line-height: 1.4;
  font-family: var(--sn-font-sans);
}

/* Columna de acciones */
.file-actions-col_sm_vc {
  display: flex; flex-direction: column;
  padding: .5rem .5rem .5rem 0; gap: 2px;
}

/* ── Animación de entrada ── */
.msg-slide-enter-active { transition: all .25s ease; }
.msg-slide-enter-from   { opacity: 0; transform: translateY(10px); }
</style>