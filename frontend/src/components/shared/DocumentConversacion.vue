<!-- ══════════════════════════════════════════════════════════════════
     DocumentConversacion.vue — Orquestador Polimórfico de Diálogos.
     Actúa como visor de documentos (Chat) o Trazabilidad (Timeline)
     según el prop esTrazabilidad_sm_vc.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="doc-chat-root_sm_vc">
    <!-- ── MODO TRAZABILIDAD (Timeline de Eventos) ── -->
    <template v-if="esTrazabilidad_sm_vc">
      <ConvTimeline
        :eventos="conversacionStore_sm_vc.conversaciones_sm_vc"
        :cargando="conversacionStore_sm_vc.cargando_sm_vc"
      />
    </template>

    <!-- ── MODO DOCUMENTAL (Chat de Archivos) ── -->
    <template v-else>
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
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import { useConversacionStore_sm_vc } from 'src/stores/conversacionStore'

/* Componentes Atómicos */
import ConvHeader from './conv/ConvHeader.vue'
import ConvMessages from './conv/ConvMessages.vue'
import ConvFormEstudiante from './conv/ConvFormEstudiante.vue'
import ConvFormProfesor from './conv/ConvFormProfesor.vue'
import ConvTimeline from './conv/ConvTimeline.vue'

/* ── Props ── */
const props = defineProps({
  materiaId:        { type: [String, Number], default: null },
  estudianteId:     { type: [String, Number], default: null }, // Opcional: fallback a authStore
  readonly:         { type: Boolean, default: false },
  estadoProgreso:   { type: String, default: null },
  esTrazabilidad_sm_vc: { type: Boolean, default: false } // Trigger del polimorfismo
})

const emit = defineEmits(['mensajeEnviado'])

/* ── Stores ── */
const pasantiasStore_sm_vc    = usePasantiasStore()
const auth_sm_vc              = useAuthStore()
const conversacionStore_sm_vc = useConversacionStore_sm_vc()

/* ── Lógica de ID de Estudiante (Prop o Fallback) ── */
const idEstudianteFinal_sm_vc = computed(() => {
  return props.estudianteId || auth_sm_vc.user?.id_sm_vc || null
})

/* ── Lifecycle ── */
onMounted(() => {
  // Si estamos en modo trazabilidad, disparamos la carga inicial
  if (props.esTrazabilidad_sm_vc && idEstudianteFinal_sm_vc.value) {
    conversacionStore_sm_vc.obtenerConversacion_sm_vc(idEstudianteFinal_sm_vc.value)
  }
})

/* ── Computed (Modo Documental) ── */
const userRol_sm_vc = computed(() => auth_sm_vc.user?.rol_sm_vc ?? null)

const materia_sm_vc = computed(() =>
  props.materiaId ? pasantiasStore_sm_vc.getMateriaById(props.materiaId) : null
)

const requisitos_sm_vc = computed(() =>
  materia_sm_vc.value?.requisitos ?? []
)

const mensajes_sm_vc = computed(() =>
  pasantiasStore_sm_vc.getConversacion(idEstudianteFinal_sm_vc.value, props.materiaId)
)

const requisitosAprobadosIniciales_sm_vc = computed(() => {
  if (!props.materiaId || !idEstudianteFinal_sm_vc.value) return []
  const prog_sm_vc = pasantiasStore_sm_vc.progreso_sm_vc.find(
    (p) =>
      p.estudiante_id_sm_vc === idEstudianteFinal_sm_vc.value &&
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
    estudiante_id_sm_vc: idEstudianteFinal_sm_vc.value,
    materia_id_sm_vc: props.materiaId,
    ...payload_sm_vc
  })
  emit('mensajeEnviado', msg_sm_vc)
}

const handleGuardarRequisitos_sm_vc = (ids_sm_vc) => {
  const msg_sm_vc = pasantiasStore_sm_vc.aprobarRequisitosGranular({
    estudiante_id_sm_vc: idEstudianteFinal_sm_vc.value,
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
  width: 100%;
}
.readonly-banner_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  padding: .75rem 1.25rem;
  background: rgba(158,158,158,.04);
  border-top: 1px solid rgba(158,158,158,.12);
  font-size: .68rem; color: #616161; font-family: var(--sn-font-sans);
}
</style>