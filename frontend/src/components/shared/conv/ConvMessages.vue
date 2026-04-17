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
        :sent="esMensajeEnviado_sm_vc(msg)"
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

        <!-- ══ NODO TEXTO ══
             Renderizado con v-html procesado por el motor de Markdown global.
             Incluye sanitización XSS y énfasis semántico. -->
        <div 
          v-if="msg.tipo_nodo_sm_vc === 'TEXTO'" 
          class="message-text_sm_vc"
          v-html="renderMarkdown_sm_vc(msg.contenido_sm_vc)"
        />

        <!-- ══ NODO DOCUMENTO ══ -->
        <div
          v-else-if="msg.tipo_nodo_sm_vc === 'DOCUMENTO'"
          class="file-card_sm_vc"
          :class="estadoCardClass_sm_vc(msg.estado_sm_vc)"
        >
          <!-- Franja lateral de color por estado (vía CSS variables) -->
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
                class="q-ml-xs text-weight-bold"
                style="font-size: 0.52rem;"
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

            <template v-else>
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
import { renderMarkdown_sm_vc } from 'src/utils/markdown'
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

/** Map de loading por mensaje: { [msgId]: 'descargar' | 'visualizar' | null } */
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

/* ═══════════════════════════════════════════════════════════
   HELPERS DE IDENTIDAD DEL MENSAJE
   ═══════════════════════════════════════════════════════════ */

const tipoRemitente_sm_vc = (msg_sm_vc) => {
  if (msg_sm_vc.es_sistema_sm_vc) return 'SISTEMA'
  if (msg_sm_vc.remitente_rol_sm_vc === 'PROFESOR')   return 'PROFESOR'
  if (msg_sm_vc.remitente_rol_sm_vc === 'ESTUDIANTE') return 'ESTUDIANTE'
  return 'ESTUDIANTE' // Fallback legacy
}

const esMensajeEnviado_sm_vc = (msg_sm_vc) =>
  tipoRemitente_sm_vc(msg_sm_vc) === 'ESTUDIANTE'

const bgColor_sm_vc = (msg_sm_vc) => {
  const tipo_sm_vc = tipoRemitente_sm_vc(msg_sm_vc)
  if (tipo_sm_vc === 'ESTUDIANTE') return $q.dark.isActive ? 'teal-10' : 'teal-8'
  if (tipo_sm_vc === 'PROFESOR')   return $q.dark.isActive ? 'indigo-9' : 'indigo-8'
  return $q.dark.isActive ? 'blue-grey-9' : 'blue-grey-8'
}

const avatarColor_sm_vc = (msg_sm_vc) => {
  const tipo_sm_vc = tipoRemitente_sm_vc(msg_sm_vc)
  if (tipo_sm_vc === 'ESTUDIANTE') return 'teal-4'
  if (tipo_sm_vc === 'PROFESOR')   return 'indigo-5'
  return 'blue-grey-7'
}

