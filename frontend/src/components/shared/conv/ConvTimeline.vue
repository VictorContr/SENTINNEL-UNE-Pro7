<template>
  <div class="timeline-container_sm_vc">

    <!-- ── Empty State ── -->
    <div v-if="eventos.length === 0 && !cargando" class="empty-timeline_sm_vc">
      <q-icon name="history_toggle_off" size="48px" color="blue-grey-8" />
      <p class="text-subtitle2 q-mt-md text-blue-grey-6">
        Aún no se han registrado eventos en esta traza.
      </p>
    </div>

    <!-- ── Timeline principal ── -->
    <q-timeline
      v-else
      :layout="layout_sm_vc"
      side="right"
      class="q-px-md q-pb-xl q-pt-sm"
    >
      <q-timeline-entry
        v-for="evento in eventos"
        :key="evento.id_sm_vc"
        :title="tituloEvento_sm_vc(evento)"
        :subtitle="formatearFecha_sm_vc(evento.fecha_creacion_sm_vc)"
        :icon="iconoEvento_sm_vc(evento)"
        :color="colorEvento_sm_vc(evento)"
        class="timeline-entry_sm_vc"
      >
        <!-- ── NODO TEXTO: Log de Sistema con soporte Markdown ── -->
        <div
          v-if="evento.tipo_nodo_sm_vc === 'TEXTO'"
          class="evento-contenido_sm_vc"
          :class="evento.es_sistema_sm_vc ? 'evento-sistema_sm_vc' : 'evento-usuario_sm_vc'"
        >
          <div class="evento-tag_sm_vc">
            <q-icon
              :name="evento.es_sistema_sm_vc ? 'smart_toy' : 'person'"
              size="11px"
            />
            {{ evento.es_sistema_sm_vc ? 'Notificación Automática' : 'Mensaje del Estudiante' }}
          </div>
          <!-- Renderizado Markdown seguro -->
          <div 
             class="evento-texto_sm_vc"
             v-html="renderMarkdown_sm_vc(evento.contenido_sm_vc)"
          />
        </div>

        <!-- ── NODO DOCUMENTO: Tarjeta de Archivo ── -->
        <div
          v-else-if="evento.tipo_nodo_sm_vc === 'DOCUMENTO'"
          class="doc-card_sm_vc"
          :class="estadoClase_sm_vc(evento.estado_sm_vc)"
        >
          <div class="doc-strip_sm_vc" />

          <div class="doc-icon-col_sm_vc">
            <div class="doc-icon-bg_sm_vc">
              <q-icon
                :name="iconoEstado_sm_vc(evento.estado_sm_vc)"
                size="20px"
                :color="colorIconoEstado_sm_vc(evento.estado_sm_vc)"
              />
            </div>
          </div>

          <div class="doc-body_sm_vc">
            <div class="doc-nombre-row_sm_vc">
              <span class="doc-nombre_sm_vc">{{ evento.archivo_nombre_sm_vc }}</span>
              <q-badge
                v-if="evento.mock_sm_vc"
                color="warning"
                label="MOCK"
                class="q-ml-xs text-weight-bold"
                style="font-size: 0.52rem;"
              />
              <q-badge
                v-if="evento.estado_sm_vc"
                :color="colorBadgeEstado_sm_vc(evento.estado_sm_vc)"
                :label="evento.estado_sm_vc"
                class="q-ml-xs text-weight-bold"
                style="font-size: 0.52rem; letter-spacing: .05em;"
              />
            </div>
            <div class="doc-meta-row_sm_vc">
              <span class="doc-size_sm_vc">{{ evento.tamanio_sm_vc }}</span>
            </div>
            <p v-if="evento.mock_sm_vc" class="doc-mock-notice_sm_vc">
              Archivo de demostración académica — no requiere descarga real.
            </p>
          </div>

          <div class="doc-actions-col_sm_vc">
            <q-btn
              v-if="evento.mock_sm_vc"
              flat round dense
              icon="info"
              color="amber-4"
              size="sm"
              @click="handleMockInfo_sm_vc"
            >
              <q-tooltip class="bg-dark text-caption">Archivo simulado</q-tooltip>
            </q-btn>

            <template v-else>
              <q-btn
                flat round dense
                icon="download"
                color="teal-3"
                size="sm"
                @click="handleDescargar_sm_vc(evento)"
              >
                <q-tooltip class="bg-dark text-caption">Descargar</q-tooltip>
              </q-btn>
              <q-btn
                flat round dense
                icon="open_in_new"
                color="grey-5"
                size="sm"
                @click="handleVisualizar_sm_vc(evento)"
              >
                <q-tooltip class="bg-dark text-caption">Previsualizar</q-tooltip>
              </q-btn>
            </template>
          </div>
        </div>

      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { renderMarkdown_sm_vc } from 'src/utils/markdown'

