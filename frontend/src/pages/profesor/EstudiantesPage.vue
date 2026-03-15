<!-- EstudiantesView.vue — Vista Profesor: Grid de tarjetas de estudiantes -->
<template>
  <q-page class="sntnl-page">
    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="groups" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title">Mis Estudiantes Asignados</h1>
      </div>
      <p class="page-subtitle">
        Profesor: <span class="highlight">{{ auth.user?.nombre_sm_vc }}</span>
        · ID: <span class="code-tag">{{ auth.user?.id_sm_vc }}</span>
      </p>
    </div>

    <!-- Filtros y buscador -->
    <div class="filter-row">
      <q-input v-model="busqueda" dense outlined placeholder="Buscar estudiante…" dark color="teal-3" class="sntnl-input search-input">
        <template #prepend><q-icon name="search" color="grey-6" size="18px" /></template>
      </q-input>
      <q-select v-model="filtroCohorte" :options="cohorteOptions" dense outlined dark color="teal-3" label="Cohorte" clearable class="sntnl-select filter-select" emit-value map-options />
      <q-select v-model="filtroMateria" :options="materiaOptions" dense outlined dark color="teal-3" label="Materia Activa" clearable class="sntnl-select filter-select" emit-value map-options />
    </div>

    <!-- Grid de tarjetas -->
    <div class="students-grid">
      <q-card
        v-for="estudiante in estudiantesFiltrados"
        :key="estudiante.id_sm_vc"
        class="student-card"
        @click="verTrazabilidad(estudiante)"
      >
        <q-card-section class="card-inner">
          <!-- Avatar -->
          <div class="student-avatar">{{ getInitials(estudiante.nombre_sm_vc) }}</div>
          <!-- Info -->
          <div class="student-info">
            <p class="student-name">{{ estudiante.nombre_sm_vc }}</p>
            <p class="student-id">{{ estudiante.id_sm_vc }}</p>
            <div class="student-meta">
              <span class="meta-chip">
                <q-icon name="calendar_month" size="11px" />
                {{ estudiante.cohorte_sm_vc }}
              </span>
              <span class="meta-chip" :class="`status--${estudiante.estado_actual?.toLowerCase()}`">
                <q-icon name="circle" size="8px" />
                {{ estudiante.estado_actual }}
              </span>
            </div>
          </div>
          <!-- Acción -->
          <q-btn flat round dense icon="arrow_forward" color="teal-3" size="sm" class="card-arrow" />
        </q-card-section>
        <!-- Progreso materias -->
        <q-card-section class="card-progress">
          <div v-for="(mat, i) in estudiante.materias" :key="i" class="progress-bar-wrap">
            <div class="progress-bar-label">
              <span>{{ mat.nombre }}</span>
              <span :class="`prog-status--${mat.estado.toLowerCase()}`">{{ mat.estado }}</span>
            </div>
            <q-linear-progress
              :value="mat.progreso"
              :color="mat.estado === 'APROBADO' ? 'teal-4' : mat.estado === 'REPROBADO' ? 'red-4' : 'blue-grey-7'"
              track-color="blue-grey-10"
              rounded
              size="4px"
              class="mat-progress"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Empty state -->
    <div v-if="estudiantesFiltrados.length === 0" class="empty-state">
      <q-icon name="person_off" size="48px" color="blue-grey-8" />
      <p>No hay estudiantes con los filtros aplicados.</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'

const auth = useAuthStore()
const router = useRouter()
const busqueda = ref('')
const filtroCohorte = ref(null)
const filtroMateria = ref(null)

const cohorteOptions = [
  { label: '2024-A', value: '2024-A' },
  { label: '2024-B', value: '2024-B' },
  { label: '2023-A', value: '2023-A' }
]
const materiaOptions = [
  { label: 'Pasantías I', value: 'MAT-001' },
  { label: 'Pasantías II', value: 'MAT-002' },
  { label: 'Pasantías III', value: 'MAT-003' }
]

