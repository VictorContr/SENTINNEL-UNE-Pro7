<!-- ══════════════════════════════════════════════════════════════════
     TrazabilidadPage.vue (profesor) — Vista detalle de un estudiante.
     Thin Page: ficha del estudiante, grid de materias con MateriaCard,
     tabs de conversación y deploy. Sufijos _sm_vc en todo el script.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
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
          <span class="meta-item_sm_vc"><q-icon name="calendar_month" size="12px" />Cohorte {{ estudiante_sm_vc.cohorte_sm_vc }}</span>
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
      <span>Trazabilidad por Materia</span>
    </div>

    <div class="materias-grid_sm_vc">
      <MateriaProgressCard
        v-for="materia in progresoEstudiante_sm_vc"
        :key="materia.id_sm_vc"
        :materia="materia"
        :estudiante-id="estudianteId_sm_vc"
        :show-description="true"
        :show-requisitos="true"
        @click="seleccionarMateria_sm_vc" />
    </div>

    <!-- Tabs de detalle -->
    <div class="detail-tabs-row_sm_vc q-mt-lg">
      <button
        v-for="tab in tabs_sm_vc"
        :key="tab.key"
        class="detail-tab_sm_vc"
        :class="{ 'detail-tab--active_sm_vc': tabActiva_sm_vc === tab.key }"
        @click="tabActiva_sm_vc = tab.key">
        <q-icon :name="tab.icon" size="14px" />
        {{ tab.label }}
        <span
          v-if="tab.key === 'conversacion' && materiaSeleccionada_sm_vc"
          class="tab-badge_sm_vc">
          {{ materiaSeleccionada_sm_vc.nombre_sm_vc.replace('Pasantías ', 'P') }}
        </span>
      </button>
    </div>

    <!-- Tab: Conversación documental -->
    <div v-if="tabActiva_sm_vc === 'conversacion'" class="tab-panel_sm_vc">
      <div v-if="!materiaSeleccionada_sm_vc" class="tab-empty_sm_vc">
        <q-icon name="touch_app" size="32px" color="blue-grey-8" />
        <p>Selecciona una materia para ver la conversación documental.</p>
      </div>
      <DocumentConversacion
        v-else
        :materia-id="materiaSeleccionada_sm_vc.id_sm_vc"
        :estudiante-id="estudianteId_sm_vc"
        :readonly="materiaSeleccionada_sm_vc.estado_aprobacion_sm_vc === 'APROBADO'"
        :estado-progreso="materiaSeleccionada_sm_vc.estado_aprobacion_sm_vc" />
    </div>

    <!-- Tab: Deploy del proyecto -->
    <div v-if="tabActiva_sm_vc === 'deploy'" class="tab-panel_sm_vc">
      <div v-if="!deployEstudiante_sm_vc" class="tab-empty_sm_vc">
        <q-icon name="pending" size="32px" color="blue-grey-8" />
        <p>El estudiante aún no ha registrado su deploy.</p>
      </div>

      <div v-else class="deploy-readonly-panel_sm_vc">
        <div class="section-title_sm_vc q-mb-md">
          <q-icon name="rocket_launch" size="16px" color="teal-3" />
          <span>Proyecto Final</span>
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

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import MateriaProgressCard from 'src/components/shared/MateriaProgressCard.vue'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

const route_sm_vc   = useRoute()
const router_sm_vc  = useRouter()
const store_sm_vc   = usePasantiasStore()
const auth_sm_vc    = useAuthStore()

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

/* ── Tabs ── */
const tabActiva_sm_vc         = ref('conversacion')
const materiaSeleccionada_sm_vc = ref(null)

const tabs_sm_vc = [
  { key: 'conversacion', label: 'Conversación Documental', icon: 'forum' },
  { key: 'deploy',       label: 'Deploy del Proyecto',      icon: 'rocket_launch' }
]

