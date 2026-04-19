<!-- ══════════════════════════════════════════════════════════════════
     TrazabilidadPage.vue (estudiante) — Progreso secuencial de las 4
     materias del programa de grado mediante un Stepper Vertical.
     Thin Page: toda la lógica de estado viene de pasantiasStore.
     La tarjeta de cada materia es renderizada por <MateriaProgressCard>.
     Sufijos _sm_vc en todas las variables reactivas internas.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">

    <div v-if="!materiaActiva_sm_vc">
      <!-- ── Header ── -->
      <div class="page-header_sm_vc">
        <div class="page-title-row_sm_vc">
          <q-icon name="track_changes" size="22px" color="teal-3" class="q-mr-sm" />
          <h1 class="page-title_sm_vc">
            {{ auth_sm_vc.user_sm_vc?.nombre_sm_vc ?? 'Estudiante' }} {{ auth_sm_vc.user_sm_vc?.apellido_sm_vc ?? '' }}
          </h1>
        </div>
        <div class="traz-ficha-meta_sm_vc">
          <span class="trz-meta-item_sm_vc">
            <q-icon name="badge" size="15px" />
            {{ auth_sm_vc.user_sm_vc?.cedula_sm_vc }}
          </span>
          <span v-if="auth_sm_vc.user_sm_vc?.correo_sm_vc" class="trz-meta-item_sm_vc">
            <q-icon name="email" size="15px" />
            {{ auth_sm_vc.user_sm_vc.correo_sm_vc }}
          </span>
          <span v-if="auth_sm_vc.user_sm_vc?.rol_sm_vc" class="trz-meta-item_sm_vc">
            <q-icon name="school" size="15px" />
            {{ auth_sm_vc.user_sm_vc.rol_sm_vc }}
          </span>
          <span v-if="auth_sm_vc.user_sm_vc?.cohorte_sm_vc" class="trz-meta-item_sm_vc">
            <q-icon name="calendar_month" size="15px" />
            Periodo: {{ auth_sm_vc.user_sm_vc.cohorte_sm_vc }}
          </span>
          <template v-if="auth_sm_vc.user_sm_vc?.estudiante_sm_vc">
            <span v-if="auth_sm_vc.user_sm_vc.estudiante_sm_vc.profesorTutor" class="trz-meta-item_sm_vc">
              <q-icon name="local_library" size="15px" />
              Profesor: {{ auth_sm_vc.user_sm_vc.estudiante_sm_vc.profesorTutor.nombre_sm_vc }} {{ auth_sm_vc.user_sm_vc.estudiante_sm_vc.profesorTutor.apellido_sm_vc }}
            </span>
            <span v-if="auth_sm_vc.user_sm_vc.estudiante_sm_vc.tutor_empresarial_sm_vc" class="trz-meta-item_sm_vc">
              <q-icon name="supervisor_account" size="15px" />
              Tutor: {{ auth_sm_vc.user_sm_vc.estudiante_sm_vc.tutor_empresarial_sm_vc }}
            </span>
            <span v-if="auth_sm_vc.user_sm_vc.estudiante_sm_vc.empresa_sm_vc" class="trz-meta-item_sm_vc">
              <q-icon name="business" size="15px" />
              Empresa: {{ auth_sm_vc.user_sm_vc.estudiante_sm_vc.empresa_sm_vc }}
            </span>
            <span v-if="auth_sm_vc.user_sm_vc.estudiante_sm_vc.titulo_proyecto_sm_vc" class="trz-meta-item_sm_vc">
              <q-icon name="work" size="15px" />
              Proyecto: {{ auth_sm_vc.user_sm_vc.estudiante_sm_vc.titulo_proyecto_sm_vc }}
            </span>
          </template>
        </div>
      </div>

      <!-- ── Barra de progreso global ── -->
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

      <!-- ══════════════════════════════════════════════════════════════
           STEPPER VERTICAL — Cada step = una materia del programa.
           El paso activo se controla con stepActivo_sm_vc (ref local).
           ══════════════════════════════════════════════════════════════ -->
      <q-stepper
        v-model="stepActivo_sm_vc"
        vertical
        animated
        flat
        class="stepper_sm_vc"
        active-color="teal-3"
        done-color="teal-4"
        inactive-color="blue-grey-7"
      >
        <!--
          v-for genera un <q-step> por cada materia computada.
          La prop :disable se calcula con el campo `bloqueada` que el store
          ya resuelve: una materia está bloqueada si la anterior NO es APROBADO.
        -->
        <q-step
          v-for="materia in materiasConFases_sm_vc"
          :key="materia.id_sm_vc"
          :name="materia.id_sm_vc"
          :title="materia.nombre_sm_vc"
          :caption="materia.captionFase_sm_vc"
          :icon="materia.icono_sm_vc"
          :done="materia.estado_aprobacion_sm_vc === 'APROBADO'"
          :disable="materia.bloqueada"
          :error="materia.estado_aprobacion_sm_vc === 'REPROBADO'"
          :active-icon="materia.icono_sm_vc"
          :done-icon="'check_circle'"
          :error-icon="'cancel'"
          class="step-item_sm_vc"
        >
          <!--
            Cada step muestra la tarjeta de materia completa.
          -->
          <MateriaProgressCard
            :materia="materia"
            :estudiante-id="auth_sm_vc.user_sm_vc?.id_sm_vc ?? ''"
            :show-description="true"
            :show-requisitos="true"
            @click="handleMateriaClick_sm_vc"
          />

          <!-- Acciones de navegación del stepper -->
          <q-stepper-navigation class="step-nav_sm_vc">
            <q-btn
              v-if="!esPrimerStep_sm_vc(materia.id_sm_vc)"
              flat no-caps
              color="blue-grey-6"
              icon="arrow_upward"
              label="Anterior"
              size="sm"
              class="step-nav-btn_sm_vc q-mr-sm"
              @click="retrocederStep_sm_vc(materia.id_sm_vc)"
            />
            <q-btn
              v-if="!esUltimoStep_sm_vc(materia.id_sm_vc)"
              unelevated no-caps
              color="teal-3"
              text-color="dark"
              icon-right="arrow_downward"
              label="Siguiente materia"
              size="sm"
              class="step-nav-btn_sm_vc"
              :disable="materia.bloqueada || proximaDesbloqueada_sm_vc(materia.id_sm_vc) === null"
              @click="avanzarStep_sm_vc(materia.id_sm_vc)"
            />
            <q-btn
              v-if="materia.estado_aprobacion_sm_vc === 'APROBADO'"
              flat no-caps
              color="teal-3"
              icon="history"
              label="Ver historial"
              size="sm"
              class="q-ml-sm"
              @click="router_sm_vc.push(`/estudiante/materia/${materia.id_sm_vc}/historial`)"
            />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>

      <!-- ── CTA deploy (solo si todas aprobadas) ── -->
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
    </div>

    <!-- ── Panel de conversación de la materia activa ── -->
    <div v-if="materiaActiva_sm_vc" class="materia-activa-panel_sm_vc">
      <div class="panel-header_sm_vc">
        <div class="panel-title_sm_vc">
          <q-icon name="edit_document" size="16px" color="teal-3" />
          <span>Enviar Informe — {{ materiaActiva_sm_vc.nombre_sm_vc }}</span>
        </div>
        <q-btn flat no-caps icon="arrow_back" label="Volver a trazabilidad" color="teal-3" size="sm"
          @click="materiaActiva_sm_vc = null" />
      </div>
      <div class="conv-embed_sm_vc">
        <DocumentConversacion
          :materia-id="materiaActiva_sm_vc.id_sm_vc"
          :estudiante-id="auth_sm_vc.user_sm_vc?.id_sm_vc ?? ''"
          :readonly="['APROBADO', 'REPROBADO'].includes(materiasConFases_sm_vc.find(m => m.id_sm_vc === materiaActiva_sm_vc.id_sm_vc)?.estado_aprobacion_sm_vc || materiaActiva_sm_vc.estado_aprobacion_sm_vc)"
          :estado-progreso="materiasConFases_sm_vc.find(m => m.id_sm_vc === materiaActiva_sm_vc.id_sm_vc)?.estado_aprobacion_sm_vc || materiaActiva_sm_vc.estado_aprobacion_sm_vc"
          @mensaje-enviado="onMensajeEnviado_sm_vc" />
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import { useProgressBarStore } from 'src/stores/progressBarStore'
import MateriaProgressCard from 'src/components/shared/MateriaProgressCard.vue'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

