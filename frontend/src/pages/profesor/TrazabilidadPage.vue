<template>
  <q-page class="sntnl-page">
    <q-btn flat no-caps icon="arrow_back" label="Volver a Estudiantes" color="grey-5" size="sm"
      class="q-mb-lg back-btn" @click="router.push('/profesor/estudiantes')" />

    <div v-if="estudiante" class="student-ficha">
      <div class="ficha-avatar">{{ getInitials(estudiante.nombre_sm_vc) }}</div>
      <div class="ficha-data">
        <h1 class="ficha-nombre">{{ estudiante.nombre_sm_vc }}</h1>
        <div class="ficha-meta">
          <span class="meta-item"><q-icon name="badge" size="12px" />{{ estudiante.id_sm_vc }}</span>
          <span class="meta-item"><q-icon name="email" size="12px" />{{ estudiante.correo_sm_vc }}</span>
          <span class="meta-item"><q-icon name="calendar_month" size="12px" />Cohorte {{ estudiante.cohorte_sm_vc }}</span>
        </div>
      </div>
      <div class="ficha-global-estado">
        <div class="global-estado-label">Progreso Global</div>
        <q-circular-progress :value="progresoGlobal" size="60px" :thickness="0.15"
          color="teal-3" track-color="blue-grey-9" show-value>
          <span class="pct-label">{{ progresoGlobal }}%</span>
        </q-circular-progress>
      </div>
    </div>

    <div class="section-title"><q-icon name="track_changes" size="16px" color="teal-3" /><span>Trazabilidad por Materia</span></div>

    <div class="materias-grid">
      <MateriaProgressCard
        v-for="materia in progresoEstudiante" :key="materia.id_sm_vc"
        :materia="materia" :estudiante-id="estudianteId"
        :show-description="true" :show-requisitos="true"
        @click="seleccionarMateria"
      />
    </div>

    <div class="detail-tabs-row q-mt-lg">
      <button v-for="tab in tabs" :key="tab.key" class="detail-tab"
        :class="{ 'detail-tab--active': tabActiva === tab.key }" @click="tabActiva = tab.key">
        <q-icon :name="tab.icon" size="14px" />{{ tab.label }}
        <span v-if="tab.key === 'conversacion' && materiaSeleccionada" class="tab-badge">
          {{ materiaSeleccionada.nombre_sm_vc.replace('Pasantías ', 'P') }}
        </span>
      </button>
    </div>

    <div v-if="tabActiva === 'conversacion'" class="tab-panel">
      <div v-if="!materiaSeleccionada" class="tab-empty">
        <q-icon name="touch_app" size="32px" color="blue-grey-8" />
        <p>Selecciona una materia para ver la conversación documental.</p>
      </div>
      <DocumentConversacion v-else :materia-id="materiaSeleccionada.id_sm_vc"
        :estudiante-id="estudianteId" :readonly="false"
        :estado-progreso="materiaSeleccionada.estado_aprobacion_sm_vc" />
    </div>

    <div v-if="tabActiva === 'deploy'" class="tab-panel">
      <div v-if="!deployEstudiante" class="tab-empty">
        <q-icon name="pending" size="32px" color="blue-grey-8" />
        <p>El estudiante aún no ha registrado su deploy.</p>
      </div>
      <div v-else class="deploy-readonly-panel">
        <div class="section-title q-mb-md"><q-icon name="rocket_launch" size="16px" color="teal-3" /><span>Proyecto Final</span></div>
        <div class="deploy-field-grid">
          <div class="deploy-field-item">
            <label class="deploy-field-label">URL de Producción</label>
            <a :href="deployEstudiante.url_produccion_sm_vc" target="_blank" class="deploy-url">
              <q-icon name="open_in_new" size="13px" />{{ deployEstudiante.url_produccion_sm_vc }}
            </a>
          </div>
          <div class="deploy-field-item">
            <label class="deploy-field-label">Código Fuente (.zip)</label>
            <div class="deploy-file-chip"><q-icon name="folder_zip" size="14px" color="teal-3" />
              <span>{{ deployEstudiante.archivo_codigo_id_sm_vc }}</span>
              <q-btn flat dense no-caps label="Descargar" color="teal-3" size="xs" />
            </div>
          </div>
          <div class="deploy-field-item">
            <label class="deploy-field-label">Documentación (.pdf)</label>
            <div class="deploy-file-chip"><q-icon name="picture_as_pdf" size="14px" color="amber-4" />
              <span>{{ deployEstudiante.documentacion_tecnica_id_sm_vc }}</span>
              <q-btn flat dense no-caps label="Ver PDF" color="amber-4" size="xs" />
            </div>
          </div>
          <div class="deploy-field-item">
            <label class="deploy-field-label">Fecha de Registro</label>
            <span class="deploy-value">{{ formatDate(deployEstudiante.fecha_registro_sm_vc) }}</span>
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

