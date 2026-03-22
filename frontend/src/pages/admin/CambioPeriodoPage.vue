<!-- ══════════════════════════════════════════════════════════════════
     CambioPeriodoPage.vue — Vista admin para el periodo académico.
     Thin Page: delega toda la lógica al periodoStore (Mock-First).
     Elimina Tailwind hardcodeado y usa CSS Custom Properties de SENTINNEL.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="calendar_today" size="22px" color="amber-4" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Periodo Académico</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Gestiona el periodo global del sistema — todos los módulos se ven afectados.
      </p>
    </div>

    <div class="periodo-card_sm_vc">
      <!-- Estado actual -->
      <div class="periodo-actual_sm_vc">
        <div>
          <p class="periodo-label_sm_vc">Periodo Actual</p>
          <p class="periodo-valor_sm_vc">{{ store_sm_vc.periodoFormateado_sm_vc() }}</p>
        </div>
        <q-icon name="calendar_today" size="32px" color="teal-3" />
      </div>

      <!-- Formulario de actualización -->
      <q-form @submit.prevent="handleSubmit_sm_vc" class="periodo-form_sm_vc">
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            Nuevo Periodo <span class="req-mark_sm_vc">*</span>
          </label>
          <q-input
            v-model="nuevoPeriodo_sm_vc"
            dense outlined color="teal-3"
            class="sntnl-input_sm_vc"
            placeholder="Ej: P-166"
            :loading="store_sm_vc.loading_sm_vc"
            :rules="[
              val => !!val || 'El periodo es obligatorio',
              val => val.length >= 4 || 'Mínimo 4 caracteres',
              val => /^P-\d+$/.test(val) || 'Formato inválido (ej: P-166)'
            ]"
            hint="Formato: P-XXX"
          >
            <template #prepend>
              <q-icon name="edit" color="teal-3" />
            </template>
          </q-input>
        </div>

        <q-btn
          type="submit"
          :loading="store_sm_vc.loading_sm_vc"
          :disable="!nuevoPeriodo_sm_vc || store_sm_vc.loading_sm_vc"
          unelevated no-caps
          label="Actualizar Periodo" icon="update"
          class="btn-cta_sm_vc" />
      </q-form>

      <!-- Aviso informativo -->
      <div class="info-notice_sm_vc">
        <q-icon name="info" color="teal-3" size="18px" />
        <p class="info-texto_sm_vc">
          El cambio de periodo afecta a toda la plataforma.
          Verifica el valor antes de confirmar.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePeriodoStore } from 'src/stores/periodoStore'

const store_sm_vc = usePeriodoStore()
const nuevoPeriodo_sm_vc = ref('')

const handleSubmit_sm_vc = async () => {
  const ok_sm_vc = await store_sm_vc.actualizarPeriodo_sm_vc(nuevoPeriodo_sm_vc.value)
  if (ok_sm_vc) nuevoPeriodo_sm_vc.value = ''
}

onMounted(() => store_sm_vc.cargarPeriodoActual_sm_vc())
</script>

<style scoped>
.periodo-card_sm_vc {
  max-width: 440px;
  background: var(--sn-fondo-panel);
  border: 1px solid var(--sn-borde-activo);
  border-radius: 12px;
  padding: 1.75rem;
  display: flex; flex-direction: column; gap: 1.25rem;
  box-shadow: var(--sn-shadow-md);
}
.periodo-actual_sm_vc {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--sn-fondo-elevado);
  border: 1px solid var(--sn-borde); border-radius: 8px;
}
.periodo-label_sm_vc {
  font-size: .62rem; letter-spacing: .14em; text-transform: uppercase;
  color: var(--sn-texto-apagado); margin: 0 0 4px; font-family: var(--sn-font-mono);
}
.periodo-valor_sm_vc {
  font-size: 1.6rem; font-weight: 700;
  color: var(--sn-primario); margin: 0; font-family: var(--sn-font-mono);
}
.periodo-form_sm_vc { display: flex; flex-direction: column; gap: .75rem; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: .3rem; }
.field-label_sm_vc {
  font-size: .62rem; letter-spacing: .12em; text-transform: uppercase;
  color: var(--sn-acento-sec); font-weight: 500; font-family: var(--sn-font-mono);
}
.req-mark_sm_vc { color: var(--sn-error-claro); }
:deep(.sntnl-input_sm_vc .q-field__control) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important; border-radius: 6px !important;
}
:deep(.sntnl-input_sm_vc .q-field__native) {
  color: var(--sn-texto-principal) !important;
  font-size: .82rem !important; font-family: var(--sn-font-mono) !important;
}
.info-notice_sm_vc {
  display: flex; align-items: flex-start; gap: .75rem;
  padding: .875rem 1rem;
  background: rgba(111,255,233,.04);
  border: 1px solid rgba(111,255,233,.1); border-radius: 8px;
}
.info-texto_sm_vc {
  font-size: .72rem; color: var(--sn-texto-terciario);
  margin: 0; line-height: 1.6; font-family: var(--sn-font-sans);
}
</style>