const MOCK_ESTUDIANTES = [
  {
    id_sm_vc: 'USR-003',
    nombre_sm_vc: 'Luis Ramírez',
    correo_sm_vc: 'estudiante@une.edu.ve',
    cohorte_sm_vc: '2024-A',
    profesor_id_sm_vc: 'USR-002',
    estado_actual: 'ENTREGADO',
    empresa_sm_vc: 'TechVe C.A.',
    materias: [
      { nombre: 'Pasantías I', estado: 'APROBADO', progreso: 1 },
      { nombre: 'Pasantías II', estado: 'ENTREGADO', progreso: 0.6 },
      { nombre: 'Pasantías III', estado: 'PENDIENTE', progreso: 0 }
    ]
  },
  {
    id_sm_vc: 'USR-010',
    nombre_sm_vc: 'María González',
    correo_sm_vc: 'mgonzalez@une.edu.ve',
    cohorte_sm_vc: '2024-A',
    profesor_id_sm_vc: 'USR-002',
    estado_actual: 'PENDIENTE',
    empresa_sm_vc: 'DataSoft',
    materias: [
      { nombre: 'Pasantías I', estado: 'PENDIENTE', progreso: 0.2 },
      { nombre: 'Pasantías II', estado: 'PENDIENTE', progreso: 0 },
      { nombre: 'Pasantías III', estado: 'PENDIENTE', progreso: 0 }
    ]
  },
  {
    id_sm_vc: 'USR-011',
    nombre_sm_vc: 'Carlos Pérez',
    correo_sm_vc: 'cperez@une.edu.ve',
    cohorte_sm_vc: '2024-B',
    profesor_id_sm_vc: 'USR-002',
    estado_actual: 'APROBADO',
    empresa_sm_vc: 'InnoTech',
    materias: [
      { nombre: 'Pasantías I', estado: 'APROBADO', progreso: 1 },
      { nombre: 'Pasantías II', estado: 'APROBADO', progreso: 1 },
      { nombre: 'Pasantías III', estado: 'APROBADO', progreso: 1 }
    ]
  }
]

const estudiantesFiltrados = computed(() => {
  return MOCK_ESTUDIANTES.filter((e) => {
    if (e.profesor_id_sm_vc !== auth.user?.id_sm_vc) return false
    const q = busqueda.value.toLowerCase()
    if (q && !e.nombre_sm_vc.toLowerCase().includes(q)) return false
    if (filtroCohorte.value && e.cohorte_sm_vc !== filtroCohorte.value) return false
    return true
  })
})

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function verTrazabilidad(estudiante) {
  router.push(`/profesor/estudiantes/${estudiante.id_sm_vc}/trazabilidad`)
}
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.page-header { margin-bottom: 1.25rem; }
.page-title-row { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title { font-size: 1.2rem; font-weight: 700; color: #c8dde8; letter-spacing: 0.06em; margin: 0; font-family: 'IBM Plex Mono', monospace; }
.page-subtitle { font-size: 0.72rem; color: #3a5a78; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.highlight { color: #6fffe9; font-weight: 600; }
.code-tag { background: rgba(111,255,233,0.08); color: #5bc0be; padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; font-family: 'IBM Plex Mono', monospace; }
.filter-row { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
.search-input { min-width: 240px; }
.filter-select { min-width: 150px; }
:deep(.sntnl-input .q-field__control), :deep(.sntnl-select .q-field__control) { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(91,192,190,0.2) !important; border-radius: 6px !important; }
:deep(.sntnl-input .q-field__native), :deep(.sntnl-select .q-field__native) { color: #c8dde8 !important; font-size: 0.8rem !important; font-family: 'IBM Plex Mono', monospace !important; }
.students-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
:deep(.student-card) { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(111,255,233,0.08) !important; border-radius: 12px !important; cursor: pointer; transition: all 0.15s ease; overflow: hidden; }
:deep(.student-card:hover) { border-color: rgba(111,255,233,0.2) !important; background: rgba(111,255,233,0.04) !important; transform: translateY(-2px); }
.card-inner { display: flex; align-items: center; gap: 0.875rem; padding: 1rem !important; }
.student-avatar { width: 42px; height: 42px; border-radius: 10px; background: rgba(111,255,233,0.1); border: 1px solid rgba(111,255,233,0.2); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #6fffe9; flex-shrink: 0; font-family: 'IBM Plex Mono', monospace; }
.student-info { flex: 1; min-width: 0; }
.student-name { font-size: 0.82rem; font-weight: 600; color: #c8dde8; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'IBM Plex Mono', monospace; }
.student-id { font-size: 0.6rem; color: #2e4a6a; margin: 0 0 6px; font-family: 'IBM Plex Mono', monospace; }
.student-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.meta-chip { display: flex; align-items: center; gap: 3px; font-size: 0.58rem; color: #4a6a88; background: rgba(255,255,255,0.04); padding: 1px 6px; border-radius: 4px; font-family: 'IBM Plex Mono', monospace; }
.status--aprobado { color: #6fffe9 !important; }
.status--entregado { color: #7ec8e3 !important; }
.status--pendiente { color: #5a7fa8 !important; }
.status--reprobado { color: #ff8fa3 !important; }
.card-arrow { opacity: 0.5; }
.card-progress { padding: 0 1rem 0.875rem !important; display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.04); margin-top: 0; }
.progress-bar-wrap { display: flex; flex-direction: column; gap: 3px; }
.progress-bar-label { display: flex; justify-content: space-between; font-size: 0.6rem; color: #3a5a78; font-family: 'IBM Plex Mono', monospace; }
.prog-status--aprobado { color: #6fffe9; }
.prog-status--entregado { color: #7ec8e3; }
.prog-status--pendiente { color: #4a6a88; }
.prog-status--reprobado { color: #ff8fa3; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 3rem; color: #2e4a6a; font-size: 0.8rem; font-family: 'IBM Plex Sans', sans-serif; }
</style>
