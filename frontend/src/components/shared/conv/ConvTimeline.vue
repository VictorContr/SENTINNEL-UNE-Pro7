<!-- ══════════════════════════════════════════════════════════════════
     ConvTimeline.vue — Vista de Trazabilidad Cronológica.
     Renderiza todos los eventos del log unificado (TEXTO + DOCUMENTO)
     como un timeline interactivo de Quasar.
     Es un componente "Dumb": solo recibe el array de eventos por prop.

     Diferenciación visual:
       • TEXTO + es_sistema = true  → Log Automático del Sistema (azul/teal)
       • TEXTO + es_sistema = false → Mensaje Manual del Usuario (amber)
       • DOCUMENTO (cualquiera)     → Tarjeta de Archivo compacta
     ══════════════════════════════════════════════════════════════════ -->
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
        <!-- ── NODO TEXTO: Log de Sistema ── -->
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
          <p class="evento-texto_sm_vc">{{ evento.contenido_sm_vc }}</p>
        </div>

        <!-- ── NODO DOCUMENTO: Tarjeta de Archivo ── -->
        <div
          v-else-if="evento.tipo_nodo_sm_vc === 'DOCUMENTO'"
          class="doc-card_sm_vc"
          :class="estadoClase_sm_vc(evento.estado_sm_vc)"
        >
          <!-- Franja de color lateral por estado -->
          <div class="doc-strip_sm_vc" />

          <!-- Icono de archivo -->
          <div class="doc-icon-col_sm_vc">
            <div class="doc-icon-bg_sm_vc">
              <q-icon
                :name="iconoEstado_sm_vc(evento.estado_sm_vc)"
                size="20px"
                :color="colorIconoEstado_sm_vc(evento.estado_sm_vc)"
              />
            </div>
          </div>

          <!-- Cuerpo de la tarjeta -->
          <div class="doc-body_sm_vc">
            <div class="doc-nombre-row_sm_vc">
              <span class="doc-nombre_sm_vc">{{ evento.archivo_nombre_sm_vc }}</span>
              <q-badge
                v-if="evento.mock_sm_vc"
                color="warning"
                label="MOCK"
                class="q-ml-xs"
                style="font-size: 0.52rem; font-weight: 700;"
              />
              <q-badge
                v-if="evento.estado_sm_vc"
                :color="colorBadgeEstado_sm_vc(evento.estado_sm_vc)"
                :label="evento.estado_sm_vc"
                class="q-ml-xs"
                style="font-size: 0.52rem; font-weight: 700; letter-spacing: .05em;"
              />
            </div>
            <div class="doc-meta-row_sm_vc">
              <span class="doc-size_sm_vc">{{ evento.tamanio_sm_vc }}</span>
            </div>
            <!-- Aviso informativo para archivos simulados -->
            <p v-if="evento.mock_sm_vc" class="doc-mock-notice_sm_vc">
              Archivo de demostración académica — no requiere descarga real.
            </p>
          </div>

          <!-- Acciones según si es mock o archivo real -->
          <div class="doc-actions-col_sm_vc">
            <!-- Mock: botón informativo -->
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

            <!-- Real: botones de acción -->
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

const $q_sm_vc = useQuasar()

/* ── Props ── */
defineProps({
  eventos:  { type: Array,   default: () => [] },
  cargando: { type: Boolean, default: false }
})

/* ── Computed: layout responsive del timeline ── */
const layout_sm_vc = computed(() =>
  $q_sm_vc.screen.lt.sm ? 'dense' : ($q_sm_vc.screen.lt.md ? 'comfortable' : 'loose')
)

/* ── Helpers de Renderizado ── */

/**
 * Título del nodo: diferencia entre documento subido y log de sistema.
 */
