<template>
  <q-page class="sntnl-page">
    <q-btn flat no-caps icon="arrow_back" label="Volver a Trazabilidad" color="grey-5" size="sm"
      class="q-mb-md back-btn"
      @click="router.push(`/profesor/estudiantes/${route.params.id_sm_vc}/trazabilidad`)" />

    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="forum" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title">Conversación de Documentos</h1>
      </div>
      <p class="page-subtitle">
        Estudiante: <span class="code-tag">{{ route.params.id_sm_vc }}</span>
        · Materia: <span class="code-tag">{{ materiaId }}</span>
      </p>
    </div>

    <!-- Estado de carga mientras se inicializa el store -->
    <div v-if="cargandoContexto_sm_vc" class="loading-contexto_sm_vc">
      <q-spinner-dots color="teal-3" size="34px" />
      <span>Cargando contexto académico...</span>
    </div>

    <!-- Conversación: solo se monta cuando las materias y el progreso están disponibles -->
    <div v-else class="conv-card">
      <DocumentConversacion
        :materia-id="materiaId"
        :estudiante-id="estudianteId"
        :readonly="estadoActual === 'APROBADO'"
        :estado-progreso="estadoActual"
        @mensajeEnviado="onMensajeEnviado"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

const route  = useRoute()
const router = useRouter()
const $q     = useQuasar()
const store  = usePasantiasStore()

// ── IDs resueltos desde los params del router ──
// El profesor navega a /profesor/estudiantes/:id_sm_vc/materia/:materia_id/conversacion
const estudianteId = computed(() => route.params.id_sm_vc)
const materiaId    = computed(() => route.params.materia_id)

// ── Estado de carga del contexto académico ──
// Se mantiene en true hasta que el onMounted garantice que materias y progreso
// están en el store, evitando la condición de carrera en DocumentConversacion.
const cargandoContexto_sm_vc = ref(true)

/**
 * Carga asíncrona del contexto mínimo necesario para que DocumentConversacion
 * pueda resolver la materia por ID y el historial por (estudianteId, materiaId).
 *
 * Se ejecutan en paralelo para minimizar el tiempo de espera.
 */
onMounted(async () => {
  if (estudianteId.value) {
    await Promise.all([
      // Garantiza que el catálogo de materias esté disponible (getMateriaById safe)
      store.ensure_materias_cargadas_sm_vc(),
      // Carga el progreso del estudiante (estado de aprobación, requisitos)
      store.fetch_progreso_estudiante_sm_vc(estudianteId.value)
    ])
  }
  cargandoContexto_sm_vc.value = false
})

/**
 * Estado actual de aprobación de la materia para este estudiante.
 * SAFE: Si no se encuentra, devuelve 'PENDIENTE' (no bloquea el UI).
 *
 * FIX: ahora accede a `store.progreso_sm_vc` (sufijo correcto).
 */
const estadoActual = computed(() => {
  const prog = store.progreso_sm_vc.find(
    (p) =>
      String(p.estudiante_id_sm_vc) === String(estudianteId.value) &&
      String(p.materia_id_sm_vc)    === String(materiaId.value)
  )
  return prog?.estado_aprobacion_sm_vc ?? 'PENDIENTE'
})

function onMensajeEnviado() {
  $q.notify({
    type: 'positive',
    message: 'Corrección enviada.',
    icon: 'check_circle',
    position: 'top-right',
    timeout: 2500
  })
}
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.back-btn { font-size: 0.72rem !important; }
.page-header { margin-bottom: 1.25rem; }
.page-title-row { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: 0.06em; margin: 0; font-family: var(--sn-font-mono); }
.page-subtitle { font-size: 0.72rem; color: var(--sn-texto-terciario); margin: 0; }
.code-tag { background: rgba(111,255,233,0.08); color: var(--sn-acento-sec); padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; font-family: var(--sn-font-mono); }
.conv-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(111,255,233,0.1); border-radius: 14px; max-width: 780px; }

/* ── Estado de carga del contexto académico ── */
.loading-contexto_sm_vc {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  font-size: 0.8rem;
  color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono);
}
</style>