/* ── Handlers ── */
const seleccionarMateria_sm_vc = (materia_sm_vc) => {
  materiaSeleccionada_sm_vc.value = materia_sm_vc
  tabActiva_sm_vc.value = 'conversacion'
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
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; min-height: 100vh; font-family: var(--sn-font-mono); }
.student-ficha_sm_vc { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.5rem; background: rgba(255,255,255,.025); border: 1px solid rgba(111,255,233,.1); border-radius: 14px; margin-bottom: 2rem; flex-wrap: wrap; }
.ficha-avatar_sm_vc { width: 54px; height: 54px; border-radius: 12px; background: rgba(111,255,233,.1); border: 1px solid rgba(111,255,233,.25); display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: var(--sn-primario); flex-shrink: 0; }
.ficha-data_sm_vc { flex: 1; }
.ficha-nombre_sm_vc { font-size: 1.15rem; font-weight: 700; color: var(--sn-texto-principal); margin: 0 0 .4rem; letter-spacing: .04em; }
.ficha-meta_sm_vc { display: flex; gap: 1rem; flex-wrap: wrap; }
.meta-item_sm_vc { display: flex; align-items: center; gap: .3rem; font-size: .65rem; color: var(--sn-texto-terciario); }
.ficha-global-estado_sm_vc { display: flex; flex-direction: column; align-items: center; gap: .3rem; flex-shrink: 0; }
.global-estado-label_sm_vc { font-size: .58rem; letter-spacing: .1em; text-transform: uppercase; color: var(--sn-texto-apagado); }
.pct-label_sm_vc { font-size: .75rem; font-weight: 700; color: var(--sn-primario); }
.section-title_sm_vc { display: flex; align-items: center; gap: .5rem; font-size: .72rem; font-weight: 600; color: var(--sn-acento-sec); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 1rem; }
.materias-grid_sm_vc { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
@media (max-width: 900px) { .materias-grid_sm_vc { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }
.detail-tabs-row_sm_vc { display: flex; gap: .4rem; border-bottom: 1px solid rgba(111,255,233,.07); flex-wrap: wrap; }
.detail-tab_sm_vc { display: flex; align-items: center; gap: .4rem; padding: .6rem 1rem; font-size: .68rem; color: var(--sn-texto-terciario); cursor: pointer; background: transparent; border: none; border-bottom: 2px solid transparent; letter-spacing: .05em; font-family: var(--sn-font-mono); transition: all .15s; margin-bottom: -1px; }
.detail-tab_sm_vc:hover { color: var(--sn-texto-secundario); }
.detail-tab--active_sm_vc { color: var(--sn-primario); border-bottom-color: var(--sn-primario); background: rgba(111,255,233,.04); }
.tab-badge_sm_vc { background: rgba(111,255,233,.12); color: var(--sn-acento-sec); font-size: .55rem; padding: 1px 6px; border-radius: 3px; }
.tab-panel_sm_vc { background: rgba(255,255,255,.02); border: 1px solid rgba(111,255,233,.07); border-top: none; border-radius: 0 0 12px 12px; min-height: 200px; }
.tab-empty_sm_vc { display: flex; flex-direction: column; align-items: center; gap: .5rem; padding: 3rem; text-align: center; }
.tab-empty_sm_vc p { font-size: .78rem; color: var(--sn-texto-apagado); margin: 0; font-family: var(--sn-font-sans); }
.deploy-readonly-panel_sm_vc { padding: 1.5rem; }
.deploy-field-grid_sm_vc { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
.deploy-field-item_sm_vc { display: flex; flex-direction: column; gap: .4rem; }
.deploy-field-label_sm_vc { font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sn-texto-apagado); }
.deploy-url_sm_vc { display: flex; align-items: center; gap: .35rem; font-size: .78rem; color: var(--sn-primario); text-decoration: none; word-break: break-all; }
.deploy-url_sm_vc:hover { text-decoration: underline; }
.deploy-file-chip_sm_vc { display: flex; align-items: center; gap: .4rem; padding: .4rem .75rem; background: rgba(255,255,255,.03); border: 1px solid var(--sn-borde); border-radius: 6px; }
.deploy-file-chip_sm_vc span { font-size: .72rem; color: var(--sn-texto-secundario); flex: 1; }
.deploy-value_sm_vc { font-size: .78rem; color: var(--sn-texto-secundario); }
</style>