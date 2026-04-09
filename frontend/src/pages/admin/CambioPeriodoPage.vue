<!-- ══════════════════════════════════════════════════════════════════
     CambioPeriodoPage.vue — Gestión del periodo académico global.
     Thin Page: delega estado al periodoStore (Mock-First).
     Modal q-dialog de advertencia con selectores q-date por mes.
     Validación: fechaCierre_vc debe ser > fechaInicio_vc.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="calendar_today" size="22px" color="amber-4" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Periodo Académico</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Gestiona el periodo global del sistema — todos los módulos se ven afectados.
      </p>
    </div>

    <!-- ── Tarjeta de estado actual (Rediseño Hero) ── -->
    <div class="periodo-card_sm_vc">
      <div v-if="store_sm_vc.loading_sm_vc">
        <q-skeleton type="rect" height="100px" class="skeleton-card_sm_vc" />
      </div>

      <template v-else>
        <div class="periodo-hero-header_sm_vc">
          <div class="periodo-info_sm_vc">
            <div class="status-badge_sm_vc">
              <span class="pulse-dot_sm_vc"></span>
              ACTIVO
            </div>
            <p class="periodo-label_sm_vc">Periodo Operativo</p>
            <h2 class="periodo-valor_sm_vc">{{ store_sm_vc.periodoFormateado_sm_vc }}</h2>
          </div>
          <div class="periodo-icon-box_sm_vc">
            <q-icon name="auto_awesome" size="32px" color="teal-3" />
          </div>
        </div>

        <!-- Rango de fechas del periodo actual -->
        <div v-if="store_sm_vc.fechaInicio_sm_vc" class="fechas-actuales_vc">
          <div class="fecha-chip_vc">
            <q-icon name="event" size="14px" color="teal-3" />
            <span class="fecha-text_sm_vc">Del: {{ formatearFechaMes_vc(store_sm_vc.fechaInicio_sm_vc) }}</span>
          </div>
          <div class="fecha-divider_sm_vc"></div>
          <div class="fecha-chip_vc">
            <q-icon name="event_busy" size="14px" color="amber-4" />
            <span class="fecha-text_sm_vc">Al: {{ formatearFechaMes_vc(store_sm_vc.fechaCierre_sm_vc) }}</span>
          </div>
        </div>

        <!-- Botón para abrir el modal -->
        <div class="actions-row_sm_vc">
          <q-btn
            unelevated no-caps
            label="Actualizar Periodo" 
            icon="edit_calendar"
            class="btn-cta_sm_vc"
            @click="abrirModalPeriodo_vc" />
          
          <q-btn
            flat round dense
            icon="refresh"
            color="teal-3"
            class="btn-refresh_sm_vc"
            :loading="store_sm_vc.loading_sm_vc"
            @click="store_sm_vc.cargarPeriodoActual_sm_vc" />
        </div>
      </template>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         MODAL DE ADVERTENCIA — Cambio de Periodo Académico
         ══════════════════════════════════════════════════════════ -->
    <q-dialog
      v-model="modalPeriodo_vc"
      persistent
      transition-show="scale"
      transition-hide="scale">

      <q-card class="modal-warning-card_vc" dark>
        <!-- Franja de advertencia superior -->
        <div class="modal-warning-header_vc">
          <q-icon name="warning_amber" size="22px" color="amber-4" />
          <span class="modal-warning-titulo_vc">Advertencia: Cambio de Periodo</span>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </div>

        <q-card-section class="modal-body_vc">
          <p class="modal-desc_vc">
            Esta acción actualizará el <strong>periodo académico global</strong> del sistema.
            Todos los módulos, estudiantes y reportes se verán afectados inmediatamente.
            Verifica las fechas antes de confirmar.
          </p>

          <!-- Selectores de fecha por mes -->
          <div class="fecha-pickers-row_vc">
            <!-- Fecha de Inicio -->
            <div class="fecha-picker-col_vc">
              <p class="fecha-picker-label_vc">
                <q-icon name="play_circle" size="14px" color="teal-3" class="q-mr-xs" />
                Fecha de Inicio
              </p>
              <q-date
                v-model="fechaInicio_vc"
                dark
                minimal
                emit-immediately
                :navigation-max-year-month="fechaCierre_vc ? fechaCierre_vc.substring(0, 7).replace('-', '/') : undefined"
                class="sntnl-date_vc"
                color="teal-3"
                mask="YYYY-MM-DD"
              />
              <p class="fecha-valor_vc">{{ formatearFechaMes_vc(fechaInicio_vc) || '—' }}</p>
            </div>

            <div class="fecha-separador_vc">
              <q-icon name="arrow_forward" size="20px" color="blue-grey-6" />
            </div>

            <!-- Fecha de Cierre -->
            <div class="fecha-picker-col_vc">
              <p class="fecha-picker-label_vc">
                <q-icon name="stop_circle" size="14px" color="amber-4" class="q-mr-xs" />
                Fecha de Cierre
              </p>
              <q-date
                v-model="fechaCierre_vc"
                dark
                minimal
                emit-immediately
                :navigation-min-year-month="fechaInicio_vc ? fechaInicio_vc.substring(0, 7).replace('-', '/') : undefined"
                class="sntnl-date_vc"
                color="amber"
                mask="YYYY-MM-DD"
              />
              <p class="fecha-valor_vc">{{ formatearFechaMes_vc(fechaCierre_vc) || '—' }}</p>
            </div>
          </div>

          <!-- Error de validación de fechas -->
          <transition name="slide-down">
            <div v-if="errorFechas_vc" class="fecha-error-aviso_vc">
              <q-icon name="error" size="15px" color="red-4" />
              <span>La fecha de cierre debe ser <strong>posterior</strong> a la fecha de inicio.</span>
            </div>
          </transition>
        </q-card-section>

        <!-- Acciones del modal -->
        <q-card-actions class="modal-actions_vc">
          <q-btn
            flat no-caps
            label="Cancelar" icon="close"
            color="grey-5"
            class="modal-btn-cancel_vc"
            v-close-popup />
          <q-btn
            unelevated no-caps
            label="Guardar Periodo" icon="save"
            class="modal-btn-confirm_vc"
            :disable="!fechaInicio_vc || !fechaCierre_vc || errorFechas_vc"
            :loading="store_sm_vc.loading_sm_vc"
            @click="guardarPeriodo_vc" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeriodoStore } from 'src/stores/periodoStore'