/* ── Composables ── */
const router_sm_vc = useRouter()
const $q_sm_vc    = useQuasar()
const store_sm_vc = usePasantiasStore()
const auth_sm_vc  = useAuthStore()
const progressBar_sm_vc = useProgressBarStore()

onMounted(async () => {
  await store_sm_vc.fetch_mi_progreso_sm_vc()
})

/* ── Estado local del Stepper ── */
// stepActivo_sm_vc guarda el id_sm_vc de la materia cuyo step está expandido.
// Se inicializa con el id de la primera materia desbloqueada (no aprobada aún).
const stepActivo_sm_vc = ref(null)

/* ── Estado del panel de conversación ── */
const materiaActiva_sm_vc = ref(null)

/*
 * materiasConFases_sm_vc — computed que enriquece cada materia del store
 * con metadatos visuales para el stepper (ícono, caption de fase).
 *
 * LÓGICA DE BLOQUEO (prop `disable` del <q-step>):
 *   El campo `materia.bloqueada` ya viene calculado desde pasantiasStore:
 *   una materia queda bloqueada si la materia de orden_sm_int anterior
 *   NO tiene estado_aprobacion_sm_vc === 'APROBADO'.
 *   Al ser un `computed`, cualquier cambio en el store (ej. el profesor
 *   aprueba Materia 1) provoca que Vue recalcule este array y automáticamente
 *   actualiza el prop :disable del q-step correspondiente.
 */
