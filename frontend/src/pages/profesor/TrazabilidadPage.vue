<!-- ══════════════════════════════════════════════════════════════════
     TrazabilidadPage.vue (profesor) — Vista detalle de un estudiante.
     Thin Page: ficha del estudiante, progreso secuencial en Stepper,
     panel enfocado de conversación y deploy final.
     Sufijos _sm_vc en todo el script.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    
    <!-- ── VISTA PRINCIPAL (Ficha + Stepper + Deploy) ── -->
    <div v-if="!materiaSeleccionada_sm_vc">
      
      <!-- Botón Volver -->
      <q-btn
        flat no-caps icon="arrow_back" label="Volver a Estudiantes"
        color="grey-5" size="sm" class="q-mb-lg"
        @click="router_sm_vc.push('/profesor/estudiantes')" />

      <!-- Ficha del estudiante -->
      <div v-if="estudiante_sm_vc" class="student-ficha_sm_vc">
        <div class="ficha-avatar_sm_vc">{{ iniciales_sm_vc(estudiante_sm_vc.nombre_sm_vc) }}</div>
        <div class="ficha-data_sm_vc">
          <h1 class="ficha-nombre_sm_vc">{{ estudiante_sm_vc.nombre_sm_vc }}</h1>
          <div class="ficha-meta_sm_vc">
            <span class="meta-item_sm_vc"><q-icon name="badge" size="12px" />{{ estudiante_sm_vc.id_sm_vc }}</span>
            <span class="meta-item_sm_vc"><q-icon name="email" size="12px" />{{ estudiante_sm_vc.correo_sm_vc }}</span>
            <span class="meta-item_sm_vc"><q-icon name="calendar_month" size="12px" />Periodo {{ estudiante_sm_vc.cohorte_sm_vc }}</span>
          </div>
        </div>
        <div class="ficha-global-estado_sm_vc">
          <div class="global-estado-label_sm_vc">Progreso Global</div>
          <q-circular-progress
            :value="progresoGlobal_sm_vc" size="60px" :thickness="0.15"
            color="teal-3" track-color="blue-grey-9" show-value>
            <span class="pct-label_sm_vc">{{ progresoGlobal_sm_vc }}%</span>
          </q-circular-progress>
        </div>
      </div>

      <!-- Sección trazabilidad por materia -->
      <div class="section-title_sm_vc">
        <q-icon name="track_changes" size="16px" color="teal-3" />
        <span>Trazabilidad Académica</span>
      </div>

      <!-- Stepper Vertical -->
      <q-stepper
        v-model="stepActivo_sm_vc"
        vertical
        animated
        flat
        class="stepper_sm_vc"
        active-color="teal-3"
        done-color="teal-4"
        inactive-color="blue-grey-7"
      >
        <q-step
          v-for="materia in materiasConFases_sm_vc"
          :key="materia.id_sm_vc"
          :name="materia.id_sm_vc"
          :title="materia.nombre_sm_vc"
          :caption="materia.captionFase_sm_vc"
          :icon="materia.icono_sm_vc"
          :done="materia.estado_aprobacion_sm_vc === 'APROBADO'"
          :disable="materia.bloqueada"
          :error="materia.estado_aprobacion_sm_vc === 'REPROBADO'"
          :active-icon="materia.icono_sm_vc"
          :done-icon="'check_circle'"
          :error-icon="'cancel'"
          class="step-item_sm_vc"
        >
          <MateriaProgressCard
            :materia="materia"
            :estudiante-id="estudianteId_sm_vc"
            :show-description="true"
            :show-requisitos="true"
            @click="seleccionarMateria_sm_vc" />

          <q-stepper-navigation class="step-nav_sm_vc">
            <q-btn
              v-if="!esPrimerStep_sm_vc(materia.id_sm_vc)"
              flat no-caps
              color="blue-grey-6"
              icon="arrow_upward"
              label="Anterior"
              size="sm"
              class="step-nav-btn_sm_vc q-mr-sm"
              @click="retrocederStep_sm_vc(materia.id_sm_vc)"
            />
            <q-btn
              v-if="!esUltimoStep_sm_vc(materia.id_sm_vc)"
              unelevated no-caps
              color="teal-3"
              text-color="dark"
              icon-right="arrow_downward"
              label="Siguiente materia"
              size="sm"
              class="step-nav-btn_sm_vc"
              :disable="materia.bloqueada || proximaDesbloqueada_sm_vc(materia.id_sm_vc) === null"
              @click="avanzarStep_sm_vc(materia.id_sm_vc)"
            />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>

      <!-- Panel de Deploy (sólo lectura si ya lo registró) -->
      <div v-if="deployEstudiante_sm_vc" class="deploy-readonly-panel_sm_vc q-mt-xl">
        <div class="section-title_sm_vc q-mb-md">
          <q-icon name="rocket_launch" size="16px" color="teal-3" />
          <span>Proyecto Final de Deploy</span>
        </div>
        <div class="deploy-field-grid_sm_vc">
          <div class="deploy-field-item_sm_vc">
            <label class="deploy-field-label_sm_vc">URL de Producción</label>
            <a :href="deployEstudiante_sm_vc.url_produccion_sm_vc"
              target="_blank" class="deploy-url_sm_vc">
              <q-icon name="open_in_new" size="13px" />
              {{ deployEstudiante_sm_vc.url_produccion_sm_vc }}
            </a>
          </div>
          <div class="deploy-field-item_sm_vc">
            <label class="deploy-field-label_sm_vc">Código Fuente (.zip)</label>
            <div class="deploy-file-chip_sm_vc">
              <q-icon name="folder_zip" size="14px" color="teal-3" />
              <span>{{ deployEstudiante_sm_vc.archivo_codigo_id_sm_vc }}</span>
              <q-btn flat dense no-caps label="Descargar" color="teal-3" size="xs" />
            </div>
          </div>
          <div class="deploy-field-item_sm_vc">
            <label class="deploy-field-label_sm_vc">Documentación (.pdf)</label>
            <div class="deploy-file-chip_sm_vc">
              <q-icon name="picture_as_pdf" size="14px" color="amber-4" />
              <span>{{ deployEstudiante_sm_vc.documentacion_tecnica_id_sm_vc }}</span>
              <q-btn flat dense no-caps label="Ver PDF" color="amber-4" size="xs" />
            </div>
          </div>
          <div class="deploy-field-item_sm_vc">
            <label class="deploy-field-label_sm_vc">Fecha de Registro</label>
            <span class="deploy-value_sm_vc">
              {{ formatDate_sm_vc(deployEstudiante_sm_vc.fecha_registro_sm_vc) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── PANEL DE CONVERSACIÓN (Aislado a pantalla completa) ── -->
    <div v-if="materiaSeleccionada_sm_vc" class="materia-activa-panel_sm_vc">
      <div class="panel-header_sm_vc">
        <div class="panel-title_sm_vc">
          <q-icon name="edit_document" size="16px" color="teal-3" />
          <span>Revisando Informe — {{ materiaSeleccionada_sm_vc.nombre_sm_vc }}</span>
        </div>
        <q-btn flat no-caps icon="arrow_back" label="Volver a trazabilidad" color="teal-3" size="sm"
          @click="materiaSeleccionada_sm_vc = null" />
      </div>
      <div class="conv-embed_sm_vc">
        <DocumentConversacion
          :materia-id="materiaSeleccionada_sm_vc.id_sm_vc"
          :estudiante-id="estudianteId_sm_vc"
          :readonly="materiaSeleccionada_sm_vc.estado_aprobacion_sm_vc === 'APROBADO'"
          :estado-progreso="materiaSeleccionada_sm_vc.estado_aprobacion_sm_vc" />
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import { useProgressBarStore } from 'src/stores/progressBarStore'
import MateriaProgressCard from 'src/components/shared/MateriaProgressCard.vue'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

const route_sm_vc   = useRoute()
const router_sm_vc  = useRouter()
const store_sm_vc   = usePasantiasStore()
const auth_sm_vc    = useAuthStore()
const progressBar_sm_vc = useProgressBarStore()

/* ── Computed principales ── */
const estudianteId_sm_vc = computed(() => route_sm_vc.params.id_sm_vc)

const estudiante_sm_vc = computed(() =>
  auth_sm_vc.MOCK_USERS.find((u) => u.id_sm_vc === estudianteId_sm_vc.value) ?? null
)

const progresoEstudiante_sm_vc = computed(() =>
  store_sm_vc.getProgresoEstudiante(estudianteId_sm_vc.value)
)

const progresoGlobal_sm_vc = computed(() => {
  const items_sm_vc = progresoEstudiante_sm_vc.value
  if (!items_sm_vc.length) return 0
  const suma_sm_vc = items_sm_vc.reduce((acc, m) => acc + (m.progreso_decimal || 0), 0)
  return Math.round((suma_sm_vc / items_sm_vc.length) * 100)
})

const deployEstudiante_sm_vc = computed(() =>
  store_sm_vc.getDeployEstudiante(estudianteId_sm_vc.value)
)

/* ── Estado local del Stepper ── */
const stepActivo_sm_vc = ref(null)
const materiaSeleccionada_sm_vc = ref(null)

const materiasConFases_sm_vc = computed(() =>
  progressBar_sm_vc.enriquecerMateriasTrazabilidad_sm_vc(progresoEstudiante_sm_vc.value)
)

// Inicialización reactiva segura
watchEffect(() => {
  if (stepActivo_sm_vc.value) return 
  const lista_sm_vc = materiasConFases_sm_vc.value
  if (!lista_sm_vc.length) return
  const primera_sm_vc = lista_sm_vc.find((m) => !m.bloqueada) ?? lista_sm_vc[0]
  stepActivo_sm_vc.value = primera_sm_vc.id_sm_vc
})

/* ── Helpers de navegación del stepper ── */
const esUltimoStep_sm_vc = (id_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  return lista_sm_vc[lista_sm_vc.length - 1]?.id_sm_vc === id_sm_vc
}

const esPrimerStep_sm_vc = (id_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  return lista_sm_vc[0]?.id_sm_vc === id_sm_vc
}

const retrocederStep_sm_vc = (idActual_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  const idx_sm_vc   = lista_sm_vc.findIndex((m) => m.id_sm_vc === idActual_sm_vc)
  if (idx_sm_vc > 0) {
    stepActivo_sm_vc.value = lista_sm_vc[idx_sm_vc - 1].id_sm_vc
  }
}

const proximaDesbloqueada_sm_vc = (idActual_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  const idx_sm_vc   = lista_sm_vc.findIndex((m) => m.id_sm_vc === idActual_sm_vc)
  const proxima_sm_vc = lista_sm_vc[idx_sm_vc + 1]
  return proxima_sm_vc && !proxima_sm_vc.bloqueada ? proxima_sm_vc.id_sm_vc : null
}

const avanzarStep_sm_vc = (idActual_sm_vc) => {
  const proxima_sm_vc = proximaDesbloqueada_sm_vc(idActual_sm_vc)
  if (proxima_sm_vc) stepActivo_sm_vc.value = proxima_sm_vc
}

/* ── Handlers ── */
const seleccionarMateria_sm_vc = (materia_sm_vc) => {
  materiaSeleccionada_sm_vc.value = materia_sm_vc
}

/* ── Utils ── */
const iniciales_sm_vc = (nombre_sm_vc) =>
  (nombre_sm_vc ?? '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()

const formatDate_sm_vc = (iso_sm_vc) =>
  new Date(iso_sm_vc).toLocaleDateString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
</script>

<style scoped>
/* ── Layout principal ── */
.sntnl-page_sm_vc {
  padding: 1.75rem 2rem;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  font-family: var(--sn-font-mono);
}

/* ── Ficha del estudiante ── */
.student-ficha_sm_vc {
  display: flex; align-items: center; gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255,255,255,.025);
  border: 1px solid rgba(111,255,233,.1);
  border-radius: 14px;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.ficha-avatar_sm_vc {
  width: 54px; height: 54px; border-radius: 12px;
  background: rgba(111,255,233,.1);
  border: 1px solid rgba(111,255,233,.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; color: var(--sn-primario);
  flex-shrink: 0;
}
.ficha-data_sm_vc { flex: 1; }
.ficha-nombre_sm_vc {
  font-size: 1.15rem; font-weight: 700;
  color: var(--sn-texto-principal);
  margin: 0 0 .4rem; letter-spacing: .04em;
}
.ficha-meta_sm_vc { display: flex; gap: 1rem; flex-wrap: wrap; }
.meta-item_sm_vc { display: flex; align-items: center; gap: .3rem; font-size: .65rem; color: var(--sn-texto-terciario); }

.ficha-global-estado_sm_vc { display: flex; flex-direction: column; align-items: center; gap: .3rem; flex-shrink: 0; }
.global-estado-label_sm_vc { font-size: .58rem; letter-spacing: .1em; text-transform: uppercase; color: var(--sn-texto-apagado); }
.pct-label_sm_vc { font-size: .75rem; font-weight: 700; color: var(--sn-primario); }

/* ── Stepper ── */
.section-title_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  font-size: .72rem; font-weight: 600;
  color: var(--sn-acento-sec);
  letter-spacing: .1em; text-transform: uppercase;
  margin-bottom: 1rem;
}

.stepper_sm_vc {
  background: transparent !important;
  border: 1px solid var(--sn-borde);
  border-radius: 14px;
  margin-bottom: 1.75rem;
  max-width: 860px;
}
:deep(.q-stepper__tab) { font-family: var(--sn-font-mono); }
:deep(.q-stepper__title) {
  font-size: .82rem; font-weight: 600;
  color: var(--sn-texto-principal); letter-spacing: .04em;
}
:deep(.q-stepper__caption) {
  font-size: .6rem; color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans); margin-top: 2px;
}
:deep(.q-stepper__line) { border-color: var(--sn-borde) !important; }
:deep(.q-stepper__step-inner) { background: transparent; }
:deep(.q-step--disabled .q-stepper__title),
:deep(.q-step--disabled .q-stepper__caption) { opacity: 0.4; }

.step-item_sm_vc { border-bottom: 1px solid var(--sn-borde); }
.step-item_sm_vc:last-child { border-bottom: none; }

.step-nav_sm_vc { display: flex; align-items: center; gap: .75rem; padding-top: .875rem; }
.step-nav-btn_sm_vc { font-size: .7rem !important; font-weight: 700 !important; border-radius: 6px !important; }

/* ── Panel Deploy (Lectura) ── */
.deploy-readonly-panel_sm_vc {
  padding: 1.5rem;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(111,255,233,.08);
  border-radius: 12px;
  max-width: 860px;
}
.deploy-field-grid_sm_vc { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
.deploy-field-item_sm_vc { display: flex; flex-direction: column; gap: .4rem; }
.deploy-field-label_sm_vc { font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sn-texto-apagado); }
.deploy-url_sm_vc { display: flex; align-items: center; gap: .35rem; font-size: .78rem; color: var(--sn-primario); text-decoration: none; word-break: break-all; }
.deploy-url_sm_vc:hover { text-decoration: underline; }
.deploy-file-chip_sm_vc { display: flex; align-items: center; gap: .4rem; padding: .4rem .75rem; background: rgba(255,255,255,.03); border: 1px solid var(--sn-borde); border-radius: 6px; }
.deploy-file-chip_sm_vc span { font-size: .72rem; color: var(--sn-texto-secundario); flex: 1; }
.deploy-value_sm_vc { font-size: .78rem; color: var(--sn-texto-secundario); }

/* ── Panel de conversación activa ── */
.materia-activa-panel_sm_vc {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(111,255,233,.12);
  border-radius: 14px;
  overflow: hidden;
  max-width: 860px;
}
.panel-header_sm_vc {
  display: flex; align-items: center; justify-content: space-between;
  padding: .875rem 1.25rem;
  border-bottom: 1px solid rgba(111,255,233,.08);
  background: rgba(0,0,0,.2);
}
.panel-title_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  font-size: .72rem; color: var(--sn-acento-sec);
  letter-spacing: .06em; text-transform: uppercase;
}
</style>