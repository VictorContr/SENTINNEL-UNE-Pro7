<!-- ══════════════════════════════════════════════════════════════════
     EstudiantesPage.vue — Grid de estudiantes asignados al profesor.
     Thin Page: filtrado 100% en computed, sin lógica en template.
     Unifica sufijos _sm_vc y elimina la dependencia directa al store
     de Pinia desde el template.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="groups" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Mis Estudiantes Asignados</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Profesor:
        <span class="highlight_sm_vc">{{ auth_sm_vc.user?.nombre_sm_vc }}</span>
        · ID:
        <span class="code-tag_sm_vc">{{ auth_sm_vc.user?.id_sm_vc }}</span>
      </p>
    </div>

    <!-- Filtros -->
    <div class="filter-row_sm_vc">
      <q-input
        v-model="busqueda_sm_vc"
        dense
        outlined
        placeholder="Buscar estudiante…"
        color="teal-3"
        class="sntnl-input_sm_vc search-input_sm_vc"
      >
        <template #prepend>
          <q-icon name="search" color="grey-6" size="18px" />
        </template>
      </q-input>

      <q-select
        v-model="filtroPeriodo_sm_vc"
        :options="periodosOpc_sm_vc"
        dense
        outlined
        color="teal-3"
        label="Periodo"
        clearable
        class="sntnl-select_sm_vc filter-select_sm_vc"
        emit-value
        map-options
      />

      <q-select
        v-model="filtroMateria_sm_vc"
        :options="materiasOpc_sm_vc"
        dense
        outlined
        color="teal-3"
        label="Materia Activa"
        clearable
        class="sntnl-select_sm_vc filter-select_sm_vc"
        emit-value
        map-options
      />

      <q-select
        v-model="filtroEstado_sm_vc"
        :options="estadosOpc_sm_vc"
        dense
        outlined
        color="teal-3"
        label="Estado"
        clearable
        class="sntnl-select_sm_vc filter-select_sm_vc"
        emit-value
        map-options
      />
    </div>

    <!-- Grid de tarjetas -->
    <div v-if="estudiantesFiltrados_sm_vc.length" class="students-grid_sm_vc">
      <q-card
        v-for="est in estudiantesFiltrados_sm_vc"
        :key="est.id"
        class="student-card_sm_vc"
        @click="verTrazabilidad_sm_vc(est)"
      >
        <q-card-section class="card-inner_sm_vc">
          <div class="student-avatar_sm_vc">
            {{ iniciales_sm_vc(est.nombre) }}
          </div>
          <div class="student-info_sm_vc">
            <p class="student-name_sm_vc">{{ est.nombre }}</p>
            <p class="student-id_sm_vc">{{ est.id }}</p>
            <div class="student-meta_sm_vc">
              <span class="meta-chip_sm_vc bg-teal-9 text-teal-1">
                <q-icon name="menu_book" size="11px" />
                {{ est.materia_activa_nombre }} ({{ est.cohorte }})
              </span>
              <span
                class="meta-chip_sm_vc"
                :class="`status--${est.estado_actual?.toLowerCase()}_sm_vc`"
              >
                <q-icon name="circle" size="8px" />
                {{ est.estado_actual }}
              </span>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="arrow_forward"
            color="teal-3"
            size="sm"
            class="card-arrow_sm_vc"
          />
        </q-card-section>

        <!-- Barras de progreso por materia (Muestra el ciclo completo) -->
        <q-card-section class="card-progress_sm_vc">
          <div
            v-for="mat in est.materias"
            :key="mat.materia_id"
            class="progress-bar-wrap_sm_vc"
            :class="{ 'materia-bloqueada_sm_vc': mat.bloqueada }"
          >
            <div class="progress-bar-label_sm_vc">
              <span>{{ mat.materia_nombre }}</span>
              <span
                v-if="!mat.bloqueada"
                :class="`prog-status--${mat.estado.toLowerCase()}_sm_vc`"
              >
                {{ mat.progreso_porcentaje }}%
              </span>
              <span v-else class="text-grey-7">
                <q-icon name="lock" size="10px" />
                Bloqueada
              </span>
            </div>
            <q-linear-progress
              :value="mat.progreso"
              :color="mat.bloqueada ? 'grey-8' : colorEstado_sm_vc(mat.estado)"
              track-color="blue-grey-10"
              rounded
              size="3px"
              :style="mat.bloqueada ? 'opacity: 0.3' : ''"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state_sm_vc">
      <q-icon name="person_off" size="48px" color="blue-grey-8" />
      <p>No hay estudiantes con los filtros aplicados.</p>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "src/stores/authStore";
import { useProgressBarStore } from "src/stores/progressBarStore";
import { api as api_vc } from "boot/axios";

const router_sm_vc = useRouter();
const auth_sm_vc = useAuthStore();
const progressBarStore_sm_vc = useProgressBarStore();

/* ── Filtros ── */
const busqueda_sm_vc = ref("");
const filtroPeriodo_sm_vc = ref(null);
const filtroMateria_sm_vc = ref(null);
const filtroEstado_sm_vc = ref(null);

const periodosOpc_sm_vc = ref([]);

const materiasOpc_sm_vc = computed(() => {
  const opciones_sm_vc = new Map();
  const estudiantes_sm_vc =
    progressBarStore_sm_vc.progresoEstudiantesProfesor_sm_vc || [];
  for (const est_sm_vc of estudiantes_sm_vc) {
    for (const mat_sm_vc of est_sm_vc.materias || []) {
      if (mat_sm_vc.posicion_sm_vc && !opciones_sm_vc.has(mat_sm_vc.posicion_sm_vc)) {
        opciones_sm_vc.set(mat_sm_vc.posicion_sm_vc, {
          label: mat_sm_vc.materia_nombre,
          value: mat_sm_vc.posicion_sm_vc,
        });
      }
    }
  }
  return Array.from(opciones_sm_vc.values()).sort((a, b) => a.value - b.value);
});

