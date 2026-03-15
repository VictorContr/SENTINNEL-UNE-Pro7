<!-- EstudiantesView.vue — Vista Profesor: Grid de tarjetas de estudiantes -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="groups" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Mis Estudiantes Asignados</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Profesor: <span class="highlight_sm_vc">{{ auth.user?.nombre_sm_vc }}</span>
        · ID: <span class="code-tag_sm_vc">{{ auth.user?.id_sm_vc }}</span>
      </p>
    </div>

    <!-- Filtros y buscador -->
    <div class="filter-row_sm_vc">
      <q-input v-model="busqueda_sm_vc" dense outlined placeholder="Buscar estudiante…" dark color="teal-3" class="sntnl-input_sm_vc search-input_sm_vc">
        <template #prepend><q-icon name="search" color="grey-6" size="18px" /></template>
      </q-input>
      <q-select v-model="filtro_cohorte_sm_vc" :options="cohorte_options_sm_vc" dense outlined dark color="teal-3" label="Cohorte" clearable class="sntnl-select_sm_vc filter-select_sm_vc" emit-value map-options />
      <q-select v-model="filtro_materia_sm_vc" :options="materia_options_sm_vc" dense outlined dark color="teal-3" label="Materia Activa" clearable class="sntnl-select_sm_vc filter-select_sm_vc" emit-value map-options />
    </div>

    <!-- Grid de tarjetas -->
    <div class="students-grid_sm_vc">
      <q-card v-for="estudiante_sm_vc in estudiantes_filtrados_sm_vc" :key="estudiante_sm_vc.id_sm_vc"
        class="student-card_sm_vc" @click="ver_trazabilidad_sm_vc(estudiante_sm_vc)">
        <q-card-section class="card-inner_sm_vc">
          <div class="student-avatar_sm_vc">{{ get_initials_sm_vc(estudiante_sm_vc.nombre_sm_vc) }}</div>
          <div class="student-info_sm_vc">
            <p class="student-name_sm_vc">{{ estudiante_sm_vc.nombre_sm_vc }}</p>
            <p class="student-id_sm_vc">{{ estudiante_sm_vc.id_sm_vc }}</p>
            <div class="student-meta_sm_vc">
              <span class="meta-chip_sm_vc"><q-icon name="calendar_month" size="11px" /> {{ estudiante_sm_vc.cohorte_sm_vc }}</span>
              <span class="meta-chip_sm_vc" :class="`status--${estudiante_sm_vc.estado_actual_sm_vc?.toLowerCase()}_sm_vc`">
                <q-icon name="circle" size="8px" /> {{ estudiante_sm_vc.estado_actual_sm_vc }}
              </span>
            </div>
          </div>
          <q-btn flat round dense icon="arrow_forward" color="teal-3" size="sm" class="card-arrow_sm_vc" />
        </q-card-section>
        <q-card-section class="card-progress_sm_vc">
          <div v-for="(mat_sm_vc, i) in estudiante_sm_vc.materias_sm_vc" :key="i" class="progress-bar-wrap_sm_vc">
            <div class="progress-bar-label_sm_vc">
              <span>{{ mat_sm_vc.nombre }}</span>
              <span :class="`prog-status--${mat_sm_vc.estado.toLowerCase()}_sm_vc`">{{ mat_sm_vc.estado }}</span>
            </div>
            <q-linear-progress :value="mat_sm_vc.progreso"
              :color="mat_sm_vc.estado === 'APROBADO' ? 'teal-4' : mat_sm_vc.estado === 'REPROBADO' ? 'red-4' : 'blue-grey-7'"
              track-color="blue-grey-10" rounded size="4px" />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-if="estudiantes_filtrados_sm_vc.length === 0" class="empty-state_sm_vc">
      <q-icon name="person_off" size="48px" color="blue-grey-8" />
      <p>No hay estudiantes con los filtros aplicados.</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { usePasantiasStore } from 'src/stores/pasantiasStore'

const auth = useAuthStore()
const pasantias_store_sm_vc = usePasantiasStore()
const router_sm_vc = useRouter()
const busqueda_sm_vc = ref('')
const filtro_cohorte_sm_vc = ref(null)
const filtro_materia_sm_vc = ref(null)

const cohorte_options_sm_vc = [
  { label: '2024-A', value: '2024-A' },
  { label: '2024-B', value: '2024-B' },
  { label: '2023-A', value: '2023-A' }
]
const materia_options_sm_vc = [
  { label: 'Pasantías I', value: 'MAT-001' },
  { label: 'Pasantías II', value: 'MAT-002' },
  { label: 'Pasantías III', value: 'MAT-003' }
]

