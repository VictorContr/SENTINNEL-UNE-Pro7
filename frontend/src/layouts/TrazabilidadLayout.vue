<!-- Layout base: stepper vertical + tarjeta + conversación por materia (DRY). -->
<template>
  <div class="traz-layout-root_sm_vc">
    <!-- Ficha estudiante (authStore + id del layout) -->
    <div
      class="traz-ficha-est_sm_vc"
      :class="{ 'traz-ficha-est--muted_sm_vc': !fichaEstudiante_sm_vc }"
    >
      <div class="traz-ficha-avatar_sm_vc">
        {{ inicialesEstudiante_sm_vc }}
      </div>
      <div class="traz-ficha-body_sm_vc">
        <h2 class="traz-ficha-nombre_sm_vc">
          {{ fichaEstudiante_sm_vc?.nombre_sm_vc ?? 'Estudiante' }}
        </h2>
        <div class="traz-ficha-meta_sm_vc">
          <span class="trz-meta-item_sm_vc">
            <q-icon name="badge" size="12px" />
            {{ estudianteId }}
          </span>
          <span
            v-if="fichaEstudiante_sm_vc?.correo_sm_vc"
            class="trz-meta-item_sm_vc"
          >
            <q-icon name="email" size="12px" />
            {{ fichaEstudiante_sm_vc.correo_sm_vc }}
          </span>
          <span
            v-if="fichaEstudiante_sm_vc?.cohorte_sm_vc"
            class="trz-meta-item_sm_vc"
          >
            <q-icon name="calendar_month" size="12px" />
            Periodo {{ fichaEstudiante_sm_vc.cohorte_sm_vc }}
          </span>
          <span
            v-if="fichaEstudiante_sm_vc?.rol_sm_vc"
            class="trz-meta-item_sm_vc"
          >
            <q-icon name="school" size="12px" />
            {{ fichaEstudiante_sm_vc.rol_sm_vc }}
          </span>
        </div>
      </div>

      <div class="ficha-global-estado_sm_vc">
        <div class="global-estado-label_sm_vc">Progreso Global</div>
        <q-circular-progress
          :value="progresoGlobal_sm_vc" size="60px" :thickness="0.15"
          color="teal-3" track-color="blue-grey-9" show-value>
          <span class="pct-label_sm_vc">{{ progresoGlobal_sm_vc }}%</span>
        </q-circular-progress>
      </div>
    </div>

    <q-stepper
      v-if="!vistaSoloConversacion_sm_vc"
      v-model="stepActivo_sm_vc"
      vertical
      animated
      flat
      class="traz-stepper_sm_vc"
      active-color="teal-3"
      done-color="teal-4"
      inactive-color="blue-grey-7"
    >
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
        done-icon="check_circle"
        error-icon="cancel"
        class="traz-step-item_sm_vc"
      >
        <MateriaProgressCard
          :materia="materia"
          :estudiante-id="estudianteId"
          :show-description="true"
          :show-requisitos="true"
          :readonly="readonly"
        />

        <q-stepper-navigation class="traz-step-nav_sm_vc">
          <q-btn
            v-if="!esPrimerStep_sm_vc(materia.id_sm_vc)"
            flat
            no-caps
            color="blue-grey-6"
            icon="arrow_upward"
            label="Anterior"
            size="sm"
            class="traz-step-nav-btn_sm_vc q-mr-sm"
            @click="retrocederStep_sm_vc(materia.id_sm_vc)"
          />
          <q-btn
            v-if="!esUltimoStep_sm_vc(materia.id_sm_vc)"
            unelevated
            no-caps
            color="teal-3"
            text-color="dark"
            icon-right="arrow_downward"
            label="Siguiente materia"
            size="sm"
            class="traz-step-nav-btn_sm_vc q-mr-sm"
            :disable="
              materia.bloqueada || proximaDesbloqueada_sm_vc(materia.id_sm_vc) === null
            "
            @click="avanzarStep_sm_vc(materia.id_sm_vc)"
          />
          <q-btn
            flat
            no-caps
            size="sm"
            icon="chat"
            label="Solo conversación"
            class="traz-step-nav-btn_sm_vc traz-btn-solo-chat_sm_vc"
            :disable="materia.bloqueada"
            @click="abrirSoloConversacion_sm_vc(materia.id_sm_vc)"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <div v-else class="trz-solo-conv-panel_sm_vc">
      <div class="trz-solo-nav_sm_vc">
        <q-btn
          flat
          no-caps
          size="sm"
          icon="view_timeline"
          label="Volver a la trazabilidad"
          class="traz-step-nav-btn_sm_vc traz-btn-solo-chat_sm_vc"
          @click="vistaSoloConversacion_sm_vc = false"
        />
      </div>
      <p v-if="!materiaPasoActivo_sm_vc" class="trz-solo-empty_sm_vc">
        No hay materia activa para mostrar la conversación.
      </p>
      <template v-else>
        <p class="trz-solo-materia-lbl_sm_vc">
          {{ materiaPasoActivo_sm_vc.nombre_sm_vc }}
        </p>
        <div class="traz-conv-wrap_sm_vc traz-conv-wrap--solo_sm_vc">
          <DocumentConversacion
            :key="materiaPasoActivo_sm_vc.id_sm_vc"
            :materia-id="materiaPasoActivo_sm_vc.id_sm_vc"
            :estudiante-id="estudianteId"
            :readonly="readonly"
            :estado-progreso="materiaPasoActivo_sm_vc.estado_aprobacion_sm_vc"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useProgressBarStore } from 'src/stores/progressBarStore'
