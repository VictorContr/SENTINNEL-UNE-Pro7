<template>
  <div
    class="materia-card"
    :class="{
      'materia-card--active': materia.estado_aprobacion_sm_vc === 'ENTREGADO',
      'materia-card--done': materia.estado_aprobacion_sm_vc === 'APROBADO',
      'materia-card--locked': materia.bloqueada,
      'materia-card--reprobado':
        materia.estado_aprobacion_sm_vc === 'REPROBADO',
      'materia-card--readonly': readonly,
    }"
    @click="handleCardClick_sm_vc"
  >
    <!-- Borde top de acento -->
    <div class="card-accent-top" />

    <!-- Orden / número -->
    <div class="card-orden">
      {{ String(materia.orden_sm_int).padStart(2, "0") }}
    </div>

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
          borderColor: materia.meta_estado?.color + '40',
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
        <span>{{ requisitosAprobadosVisual_sm_vc }}/{{ materia.total_requisitos_sm_int }}</span>
      </div>
      <q-linear-progress
        :value="materia.progreso_decimal"
        :color="progressColor"
        track-color="blue-grey-10"
        rounded
        size="4px"
      />
    </div>

    <!-- Requisitos pills -->
    <div v-if="showRequisitos" class="requisitos-list">
      <div v-for="req in materia.requisitos" :key="req.id_sm_vc" class="req-wrapper-block_sm_vc">
        <div
          class="req-pill"
          :class="{
            'req-pill--done': isRequisitoCompletado_sm_vc(req.id_sm_vc),
            'req-pill--optional': !req.obligatorio_sm_vc,
          }"
        >
          <q-icon
            :name="
              isRequisitoCompletado_sm_vc(req.id_sm_vc)
                ? 'check_circle'
                : 'radio_button_unchecked'
            "
            size="11px"
          />
          <span>{{ req.nombre_sm_vc }}</span>
          <span v-if="!req.obligatorio_sm_vc" class="optional-tag">opt</span>
        </div>
        
        <!-- Lista de documentos para este requisito -->
        <div v-if="getDocumentosForRequisito_sm_vc(req.id_sm_vc).length" class="doc-list_sm_vc">
          <div v-for="doc in getDocumentosForRequisito_sm_vc(req.id_sm_vc)" :key="doc.id_sm_vc" class="doc-item_sm_vc">
            <q-icon name="description" size="10px" color="teal-3" />
            <a :href="'/' + doc.ruta_archivo_sm_vc" target="_blank" class="doc-link_sm_vc" @click.stop>
              {{ doc.nombre_archivo_sm_vc }}
            </a>
          </div>
        </div>
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
        <span
          >{{ materia.intentos_sm_int }} intento{{
            materia.intentos_sm_int > 1 ? "s" : ""
          }}</span
        >
      </div>
    </div>

    <!-- Footer: acción o bloqueo -->
    <div class="card-footer">
      <span v-if="readonly" class="readonly-footer_sm_vc">
        <q-icon name="visibility" size="12px" />
        Solo lectura — sin acciones
      </span>
      <span v-else-if="materia.bloqueada" class="locked-msg">
        <q-icon name="lock" size="12px" />
        Requiere aprobar la materia anterior
      </span>
      <div v-else class="card-action">
        <span class="action-hint">
          {{
            materia.estado_aprobacion_sm_vc === "APROBADO"
              ? "Ver historial"
              : "Abrir materia"
          }}
        </span>
        <q-icon name="arrow_forward" size="14px" color="teal-3" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  materia: { type: Object, required: true },
  estudianteId: { type: String, required: true },
  showDescription: { type: Boolean, default: false },
  showRequisitos: { type: Boolean, default: true },
  /** Vista auditoría: no emite click ni sugiere edición. */
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(["click"]);

const handleCardClick_sm_vc = () => {
  if (props.readonly || props.materia.bloqueada) return;
  emit("click", props.materia);
};

const requisitosAprobadosVisual_sm_vc = computed(() => {
  if (props.materia.estado_aprobacion_sm_vc === "APROBADO") {
    return props.materia.total_requisitos_sm_int;
  }
  return props.materia.requisitos_aprobados_sm_int;
});

/* Determina si un requisito ha sido completado (basado en el detalle de aprobación o entregas previas) */
const isRequisitoCompletado_sm_vc = (requisito_id_sm_vc) => {
  if (props.materia.estado_aprobacion_sm_vc === "APROBADO") {
    return true;
  }
  const detalles_sm_vc = props.materia.progreso?.requisitos_aprobados_detalle_sm_vc ?? [];
  return detalles_sm_vc.some((d) => d.requisito_id_sm_vc === requisito_id_sm_vc);
};