const tituloEvento_sm_vc = (evento_sm_vc) => {
  if (evento_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO') return 'Entrega de Documento'
  return evento_sm_vc.es_sistema_sm_vc ? 'Log Automático del Sistema' : 'Mensaje del Estudiante'
}

/**
 * Icono del hito en el timeline según tipo y origen del evento.
 */
const iconoEvento_sm_vc = (evento_sm_vc) => {
  if (evento_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO') return 'description'
  return evento_sm_vc.es_sistema_sm_vc ? 'verified' : 'chat'
}

/**
 * Color del hito en el timeline.
 * Sistema = teal; Estudiante = amber; Documento = light-blue
 */
const colorEvento_sm_vc = (evento_sm_vc) => {
  if (evento_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO') return 'light-blue-6'
  return evento_sm_vc.es_sistema_sm_vc ? 'teal-4' : 'amber-6'
}

/* ── Helpers de Estado de Documento ── */

const iconoEstado_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO:          'check_circle',
    REPROBADO:         'cancel',
    OBSERVACIONES:     'warning',
    EVALUACION_PARCIAL:'fact_check',
    ENTREGADO:         'upload_file',
    PENDIENTE:         'schedule'
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'description'
}

const colorIconoEstado_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO:          'positive',
    REPROBADO:         'negative',
    OBSERVACIONES:     'warning',
    EVALUACION_PARCIAL:'info',
    ENTREGADO:         'light-blue-4',
    PENDIENTE:         'blue-grey-5'
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'light-blue-4'
}

const colorBadgeEstado_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO:          'positive',
    REPROBADO:         'negative',
    OBSERVACIONES:     'warning',
    EVALUACION_PARCIAL:'info',
    ENTREGADO:         'blue-5',
    PENDIENTE:         'blue-grey-6'
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'grey-7'
}

const estadoClase_sm_vc = (estado_sm_vc) => {
  const mapa_sm_vc = {
    APROBADO:  'doc-card--aprobado_sm_vc',
    REPROBADO: 'doc-card--reprobado_sm_vc',
    PENDIENTE: 'doc-card--pendiente_sm_vc',
    ENTREGADO: 'doc-card--entregado_sm_vc',
  }
  return mapa_sm_vc[estado_sm_vc] ?? 'doc-card--pendiente_sm_vc'
}

/* ── Formato de Fechas ── */
const formatearFecha_sm_vc = (iso_sm_vc) => {
  if (!iso_sm_vc) return '—'
  return new Date(iso_sm_vc).toLocaleString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

/* ── Handlers de Acción ── */
const handleMockInfo_sm_vc = () => {
  $q_sm_vc.notify({
    type: 'info',
    message: 'Este es un documento de simulación para la demostración académica.',
    position: 'top',
    icon: 'info',
    timeout: 3000
  })
}

const handleDescargar_sm_vc = (evento_sm_vc) => {
  $q_sm_vc.notify({
    type: 'warning',
    message: `Descarga de "${evento_sm_vc.archivo_nombre_sm_vc}" en construcción.`,
    position: 'top',
    timeout: 2500
  })
}

const handleVisualizar_sm_vc = (evento_sm_vc) => {
  $q_sm_vc.notify({
    type: 'warning',
    message: `Previsualización de "${evento_sm_vc.archivo_nombre_sm_vc}" en construcción.`,
    position: 'top',
    timeout: 2500
  })
}
</script>

<style scoped>
.timeline-container_sm_vc {
  min-height: 200px;
  max-width: 100%;
}

/* ── Entry base ── */
.timeline-entry_sm_vc {
  font-family: var(--sn-font-sans);
}

/* ── Empty State ── */
.empty-timeline_sm_vc {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  opacity: .6; padding: 3rem 1.5rem; text-align: center;
}

/* ══ NODO TEXTO ══ */
.evento-contenido_sm_vc {
  padding: .7rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--sn-borde);
  transition: transform .15s ease, border-color .15s;
}
.evento-contenido_sm_vc:hover {
  transform: translateX(3px);
  border-color: var(--sn-primario);
}