import MateriaProgressCard from 'src/components/shared/MateriaProgressCard.vue'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

/**
 * readonly: inyectado a hijos para modo auditoría. DocumentConversacion oculta
 * formularios y acciones; MateriaProgressCard no emite navegación. La vista admin
 * fija readonly=true para que el flujo documental sea solo consulta.
 */
const props = defineProps({
  estudianteId: { type: String, required: true },
  readonly: { type: Boolean, default: false },
})

const pasantiasStore_sm_vc = usePasantiasStore()
const authStore_sm_vc = useAuthStore()
const progressBarStore_sm_vc = useProgressBarStore()

const stepActivo_sm_vc = ref(null)
/** true = solo chat de la materia del paso activo; el stepper se desmonta (v-if). */
const vistaSoloConversacion_sm_vc = ref(false)

const fichaEstudiante_sm_vc = computed(() =>
  authStore_sm_vc.MOCK_USERS.find((u) => u.id_sm_vc === props.estudianteId) ?? null
)

const inicialesEstudiante_sm_vc = computed(() => {
  const nombre_sm_vc = fichaEstudiante_sm_vc.value?.nombre_sm_vc ?? props.estudianteId
  return String(nombre_sm_vc)
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
})

const materiasConFases_sm_vc = computed(() =>
  progressBarStore_sm_vc.enriquecerMateriasTrazabilidad_sm_vc(
    pasantiasStore_sm_vc.getProgresoEstudiante(props.estudianteId)
  )
)

const progresoGlobal_sm_vc = computed(() => {
  const items_sm_vc = pasantiasStore_sm_vc.getProgresoEstudiante(props.estudianteId)
  if (!items_sm_vc.length) return 0
  const suma_sm_vc = items_sm_vc.reduce((acc, m) => acc + (m.progreso_decimal || 0), 0)
  return Math.round((suma_sm_vc / items_sm_vc.length) * 100)
})

const materiaPasoActivo_sm_vc = computed(() =>
  materiasConFases_sm_vc.value.find((m) => m.id_sm_vc === stepActivo_sm_vc.value) ??
  null
)

watch(
  () => props.estudianteId,
  () => {
    stepActivo_sm_vc.value = null
    vistaSoloConversacion_sm_vc.value = false
  }
)

watchEffect(() => {
  if (stepActivo_sm_vc.value) return
  const lista_sm_vc = materiasConFases_sm_vc.value
  if (!lista_sm_vc.length) return
  const primera_sm_vc = lista_sm_vc.find((m) => !m.bloqueada) ?? lista_sm_vc[0]
  stepActivo_sm_vc.value = primera_sm_vc.id_sm_vc
})

const esUltimoStep_sm_vc = (id_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  return lista_sm_vc[lista_sm_vc.length - 1]?.id_sm_vc === id_sm_vc
}

const esPrimerStep_sm_vc = (id_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  return lista_sm_vc[0]?.id_sm_vc === id_sm_vc
}

const retrocederStep_sm_vc = (idActual_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  const idx_sm_vc = lista_sm_vc.findIndex((m) => m.id_sm_vc === idActual_sm_vc)
  if (idx_sm_vc > 0) {
    stepActivo_sm_vc.value = lista_sm_vc[idx_sm_vc - 1].id_sm_vc
  }
}

