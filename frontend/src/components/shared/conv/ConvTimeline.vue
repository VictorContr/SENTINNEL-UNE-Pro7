<!-- ══════════════════════════════════════════════════════════════════
     ConvTimeline.vue — Renderiza la trazabilidad mediante un Timeline.
     Visualiza eventos de sistema y mensajes de texto para el historial.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="timeline-container_sm_vc">
    <!-- Spinner central para carga inicial -->
    <div v-if="cargando" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="40px" />
      <p class="text-caption q-mt-md text-primary font-bold">Cargando trazabilidad...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="eventos.length === 0" class="empty-timeline_sm_vc q-pa-xl text-center">
      <q-icon name="history_toggle_off" size="48px" color="blue-grey-8" />
      <p class="text-subtitle2 q-mt-md text-blue-grey-6">Aún no se han registrado eventos en esta traza.</p>
    </div>

    <!-- Timeline principal -->
    <q-timeline
      v-else
      :layout="layout_sm_vc"
      side="right"
      color="primary"
      class="q-px-md q-pb-xl"
    >
      <q-timeline-entry
        v-for="evento in eventos"
        :key="evento.id_sm_vc"
        :title="evento.es_sistema_sm_vc ? 'Notificación de Sistema' : 'Mensaje'"
        :subtitle="formatearFecha_sm_vc(evento.fecha_sm_vc)"
        :icon="icono_sm_vc(evento.es_sistema_sm_vc)"
        :color="color_sm_vc(evento.es_sistema_sm_vc)"
        class="timeline-entry_sm_vc"
      >
        <div class="evento-contenido_sm_vc" :class="{'sistema-bg_sm_vc': evento.es_sistema_sm_vc}">
          <p class="text-body2 leading-relaxed text-gray-800 dark:text-gray-200">
            {{ evento.contenido_sm_vc }}
          </p>
        </div>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

/* ── Props ── */
defineProps({
  eventos:  { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false }
})

const $q_sm_vc = useQuasar()

/* ── Computed ── */

/**
 * Determina el layout del timeline según el tamaño de pantalla.
 */
const layout_sm_vc = computed(() => {
  return $q_sm_vc.screen.lt.sm ? 'dense' : ($q_sm_vc.screen.lt.md ? 'comfortable' : 'loose')
})

/* ── Métodos de Formateo ── */

/**
 * Formatea la fecha ISO a un formato legible en español.
 * @param {string} fechaIso_sm_vc 
 * @returns {string}
 */
const formatearFecha_sm_vc = (fechaIso_sm_vc) => {
  if (!fechaIso_sm_vc) return '—'
  return new Date(fechaIso_sm_vc).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Determina el icono según si es un evento de sistema o manual.
 */
const icono_sm_vc = (esSistema_sm_vc) => {
  return esSistema_sm_vc ? 'verified' : 'chat'
}

/**
 * Determina el color del hito según el tipo de evento.
 */
const color_sm_vc = (esSistema_sm_vc) => {
  return esSistema_sm_vc ? 'primary' : 'secondary'
}

</script>

<style scoped>
.timeline-container_sm_vc {
  min-height: 200px;
  max-width: 100%;
}

.timeline-entry_sm_vc {
  font-family: var(--sn-font-sans);
}

.evento-contenido_sm_vc {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  transition: all 0.2s ease;
}

.evento-contenido_sm_vc:hover {
  transform: translateX(4px);
  border-color: var(--sn-primario);
}

/* Estilo diferencial para eventos automáticos de sistema */
.sistema-bg_sm_vc {
  border-left: 4px solid var(--sn-primario);
  background: rgba(111, 255, 233, 0.03);
}

.empty-timeline_sm_vc {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

:deep(.q-timeline__title) {
  font-family: var(--sn-font-mono);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

:deep(.q-timeline__subtitle) {
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0.8;
}
</style>
