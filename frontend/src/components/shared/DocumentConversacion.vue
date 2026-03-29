<!-- ══════════════════════════════════════════════════════════════════
     DocumentConversacion.vue — Orquestador del chat documental.
     Thin Component: delega render a sub-componentes atómicos y
     despacha las acciones al pasantiasStore. Cero lógica de negocio.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="doc-chat-root_sm_vc">
    <!-- Cabecera y regla de flujo -->
    <ConvHeader
      :materia="materia_sm_vc"
      :estado-progreso="estadoProgreso"
      :total-mensajes="mensajes_sm_vc.length" />

    <!-- Lista de mensajes -->
    <ConvMessages
      :mensajes="mensajes_sm_vc"
      :requisitos="requisitos_sm_vc"
      :readonly="readonly" />

    <!-- Panel de acción según rol (solo si no es readonly) -->
    <template v-if="!readonly">
      <ConvFormEstudiante
        v-if="userRol_sm_vc === 'ESTUDIANTE'"
        :requisitos="requisitos_sm_vc"
        @enviar="handleEnviarInforme_sm_vc" />

      <ConvFormProfesor
        v-if="userRol_sm_vc === 'PROFESOR'"
        :requisitos="requisitos_sm_vc"
        :requisitos-aprobados-iniciales="requisitosAprobadosIniciales_sm_vc"
        @responder="handleResponderCorreccion_sm_vc"
        @guardar-requisitos="handleGuardarRequisitos_sm_vc" />
    </template>

    <!-- Banner de solo lectura -->
    <div v-if="readonly" class="readonly-banner_sm_vc">
      <q-icon name="lock" size="14px" color="grey-5" />
      <span>Historial de solo lectura — Materia aprobada.</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import ConvHeader from './conv/ConvHeader.vue'
import ConvMessages from './conv/ConvMessages.vue'
import ConvFormEstudiante from './conv/ConvFormEstudiante.vue'
import ConvFormProfesor from './conv/ConvFormProfesor.vue'

/* ── Props ── */
const props = defineProps({
  materiaId: { type: [String, Number], required: true },
  estudianteId: { type: String, required: true },
  readonly: { type: Boolean, default: false },
  estadoProgreso: { type: String, default: null }
})

const emit = defineEmits(['mensajeEnviado'])

/* ── Stores ── */
const pasantiasStore_sm_vc = usePasantiasStore()
const auth_sm_vc = useAuthStore()

/* ── Computed ── */
const userRol_sm_vc = computed(() => auth_sm_vc.user?.rol_sm_vc ?? null)

const materia_sm_vc = computed(() =>
  pasantiasStore_sm_vc.getMateriaById(props.materiaId)
)

const requisitos_sm_vc = computed(() =>
  materia_sm_vc.value?.requisitos ?? []
)

const mensajes_sm_vc = computed(() =>
  pasantiasStore_sm_vc.getConversacion(props.estudianteId, props.materiaId)
)

const requisitosAprobadosIniciales_sm_vc = computed(() => {
  const prog_sm_vc = pasantiasStore_sm_vc.progreso_sm_vc.find(
    (p) =>
      p.estudiante_id_sm_vc === props.estudianteId &&
      p.materia_id_sm_vc === props.materiaId
  )
  return (prog_sm_vc?.requisitos_aprobados_detalle_sm_vc ?? [])
    .map((d) => d.requisito_id_sm_vc)
})

/* ── Handlers — delegan al store ── */
const handleEnviarInforme_sm_vc = (payload_sm_vc) => {
  const msg_sm_vc = pasantiasStore_sm_vc.enviarInforme({
    materia_id_sm_vc: props.materiaId,
    ...payload_sm_vc
  })
  emit('mensajeEnviado', msg_sm_vc)
}

const handleResponderCorreccion_sm_vc = (payload_sm_vc) => {
  const msg_sm_vc = pasantiasStore_sm_vc.responderCorreccion({
    estudiante_id_sm_vc: props.estudianteId,
    materia_id_sm_vc: props.materiaId,
    ...payload_sm_vc
  })
  emit('mensajeEnviado', msg_sm_vc)
}

const handleGuardarRequisitos_sm_vc = (ids_sm_vc) => {
  const msg_sm_vc = pasantiasStore_sm_vc.aprobarRequisitosGranular({
    estudiante_id_sm_vc: props.estudianteId,
    materia_id_sm_vc: props.materiaId,
    requisitos_seleccionados_ids: ids_sm_vc
  })
  if (msg_sm_vc) emit('mensajeEnviado', msg_sm_vc)
}
</script>

<style scoped>
.doc-chat-root_sm_vc {
  display: flex; flex-direction: column; gap: 0;
  font-family: var(--sn-font-mono);
}
.readonly-banner_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  padding: .75rem 1.25rem;
  background: rgba(158,158,158,.04);
  border-top: 1px solid rgba(158,158,158,.12);
  font-size: .68rem; color: #616161; font-family: var(--sn-font-sans);
}
</style>