const proximaDesbloqueada_sm_vc = (idActual_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value
  const idx_sm_vc = lista_sm_vc.findIndex((m) => m.id_sm_vc === idActual_sm_vc)
  const proxima_sm_vc = lista_sm_vc[idx_sm_vc + 1]
  return proxima_sm_vc && !proxima_sm_vc.bloqueada ? proxima_sm_vc.id_sm_vc : null
}

const avanzarStep_sm_vc = (idActual_sm_vc) => {
  const proxima_sm_vc = proximaDesbloqueada_sm_vc(idActual_sm_vc)
  if (proxima_sm_vc) stepActivo_sm_vc.value = proxima_sm_vc
}

const abrirSoloConversacion_sm_vc = (materiaId_sm_vc) => {
  stepActivo_sm_vc.value = materiaId_sm_vc
  vistaSoloConversacion_sm_vc.value = true
}
</script>

<style scoped>
.traz-layout-root_sm_vc {
  font-family: var(--sn-font-mono);
  max-width: 860px;
}

.traz-ficha-est_sm_vc {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  background: var(--sn-fondo-panel);
  border: 1px solid var(--sn-borde);
  border-radius: 12px;
  flex-wrap: wrap;
}
.traz-ficha-est--muted_sm_vc {
  opacity: 0.92;
}
.traz-ficha-avatar_sm_vc {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--sn-primario);
  background: var(--sn-surface-active);
  border: 1px solid var(--sn-borde-activo);
  flex-shrink: 0;
}
.traz-ficha-body_sm_vc {
  flex: 1;
  min-width: 0;
}
.traz-ficha-nombre_sm_vc {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--sn-texto-principal);
}
.traz-ficha-meta_sm_vc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
}
.trz-meta-item_sm_vc {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.62rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans);
}

.ficha-global-estado_sm_vc { display: flex; flex-direction: column; align-items: center; gap: .3rem; flex-shrink: 0; }
.global-estado-label_sm_vc { font-size: .58rem; letter-spacing: .1em; text-transform: uppercase; color: var(--sn-texto-apagado); }
.pct-label_sm_vc { font-size: .75rem; font-weight: 700; color: var(--sn-primario); }

.trz-solo-nav_sm_vc {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--sn-borde);
}

.trz-solo-conv-panel_sm_vc {
  border: 1px solid var(--sn-borde);
  border-radius: 14px;
  padding: 1rem 1.25rem 1.25rem;
  background: var(--sn-fondo-elevado);
}
.trz-solo-empty_sm_vc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--sn-texto-apagado);
}
.trz-solo-materia-lbl_sm_vc {
  margin: 0 0 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sn-acento-sec);
}
.traz-conv-wrap--solo_sm_vc {
  margin-top: 0;
}

.traz-stepper_sm_vc {
  background: transparent !important;
  border: 1px solid var(--sn-borde);
  border-radius: 14px;
  margin-bottom: 1.75rem;
}

:deep(.q-stepper__tab) {
  font-family: var(--sn-font-mono);
}
:deep(.q-stepper__title) {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sn-texto-principal);
  letter-spacing: 0.04em;
}
:deep(.q-stepper__caption) {
  font-size: 0.6rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans);
  margin-top: 2px;
}
:deep(.q-stepper__line) {
  border-color: var(--sn-borde) !important;
}
:deep(.q-stepper__step-inner) {
  background: transparent;
}
:deep(.q-step--disabled .q-stepper__title),
:deep(.q-step--disabled .q-stepper__caption) {
  opacity: 0.4;
}

.traz-step-item_sm_vc {
  border-bottom: 1px solid var(--sn-borde);
}
.traz-step-item_sm_vc:last-child {
  border-bottom: none;
}

.traz-conv-wrap_sm_vc {
  margin-top: 1rem;
  padding: 0 0 0.5rem;
  border: 1px solid var(--sn-borde);
  border-radius: 12px;
  background: var(--sn-fondo-panel);
  overflow: hidden;
}

.traz-step-nav_sm_vc {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.875rem;
}
.traz-step-nav-btn_sm_vc {
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
}
.traz-btn-solo-chat_sm_vc {
  color: var(--sn-primario) !important;
  letter-spacing: 0.05em;
}
</style>
