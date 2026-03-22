<!-- ══════════════════════════════════════════════════════════════════
     TrazabilidadPage.vue (estudiante) — Progreso de las 3 materias.
     Thin Page: computed puro para progreso global, handlers que solo
     delegan al store. Sufijos _sm_vc en todas las variables internas.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">

    <!-- Header -->
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="track_changes" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Mi Trazabilidad</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Progreso de tus 3 materias de pasantía ·
        Cohorte: <span class="code-tag_sm_vc">{{ auth_sm_vc.user?.cohorte_sm_vc }}</span>
        · Profesor: <span class="code-tag_sm_vc">{{ auth_sm_vc.user?.profesor_id_sm_vc }}</span>
      </p>
    </div>

    <!-- Barra de progreso global -->
    <div class="global-progress-wrap_sm_vc">
      <div class="global-progress-info_sm_vc">
        <span>Progreso general</span>
        <span class="global-pct_sm_vc">{{ progresoGlobal_sm_vc }}%</span>
      </div>
      <q-linear-progress
        :value="progresoGlobal_sm_vc / 100"
        color="teal-3" track-color="blue-grey-10"
        rounded size="6px" />
    </div>

    <!-- Grid de materias -->
    <div class="materias-grid_sm_vc">
      <MateriaProgressCard
        v-for="materia in store_sm_vc.miProgreso"
        :key="materia.id_sm_vc"
        :materia="materia"
        :estudiante-id="auth_sm_vc.user.id_sm_vc"
        :show-description="true"
        :show-requisitos="true"
        @click="handleMateriaClick_sm_vc" />
    </div>

    <!-- CTA deploy (solo si todas aprobadas) -->
    <transition name="slide-up">
      <div v-if="store_sm_vc.todasAprobadas" class="deploy-cta_sm_vc">
        <div class="deploy-cta-icon_sm_vc">
          <q-icon name="rocket_launch" size="28px" color="teal-3" />
        </div>
        <div class="deploy-cta-text_sm_vc">
          <p class="deploy-cta-title_sm_vc">¡Todas las materias aprobadas!</p>
          <p class="deploy-cta-desc_sm_vc">
            {{ store_sm_vc.miDeploy
              ? 'Tu deploy está registrado. Puedes actualizarlo.'
              : 'Ya puedes registrar tu proyecto de deploy final.' }}
          </p>
        </div>
        <q-btn
          unelevated no-caps
          :label="store_sm_vc.miDeploy ? 'Actualizar Deploy' : 'Ir a Deploy'"
          icon-right="arrow_forward"
          class="deploy-cta-btn_sm_vc"
          @click="router_sm_vc.push('/estudiante/deploy')" />
      </div>
    </transition>

    <!-- Panel de conversación de la materia activa -->
    <div v-if="materiaActiva_sm_vc" class="materia-activa-panel_sm_vc">
      <div class="panel-header_sm_vc">
        <div class="panel-title_sm_vc">
          <q-icon name="edit_document" size="16px" color="teal-3" />
          <span>Enviar Informe — {{ materiaActiva_sm_vc.nombre_sm_vc }}</span>
        </div>
        <q-btn flat round dense icon="close" color="grey-6" size="sm"
          @click="materiaActiva_sm_vc = null" />
      </div>
      <div class="conv-embed_sm_vc">
        <DocumentConversacion
          :materia-id="materiaActiva_sm_vc.id_sm_vc"
          :estudiante-id="auth_sm_vc.user.id_sm_vc"
          :readonly="materiaActiva_sm_vc.estado_aprobacion_sm_vc === 'APROBADO'"
          :estado-progreso="materiaActiva_sm_vc.estado_aprobacion_sm_vc"
          @mensaje-enviado="onMensajeEnviado_sm_vc" />
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

const router_sm_vc  = useRouter()
const $q_sm_vc      = useQuasar()
const store_sm_vc   = usePasantiasStore()
const auth_sm_vc    = useAuthStore()

const materiaActiva_sm_vc = ref(null)

const progresoGlobal_sm_vc = computed(() => {
  const items_sm_vc = store_sm_vc.miProgreso
  if (!items_sm_vc.length) return 0
  const suma_sm_vc = items_sm_vc.reduce((acc, m) => acc + (m.progreso_decimal || 0), 0)
  return Math.round((suma_sm_vc / items_sm_vc.length) * 100)
})

const handleMateriaClick_sm_vc = (materia_sm_vc) => {
  if (materia_sm_vc.estado_aprobacion_sm_vc === 'APROBADO') {
    router_sm_vc.push(`/estudiante/materia/${materia_sm_vc.id_sm_vc}/historial`)
    return
  }
  if (materia_sm_vc.bloqueada) return
  materiaActiva_sm_vc.value =
    materiaActiva_sm_vc.value?.id_sm_vc === materia_sm_vc.id_sm_vc ? null : materia_sm_vc
}

const onMensajeEnviado_sm_vc = () => {
  $q_sm_vc.notify({
    type: 'positive',
    message: 'Informe enviado al profesor.',
    icon: 'send',
    position: 'top-right',
    timeout: 2500
  })
}
</script>

<style scoped>
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; min-height: 100vh; font-family: var(--sn-font-mono); }
.page-header_sm_vc { margin-bottom: 1.5rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.page-title_sm_vc { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: .06em; margin: 0; }
.page-subtitle_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; font-family: var(--sn-font-sans); }
.code-tag_sm_vc { background: rgba(111,255,233,.08); color: var(--sn-acento-sec); padding: 1px 5px; border-radius: 3px; font-size: .68rem; }
.global-progress-wrap_sm_vc { margin-bottom: 1.5rem; max-width: 600px; }
.global-progress-info_sm_vc { display: flex; justify-content: space-between; font-size: .62rem; color: var(--sn-texto-apagado); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .1em; }
.global-pct_sm_vc { color: var(--sn-primario); font-weight: 700; }
.materias-grid_sm_vc { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
@media (max-width: 900px) { .materias-grid_sm_vc { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }
.deploy-cta_sm_vc { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; background: rgba(111,255,233,.05); border: 1px solid rgba(111,255,233,.2); border-radius: 12px; max-width: 700px; margin-bottom: 1.5rem; flex-wrap: wrap; }
.deploy-cta-icon_sm_vc { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(111,255,233,.08); border: 1px solid rgba(111,255,233,.2); flex-shrink: 0; }
.deploy-cta-text_sm_vc { flex: 1; }
.deploy-cta-title_sm_vc { font-size: .88rem; font-weight: 600; color: var(--sn-primario); margin: 0 0 2px; }
.deploy-cta-desc_sm_vc { font-size: .72rem; color: var(--sn-texto-secundario); margin: 0; font-family: var(--sn-font-sans); }
.deploy-cta-btn_sm_vc { background: #6fffe9 !important; color: #0b132b !important; font-size: .72rem !important; font-weight: 700 !important; border-radius: 6px !important; }
.materia-activa-panel_sm_vc { background: rgba(255,255,255,.02); border: 1px solid rgba(111,255,233,.12); border-radius: 14px; overflow: hidden; max-width: 780px; }
.panel-header_sm_vc { display: flex; align-items: center; justify-content: space-between; padding: .875rem 1.25rem; border-bottom: 1px solid rgba(111,255,233,.08); background: rgba(0,0,0,.2); }
.panel-title_sm_vc { display: flex; align-items: center; gap: .5rem; font-size: .72rem; color: var(--sn-acento-sec); letter-spacing: .06em; text-transform: uppercase; }
.slide-up-enter-active { transition: all .3s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(10px); }
</style>