const store_sm_vc = usePeriodoStore()

/* ── Estado del Modal ── */
const modalPeriodo_vc = ref(false)
const fechaInicio_vc  = ref('')   // formato YYYY-MM-DD
const fechaCierre_vc  = ref('')   // formato YYYY-MM-DD

/* ── Validación reactiva: cierre debe ser estrictamente mayor que inicio ── */
const errorFechas_vc = computed(() =>
  !!fechaInicio_vc.value &&
  !!fechaCierre_vc.value &&
  fechaCierre_vc.value <= fechaInicio_vc.value
)

/* ── Formatea YYYY-MM-DD → "DD de Mes, YYYY" en español ── */
const formatearFechaMes_vc = (valor_vc) => {
  if (!valor_vc) return ''
  const [anio_vc, mes_vc, dia_vc] = valor_vc.split('-')
  const fecha_vc = new Date(Number(anio_vc), Number(mes_vc) - 1, Number(dia_vc))
  return fecha_vc.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

/* ── Abrir modal pre-llenado con el periodo actual ── */
const abrirModalPeriodo_vc = () => {
  // Pre-cargar con los valores del store si existen
  fechaInicio_vc.value = store_sm_vc.fechaInicio_sm_vc || ''
  fechaCierre_vc.value = store_sm_vc.fechaCierre_sm_vc || ''
  modalPeriodo_vc.value = true
}

/* ── Guardar el nuevo periodo ── */
const guardarPeriodo_vc = async () => {
  if (errorFechas_vc.value) return

  const ok_vc = await store_sm_vc.actualizarPeriodo_sm_vc({
    fechaInicio: fechaInicio_vc.value,
    fechaCierre: fechaCierre_vc.value
  })

  if (ok_vc) {
    modalPeriodo_vc.value = false
    fechaInicio_vc.value = ''
    fechaCierre_vc.value = ''
  }
}

onMounted(() => store_sm_vc.cargarPeriodoActual_sm_vc())
</script>

<style scoped>
/* ── Layout ── */
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.page-header_sm_vc { margin-bottom: 1.25rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.page-title_sm_vc { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: .06em; margin: 0; font-family: var(--sn-font-mono); }
.page-subtitle_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; font-family: var(--sn-font-sans); }

/* ── Tarjeta de estado (Hero Design) ── */
.periodo-card_sm_vc {
  max-width: 520px;
  background: linear-gradient(145deg, var(--sn-fondo-panel, #0f1f3d), #14254a);
  border: 1px solid rgba(111,255,233,0.15);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1.25rem;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
  position: relative; overflow: hidden;
}
.periodo-card_sm_vc::before {
  content: ''; position: absolute; top: -50%; right: -20%;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(111,255,233,0.05) 0%, transparent 70%);
  pointer-events: none;
}

.periodo-hero-header_sm_vc { display: flex; align-items: flex-start; justify-content: space-between; }
.periodo-info_sm_vc { flex: 1; }

.status-badge_sm_vc {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(111, 255, 233, 0.1);
  border: 1px solid rgba(111, 255, 233, 0.2);
  color: #6fffe9; font-size: 0.6rem; font-weight: 800;
  padding: 4px 10px; border-radius: 20px;
  letter-spacing: 0.12em; margin-bottom: 12px;
}
.pulse-dot_sm_vc {
  width: 6px; height: 6px; background: #6fffe9; border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(111, 255, 233, 0.7);
  animation: sntnl-pulse_sm_vc 2s infinite;
}
@keyframes sntnl-pulse_sm_vc {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(111, 255, 233, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(111, 255, 233, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(111, 255, 233, 0); }
}

.periodo-label_sm_vc { font-size: .65rem; color: var(--sn-texto-terciario); margin: 0 0 6px; font-family: var(--sn-font-mono); text-transform: uppercase; letter-spacing: 0.1rem; }
.periodo-valor_sm_vc { font-size: 1.4rem; font-weight: 800; color: #fff; margin: 0; line-height: 1.2; letter-spacing: -0.02em; }
.periodo-icon-box_sm_vc { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }

.fechas-actuales_vc {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.875rem 1rem;
  background: rgba(0,0,0,0.2);
  border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);
}
.fecha-chip_vc { display: flex; align-items: center; gap: 8px; flex: 1; }
.fecha-text_sm_vc { font-size: 0.72rem; color: var(--sn-texto-secundario); font-family: var(--sn-font-mono); }
.fecha-divider_sm_vc { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }

.actions-row_sm_vc { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
.btn-cta_sm_vc { 
  background: #6fffe9 !important; color: #0b132b !important; 
  font-size: .75rem !important; font-weight: 800 !important; 
  border-radius: 10px !important; flex: 1;
  box-shadow: 0 4px 15px -5px rgba(111, 255, 233, 0.4);
}
.btn-refresh_sm_vc { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1); }
.skeleton-card_sm_vc { background: rgba(255,255,255,0.05) !important; border-radius: 16px; }

/* ══════════════════════════════════════
   MODAL DE ADVERTENCIA
   ══════════════════════════════════════ */
.modal-warning-card_vc {
  background: var(--sn-fondo-panel, #0f1f3d) !important;
  border: 1px solid var(--sn-advertencia, #d97706) !important;
  border-radius: 14px !important;
  min-width: 320px;
  max-width: 760px;
  width: 95vw;
  overflow: hidden;
}

/* Franja superior de advertencia */
.modal-warning-header_vc {
  display: flex; align-items: center; gap: .75rem;
  background: rgba(217, 119, 6, .12);
  border-bottom: 1px solid rgba(217, 119, 6, .3);
  padding: .875rem 1.25rem;
}
.modal-warning-titulo_vc {
  font-size: .88rem; font-weight: 700;
  color: #fbbf24;
  font-family: var(--sn-font-mono);
  letter-spacing: .04em;
}

/* Body del modal */
.modal-body_vc { padding: 1.25rem !important; }
.modal-desc_vc {
  font-size: .78rem; color: var(--sn-texto-secundario);
  line-height: 1.7; margin: 0 0 1.25rem;
  font-family: var(--sn-font-sans);
}
.modal-desc_vc strong { color: var(--sn-texto-principal); }

/* ── Date Pickers ── */
.fecha-pickers-row_vc {
  display: flex; align-items: flex-start; gap: 1rem;
  flex-wrap: wrap; justify-content: center;
}
.fecha-picker-col_vc { display: flex; flex-direction: column; align-items: center; gap: .5rem; flex: 1; min-width: 200px; }
.fecha-picker-label_vc {
  font-size: .7rem; font-weight: 600; letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-mono);
  margin: 0; align-self: flex-start;
  display: flex; align-items: center;
}
:deep(.sntnl-date_vc) {
  background: var(--sn-fondo-elevado, rgba(255,255,255,.04)) !important;
  border: 1px solid var(--sn-borde) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  width: 100%;
}
:deep(.sntnl-date_vc .q-date__header) { display: none !important; }
.fecha-valor_vc {
  font-size: .68rem; color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono);
  text-transform: capitalize; margin: 0;
}
.fecha-separador_vc {
  display: flex; align-items: center; padding-top: 2.5rem;
}

/* ── Error de Fechas ── */
.fecha-error-aviso_vc {
  display: flex; align-items: center; gap: .4rem;
  font-size: .7rem; color: #f87171;
  margin-top: .875rem; font-family: var(--sn-font-sans);
  background: rgba(220,38,38,.08);
  border: 1px solid rgba(220,38,38,.2);
  border-radius: 6px; padding: .5rem .75rem;
}
.fecha-error-aviso_vc strong { font-weight: 600; }

/* ── Acciones del Modal ── */
.modal-actions_vc {
  display: flex; justify-content: flex-end; gap: .5rem;
  padding: .875rem 1.25rem !important;
  border-top: 1px solid rgba(255,255,255,.06);
}
.modal-btn-cancel_vc { font-size: .72rem !important; color: var(--sn-texto-terciario) !important; }
.modal-btn-confirm_vc {
  background: #6fffe9 !important;
  color: #0b132b !important;
  font-size: .72rem !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
}
.modal-btn-confirm_vc:disabled { background: rgba(111,255,233,.2) !important; color: rgba(11,19,43,.5) !important; }

/* ── Transiciones ── */
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-4px); }
.slide-down-leave-to { opacity: 0; }
</style>