const estadosOpc_sm_vc = [
  { label: "Aprobado", value: "APROBADO" },
  { label: "Entregado", value: "ENTREGADO" },
  { label: "Pendiente", value: "PENDIENTE" },
  { label: "Reprobado", value: "REPROBADO" },
];

/* ── Cargar datos iniciales ── */
onMounted(async () => {
  progressBarStore_sm_vc.fetchEstudiantesProfesor_sm_vc();
  try {
    const resPeriodos_sm_vc = await api_vc.get("/periodos");
    periodosOpc_sm_vc.value = resPeriodos_sm_vc.data.map((p) => ({
      label: p.nombre_sm_vc,
      value: p.nombre_sm_vc,
    }));
  } catch (error) {
    console.error("Error cargando periodos_vc:", error);
  }
});

/* ── Estudiantes filtrados (toda la lógica en computed) ── */
const estudiantesFiltrados_sm_vc = computed(() => {
  const todos_sm_vc =
    progressBarStore_sm_vc.progresoEstudiantesProfesor_sm_vc || [];
  const q_sm_vc = busqueda_sm_vc.value.toLowerCase();

  return todos_sm_vc.filter((e) => {
    if (q_sm_vc && !e.nombre.toLowerCase().includes(q_sm_vc)) return false;
    if (filtroPeriodo_sm_vc.value && e.cohorte !== filtroPeriodo_sm_vc.value)
      return false;
    if (filtroMateria_sm_vc.value) {
      const tieneMateriaActiva_sm_vc = e.materias?.some(
        (m) =>
          m.posicion_sm_vc === filtroMateria_sm_vc.value &&
          m.estado === "PENDIENTE",
      );
      if (!tieneMateriaActiva_sm_vc) return false;
    }
    if (
      filtroEstado_sm_vc.value &&
      e.estado_actual !== filtroEstado_sm_vc.value
    ) {
      return false;
    }
    return true;
  });
});

/* ── Helpers ── */
const iniciales_sm_vc = (nombre_sm_vc) =>
  (nombre_sm_vc ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const colorEstado_sm_vc = (estado_sm_vc) =>
  progressBarStore_sm_vc.getEstadoColor(estado_sm_vc);

const verTrazabilidad_sm_vc = (est_sm_vc) =>
  router_sm_vc.push(`/profesor/estudiantes/${est_sm_vc.id}/trazabilidad`);
</script>

<style scoped>
.filter-row_sm_vc {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}
.search-input_sm_vc {
  min-width: 240px;
}
.filter-select_sm_vc {
  min-width: 150px;
}
.students-grid_sm_vc {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
:deep(.student-card_sm_vc) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important;
  border-radius: 12px !important;
  cursor: pointer;
  transition: all 0.15s ease;
  overflow: hidden;
}
:deep(.student-card_sm_vc:hover) {
  border-color: var(--sn-borde-activo) !important;
  background: var(--sn-surface-hover) !important;
  transform: translateY(-2px);
}
.card-inner_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem !important;
}
.student-avatar_sm_vc {
  width: 42px;
  height: 42px;
  border-radius: var(--sn-radius-lg);
  background: var(--sn-surface-active);
  border: 1px solid var(--sn-borde-activo);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--sn-primario);
  flex-shrink: 0;
  font-family: var(--sn-font-mono);
}
.student-info_sm_vc {
  flex: 1;
  min-width: 0;
}
.student-name_sm_vc {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sn-texto-principal);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--sn-font-mono);
}
.student-id_sm_vc {
  font-size: 0.6rem;
  color: var(--sn-texto-apagado);
  margin: 0 0 6px;
  font-family: var(--sn-font-mono);
}
.student-meta_sm_vc {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.meta-chip_sm_vc {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.58rem;
  color: var(--sn-texto-secundario);
  background: var(--sn-surface-alpha);
  padding: 1px 6px;
  border-radius: var(--sn-radius-sm);
  font-family: var(--sn-font-mono);
}
.status--aprobado_sm_vc {
  color: var(--sn-primario) !important;
}
.status--entregado_sm_vc {
  color: var(--sn-estudiante) !important;
}
.status--pendiente_sm_vc {
  color: var(--sn-texto-secundario) !important;
}
.status--reprobado_sm_vc {
  color: var(--sn-error-claro) !important;
}
.card-arrow_sm_vc {
  opacity: 0.5;
}
.card-progress_sm_vc {
  padding: 0.75rem 1rem 0.875rem !important;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border-top: 1px solid var(--sn-borde);
}
.progress-bar-wrap_sm_vc {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.progress-bar-label_sm_vc {
  display: flex;
  justify-content: space-between;
  font-size: 0.58rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-mono);
}
.materia-bloqueada_sm_vc {
  opacity: 0.55;
  filter: grayscale(0.8);
}
.prog-status--aprobado_sm_vc {
  color: var(--sn-primario);
}
.prog-status--entregado_sm_vc {
  color: var(--sn-estudiante);
}
.prog-status--pendiente_sm_vc {
  color: var(--sn-texto-secundario);
}
.prog-status--reprobado_sm_vc {
  color: var(--sn-error-claro);
}
</style>
