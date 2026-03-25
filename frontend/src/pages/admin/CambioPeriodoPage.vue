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

    <!-- ── Tarjeta de estado actual ── -->
    <div class="periodo-card_sm_vc">
      <div class="periodo-actual_sm_vc">
        <div>
          <p class="periodo-label_sm_vc">Periodo Actual</p>
          <p class="periodo-valor_sm_vc">{{ store_sm_vc.periodoFormateado_sm_vc() }}</p>
        </div>
        <q-icon name="calendar_today" size="32px" color="teal-3" />
      </div>

      <!-- Rango de fechas del periodo actual -->
      <div v-if="store_sm_vc.fechaInicio_sm_vc || store_sm_vc.fechaCierre_sm_vc" class="fechas-actuales_vc">
        <div class="fecha-chip_vc">
          <q-icon name="play_circle" size="14px" color="teal-3" />
          <span>Inicio: {{ formatearFechaMes_vc(store_sm_vc.fechaInicio_sm_vc) }}</span>
        </div>
        <q-icon name="arrow_forward" size="12px" color="blue-grey-5" />
        <div class="fecha-chip_vc">
          <q-icon name="stop_circle" size="14px" color="amber-4" />
          <span>Cierre: {{ formatearFechaMes_vc(store_sm_vc.fechaCierre_sm_vc) }}</span>
        </div>
      </div>

      <!-- Aviso informativo -->
      <div class="info-notice_sm_vc">
        <q-icon name="info" color="teal-3" size="18px" />
        <p class="info-texto_sm_vc">
          El cambio de periodo afecta a toda la plataforma.
          Verifica las fechas antes de confirmar.
        </p>
      </div>

      <!-- Botón para abrir el modal -->
      <q-btn
        unelevated no-caps
        label="Cambiar Periodo" icon="edit_calendar"
        class="btn-cta_sm_vc"
        :loading="store_sm_vc.loading_sm_vc"
        @click="abrirModalPeriodo_vc" />
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
                default-view="Months"
                :navigation-max-year-month="fechaCierre_vc || undefined"
                class="sntnl-date_vc"
                color="teal-3"
                mask="YYYY/MM"
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
                default-view="Months"
                :navigation-min-year-month="fechaInicio_vc || undefined"
                class="sntnl-date_vc"
                color="amber"
                mask="YYYY/MM"
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
const fechaInicio_vc  = ref('')   // formato YYYY/MM (máscara de q-date)
const fechaCierre_vc  = ref('')   // formato YYYY/MM

/* ── Validación reactiva: cierre debe ser estrictamente mayor que inicio ── */
const errorFechas_vc = computed(() =>
  !!fechaInicio_vc.value &&
  !!fechaCierre_vc.value &&
  fechaCierre_vc.value <= fechaInicio_vc.value
)

/* ── Formatea YYYY/MM → "Mes YYYY" en español ── */
const formatearFechaMes_vc = (valor_vc) => {
  if (!valor_vc) return ''
  const [anio_vc, mes_vc] = valor_vc.split('/')
  const fecha_vc = new Date(Number(anio_vc), Number(mes_vc) - 1, 1)
  return fecha_vc.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
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

/* ── Tarjeta de estado ── */
.periodo-card_sm_vc {
  max-width: 480px;
  background: var(--sn-fondo-panel);
  border: 1px solid var(--sn-borde-activo);
  border-radius: 12px;
  padding: 1.75rem;
  display: flex; flex-direction: column; gap: 1.25rem;
  box-shadow: var(--sn-shadow-md);
}
.periodo-actual_sm_vc {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--sn-fondo-elevado);
  border: 1px solid var(--sn-borde); border-radius: 8px;
}
.periodo-label_sm_vc { font-size: .62rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sn-texto-apagado); margin: 0 0 4px; font-family: var(--sn-font-mono); }
.periodo-valor_sm_vc { font-size: 1.6rem; font-weight: 700; color: var(--sn-primario); margin: 0; font-family: var(--sn-font-mono); }

/* ── Chips de fechas actuales ── */
.fechas-actuales_vc {
  display: flex; align-items: center; gap: .75rem; flex-wrap: wrap;
  padding: .625rem .875rem;
  background: rgba(111,255,233,.04);
  border: 1px solid rgba(111,255,233,.1);
  border-radius: 8px;
}
.fecha-chip_vc { display: flex; align-items: center; gap: .4rem; font-size: .7rem; color: var(--sn-texto-secundario); font-family: var(--sn-font-mono); }

/* ── Info notice ── */
.info-notice_sm_vc { display: flex; align-items: flex-start; gap: .75rem; padding: .875rem 1rem; background: rgba(111,255,233,.04); border: 1px solid rgba(111,255,233,.1); border-radius: 8px; }
.info-texto_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; line-height: 1.6; font-family: var(--sn-font-sans); }

/* ── CTA Button ── */
.btn-cta_sm_vc { background: #6fffe9 !important; color: #0b132b !important; font-size: .78rem !important; font-weight: 700 !important; border-radius: 8px !important; align-self: flex-start; }

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