const $q_sm_vc = useQuasar()

/* ── Props ── */
defineProps({
  eventos:  { type: Array,   default: () => [] },
  cargando: { type: Boolean, default: false }
})

const layout_sm_vc = computed(() =>
  $q_sm_vc.screen.lt.sm ? 'dense' : ($q_sm_vc.screen.lt.md ? 'comfortable' : 'loose')
)

const tituloEvento_sm_vc = (evento_sm_vc) => {
  if (evento_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO') return 'Entrega de Documento'
  return evento_sm_vc.es_sistema_sm_vc ? 'Log Automático del Sistema' : 'Mensaje del Estudiante'
}

const iconoEvento_sm_vc = (evento_sm_vc) => {
  if (evento_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO') return 'description'
  return evento_sm_vc.es_sistema_sm_vc ? 'verified' : 'chat'
}

const colorEvento_sm_vc = (evento_sm_vc) => {
  if (evento_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO') return 'light-blue-6'
  return evento_sm_vc.es_sistema_sm_vc ? 'teal-4' : 'amber-6'
}

const iconoEstado_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO: 'check_circle', REPROBADO: 'cancel', OBSERVACIONES: 'warning',
    EVALUACION_PARCIAL: 'fact_check', ENTREGADO: 'upload_file', PENDIENTE: 'schedule'
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'description'
}

const colorIconoEstado_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO: 'positive', REPROBADO: 'negative', OBSERVACIONES: 'warning',
    EVALUACION_PARCIAL: 'info', ENTREGADO: 'light-blue-4', PENDIENTE: 'blue-grey-5'
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'light-blue-4'
}

const colorBadgeEstado_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO: 'positive', REPROBADO: 'negative', OBSERVACIONES: 'warning',
    EVALUACION_PARCIAL: 'info', ENTREGADO: 'blue-5', PENDIENTE: 'blue-grey-6'
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'grey-7'
}

const estadoClase_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO: 'doc-card--aprobado_sm_vc', REPROBADO: 'doc-card--reprobado_sm_vc',
    PENDIENTE: 'doc-card--pendiente_sm_vc', ENTREGADO: 'doc-card--entregado_sm_vc'
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'doc-card--pendiente_sm_vc'
}