/* Extraer documentos vinculados a cada entrega para renderizar en la vista */
const getDocumentosForRequisito_sm_vc = (requisito_id_sm_vc) => {
  const detalle_entrega = props.materia.progreso?.entregas_detalle_sm_vc?.find(
    (e) => e.requisito_id_sm_vc === requisito_id_sm_vc
  );
  return detalle_entrega?.documentos_sm_vc || [];
};

const progressColor = computed(() => {
  const map = {
    APROBADO: "teal-4",
    ENTREGADO: "light-blue-5",
    PENDIENTE: "blue-grey-6",
    REPROBADO: "red-5",
  };
  return map[props.materia.estado_aprobacion_sm_vc] ?? "blue-grey-6";
});
</script>

<style scoped>
.materia-card {
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: 12px;
  padding: 0 0 0.875rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
  font-family: var(--sn-font-mono);
}

.materia-card:hover:not(.materia-card--locked):not(.materia-card--readonly) {
  border-color: var(--sn-borde-hover);
  background: var(--sn-surface-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.materia-card--active {
  border-color: var(--sn-borde-hover);
  background: rgba(126, 200, 227, 0.025);
}
.materia-card--done {
  border-color: var(--sn-borde-hover);
}
.materia-card--locked {
  cursor: not-allowed;
  opacity: 0.45;
}
.materia-card--readonly {
  cursor: default;
}
.materia-card--readonly:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--sn-borde);
  background: var(--sn-surface-alpha);
}
.readonly-footer_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6rem;
  color: var(--sn-texto-dim);
}
.materia-card--reprobado {
  border-color: rgba(255, 143, 163, 0.15);
}

/* Accent top bar */
.card-accent-top {
  height: 2px;
  background: var(--sn-surface-active);
}

.materia-card--active .card-accent-top {
  background: #7ec8e3;
  box-shadow: 0 0 8px rgba(126, 200, 227, 0.4);
}
.materia-card--done .card-accent-top {
  background: #6fffe9;
  box-shadow: 0 0 10px rgba(111, 255, 233, 0.5);
}
.materia-card--reprobado .card-accent-top {
  background: #ff8fa3;
}

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

.card-name-block {
  flex: 1;
  min-width: 0;
}

.card-nombre {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--sn-texto-principal);
  margin: 0 0 2px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-id {
  font-size: 0.58rem;
  color: var(--sn-texto-dim);
  margin: 0;
  letter-spacing: 0.08em;
}

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
  color: var(--sn-texto-terciario);
  margin: 0 1rem 0.75rem;
  line-height: 1.5;
  font-family: var(--sn-font-sans);
}

/* Progress */
.progress-section {
  padding: 0 1rem 0.6rem;
}

.progress-numbers {
  display: flex;
  justify-content: space-between;
  font-size: 0.58rem;
  color: var(--sn-texto-apagado);
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
  color: var(--sn-texto-apagado);
  padding: 3px 0;
}

.req-pill--done {
  color: var(--sn-acento-sec);
}
.req-pill--done .q-icon {
  color: var(--sn-primario) !important;
}
.req-pill--optional .optional-tag {
  font-size: 0.5rem;
  color: var(--sn-texto-dim);
  background: var(--sn-surface-alpha);
  padding: 0 4px;
  border-radius: 2px;
  margin-left: auto;
}

/* Documentos del Requisito */
.req-wrapper-block_sm_vc {
  display: flex;
  flex-direction: column;
}
.doc-list_sm_vc {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 14px;
  margin-top: 2px;
  margin-bottom: 4px;
}
.doc-item_sm_vc {
  display: flex;
  align-items: center;
  gap: 4px;
}
.doc-link_sm_vc {
  font-size: 0.55rem;
  color: var(--sn-acento-sec);
  text-decoration: none;
  font-family: var(--sn-font-sans);
}
.doc-link_sm_vc:hover {
  text-decoration: underline;
  color: var(--sn-primario);
}

/* Stats */
.card-stats {
  display: flex;
  gap: 0.75rem;
  padding: 0 1rem 0.75rem;
  border-bottom: 1px solid var(--sn-borde);
  margin-bottom: 0.75rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  color: var(--sn-texto-apagado);
}

.stat--nota {
  color: var(--sn-advertencia);
}

/* Footer */
.card-footer {
  padding: 0 1rem;
}

.locked-msg {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6rem;
  color: var(--sn-texto-dim);
}

.card-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.62rem;
  color: var(--sn-texto-terciario);
  transition: color 0.15s;
}

.materia-card:hover:not(.materia-card--locked):not(.materia-card--readonly)
  .card-action {
  color: var(--sn-primario);
}

.action-hint {
  font-size: 0.62rem;
  letter-spacing: 0.05em;
}
</style>
