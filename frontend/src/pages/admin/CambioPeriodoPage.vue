<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="calendar_month" size="28px" class="q-mr-sm title-icon_vc" />
        <h1 class="page-title_sm_vc">Gestión de Períodos Académicos</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Administra el ciclo actual o inicializa nuevos períodos (Roll Forward). El sistema ajustará automáticamente el progreso de los estudiantes activos.
      </p>
    </div>

    <!-- ── RECUADRO SUPERIOR: Período Activo ── -->
    <q-card class="periodo-activo-card_vc q-mb-xl text-white" :dark="config_sm_vc.isDark_sm_vc">
      <div v-if="store_sm_vc.loading_sm_vc && !store_sm_vc.periodoActual_sm_vc">
        <q-skeleton type="rect" height="120px" class="skeleton-card_sm_vc" />
      </div>
      
      <template v-else>
        <div class="hero-content_vc row items-center justify-between no-wrap">
          <div class="col-xs-12 col-sm-8 info-section_vc">
             <div class="status-badge_sm_vc">
              <span class="pulse-dot_sm_vc"></span>
              ACTIVO
            </div>
            <p class="periodo-label_sm_vc">Ciclo Operativo Actual</p>
            <h2 class="periodo-valor_sm_vc">{{ store_sm_vc.periodoFormateado_sm_vc || 'Ninguno Activo' }}</h2>
            
            <div v-if="store_sm_vc.fechaInicio_sm_vc" class="fechas-actuales_vc q-mt-md">
              <div class="fecha-chip_vc">
                <q-icon name="event" size="16px" color="teal-13" />
                <span class="fecha-text_sm_vc">Inicio: {{ formatearFechaVisual_vc(store_sm_vc.fechaInicio_sm_vc) }}</span>
              </div>
              <div class="fecha-divider_sm_vc"></div>
              <div class="fecha-chip_vc">
                <q-icon name="event_busy" size="16px" color="amber-13" />
                <span class="fecha-text_sm_vc">Cierre: {{ formatearFechaVisual_vc(store_sm_vc.fechaCierre_sm_vc) }}</span>
              </div>
            </div>
          </div>
          
          <div class="col-xs-12 col-sm-4 actions-section_vc column items-end justify-center q-gutter-y-sm">
             <q-btn
               unelevated no-caps
               label="Editar Fechas" 
               icon="edit_calendar"
               class="btn-edit_vc full-width"
               :disable="!store_sm_vc.periodoActualObj_sm_vc"
               @click="abrirModalEditar_vc" 
             />
             <q-btn
               unelevated no-caps
               label="Iniciar Nuevo Ciclo" 
               icon="rocket_launch"
               class="btn-cta_vc full-width"
               @click="abrirModalCrear_vc" 
             />
          </div>
        </div>
      </template>
    </q-card>

    <!-- ── TABLA DE HISTORIAL ── -->
    <q-card class="bg-panel-dynamic_vc" :dark="config_sm_vc.isDark_sm_vc">
       <q-table
          title="Historial de Períodos"
          :rows="store_sm_vc.periodos_sm_vc"
          :columns="columns_vc"
          row-key="id_sm_vc"
          :loading="store_sm_vc.loading_sm_vc"
          flat bordered
          class="tabla-historial_vc transparent"
          :dark="config_sm_vc.isDark_sm_vc"
          hide-bottom
          :pagination="{ rowsPerPage: 10 }"
       >
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-chip 
                dense 
                :color="props.row.estado_activo_sm_vc ? 'teal-4' : 'grey-7'" 
                :text-color="props.row.estado_activo_sm_vc ? 'black' : 'white'"
                size="11px"
                class="text-weight-bold"
              >
                {{ props.row.estado_activo_sm_vc ? 'ACTIVO' : 'CERRADO' }}
              </q-chip>
            </q-td>
          </template>
       </q-table>
    </q-card>

    <!-- ════ MODAL PARA EDITAR (PATCH) ════ -->
    <q-dialog v-model="modalEditar_vc" persistent transition-show="scale" transition-hide="scale">
      <q-card class="modal-card_vc full-width" style="max-width: 600px;" :dark="config_sm_vc.isDark_sm_vc">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold flex items-center q-gutter-x-sm">
             <q-icon name="edit_calendar" color="blue-4" size="md" />
             <span>Ajustar Fechas del Período</span>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-caption" :class="config_sm_vc.isDark_sm_vc ? 'text-grey-4' : 'text-grey-8'">
            Estás ajustando las fechas operativas del <strong>{{ store_sm_vc.periodoActual_sm_vc }}</strong>.
            Ningún estudiante ni registro será desvinculado por esta acción.
          </p>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-sm-6">
               <div class="text-subtitle2 q-mb-sm text-weight-medium">Fecha de Inicio</div>
               <q-input outlined dense v-model="formEditar_vc.fechaInicio" mask="####-##-##" :dark="config_sm_vc.isDark_sm_vc">
                 <template v-slot:append>
                   <q-icon name="event" class="cursor-pointer">
                     <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                       <q-date v-model="formEditar_vc.fechaInicio" mask="YYYY-MM-DD" :dark="config_sm_vc.isDark_sm_vc" color="blue-6">
                         <div class="row items-center justify-end">
                           <q-btn v-close-popup label="Cerrar" color="blue-6" flat />
                         </div>
                       </q-date>
                     </q-popup-proxy>
                   </q-icon>
                 </template>
               </q-input>
            </div>
            <div class="col-12 col-sm-6">
               <div class="text-subtitle2 q-mb-sm text-weight-medium">Fecha de Cierre</div>
               <q-input outlined dense v-model="formEditar_vc.fechaCierre" mask="####-##-##" :dark="config_sm_vc.isDark_sm_vc">
                 <template v-slot:append>
                   <q-icon name="event" class="cursor-pointer">
                     <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                       <q-date v-model="formEditar_vc.fechaCierre" mask="YYYY-MM-DD" :dark="config_sm_vc.isDark_sm_vc" color="blue-6">
                         <div class="row items-center justify-end">
                           <q-btn v-close-popup label="Cerrar" color="blue-6" flat />
                         </div>
                       </q-date>
                     </q-popup-proxy>
                   </q-icon>
                 </template>
               </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-action-dynamic_vc">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn 
            unelevated color="blue-6" text-color="white" 
            label="Guardar Cambios" icon="save" 
            :loading="store_sm_vc.loading_sm_vc" 
            :disable="!formEditar_vc.fechaInicio || !formEditar_vc.fechaCierre"
            @click="guardarFechas_vc" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ════ MODAL PARA CREAR (ROLL-FORWARD) ════ -->
    <q-dialog v-model="modalCrear_vc" persistent transition-show="fade" transition-hide="fade">
      <q-card class="modal-card_vc full-width" style="max-width: 600px; border: 1px solid var(--sn-advertencia);" :dark="config_sm_vc.isDark_sm_vc">
        <q-card-section class="row items-center bg-orange-1 text-orange-10 q-pb-md" :class="config_sm_vc.isDark_sm_vc ? 'bg-orange-10 text-orange-2' : ''">
          <div class="text-h6 text-weight-bold flex items-center q-gutter-x-sm">
             <q-icon name="warning_amber" size="md" />
             <span>¡Acción Crítica! Iniciar Nuevo Período</span>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-body2" :class="config_sm_vc.isDark_sm_vc ? 'text-grey-3' : 'text-grey-9'">
            Al inicializar un ciclo operativo <strong>nuevo</strong>, el sistema realizará el cierre del periodo activo:
          </p>
          <ul class="q-mb-md text-caption" :class="config_sm_vc.isDark_sm_vc ? 'text-grey-4' : 'text-grey-8'">
            <li>Los estudiantes aprobados avanzarán al nivel siguiente.</li>
            <li>Los reprobados reciclarán su nivel incrementando el intento.</li>
            <li>El histórico anterior pasará a estado cerrado e inmodificable.</li>
          </ul>

          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-sm-6">
               <div class="text-subtitle2 q-mb-sm text-weight-medium">Inicio del Nuevo Ciclo</div>
               <q-input outlined dense v-model="formCrear_vc.fechaInicio" mask="####-##-##" :dark="config_sm_vc.isDark_sm_vc" color="orange">
                 <template v-slot:append>
                   <q-icon name="event" class="cursor-pointer">
                     <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                       <q-date v-model="formCrear_vc.fechaInicio" mask="YYYY-MM-DD" :dark="config_sm_vc.isDark_sm_vc" color="orange-9">
                         <div class="row items-center justify-end">
                           <q-btn v-close-popup label="Cerrar" color="orange-9" flat />
                         </div>
                       </q-date>
                     </q-popup-proxy>
                   </q-icon>
                 </template>
               </q-input>
            </div>
            <div class="col-12 col-sm-6">
               <div class="text-subtitle2 q-mb-sm text-weight-medium">Cierre del Nuevo Ciclo</div>
               <q-input outlined dense v-model="formCrear_vc.fechaCierre" mask="####-##-##" :dark="config_sm_vc.isDark_sm_vc" color="orange">
                 <template v-slot:append>
                   <q-icon name="event" class="cursor-pointer">
                     <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                       <q-date v-model="formCrear_vc.fechaCierre" mask="YYYY-MM-DD" :dark="config_sm_vc.isDark_sm_vc" color="orange-9">
                         <div class="row items-center justify-end">
                           <q-btn v-close-popup label="Cerrar" color="orange-9" flat />
                         </div>
                       </q-date>
                     </q-popup-proxy>
                   </q-icon>
                 </template>
               </q-input>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-action-dynamic_vc">
          <q-btn flat label="Abortar" color="grey" v-close-popup />
          <q-btn 
            unelevated color="orange-9" text-color="white" 
            label="Ejecutar Roll-Forward" icon="rocket_launch" 
            :loading="store_sm_vc.loading_sm_vc" 
            :disable="!formCrear_vc.fechaInicio || !formCrear_vc.fechaCierre"
            @click="guardarNuevoCiclo_vc" 
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfigStore } from 'src/stores/configStore'
import { usePeriodoStore } from 'src/stores/periodoStore'