/* ── Derive students from pasantiasStore instead of duplicate mock ── */
const estudiantes_filtrados_sm_vc = computed(() => {
  const all_sm_vc = pasantias_store_sm_vc.getEstudiantesDelProfesor(auth.user?.id_sm_vc)
  return all_sm_vc.filter((e) => {
    const q_sm_vc = busqueda_sm_vc.value.toLowerCase()
    if (q_sm_vc && !e.nombre_sm_vc.toLowerCase().includes(q_sm_vc)) return false
    if (filtro_cohorte_sm_vc.value && e.cohorte_sm_vc !== filtro_cohorte_sm_vc.value) return false
    if (filtro_materia_sm_vc.value) {
      const tiene_materia_sm_vc = e.materias_sm_vc?.some(
        (m) => m.materia_id === filtro_materia_sm_vc.value &&
               (m.estado === 'ENTREGADO' || m.estado === 'PENDIENTE')
      )
      if (!tiene_materia_sm_vc) return false
    }
    return true
  })
})

function get_initials_sm_vc(name_sm_vc) {
  return (name_sm_vc ?? '').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function ver_trazabilidad_sm_vc(estudiante_sm_vc) {
  router_sm_vc.push(`/profesor/estudiantes/${estudiante_sm_vc.id_sm_vc}/trazabilidad`)
}
</script>

<style scoped>
.filter-row_sm_vc { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
.search-input_sm_vc { min-width: 240px; }
.filter-select_sm_vc { min-width: 150px; }
.students-grid_sm_vc { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
:deep(.student-card_sm_vc) { background: rgba(255, 255, 255, 0.03) !important; border: 1px solid rgba(111, 255, 233, 0.08) !important; border-radius: 12px !important; cursor: pointer; transition: all 0.15s ease; overflow: hidden; }
:deep(.student-card_sm_vc:hover) { border-color: rgba(111, 255, 233, 0.2) !important; background: rgba(111, 255, 233, 0.04) !important; transform: translateY(-2px); }
.card-inner_sm_vc { display: flex; align-items: center; gap: 0.875rem; padding: 1rem !important; }
.student-avatar_sm_vc { width: 42px; height: 42px; border-radius: var(--radius-lg_vc); background: rgba(111, 255, 233, 0.1); border: 1px solid rgba(111, 255, 233, 0.2); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--color-cta_vc); flex-shrink: 0; font-family: var(--font-mono_vc); }
.student-info_sm_vc { flex: 1; min-width: 0; }
.student-name_sm_vc { font-size: 0.82rem; font-weight: 600; color: var(--color-texto-primario_vc); margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--font-mono_vc); }
.student-id_sm_vc { font-size: 0.6rem; color: var(--color-texto-muted_vc); margin: 0 0 6px; font-family: var(--font-mono_vc); }
.student-meta_sm_vc { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.meta-chip_sm_vc { display: flex; align-items: center; gap: 3px; font-size: 0.58rem; color: #4a6a88; background: rgba(255, 255, 255, 0.04); padding: 1px 6px; border-radius: var(--radius-sm_vc); font-family: var(--font-mono_vc); }
.status--aprobado_sm_vc { color: var(--color-cta_vc) !important; }
.status--entregado_sm_vc { color: var(--color-estudiante_vc) !important; }
.status--pendiente_sm_vc { color: var(--color-texto-secundario_vc) !important; }
.status--reprobado_sm_vc { color: var(--color-error-claro_vc) !important; }
.card-arrow_sm_vc { opacity: 0.5; }
.card-progress_sm_vc { padding: 0 1rem 0.875rem !important; display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid rgba(255, 255, 255, 0.04); }
.progress-bar-wrap_sm_vc { display: flex; flex-direction: column; gap: 3px; }
.progress-bar-label_sm_vc { display: flex; justify-content: space-between; font-size: 0.6rem; color: var(--color-texto-terciario_vc); font-family: var(--font-mono_vc); }
.prog-status--aprobado_sm_vc { color: var(--color-cta_vc); }
.prog-status--entregado_sm_vc { color: var(--color-estudiante_vc); }
.prog-status--pendiente_sm_vc { color: #4a6a88; }
.prog-status--reprobado_sm_vc { color: var(--color-error-claro_vc); }
</style>