/* Log de Sistema: Fondo teal muy sutil + borde izquierdo */
.evento-sistema_sm_vc {
  background: rgba(111,255,233,.03);
  border-left: 3px solid rgba(111,255,233,.4);
}
/* Mensaje de Usuario/Estudiante: Fondo amber muy sutil */
.evento-usuario_sm_vc {
  background: rgba(245,158,11,.03);
  border-left: 3px solid rgba(245,158,11,.35);
}

.evento-tag_sm_vc {
  display: flex; align-items: center; gap: .3rem;
  font-size: .55rem; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; margin-bottom: .4rem;
  color: var(--sn-texto-apagado); font-family: var(--sn-font-mono);
}
.evento-sistema_sm_vc .evento-tag_sm_vc { color: rgba(111,255,233,.6); }
.evento-usuario_sm_vc .evento-tag_sm_vc { color: rgba(245,158,11,.7); }

.evento-texto_sm_vc {
  font-size: .795rem; line-height: 1.55;
  color: var(--sn-texto-secundario);
  margin: 0; font-family: var(--sn-font-sans);
}

/* ══ NODO DOCUMENTO ══ */
.doc-card_sm_vc {
  display: flex; align-items: flex-start; gap: 0;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: 10px; overflow: hidden;
  min-width: 260px; max-width: 460px;
  transition: border-color .15s;
  margin-top: 2px;
}
.doc-card_sm_vc:hover { border-color: var(--sn-borde-hover); }

/* Variantes de color por estado */
.doc-card--aprobado_sm_vc  { border-color: rgba(20,184,166,.2); }
.doc-card--reprobado_sm_vc { border-color: rgba(239,68,68,.2); }
.doc-card--entregado_sm_vc { border-color: rgba(59,130,246,.2); }
.doc-card--pendiente_sm_vc { border-color: rgba(148,163,184,.12); }

/* Franja izquierda de color */
.doc-strip_sm_vc { width: 3px; align-self: stretch; flex-shrink: 0; }
.doc-card--aprobado_sm_vc  .doc-strip_sm_vc { background: #14b8a6; }
.doc-card--reprobado_sm_vc .doc-strip_sm_vc { background: #ef4444; }
.doc-card--entregado_sm_vc .doc-strip_sm_vc { background: #3b82f6; }
.doc-card--pendiente_sm_vc .doc-strip_sm_vc { background: #64748b; }

/* Columna de icono */
.doc-icon-col_sm_vc { padding: .75rem .625rem .75rem .75rem; flex-shrink: 0; }
.doc-icon-bg_sm_vc {
  width: 34px; height: 34px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,.04);
}

/* Cuerpo */
.doc-body_sm_vc { flex: 1; padding: .75rem 0; }
.doc-nombre-row_sm_vc {
  display: flex; align-items: center; gap: .4rem;
  margin-bottom: 3px; flex-wrap: wrap;
}
.doc-nombre_sm_vc {
  font-size: .76rem; font-weight: 600;
  color: var(--sn-texto-principal);
  word-break: break-word; font-family: var(--sn-font-sans);
}
.doc-meta-row_sm_vc { display: flex; align-items: center; gap: .4rem; }
.doc-size_sm_vc { font-size: .58rem; color: var(--sn-texto-apagado); font-family: var(--sn-font-mono); }

.doc-mock-notice_sm_vc {
  font-size: .58rem; color: rgba(245,158,11,.7);
  font-style: italic; margin: 4px 0 0; line-height: 1.4;
  font-family: var(--sn-font-sans);
}

/* Acciones */
.doc-actions-col_sm_vc {
  display: flex; flex-direction: column;
  padding: .375rem .375rem .375rem 0; gap: 2px;
}

/* ── Overrides del Q-Timeline de Quasar ── */
:deep(.q-timeline__title) {
  font-family: var(--sn-font-mono);
  font-size: .8rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 700;
}
:deep(.q-timeline__subtitle) {
  font-size: .65rem;
  font-weight: 600;
  opacity: .75;
  font-family: var(--sn-font-sans);
}
</style>