const config_sm_vc = useConfigStore()
const store_sm_vc  = usePeriodoStore()

/* ── Modales y Formularios ── */
const modalEditar_vc = ref(false)
const modalCrear_vc  = ref(false)

const formEditar_vc = ref({ fechaInicio: '', fechaCierre: '' })
const formCrear_vc  = ref({ fechaInicio: '', fechaCierre: '' })

/* ── Definición de Tabla History ── */
const columns_vc = [
  { name: 'nombre', align: 'left', label: 'Código', field: 'nombre_sm_vc', sortable: true },
  { name: 'descripcion', align: 'left', label: 'Descripción', field: 'descripcion_sm_vc' },
  { 
    name: 'fecha_inicio', align: 'center', label: 'Inicio', 
    field: (row) => row.fecha_inicio_sm_vc ? new Date(row.fecha_inicio_sm_vc).toLocaleDateString('es-ES') : '' 
  },
  { 
    name: 'fecha_fin', align: 'center', label: 'Cierre', 
    field: (row) => row.fecha_fin_sm_vc ? new Date(row.fecha_fin_sm_vc).toLocaleDateString('es-ES') : '' 
  },
  { name: 'estado', align: 'center', label: 'Estado Operativo', field: 'estado_activo_sm_vc' },
]

/* ── Helpers visuales ── */
const formatearFechaVisual_vc = (isoDate) => {
  if (!isoDate) return '—'
  const [anio, mes, dia] = isoDate.split('-')
  const dateObj = new Date(Number(anio), Number(mes) - 1, Number(dia))
  return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

/* ── Acciones de Interfaz ── */
const abrirModalEditar_vc = () => {
  formEditar_vc.value.fechaInicio = store_sm_vc.fechaInicio_sm_vc
  formEditar_vc.value.fechaCierre = store_sm_vc.fechaCierre_sm_vc
  modalEditar_vc.value = true
}

const abrirModalCrear_vc = () => {
  formCrear_vc.value.fechaInicio = ''
  formCrear_vc.value.fechaCierre = ''
  modalCrear_vc.value = true
}

const guardarFechas_vc = async () => {
  const exito = await store_sm_vc.editarFechasActuales_sm_vc({
    fechaInicio: formEditar_vc.value.fechaInicio,
    fechaCierre: formEditar_vc.value.fechaCierre
  })
  if (exito) modalEditar_vc.value = false
}

const guardarNuevoCiclo_vc = async () => {
  const exito = await store_sm_vc.actualizarPeriodo_sm_vc({
    fechaInicio: formCrear_vc.value.fechaInicio,
    fechaCierre: formCrear_vc.value.fechaCierre
  })
  if (exito) modalCrear_vc.value = false
}

/* ── Inicialización ── */
onMounted(async () => {
  await store_sm_vc.cargarPeriodoActual_sm_vc()
  await store_sm_vc.cargarPeriodos_sm_vc()
})
</script>

<style scoped>
/* ── Layout y Tipografía ── */
.sntnl-page_sm_vc { padding: 2rem 2.5rem; }
.page-header_sm_vc { margin-bottom: 2rem; }
.title-icon_vc { color: var(--sn-acento-primario, #3FA2F6); }
.page-title_sm_vc { font-size: 1.6rem; font-weight: 800; color: var(--sn-texto-principal); margin: 0; font-family: var(--sn-font-sans); letter-spacing: -0.02em; }
.page-subtitle_sm_vc { font-size: 0.9rem; color: var(--sn-texto-secundario); margin: 4px 0 0 36px; max-width: 600px; line-height: 1.5; }

/* ── Recuadro Activo Elevado ── */
.periodo-activo-card_vc {
  border-radius: 16px;
  background: linear-gradient(135deg, #1b2845 0%, #274060 100%);
  border: 1px solid rgba(255,255,255,0.1);
  overflow: hidden;
}
.periodo-activo-card_vc.q-dark {
  background: linear-gradient(135deg, var(--sn-fondo-panel, #0f172a) 0%, #1e293b 100%);
}
.hero-content_vc { padding: 2rem; position: relative; }

/* ── Badges y Textos Hero ── */
.status-badge_sm_vc {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(111, 255, 233, 0.15);
  border: 1px solid rgba(111, 255, 233, 0.3);
  color: #6fffe9; font-size: 0.7rem; font-weight: 800;
  padding: 4px 12px; border-radius: 20px;
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

.periodo-label_sm_vc { font-size: 0.75rem; color: rgba(255,255,255,0.7); font-family: var(--sn-font-mono); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px; }
.periodo-valor_sm_vc { font-size: 2.2rem; font-weight: 900; margin: 0; line-height: 1.1; letter-spacing: -0.02em; }

/* ── Fechas en Hero ── */
.fechas-actuales_vc {
  display: inline-flex; align-items: center; gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: rgba(0,0,0,0.25);
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
}
.fecha-chip_vc { display: flex; align-items: center; gap: 8px; }
.fecha-text_sm_vc { font-size: 0.85rem; font-weight: 500; font-family: var(--sn-font-mono); }
.fecha-divider_sm_vc { width: 1px; height: 16px; background: rgba(255,255,255,0.2); }

/* ── Botones ── */
.actions-section_vc { border-left: 1px solid rgba(255,255,255,0.1); padding-left: 2rem; }
.btn-edit_vc {
  background: rgba(255,255,255,0.1) !important; color: white !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
  border-radius: 8px !important; font-weight: 600 !important; font-size: 0.85rem !important; padding: 10px 16px !important;
}
.btn-cta_vc {
  background: #ff9800 !important; color: #fff !important;
  border-radius: 8px !important; font-weight: 700 !important; font-size: 0.85rem !important; padding: 10px 16px !important;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

/* ── Tablas e Interfaz Dinámica ── */
.bg-panel-dynamic_vc { background: var(--sn-fondo-principal, #ffffff); border-radius: 12px; }
.bg-panel-dynamic_vc.q-dark { background: var(--sn-fondo-panel, #0f172a); border: 1px solid var(--sn-borde); }
.tabla-historial_vc .q-table__title { font-weight: 700; font-size: 1.1rem; color: var(--sn-texto-principal); }
.tabla-historial_vc.q-dark .q-table__title { color: white; }

/* ── Modales ── */
.modal-card_vc { border-radius: 16px !important; overflow: hidden; }
.modal-card_vc.q-dark { border: 1px solid var(--sn-borde); }
.bg-action-dynamic_vc { background: var(--sn-fondo-elevado, #f8fafc); border-top: 1px solid var(--sn-borde-claro, #e2e8f0); }
.q-dark .bg-action-dynamic_vc { background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }

/* ── Responsive ── */
@media (max-width: 599px) {
  .hero-content_vc { flex-direction: column !important; align-items: stretch !important; gap: 1.5rem; }
  .actions-section_vc { border-left: none; padding-left: 0; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
  .fechas-actuales_vc { flex-direction: column; align-items: stretch; gap: 0.5rem; }
  .fecha-divider_sm_vc { display: none; }
}
</style>