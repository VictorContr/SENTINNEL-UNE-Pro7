<template>
  <div
    class="materia-card"
    :class="{
      'materia-card--active':  materia.estado_aprobacion_sm_vc === 'ENTREGADO',
      'materia-card--done':    materia.estado_aprobacion_sm_vc === 'APROBADO',
      'materia-card--locked':  materia.bloqueada,
      'materia-card--reprobado': materia.estado_aprobacion_sm_vc === 'REPROBADO'
    }"
    @click="!materia.bloqueada && emit('click', materia)"
  >
    <!-- Borde top de acento -->
    <div class="card-accent-top" />

    <!-- Orden / número -->
    <div class="card-orden">{{ String(materia.orden_sm_int).padStart(2, '0') }}</div>

    <!-- Header -->
    <div class="card-header">
      <div class="card-name-block">
        <p class="card-nombre">{{ materia.nombre_sm_vc }}</p>
        <p class="card-id">{{ materia.id_sm_vc }}</p>
      </div>

      <div
        class="estado-pill"
        :style="{
          color: materia.meta_estado?.color,
          background: materia.meta_estado?.bg,
          borderColor: materia.meta_estado?.color + '40'
        }"
      >
        <q-icon :name="materia.meta_estado?.icon" size="11px" />
        {{ materia.estado_aprobacion_sm_vc }}
      </div>
    </div>

    <!-- Descripción corta -->
    <p v-if="showDescription && materia.descripcion_sm_vc" class="card-desc">
      {{ materia.descripcion_sm_vc }}
    </p>

    <!-- Barra de progreso -->
    <div class="progress-section">
      <div class="progress-numbers">
        <span>Requisitos</span>
        <span>{{ materia.requisitos_aprobados_sm_int }}/{{ materia.total_requisitos_sm_int }}</span>
      </div>
      <q-linear-progress
        :value="materia.progreso_decimal ?? 0"
        :color="progressColor"
        track-color="blue-grey-10"
        rounded
        size="4px"
      />
    </div>

    <!-- Requisitos pills -->
    <div v-if="showRequisitos" class="requisitos-list">
      <div
        v-for="req in materia.requisitos"
        :key="req.id_sm_vc"
        class="req-pill"
        :class="{ 'req-pill--done': isRequisitoAprobado(req.id_sm_vc), 'req-pill--optional': !req.obligatorio_sm_vc }"
      >
        <q-icon
          :name="isRequisitoAprobado(req.id_sm_vc) ? 'check_circle' : 'radio_button_unchecked'"
          size="11px"
        />
        <span>{{ req.nombre_sm_vc }}</span>
        <span v-if="!req.obligatorio_sm_vc" class="optional-tag">opt</span>
      </div>
    </div>

    <!-- Stats de conversación -->
    <div class="card-stats">
      <div class="stat">
        <q-icon name="chat_bubble_outline" size="12px" color="blue-grey-6" />
        <span>{{ materia.conversacion_count_sm_int }} msgs</span>
      </div>
      <div v-if="materia.nota_sm_dec !== null" class="stat stat--nota">
        <q-icon name="grade" size="12px" color="amber-5" />
        <span>{{ materia.nota_sm_dec }}/20</span>
      </div>
      <div v-if="materia.intentos_sm_int > 0" class="stat">
        <q-icon name="refresh" size="12px" color="blue-grey-6" />
        <span>{{ materia.intentos_sm_int }} intento{{ materia.intentos_sm_int > 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Footer: acción o bloqueo -->
    <div class="card-footer">
      <span v-if="materia.bloqueada" class="locked-msg">
        <q-icon name="lock" size="12px" />
        Requiere aprobar la materia anterior
      </span>
      <div v-else class="card-action">
        <span class="action-hint">
          {{ materia.estado_aprobacion_sm_vc === 'APROBADO' ? 'Ver historial' : 'Abrir materia' }}
        </span>
        <q-icon name="arrow_forward" size="14px" color="teal-3" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePasantiasStore } from 'src/stores/pasantiasStore'

const props = defineProps({
  materia: { type: Object, required: true },
  estudianteId: { type: String, required: true },
  showDescription: { type: Boolean, default: false },
  showRequisitos: { type: Boolean, default: true }
})

const emit = defineEmits(['click'])
const pasantiasStore = usePasantiasStore()

/* Determina si un requisito específico tiene mensaje aprobado */
function isRequisitoAprobado(requisito_id_sm_vc) {
  const conv = pasantiasStore.getConversacion(props.estudianteId, props.materia.id_sm_vc)
  return conv.some(
    (m) =>
      m.remitente_rol_sm_vc === 'PROFESOR' &&
      m.estado_evaluacion_sm_vc === 'APROBADO'
  )
}

const progressColor = computed(() => {
  const map = {
    APROBADO: 'teal-4',
    ENTREGADO: 'light-blue-5',
    PENDIENTE: 'blue-grey-6',
    REPROBADO: 'red-5'
  }
  return map[props.materia.estado_aprobacion_sm_vc] ?? 'blue-grey-6'
})
</script>

<style scoped>
.materia-card {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(111, 255, 233, 0.07);
  border-radius: 12px;
  padding: 0 0 0.875rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
  font-family: 'IBM Plex Mono', monospace;
}

.materia-card:hover:not(.materia-card--locked) {
  border-color: rgba(111, 255, 233, 0.18);
  background: rgba(111, 255, 233, 0.03);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.materia-card--active  { border-color: rgba(126, 200, 227, 0.2); background: rgba(126, 200, 227, 0.025); }
.materia-card--done    { border-color: rgba(111, 255, 233, 0.18); }
.materia-card--locked  { cursor: not-allowed; opacity: 0.45; }
.materia-card--reprobado { border-color: rgba(255, 143, 163, 0.15); }

/* Accent top bar */
.card-accent-top {
  height: 2px;
  background: rgba(111, 255, 233, 0.12);
}

.materia-card--active   .card-accent-top { background: #7ec8e3; box-shadow: 0 0 8px rgba(126, 200, 227, 0.4); }
.materia-card--done     .card-accent-top { background: #6fffe9; box-shadow: 0 0 10px rgba(111, 255, 233, 0.5); }
.materia-card--reprobado .card-accent-top { background: #ff8fa3; }

.card-orden {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: rgba(111, 255, 233, 0.05);
  line-height: 1;
  user-select: none;
  pointer-events: none;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.875rem 1rem 0.5rem;
}

.card-name-block { flex: 1; min-width: 0; }

.card-nombre {
  font-size: 0.88rem;
  font-weight: 600;
  color: #c8dde8;
  margin: 0 0 2px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-id { font-size: 0.58rem; color: #1e3050; margin: 0; letter-spacing: 0.08em; }

.estado-pill {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid transparent;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-desc {
  font-size: 0.68rem;
  color: #3a5a78;
  margin: 0 1rem 0.75rem;
  line-height: 1.5;
  font-family: 'IBM Plex Sans', sans-serif;
}

/* Progress */
.progress-section { padding: 0 1rem 0.6rem; }

.progress-numbers {
  display: flex;
  justify-content: space-between;
  font-size: 0.58rem;
  color: #2e4a6a;
  margin-bottom: 4px;
}

/* Requisitos pills */
.requisitos-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0 1rem 0.75rem;
}

.req-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.62rem;
  color: #2e4a6a;
  padding: 3px 0;
}

.req-pill--done { color: #5bc0be; }
.req-pill--done .q-icon { color: #6fffe9 !important; }
.req-pill--optional .optional-tag {
  font-size: 0.5rem;
  color: #1e3050;
  background: rgba(255, 255, 255, 0.04);
  padding: 0 4px;
  border-radius: 2px;
  margin-left: auto;
}

/* Stats */
.card-stats {
  display: flex;
  gap: 0.75rem;
  padding: 0 1rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  margin-bottom: 0.75rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  color: #2e4a6a;
}

.stat--nota { color: #7a6020; }

/* Footer */
.card-footer { padding: 0 1rem; }

.locked-msg {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6rem;
  color: #1e3050;
}

.card-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.62rem;
  color: #3a5a78;
  transition: color 0.15s;
}

.materia-card:hover:not(.materia-card--locked) .card-action { color: #6fffe9; }

.action-hint { font-size: 0.62rem; letter-spacing: 0.05em; }
</style>
