<!-- ══════════════════════════════════════════════════════════════════
     ConvHeader.vue — Cabecera de la conversación documental.
     Muestra el nombre de la materia, conteo de mensajes y el estado
     de aprobación actual. Recibe todo vía props; no accede a stores.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="conv-header_sm_vc">
    <div class="header-left_sm_vc">
      <div class="materia-icon_sm_vc">
        <q-icon name="book_2" size="20px" color="teal-3" />
      </div>
      <div>
        <p class="materia-nombre_sm_vc">{{ materia?.nombre_sm_vc }}</p>
        <p class="materia-meta_sm_vc">
          {{ materia?.id_sm_vc }} · {{ totalMensajes }} documentos
        </p>
      </div>
    </div>

    <div v-if="estadoProgreso" class="estado-pill_sm_vc"
      :style="{
        color: metaEstado?.color,
        background: metaEstado?.bg,
        borderColor: metaEstado?.color + '40'
      }">
      <q-icon :name="metaEstado?.icon" size="13px" />
      {{ estadoProgreso }}
    </div>
  </div>

  <!-- Regla de flujo secuencial -->
  <div class="flow-bar_sm_vc">
    <div class="flow-pill_sm_vc">
      <q-icon name="person" size="12px" color="light-blue-4" />
      <span>Estudiante envía</span>
    </div>
    <span class="flow-arrow_sm_vc">→</span>
    <div class="flow-pill_sm_vc">
      <q-icon name="school" size="12px" color="amber-4" />
      <span>Profesor corrige</span>
    </div>
    <span class="flow-arrow_sm_vc">→</span>
    <div class="flow-pill_sm_vc flow-pill--end_sm_vc">
      <q-icon name="check_circle" size="12px" color="teal-3" />
      <span>Aprobación</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ESTADO_APROBACION } from 'src/stores/pasantiasStore'

const props = defineProps({
  materia: { type: Object, default: null },
  estadoProgreso: { type: String, default: null },
  totalMensajes: { type: Number, default: 0 }
})

const metaEstado_sm_vc = computed(() =>
  props.estadoProgreso ? ESTADO_APROBACION[props.estadoProgreso] : null
)
/* Alias sin sufijo para el template */
const metaEstado = metaEstado_sm_vc
</script>

<style scoped>
.conv-header_sm_vc {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--sn-fondo-elevado);
  border-bottom: 1px solid var(--sn-borde);
  gap: 1rem; flex-wrap: wrap;
}
.header-left_sm_vc { display: flex; align-items: center; gap: .75rem; }
.materia-icon_sm_vc {
  width: 38px; height: 38px; border-radius: 8px;
  background: var(--sn-surface-active);
  border: 1px solid var(--sn-borde-hover);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.materia-nombre_sm_vc {
  font-size: .85rem; font-weight: 600;
  color: var(--sn-texto-principal); margin: 0 0 2px;
}
.materia-meta_sm_vc {
  font-size: .6rem; color: var(--sn-texto-apagado);
  margin: 0; letter-spacing: .06em;
}
.estado-pill_sm_vc {
  display: flex; align-items: center; gap: .3rem;
  font-size: .6rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  padding: 3px 10px; border-radius: 20px;
  border: 1px solid currentColor; flex-shrink: 0;
}
.flow-bar_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  padding: .5rem 1.25rem;
  background: var(--sn-fondo-elevado);
  border-bottom: 1px solid var(--sn-borde);
  flex-wrap: wrap;
}
.flow-pill_sm_vc {
  display: flex; align-items: center; gap: .3rem;
  font-size: .6rem; color: var(--sn-texto-terciario);
  background: var(--sn-surface-alpha);
  padding: 2px 8px; border-radius: 4px;
}
.flow-pill--end_sm_vc { color: var(--sn-acento-sec); }
.flow-arrow_sm_vc { font-size: .65rem; color: var(--sn-texto-dim); }
</style>