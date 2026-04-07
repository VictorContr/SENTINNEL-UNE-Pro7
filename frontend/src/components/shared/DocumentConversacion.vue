<!-- ══════════════════════════════════════════════════════════════════
     DocumentConversacion.vue — Orquestador Polimórfico de Diálogos.
     Patrón Smart Component: se conecta al store, resuelve el contexto
     y delega a componentes Dumb (ConvMessages o ConvTimeline).

     Modo Chat (esTrazabilidad_sm_vc = false):
       → DocumentCards + Formularios de acción (Estudiante/Profesor)
     Modo Trazabilidad (esTrazabilidad_sm_vc = true):
       → Timeline cronológico interactivo con cards de documento embebidas
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="doc-chat-root_sm_vc">

    <!-- ── ESTADO: Cargando ── -->
    <div v-if="conversacionStore_sm_vc.cargando_sm_vc" class="loading-state_sm_vc">
      <q-spinner-dots color="teal-3" size="36px" />
      <span class="loading-label_sm_vc">Cargando trazabilidad...</span>
    </div>

    <!-- ── ESTADO: Error de carga ── -->
    <div v-else-if="conversacionStore_sm_vc.error_sm_vc" class="error-state_sm_vc">
      <q-icon name="error_outline" size="28px" color="negative" />
      <span>{{ conversacionStore_sm_vc.error_sm_vc }}</span>
    </div>

    <!-- ── CONTENIDO PRINCIPAL ── -->
    <template v-else>

      <!-- Cabecera global (siempre visible) -->
      <ConvHeader
        :materia="materia_sm_vc"
        :estado-progreso="estadoProgreso"
        :total-mensajes="mensajesOrdenados_sm_vc.length" />

      <!-- ══ MODO TRAZABILIDAD: Timeline Cronológico ══ -->
      <ConvTimeline
        v-if="esTrazabilidad_sm_vc"
        :eventos="mensajesOrdenados_sm_vc"
        :cargando="conversacionStore_sm_vc.cargando_sm_vc" />

      <!-- ══ MODO CHAT / DOCUMENTAL: Burbuja de mensajes ══ -->
      <template v-else>
        <ConvMessages
          :mensajes="mensajesOrdenados_sm_vc"
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

    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import { useConversacionStore_sm_vc } from 'src/stores/conversacionStore'

/* Componentes Atómicos */
import ConvHeader from './conv/ConvHeader.vue'
import ConvMessages from './conv/ConvMessages.vue'
import ConvTimeline from './conv/ConvTimeline.vue'
import ConvFormEstudiante from './conv/ConvFormEstudiante.vue'
import ConvFormProfesor from './conv/ConvFormProfesor.vue'

/* ── Props ── */
const props = defineProps({
  materiaId:           { type: [String, Number], default: null },
  estudianteId:        { type: [String, Number], default: null },
  readonly:            { type: Boolean, default: false },
  estadoProgreso:      { type: String, default: null },
  /**
   * esTrazabilidad_sm_vc: true  → renderiza ConvTimeline (log cronológico)
   *                        false → renderiza ConvMessages (chat documental)
   */
  esTrazabilidad_sm_vc: { type: Boolean, default: false }
})

const emit = defineEmits(['mensajeEnviado'])

/* ── Stores ── */
const pasantiasStore_sm_vc    = usePasantiasStore()
const auth_sm_vc              = useAuthStore()
const conversacionStore_sm_vc = useConversacionStore_sm_vc()

/* ── Lógica de ID de Estudiante: Prop > Fallback a auth ── */
const idEstudianteFinal_sm_vc = computed(() =>
  props.estudianteId || auth_sm_vc.user?.id_sm_vc || null
)

/* ── Lifecycle: carga inicial y recarga reactiva al cambiar de estudiante o materia ── */
const cargarDatos_sm_vc = () => {
  if (idEstudianteFinal_sm_vc.value) {
    // Pasamos el materiaId al store para segmentar el historial.
    // Si no hay materiaId (null), el store devuelve el historial global.
    conversacionStore_sm_vc.obtenerConversacion_sm_vc(
      idEstudianteFinal_sm_vc.value,
      props.materiaId ?? null,
    )
  }
}

onMounted(cargarDatos_sm_vc)

// Recargar si el ID de estudiante cambia (navegación entre perfiles de Profesor)
watch(idEstudianteFinal_sm_vc, (nuevoId_sm_vc, viejoId_sm_vc) => {
  if (nuevoId_sm_vc && nuevoId_sm_vc !== viejoId_sm_vc) {
    conversacionStore_sm_vc.limpiarConversaciones_sm_vc()
    cargarDatos_sm_vc()
  }
})

// Recargar si la materia cambia (el profesor abre otra materia del mismo estudiante)
watch(() => props.materiaId, (nuevaMateria_sm_vc, viejaMateria_sm_vc) => {
  if (nuevaMateria_sm_vc !== viejaMateria_sm_vc) {
    conversacionStore_sm_vc.limpiarConversaciones_sm_vc()
    cargarDatos_sm_vc()
  }
})

/* ── Computed: Mensajes ordenados cronológicamente (Frontend Safety Sort) ── */
const mensajesOrdenados_sm_vc = computed(() => {
  const lista_sm_vc = conversacionStore_sm_vc.conversaciones_sm_vc || []
  // Orden ascendente: el mensaje más antiguo primero (mismo que el backend devuelve)
  return [...lista_sm_vc].sort((a_sm_vc, b_sm_vc) => {
    const ta_sm_vc = new Date(a_sm_vc.fecha_creacion_sm_vc).getTime()
    const tb_sm_vc = new Date(b_sm_vc.fecha_creacion_sm_vc).getTime()
    return ta_sm_vc - tb_sm_vc
  })
})

/* ── Computed: Rol del usuario autenticado ── */
const userRol_sm_vc = computed(() => auth_sm_vc.user?.rol_sm_vc ?? null)

/* ── Computed: Materia activa (si existe la prop materiaId) ── */
const materia_sm_vc = computed(() =>
  props.materiaId ? pasantiasStore_sm_vc.getMateriaById(props.materiaId) : null
)

/* ── Computed: Requisitos de la materia activa ── */
const requisitos_sm_vc = computed(() =>
  materia_sm_vc.value?.requisitos ?? []
)

/* ── Computed: Requisitos ya aprobados para pre-marcar el form del Profesor ── */
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

/* ── Handlers — delegan al store de pasantías ── */
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

/* ── Estado de carga ── */
.loading-state_sm_vc {
  display: flex; flex-direction: column; align-items: center;
  gap: .75rem; padding: 3rem 1.5rem;
}
.loading-label_sm_vc {
  font-size: .7rem; color: var(--sn-texto-apagado);
  letter-spacing: .08em; text-transform: uppercase;
  font-family: var(--sn-font-mono);
}

/* ── Estado de error ── */
.error-state_sm_vc {
  display: flex; align-items: center; gap: .75rem;
  padding: 1.25rem 1.5rem;
  background: rgba(220,38,38,.06);
  border: 1px solid rgba(220,38,38,.2);
  border-radius: 10px; margin: 1rem;
  font-size: .78rem; color: var(--q-negative);
}

/* ── Banner de solo lectura ── */
.readonly-banner_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  padding: .75rem 1.25rem;
  background: rgba(158,158,158,.04);
  border-top: 1px solid rgba(158,158,158,.12);
  font-size: .68rem; color: #616161; font-family: var(--sn-font-sans);
}
</style>