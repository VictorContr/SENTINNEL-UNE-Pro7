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

    <div class="conv-card">
      <DocumentConversacion
        :materia-id="materiaId"
        :estudiante-id="estudianteId"
        :readonly="false"
        :estado-progreso="estadoActual"
        @mensajeEnviado="onMensajeEnviado"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

const route  = useRoute()
const router = useRouter()
const $q     = useQuasar()
const store  = usePasantiasStore()

const estudianteId = computed(() => route.params.id_sm_vc)
const materiaId    = computed(() => route.params.materia_id)

const estadoActual = computed(() => {
  const prog = store.progreso_sm.find(
    (p) => p.estudiante_id_sm_vc === estudianteId.value && p.materia_id_sm_vc === materiaId.value
  )
  return prog?.estado_aprobacion_sm_vc ?? 'PENDIENTE'
})

function onMensajeEnviado(msg) {
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
.page-title { font-size: 1.2rem; font-weight: 700; color: #c8dde8; letter-spacing: 0.06em; margin: 0; font-family: 'IBM Plex Mono', monospace; }
.page-subtitle { font-size: 0.72rem; color: #3a5a78; margin: 0; }
.code-tag { background: rgba(111,255,233,0.08); color: #5bc0be; padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; font-family: 'IBM Plex Mono', monospace; }
.conv-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(111,255,233,0.1); border-radius: 14px; overflow: hidden; max-width: 780px; }
</style>
