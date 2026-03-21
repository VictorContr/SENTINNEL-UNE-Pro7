<template>
  <q-page class="sntnl-page">
    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="track_changes" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title">Mi Trazabilidad</h1>
      </div>
      <p class="page-subtitle">
        Progreso de tus 3 materias de pasantía ·
        Cohorte: <span class="code-tag">{{ auth.user?.cohorte_sm_vc }}</span>
        · Profesor: <span class="code-tag">{{ auth.user?.profesor_id_sm_vc }}</span>
      </p>
    </div>

    <!-- Barra de progreso global -->
    <div class="global-progress-bar-wrap">
      <div class="global-progress-info">
        <span>Progreso general</span>
        <span class="global-pct">{{ progresoGlobal }}%</span>
      </div>
      <q-linear-progress :value="progresoGlobal / 100" color="teal-3" track-color="blue-grey-10" rounded size="6px" />
    </div>

    <!-- Grid de materias con el componente compartido -->
    <div class="materias-grid">
      <MateriaProgressCard
        v-for="materia in store.miProgreso" :key="materia.id_sm_vc"
        :materia="materia" :estudiante-id="auth.user.id_sm_vc"
        :show-description="true" :show-requisitos="true"
        @click="handleMateriaClick"
      />
    </div>

    <!-- Deploy CTA si todas están aprobadas -->
    <transition name="slide-up">
      <div v-if="store.todasAprobadas" class="deploy-cta">
        <div class="deploy-cta-icon"><q-icon name="rocket_launch" size="28px" color="teal-3" /></div>
        <div class="deploy-cta-text">
          <p class="deploy-cta-title">¡Todas las materias aprobadas!</p>
          <p class="deploy-cta-desc">
            {{ store.miDeploy ? 'Tu deploy está registrado. Puedes actualizarlo.' : 'Ya puedes registrar tu proyecto de deploy final.' }}
          </p>
        </div>
        <q-btn unelevated no-caps :label="store.miDeploy ? 'Actualizar Deploy' : 'Ir a Deploy'"
          icon-right="arrow_forward" class="deploy-cta-btn"
          @click="router.push('/estudiante/deploy')" />
      </div>
    </transition>

    <!-- Panel de envío de informe (si hay materia activa seleccionada) -->
    <div v-if="materiaActiva" class="materia-activa-panel">
      <div class="panel-header">
        <div class="panel-title">
          <q-icon name="edit_document" size="16px" color="teal-3" />
          <span>Enviar Informe — {{ materiaActiva.nombre_sm_vc }}</span>
        </div>
        <q-btn flat round dense icon="close" color="grey-6" size="sm" @click="materiaActiva = null" />
      </div>
      <div class="conv-embed">
        <DocumentConversacion
          :materia-id="materiaActiva.id_sm_vc"
          :estudiante-id="auth.user.id_sm_vc"
          :readonly="materiaActiva.estado_aprobacion_sm_vc === 'APROBADO'"
          :estado-progreso="materiaActiva.estado_aprobacion_sm_vc"
          @mensajeEnviado="onMensajeEnviado"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import MateriaProgressCard from 'src/components/shared/MateriaProgressCard.vue'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

const router = useRouter()
const $q = useQuasar()
const store = usePasantiasStore()
const auth = useAuthStore()

const materiaActiva = ref(null)

const progresoGlobal = computed(() => {
  const items = store.miProgreso
  if (!items.length) return 0
  const suma_progresos = items.reduce((sum, current) => sum + (current.progreso_decimal || 0), 0)
  return Math.round((suma_progresos / items.length) * 100)
})

function handleMateriaClick(materia) {
  if (materia.estado_aprobacion_sm_vc === 'APROBADO') {
    router.push(`/estudiante/materia/${materia.id_sm_vc}/historial`)
  } else if (!materia.bloqueada) {
    materiaActiva.value = materiaActiva.value?.id_sm_vc === materia.id_sm_vc ? null : materia
  }
}

function onMensajeEnviado() {
  $q.notify({ type: 'positive', message: 'Informe enviado al profesor.', icon: 'send', position: 'top-right', timeout: 2500 })
}
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; min-height: 100vh; font-family: var(--sn-font-mono); }
.page-header { margin-bottom: 1.5rem; }
.page-title-row { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: 0.06em; margin: 0; }
.page-subtitle { font-size: 0.72rem; color: var(--sn-texto-terciario); margin: 0; font-family: var(--sn-font-sans); }
.code-tag { background: rgba(111,255,233,0.08); color: var(--sn-acento-sec); padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; }

.global-progress-bar-wrap { margin-bottom: 1.5rem; max-width: 600px; }
.global-progress-info { display: flex; justify-content: space-between; font-size: 0.62rem; color: var(--sn-texto-apagado); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.1em; }
.global-pct { color: var(--sn-primario); font-weight: 700; }

.materias-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
@media (max-width: 900px) { .materias-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }

.deploy-cta { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; background: rgba(111,255,233,0.05); border: 1px solid rgba(111,255,233,0.2); border-radius: 12px; max-width: 700px; margin-bottom: 1.5rem; flex-wrap: wrap; }
.deploy-cta-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(111,255,233,0.08); border: 1px solid rgba(111,255,233,0.2); flex-shrink: 0; }
.deploy-cta-text { flex: 1; }
.deploy-cta-title { font-size: 0.88rem; font-weight: 600; color: var(--sn-primario); margin: 0 0 2px; }
.deploy-cta-desc { font-size: 0.72rem; color: var(--sn-texto-secundario); margin: 0; font-family: var(--sn-font-sans); }
.deploy-cta-btn { background: #6fffe9 !important; color: #0b132b !important; font-size: 0.72rem !important; font-weight: 700 !important; border-radius: 6px !important; }

.materia-activa-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(111,255,233,0.12); border-radius: 14px; overflow: hidden; max-width: 780px; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1.25rem; border-bottom: 1px solid rgba(111,255,233,0.08); background: rgba(0,0,0,0.2); }
.panel-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: var(--sn-acento-sec); letter-spacing: 0.06em; text-transform: uppercase; }

.slide-up-enter-active { transition: all 0.3s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(10px); }
</style>