const materiasConFases_sm_vc = computed(() =>
  progressBar_sm_vc.enriquecerMateriasTrazabilidad_sm_vc(store_sm_vc.miProgreso)
)

/*
 * watchEffect inicializa stepActivo_sm_vc en la primera materia desbloqueada
 * en cuanto la lista de materias esté disponible en el store.
 * Se usa watchEffect (y no computed) para evitar efectos secundarios dentro
 * de funciones computadas, lo que viola la regla vue/no-side-effects-in-computed-properties.
 */
watchEffect(() => {
  if (stepActivo_sm_vc.value) return   // ya inicializado, no sobreescribir
  const lista_sm_vc = materiasConFases_sm_vc.value
  if (!lista_sm_vc.length) return
  const primera_sm_vc = lista_sm_vc.find((m) => !m.bloqueada) ?? lista_sm_vc[0]
  stepActivo_sm_vc.value = primera_sm_vc.id_sm_vc
})

/* ── Progreso global ── */
const progresoGlobal_sm_vc = computed(() => {
  const items_sm_vc = store_sm_vc.miProgreso
  if (!items_sm_vc.length) return 0
  const suma_sm_vc = items_sm_vc.reduce((acc, m) => acc + (m.progreso_decimal || 0), 0)
  return Math.round((suma_sm_vc / items_sm_vc.length) * 100)
})

/* ── Helpers de navegación del stepper ── */

// Devuelve true si la materia es la última de la lista (no muestra botón "Siguiente").
const esUltimoStep_sm_vc = (id_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  return lista_sm_vc[lista_sm_vc.length - 1]?.id_sm_vc === id_sm_vc
}

// Devuelve true si la materia es la primera (no muestra botón "Anterior").
const esPrimerStep_sm_vc = (id_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  return lista_sm_vc[0]?.id_sm_vc === id_sm_vc
}

// Retrocede el stepper al step anterior.
const retrocederStep_sm_vc = (idActual_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  const idx_sm_vc   = lista_sm_vc.findIndex((m) => m.id_sm_vc === idActual_sm_vc)
  if (idx_sm_vc > 0) {
    stepActivo_sm_vc.value = lista_sm_vc[idx_sm_vc - 1].id_sm_vc
  }
}

/*
 * proximaDesbloqueada_sm_vc — Devuelve el id de la siguiente materia
 * si no está bloqueada, o null en caso contrario.
 * Se usa para desactivar el botón "Siguiente" cuando la próxima
 * materia aún está bloqueada (la actual no fue aprobada).
 */
const proximaDesbloqueada_sm_vc = (idActual_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  const idx_sm_vc   = lista_sm_vc.findIndex((m) => m.id_sm_vc === idActual_sm_vc)
  const proxima_sm_vc = lista_sm_vc[idx_sm_vc + 1]
  return proxima_sm_vc && !proxima_sm_vc.bloqueada ? proxima_sm_vc.id_sm_vc : null
}

// Avanza el stepper al siguiente step desbloqueado.
const avanzarStep_sm_vc = (idActual_sm_vc) => {
  const proxima_sm_vc = proximaDesbloqueada_sm_vc(idActual_sm_vc)
  if (proxima_sm_vc) stepActivo_sm_vc.value = proxima_sm_vc
}