const route = useRoute(); const router = useRouter()
const store = usePasantiasStore(); const auth = useAuthStore()

const estudianteId = computed(() => route.params.id_sm_vc)
const estudiante = computed(() => auth.MOCK_USERS.find((u) => u.id_sm_vc === estudianteId.value) ?? null)
const progresoEstudiante = computed(() => store.getProgresoEstudiante(estudianteId.value))
const progresoGlobal = computed(() => {
  const items = progresoEstudiante.value
  if (!items.length) return 0
  const aprobadas = items.filter((m) => m.estado_aprobacion_sm_vc === 'APROBADO').length
  return Math.round((aprobadas / items.length) * 100)
})
const deployEstudiante = computed(() => store.getDeployEstudiante(estudianteId.value))
const materiaSeleccionada = ref(null)
const tabActiva = ref('conversacion')
const tabs = [
  { key: 'conversacion', label: 'Conversación Documental', icon: 'forum' },
  { key: 'deploy', label: 'Deploy del Proyecto', icon: 'rocket_launch' }
]
function seleccionarMateria(materia) { materiaSeleccionada.value = materia; tabActiva.value = 'conversacion' }
function getInitials(name) { return (name ?? '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() }
function formatDate(iso) { return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) }
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; min-height: 100vh; font-family: var(--sn-font-mono); }
.back-btn { font-size: 0.72rem !important; }
.student-ficha { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.5rem; background: rgba(255,255,255,0.025); border: 1px solid rgba(111,255,233,0.1); border-radius: 14px; margin-bottom: 2rem; flex-wrap: wrap; }
.ficha-avatar { width: 54px; height: 54px; border-radius: 12px; background: rgba(111,255,233,0.1); border: 1px solid rgba(111,255,233,0.25); display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: var(--sn-primario); flex-shrink: 0; }
.ficha-data { flex: 1; }
.ficha-nombre { font-size: 1.15rem; font-weight: 700; color: var(--sn-texto-principal); margin: 0 0 0.4rem; letter-spacing: 0.04em; }
.ficha-meta { display: flex; gap: 1rem; flex-wrap: wrap; }
.meta-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.65rem; color: var(--sn-texto-terciario); }
.ficha-global-estado { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; flex-shrink: 0; }
.global-estado-label { font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--sn-texto-apagado); }
.pct-label { font-size: 0.75rem; font-weight: 700; color: var(--sn-primario); }
.section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; font-weight: 600; color: var(--sn-acento-sec); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem; }
.materias-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
@media (max-width: 900px) { .materias-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }
.detail-tabs-row { display: flex; gap: 0.4rem; border-bottom: 1px solid rgba(111,255,233,0.07); flex-wrap: wrap; }
.detail-tab { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1rem; font-size: 0.68rem; color: var(--sn-texto-terciario); cursor: pointer; background: transparent; border: none; border-bottom: 2px solid transparent; letter-spacing: 0.05em; font-family: var(--sn-font-mono); transition: all 0.15s; margin-bottom: -1px; }
.detail-tab:hover { color: var(--sn-texto-secundario); }
.detail-tab--active { color: var(--sn-primario); border-bottom-color: var(--sn-primario); background: rgba(111,255,233,0.04); }
.tab-badge { background: rgba(111,255,233,0.12); color: var(--sn-acento-sec); font-size: 0.55rem; padding: 1px 6px; border-radius: 3px; }
.tab-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(111,255,233,0.07); border-top: none; border-radius: 0 0 12px 12px; min-height: 200px; }
.tab-empty { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 3rem; text-align: center; }
.tab-empty p { font-size: 0.78rem; color: var(--sn-texto-apagado); margin: 0; font-family: var(--sn-font-sans); }
.deploy-readonly-panel { padding: 1.5rem; }
.deploy-field-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
.deploy-field-item { display: flex; flex-direction: column; gap: 0.4rem; }
.deploy-field-label { font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sn-texto-apagado); }
.deploy-url { display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; color: var(--sn-primario); text-decoration: none; word-break: break-all; }
.deploy-url:hover { text-decoration: underline; }
.deploy-file-chip { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid var(--sn-borde); border-radius: 6px; }
.deploy-file-chip span { font-size: 0.72rem; color: var(--sn-texto-secundario); flex: 1; }
.deploy-value { font-size: 0.78rem; color: var(--sn-texto-secundario); }
</style>
