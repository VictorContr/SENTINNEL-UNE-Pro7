<template>
  <q-page class="sntnl-page">
    <q-btn flat no-caps icon="arrow_back" label="Volver a Trazabilidad" color="grey-5" size="sm"
      class="q-mb-md back-btn" @click="router.push('/estudiante/trazabilidad')" />

    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="history" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title">Historial de Materia</h1>
      </div>
      <p class="page-subtitle">
        Materia: <span class="code-tag">{{ materia_id_sm_vc }}</span>
        · Solo lectura — <span class="aprobado-text">Aprobada</span>
      </p>
    </div>

    <!-- Resumen de aprobación -->
    <div v-if="progreso" class="aprobacion-banner">
      <div class="banner-icon"><q-icon name="check_circle" size="22px" color="teal-3" /></div>
      <div>
        <p class="banner-title">Materia Aprobada</p>
        <p class="banner-detail">
          Nota: <span class="nota-val">{{ progreso.nota_sm_dec }}/20</span>
          · Fecha: {{ formatDate(progreso.fecha_aprobacion_sm_vc) }}
          · Intentos: {{ progreso.intentos_sm_int }}
        </p>
      </div>
    </div>

    <!-- Conversación (solo lectura) -->
    <div v-if="auth.user && progreso" class="conv-card">
      <DocumentConversacion
        :materia-id="materia_id_sm_vc"
        :estudiante-id="auth.user.id_sm_vc"
        :readonly="true"
        :estado-progreso="'APROBADO'"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

const route  = useRoute()
const router = useRouter()
const store  = usePasantiasStore()
const auth   = useAuthStore()

const materia_id_sm_vc = computed(() => route.params.materia_id)

const progreso = computed(() =>
  store.progreso_sm_vc.find(
    (p) => p.estudiante_id_sm_vc === auth.user?.id_sm_vc && p.materia_id_sm_vc === materia_id_sm_vc.value
  ) ?? null
)

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
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
.aprobado-text { color: var(--sn-primario); font-weight: 600; }
.aprobacion-banner { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; background: rgba(111,255,233,0.05); border: 1px solid rgba(111,255,233,0.15); border-radius: 10px; margin-bottom: 1.25rem; max-width: 600px; }
.banner-icon { flex-shrink: 0; }
.banner-title { font-size: 0.85rem; font-weight: 600; color: var(--sn-primario); margin: 0 0 2px; font-family: var(--sn-font-mono); }
.banner-detail { font-size: 0.7rem; color: var(--sn-texto-secundario); margin: 0; font-family: var(--sn-font-sans); }
.nota-val { color: var(--sn-texto-principal); font-weight: 700; }
.conv-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(111,255,233,0.1); border-radius: 14px; overflow: hidden; max-width: 780px; }
</style>
