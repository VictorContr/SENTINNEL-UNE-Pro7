<!-- ══════════════════════════════════════════════════════════════════
     ConvMessages.vue — Lista paginada de mensajes documentales.
     Renderiza tarjetas de archivos (informe/corrección) con acciones
     de descarga. Recibe mensajes como prop; no muta el store.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="messages-container_sm_vc" ref="containerRef_sm_vc">
    <div v-if="mensajes.length === 0" class="empty-chat_sm_vc">
      <q-icon name="chat_bubble_outline" size="36px" color="blue-grey-8" />
      <p>Aún no hay documentos en esta conversación.</p>
      <p v-if="!readonly" class="empty-hint_sm_vc">
        El estudiante debe enviar la primera versión.
      </p>
    </div>

    <transition-group name="msg-slide" tag="div" class="messages-list_sm_vc">
      <q-chat-message
        v-for="msg in mensajes"
        :key="msg.id_sm_vc"
        :name="msg.remitente_rol_sm_vc"
        :stamp="formatDateTime_sm_vc(msg.fecha_sm_vc)"
        :sent="msg.remitente_rol_sm_vc !== 'ESTUDIANTE'"
        :text-color="$q.dark.isActive ? 'white' : 'dark'"
        :bg-color="bgColor_sm_vc(msg.remitente_rol_sm_vc)"
        size="8"
      >
        <template #avatar>
          <q-avatar size="32px"
            :color="msg.remitente_rol_sm_vc === 'ESTUDIANTE' ? 'teal-3' : 'grey-6'"
            :text-color="$q.dark.isActive ? 'white' : 'dark'"
            class="q-mx-sm">
            <q-icon
              :name="msg.remitente_rol_sm_vc === 'ESTUDIANTE' ? 'person' : 'school'"
              size="20px" />
          </q-avatar>
        </template>

        <template #name>
          <span class="role-text_sm_vc">{{ msg.remitente_rol_sm_vc }}</span>
          <div v-if="msg.requisito_id_sm_vc" class="req-tag_sm_vc">
            <q-icon name="assignment" size="11px" />
            {{ getRequisitoNombre_sm_vc(msg.requisito_id_sm_vc) }}
          </div>
        </template>

        <!-- Tarjeta de archivo -->
        <div class="file-card_sm_vc"
          :class="`file-card--${msg.tipo_sm_vc.toLowerCase()}_sm_vc`">
          <div class="file-type-strip_sm_vc" />
          <div class="file-icon-col_sm_vc">
            <div class="file-icon-bg_sm_vc">
              <q-icon
                :name="msg.tipo_sm_vc === 'INFORME' ? 'description' : 'rate_review'"
                size="22px"
                :color="msg.tipo_sm_vc === 'INFORME' ? 'light-blue-4' : 'grey-5'" />
            </div>
          </div>
          <div class="file-body_sm_vc">
            <div class="file-name-row_sm_vc">
              <span class="file-name_sm_vc">{{ msg.archivo_nombre_sm_vc }}</span>
              <div class="file-version-chip_sm_vc">{{ msg.version_sm_vc }}</div>
            </div>
            <div class="file-meta-row_sm_vc">
              <span class="file-type-label_sm_vc"
                :class="`tipo-label--${msg.tipo_sm_vc.toLowerCase()}_sm_vc`">
                {{ msg.tipo_sm_vc }}
              </span>
              <span class="file-size_sm_vc">{{ msg.tamanio_sm_vc }}</span>
            </div>
            <p v-if="msg.comentario_sm_vc" class="file-comment_sm_vc">
              "{{ msg.comentario_sm_vc }}"
            </p>
          </div>
          <div class="file-actions-col_sm_vc">
            <q-btn flat round dense icon="download" color="teal-3" size="sm">
              <q-tooltip class="bg-dark text-caption">Descargar</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="open_in_new" color="grey-6" size="sm">
              <q-tooltip class="bg-dark text-caption">Previsualizar</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Chip de evaluación -->
        <div v-if="msg.estado_evaluacion_sm_vc"
          class="eval-chip_sm_vc"
          :class="`eval-chip--${msg.estado_evaluacion_sm_vc.toLowerCase()}_sm_vc`">
          <q-icon :name="evalIcon_sm_vc(msg.estado_evaluacion_sm_vc)" size="14px" />
          <span>Resultado: {{ msg.estado_evaluacion_sm_vc }}</span>
        </div>
      </q-chat-message>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  mensajes: { type: Array, default: () => [] },
  requisitos: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false }
})

const containerRef_sm_vc = ref(null)

/* Auto-scroll al agregar mensajes */
watch(
  () => props.mensajes.length,
  async () => {
    await nextTick()
    if (containerRef_sm_vc.value) {
      containerRef_sm_vc.value.scrollTop = containerRef_sm_vc.value.scrollHeight
    }
  }
)

const bgColor_sm_vc = (rol_sm_vc) => {
  if ($q.dark.isActive) {
    return rol_sm_vc === 'ESTUDIANTE' ? 'teal-9' : 'grey-8'
  }
  return rol_sm_vc === 'ESTUDIANTE' ? 'teal-1' : 'grey-2'
}