/* ── Handlers de MateriaProgressCard ── */
const handleMateriaClick_sm_vc = (materia_sm_vc) => {
  if (materia_sm_vc.estado_aprobacion_sm_vc === 'APROBADO') {
    router_sm_vc.push(`/estudiante/materia/${materia_sm_vc.id_sm_vc}/historial`)
    return
  }
  if (materia_sm_vc.bloqueada) return
  // Toggle del panel de conversación documental
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
/* ── Layout principal ── */
.sntnl-page_sm_vc {
  padding: 1.75rem 2rem;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  font-family: var(--sn-font-mono);
}

/* ── Header ── */
.page-header_sm_vc  { margin-bottom: 1.5rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.page-title_sm_vc {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--sn-texto-principal);
  letter-spacing: .06em;
  margin: 0;
}
.page-subtitle_sm_vc {
  font-size: .72rem;
  color: var(--sn-texto-terciario);
  margin: 0;
  font-family: var(--sn-font-sans);
}
.traz-ficha-meta_sm_vc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1.25rem;
  margin-top: 0.75rem;
}
.trz-meta-item_sm_vc {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 15px;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans);
  font-weight: 500;
}
.code-tag_sm_vc {
  background: rgba(111,255,233,.08);
  color: var(--sn-acento-sec);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: .68rem;
}

/* ── Barra de progreso global ── */
.global-progress-wrap_sm_vc { margin-bottom: 2rem; max-width: 600px; }
.global-progress-info_sm_vc {
  display: flex;
  justify-content: space-between;
  font-size: .62rem;
  color: var(--sn-texto-apagado);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .1em;
}
.global-pct_sm_vc { color: var(--sn-primario); font-weight: 700; }

/* ── Stepper ── */
.stepper_sm_vc {
  background: transparent !important;
  border: 1px solid var(--sn-borde);
  border-radius: 14px;
  margin-bottom: 1.75rem;
  max-width: 860px;
}

/* Anula el fondo blanco por defecto de Quasar */
:deep(.q-stepper__tab) {
  font-family: var(--sn-font-mono);
}
:deep(.q-stepper__title) {
  font-size: .82rem;
  font-weight: 600;
  color: var(--sn-texto-principal);
  letter-spacing: .04em;
}
:deep(.q-stepper__caption) {
  font-size: .6rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans);
  margin-top: 2px;
}
/* Línea vertical del stepper */
:deep(.q-stepper__line) {
  border-color: var(--sn-borde) !important;
}
/* Fondo del step expandido */
:deep(.q-stepper__step-inner) {
  background: transparent;
}
/* Step deshabilitado: menor opacidad */
:deep(.q-step--disabled .q-stepper__title),
:deep(.q-step--disabled .q-stepper__caption) {
  opacity: 0.4;
}

/* ── Card dentro del step ── */
.step-item_sm_vc {
  border-bottom: 1px solid var(--sn-borde);
}
.step-item_sm_vc:last-child { border-bottom: none; }

/* ── Navegación del step ── */
.step-nav_sm_vc {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding-top: .875rem;
}
.step-nav-btn_sm_vc {
  font-size: .7rem !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
}

/* ── CTA Deploy ── */
.deploy-cta_sm_vc {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(111,255,233,.05);
  border: 1px solid rgba(111,255,233,.2);
  border-radius: 12px;
  max-width: 700px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.deploy-cta-icon_sm_vc {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(111,255,233,.08);
  border: 1px solid rgba(111,255,233,.2);
  flex-shrink: 0;
}
.deploy-cta-text_sm_vc { flex: 1; }
.deploy-cta-title_sm_vc {
  font-size: .88rem;
  font-weight: 600;
  color: var(--sn-primario);
  margin: 0 0 2px;
}
.deploy-cta-desc_sm_vc {
  font-size: .72rem;
  color: var(--sn-texto-secundario);
  margin: 0;
  font-family: var(--sn-font-sans);
}
.deploy-cta-btn_sm_vc {
  background: #6fffe9 !important;
  color: #0b132b !important;
  font-size: .72rem !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
}

/* ── Panel de conversación activa ── */
.materia-activa-panel_sm_vc {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(111,255,233,.12);
  border-radius: 14px;
  overflow: hidden;
  max-width: 780px;
}
.panel-header_sm_vc {
  display: flex; align-items: center; justify-content: space-between;
  padding: .875rem 1.25rem;
  border-bottom: 1px solid rgba(111,255,233,.08);
  background: rgba(0,0,0,.2);
}
.panel-title_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  font-size: .72rem;
  color: var(--sn-acento-sec);
  letter-spacing: .06em;
  text-transform: uppercase;
}

/* ── Transición deploy CTA ── */
.slide-up-enter-active { transition: all .3s ease; }
.slide-up-enter-from   { opacity: 0; transform: translateY(10px); }
</style>