const formatearFecha_sm_vc = (iso_sm_vc) => {
  if (!iso_sm_vc) return '—'
  return new Date(iso_sm_vc).toLocaleString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const handleMockInfo_sm_vc = () => {
  $q_sm_vc.notify({ type: 'info', message: 'Documento de simulación académica.', icon: 'info' })
}

const handleDescargar_sm_vc = (evento_sm_vc) => {
  $q_sm_vc.notify({ type: 'warning', message: `Descarga de "${evento_sm_vc.archivo_nombre_sm_vc}" en construcción.` })
}

const handleVisualizar_sm_vc = (evento_sm_vc) => {
  $q_sm_vc.notify({ type: 'warning', message: `Previsualización de "${evento_sm_vc.archivo_nombre_sm_vc}" en construcción.` })
}
</script>

<style scoped>
.timeline-container_sm_vc { min-height: 200px; max-width: 100%; }
.timeline-entry_sm_vc { font-family: var(--sn-font-sans); }

.empty-timeline_sm_vc {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: .6; padding: 3rem 1.5rem; text-align: center;
}

/* ══ NODO TEXTO ══ */
.evento-contenido_sm_vc {
  padding: .7rem 1rem; border-radius: var(--sn-radius-md);
  border: 1px solid var(--sn-borde); transition: all .15s ease;
}
.evento-contenido_sm_vc:hover { transform: translateX(3px); border-color: var(--sn-borde-activo); }

.evento-sistema_sm_vc { background: var(--sn-surface-alpha); border-left: 3px solid var(--sn-acento); }
.evento-usuario_sm_vc { background: var(--sn-surface-alpha); border-left: 3px solid var(--sn-advertencia); }

.evento-tag_sm_vc {
  display: flex; align-items: center; gap: .3rem; font-size: .55rem; font-weight: 700;
  text-transform: uppercase; margin-bottom: .4rem; font-family: var(--sn-font-mono);
}
.evento-sistema_sm_vc .evento-tag_sm_vc { color: var(--sn-acento-sec); }
.evento-usuario_sm_vc .evento-tag_sm_vc { color: var(--sn-advertencia); }

.evento-texto_sm_vc {
  font-size: .795rem; line-height: 1.55; color: var(--sn-texto-secundario);
  margin: 0; font-family: var(--sn-font-sans);
}

/* ══ NODO DOCUMENTO ══ */
.doc-card_sm_vc {
  display: flex; align-items: flex-start; gap: 0; background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde); border-radius: var(--sn-radius-lg); overflow: hidden;
  min-width: 260px; max-width: 460px; transition: border-color .15s; margin-top: 2px;
}
.doc-card_sm_vc:hover { border-color: var(--sn-borde-hover); }

.doc-card--aprobado_sm_vc  { border-color: var(--sn-exito); opacity: 0.9; }
.doc-card--reprobado_sm_vc { border-color: var(--sn-error); }
.doc-card--entregado_sm_vc { border-color: var(--sn-estudiante); }

.doc-strip_sm_vc { width: 3px; align-self: stretch; flex-shrink: 0; }
.doc-card--aprobado_sm_vc  .doc-strip_sm_vc { background: var(--sn-exito); }
.doc-card--reprobado_sm_vc .doc-strip_sm_vc { background: var(--sn-error); }
.doc-card--entregado_sm_vc .doc-strip_sm_vc { background: var(--sn-estudiante); }
.doc-card--pendiente_sm_vc .doc-strip_sm_vc { background: var(--sn-texto-apagado); }

.doc-icon-col_sm_vc { padding: .75rem .625rem .75rem .75rem; }
.doc-icon-bg_sm_vc {
  width: 34px; height: 34px; border-radius: var(--sn-radius-md);
  display: flex; align-items: center; justify-content: center; background: var(--sn-surface-alpha);
}

.doc-body_sm_vc { flex: 1; padding: .75rem 0; }
.doc-nombre_sm_vc { font-size: .76rem; font-weight: 600; color: var(--sn-texto-principal); font-family: var(--sn-font-sans); }
.doc-size_sm_vc { font-size: .58rem; color: var(--sn-texto-apagado); font-family: var(--sn-font-mono); }
.doc-mock-notice_sm_vc { font-size: .58rem; color: var(--sn-advertencia); font-style: italic; margin-top: 4px; }

.doc-actions-col_sm_vc { display: flex; flex-direction: column; padding: .375rem; gap: 2px; }

:deep(.q-timeline__title) { font-family: var(--sn-font-mono); font-size: .8rem; text-transform: uppercase; font-weight: 700; color: var(--sn-texto-principal); }
:deep(.q-timeline__subtitle) { font-size: .65rem; font-weight: 600; opacity: .75; color: var(--sn-texto-terciario); }
</style>