const getRequisitoNombre_sm_vc = (id_sm_vc) =>
  props.requisitos.find((r) => r.id_sm_vc === id_sm_vc)?.nombre_sm_vc ?? id_sm_vc

const evalIcon_sm_vc = (estado_sm_vc) => {
  const icons_sm_vc = {
    APROBADO: 'check_circle',
    REPROBADO: 'cancel',
    OBSERVACIONES: 'warning',
    EVALUACION_PARCIAL: 'fact_check'
  }
  return icons_sm_vc[estado_sm_vc] ?? 'info'
}

const formatDateTime_sm_vc = (iso_sm_vc) =>
  new Date(iso_sm_vc).toLocaleString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
</script>

<style scoped>
.messages-container_sm_vc {
  padding: 1.25rem; max-height: 420px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(111,255,233,.1) transparent;
}
.messages-list_sm_vc { display: flex; flex-direction: column; gap: 1.25rem; }
.empty-chat_sm_vc {
  display: flex; flex-direction: column; align-items: center;
  gap: .5rem; padding: 2.5rem; text-align: center;
}
.empty-chat_sm_vc p { font-size: .75rem; color: var(--sn-texto-apagado); margin: 0; }
.empty-hint_sm_vc { color: var(--sn-texto-dim) !important; font-size: .68rem !important; }
.role-text_sm_vc { color: var(--sn-primario); font-weight: bold; margin-bottom: 4px; display: inline-block; }
.req-tag_sm_vc {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: .55rem; color: var(--sn-acento-sec);
  background: var(--sn-surface-active); padding: 1px 6px;
  border-radius: 3px; margin-left: .5rem;
}
.file-card_sm_vc {
  display: flex; align-items: flex-start; gap: 0;
  background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde);
  border-radius: 10px; overflow: hidden;
  min-width: 280px; max-width: 460px;
  transition: border-color .15s;
}
.file-card_sm_vc:hover { border-color: var(--sn-borde-hover); }
.file-card--informe_sm_vc { border-color: rgba(126,200,227,.1); }
.file-card--correccion_sm_vc { border-color: rgba(243,168,6,.1); }
.file-type-strip_sm_vc { width: 3px; align-self: stretch; flex-shrink: 0; }
.file-card--informe_sm_vc .file-type-strip_sm_vc { background: #7ec8e3; }
.file-card--correccion_sm_vc .file-type-strip_sm_vc { background: #9e9e9e; }
.file-icon-col_sm_vc { padding: .875rem .75rem .875rem .875rem; flex-shrink: 0; }
.file-icon-bg_sm_vc {
  width: 38px; height: 38px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.file-card--informe_sm_vc .file-icon-bg_sm_vc { background: rgba(126,200,227,.1); }
.file-card--correccion_sm_vc .file-icon-bg_sm_vc { background: rgba(238,164,5,.849); }
.file-body_sm_vc { flex: 1; padding: .875rem 0; }
.file-name-row_sm_vc { display: flex; align-items: center; gap: .5rem; margin-bottom: 4px; flex-wrap: wrap; }
.file-name_sm_vc { font-size: .78rem; font-weight: 600; color: var(--sn-texto-principal); word-break: break-word; }
.file-version-chip_sm_vc {
  font-size: .55rem; font-weight: 700; color: var(--sn-texto-secundario);
  background: rgba(255,255,255,.05); padding: 1px 6px; border-radius: 3px;
}
.file-meta-row_sm_vc { display: flex; align-items: center; gap: .5rem; margin-bottom: 6px; }
.file-type-label_sm_vc { font-size: .55rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.tipo-label--informe_sm_vc { color: var(--sn-estudiante); }
.tipo-label--correccion_sm_vc { color: rgba(238,164,5,.952); }
.file-size_sm_vc { font-size: .6rem; color: var(--sn-texto-principal); }
.file-comment_sm_vc {
  font-size: .68rem; color: var(--sn-texto-principal);
  line-height: 1.5; margin: 0; font-family: var(--sn-font-sans); font-style: italic;
}
.file-actions-col_sm_vc { display: flex; flex-direction: column; padding: .5rem .5rem .5rem 0; gap: 2px; }
.eval-chip_sm_vc {
  display: flex; align-items: center; gap: .35rem;
  font-size: .6rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
  padding: 3px 10px; border-radius: 4px; align-self: flex-end;
}
.eval-chip--aprobado_sm_vc { background: var(--sn-surface-active); color: var(--sn-primario); }
.eval-chip--reprobado_sm_vc { background: rgba(255,143,163,.1); color: var(--sn-error-claro); }
.eval-chip--observaciones_sm_vc { background: rgba(240,165,0,.1); color: var(--sn-advertencia); }
.eval-chip--evaluacion_parcial_sm_vc { background: rgba(126,200,227,.1); color: var(--sn-estudiante); }
.msg-slide-enter-active { transition: all .25s ease; }
.msg-slide-enter-from { opacity: 0; transform: translateY(10px); }
</style>