const avatarIcono_sm_vc = (msg_sm_vc) => {
  if (msg_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO') return 'description'
  const tipo_sm_vc = tipoRemitente_sm_vc(msg_sm_vc)
  if (tipo_sm_vc === 'PROFESOR')   return 'school'
  if (tipo_sm_vc === 'SISTEMA')    return 'smart_toy'
  return 'person'
}

const nombreRemitente_sm_vc = (msg_sm_vc) => {
  const tipo_sm_vc = tipoRemitente_sm_vc(msg_sm_vc)
  if (tipo_sm_vc === 'PROFESOR')   return 'Profesor'
  if (tipo_sm_vc === 'SISTEMA')    return 'Sistema SENTINNEL'
  return 'Estudiante'
}

const rolClass_sm_vc = (msg_sm_vc) => {
  const tipo_sm_vc = tipoRemitente_sm_vc(msg_sm_vc)
  if (tipo_sm_vc === 'PROFESOR')   return 'role-profesor_sm_vc'
  if (tipo_sm_vc === 'SISTEMA')    return 'role-sistema_sm_vc'
  return 'role-estudiante_sm_vc'
}

/* ═══════════════════════════════
   HELPERS DE DOCUMENTO
   ═══════════════════════════════ */

const _normalizarEstado_sm_vc = (estado_sm_vc) => {
  if (!estado_sm_vc) return null;
  return String(estado_sm_vc).trim().toUpperCase();
}

const estadoCardClass_sm_vc = (estadoRaw_sm_vc) => {
  const estado_sm_vc = _normalizarEstado_sm_vc(estadoRaw_sm_vc);
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

const evalIcon_sm_vc = (estadoRaw_sm_vc) => {
  const estado_sm_vc = _normalizarEstado_sm_vc(estadoRaw_sm_vc);
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

const colorIconoEstado_sm_vc = (estadoRaw_sm_vc) => {
  const estado_sm_vc = _normalizarEstado_sm_vc(estadoRaw_sm_vc);
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

const colorBadge_sm_vc = (estadoRaw_sm_vc) => {
  const estado_sm_vc = _normalizarEstado_sm_vc(estadoRaw_sm_vc);
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

const getRequisitoNombre_sm_vc = (id_sm_vc) =>
  props.requisitos.find((r_sm_vc) => r_sm_vc.id_sm_vc === id_sm_vc)?.nombre_sm_vc ?? `Requisito #${id_sm_vc}`

const formatDateTime_sm_vc = (iso_sm_vc) => {
  if (!iso_sm_vc) return ''
  return new Date(iso_sm_vc).toLocaleString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const handleAccionArchivo_sm_vc = async (msg_sm_vc, accion_sm_vc) => {
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

  const rawId_sm_vc = msg_sm_vc.documento_id_sm_vc ?? msg_sm_vc.id_sm_vc
  const documentoId_sm_vc =
    typeof rawId_sm_vc === 'string' && rawId_sm_vc.startsWith('doc-')
      ? parseInt(rawId_sm_vc.replace('doc-', ''), 10)
      : rawId_sm_vc

  if (!documentoId_sm_vc) {
    $q.notify({ type: 'warning', message: 'No se puede identificar el archivo.', icon: 'warning' })
    return
  }

  if (loadingAccion_sm_vc.value[documentoId_sm_vc]) return
  loadingAccion_sm_vc.value = { ...loadingAccion_sm_vc.value, [documentoId_sm_vc]: accion_sm_vc }

  try {
    if (accion_sm_vc === 'descargar') {
      await svcDescargar_sm_vc(documentoId_sm_vc, msg_sm_vc.archivo_nombre_sm_vc ?? 'documento.pdf')
      $q.notify({ type: 'positive', message: 'Descargado correctamente.', icon: 'download_done' })
    } else if (accion_sm_vc === 'visualizar') {
      await svcVisualizar_sm_vc(documentoId_sm_vc)
    }
  } catch (err_sm_vc) {
    console.error('[SENTINNEL] Error:', err_sm_vc)
    $q.notify({ type: 'negative', message: 'Error al procesar el archivo.', icon: 'error_outline' })
  } finally {
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
  scrollbar-color: var(--sn-borde-activo) transparent;
}
.messages-list_sm_vc { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Empty State ── */
.empty-chat_sm_vc {
  display: flex; flex-direction: column; align-items: center;
  gap: .5rem; padding: 2.5rem; text-align: center;
}
.empty-chat_sm_vc p { font-size: .75rem; color: var(--sn-texto-apagado); margin: 0; }
.empty-hint_sm_vc { color: var(--sn-texto-dim) !important; font-size: .68rem !important; }

/* ── Labels de rol (Design System Aware) ── */
.role-text_sm_vc   { font-weight: 700; margin-bottom: 4px; display: inline-block; font-size: .72rem; }
.role-sistema_sm_vc    { color: var(--sn-estudiante); opacity: 0.8; }
.role-profesor_sm_vc   { color: var(--sn-profesor); }
.role-estudiante_sm_vc { color: var(--sn-acento); }

/* ── NODO TEXTO ── */
.message-text_sm_vc {
  font-size: .8rem; 
  line-height: 1.6;
  font-family: var(--sn-font-sans);
}

/* Manejo de elementos inyectados por el motor de Markdown */
.message-text_sm_vc :deep(strong) { font-weight: 700; }
.message-text_sm_vc :deep(em) { font-style: italic; opacity: 0.9; }
.message-text_sm_vc :deep(a) { transition: opacity 0.2s; }
.message-text_sm_vc :deep(a:hover) { opacity: 0.8; }

/* ══ NODO DOCUMENTO ══ */
.file-card_sm_vc {
  display: flex; align-items: flex-start; gap: 0;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-radius-lg); 
  overflow: hidden;
  min-width: 280px; max-width: 460px;
  transition: border-color .15s;
  margin-top: 6px;
}
.file-card_sm_vc:hover { border-color: var(--sn-borde-hover); }

/* Variantes por estado consumiendo tokens de color */
.file-card--aprobado_sm_vc   { border-color: var(--sn-exito); }
.file-card--reprobado_sm_vc  { border-color: var(--sn-error); }
.file-card--observado_sm_vc  { border-color: var(--sn-advertencia); }
.file-card--parcial_sm_vc    { border-color: var(--sn-profesor); }
.file-card--entregado_sm_vc  { border-color: var(--sn-estudiante); }
.file-card--pendiente_sm_vc  { border-color: var(--sn-texto-apagado); }

/* Franja lateral de color */
.file-type-strip_sm_vc { width: 3px; align-self: stretch; flex-shrink: 0; }
.file-card--aprobado_sm_vc  .file-type-strip_sm_vc { background: var(--sn-exito); }
.file-card--reprobado_sm_vc .file-type-strip_sm_vc { background: var(--sn-error); }
.file-card--observado_sm_vc .file-type-strip_sm_vc { background: var(--sn-advertencia); }
.file-card--parcial_sm_vc   .file-type-strip_sm_vc { background: var(--sn-profesor); }
.file-card--entregado_sm_vc .file-type-strip_sm_vc { background: var(--sn-estudiante); }
.file-card--pendiente_sm_vc .file-type-strip_sm_vc { background: var(--sn-texto-apagado); }

/* Columna de icono */
.file-icon-col_sm_vc { padding: .875rem .75rem .875rem .875rem; flex-shrink: 0; }
.file-icon-bg_sm_vc {
  width: 38px; height: 38px; border-radius: var(--sn-radius-md);
  display: flex; align-items: center; justify-content: center;
  background: var(--sn-surface-alpha);
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
  font-size: .6rem; color: var(--sn-advertencia);
  opacity: 0.8; font-style: italic; margin: 0; line-height: 1.4;
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