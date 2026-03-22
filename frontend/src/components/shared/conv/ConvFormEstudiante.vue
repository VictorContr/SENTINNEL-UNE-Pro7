<!-- ══════════════════════════════════════════════════════════════════
     ConvFormEstudiante.vue — Formulario de envío de informe.
     Recoge archivo (simulado), versión, requisito y comentario.
     Emite el evento 'enviar' con el payload; la lógica vive en el store.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="action-panel_sm_vc">
    <div class="panel-header_sm_vc">
      <q-icon name="upload_file" size="16px" color="teal-3" />
      <span>Enviar nueva versión del informe</span>
    </div>

    <div class="action-form_sm_vc">
      <div class="form-row_sm_vc">
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            Requisito / Capítulo <span class="req-mark_sm_vc">*</span>
          </label>
          <q-select
            v-model="form_sm_vc.requisito_id_sm_vc"
            :options="requisitos"
            option-value="id_sm_vc"
            option-label="nombre_sm_vc"
            emit-value map-options
            dense outlined color="teal-3"
            class="sntnl-select_sm_vc"
            label="Seleccionar requisito" />
        </div>

        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">Versión</label>
          <q-input
            v-model="form_sm_vc.version_sm_vc"
            dense outlined color="teal-3"
            class="sntnl-input_sm_vc"
            placeholder="ej: v1.0" />
        </div>
      </div>

      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">Archivo PDF (simulado)</label>
        <div class="mini-upload_sm_vc" @click="fileInput_sm_vc?.click()">
          <q-icon name="attach_file" size="16px" color="teal-3" />
          <span>{{ form_sm_vc.archivo_nombre_sm_vc || 'Seleccionar archivo .pdf' }}</span>
          <input
            ref="fileInput_sm_vc"
            type="file" accept=".pdf,.docx" hidden
            @change="handleFileSelect_sm_vc" />
        </div>
      </div>

      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">Comentario (opcional)</label>
        <q-input
          v-model="form_sm_vc.comentario_sm_vc"
          dense outlined color="teal-3"
          class="sntnl-input_sm_vc"
          placeholder="Describe los cambios realizados…"
          type="textarea" :rows="2" autogrow />
      </div>

      <q-btn
        unelevated no-caps
        label="Enviar Informe" icon="send"
        class="send-btn_sm_vc"
        :disable="!form_sm_vc.requisito_id_sm_vc || !form_sm_vc.archivo_nombre_sm_vc"
        @click="emitirEnvio_sm_vc" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  requisitos: { type: Array, default: () => [] }
})

const emit = defineEmits(['enviar'])

const fileInput_sm_vc = ref(null)

const form_sm_vc = ref({
  requisito_id_sm_vc: null,
  version_sm_vc: 'v1.0',
  archivo_nombre_sm_vc: '',
  comentario_sm_vc: ''
})

const handleFileSelect_sm_vc = (e_sm_vc) => {
  form_sm_vc.value.archivo_nombre_sm_vc = e_sm_vc.target.files[0]?.name ?? ''
}

const emitirEnvio_sm_vc = () => {
  emit('enviar', { ...form_sm_vc.value })
  form_sm_vc.value = {
    requisito_id_sm_vc: null,
    version_sm_vc: 'v1.0',
    archivo_nombre_sm_vc: '',
    comentario_sm_vc: ''
  }
}
</script>

<style scoped>
.action-panel_sm_vc {
  border-top: 1px solid var(--sn-borde);
  padding: 1.25rem;
  background: var(--sn-fondo-elevado);
}
.panel-header_sm_vc {
  display: flex; align-items: center; gap: .4rem;
  font-size: .68rem; color: var(--sn-acento-sec);
  letter-spacing: .06em; margin-bottom: 1rem; text-transform: uppercase;
}
.action-form_sm_vc { display: flex; flex-direction: column; gap: .875rem; }
.form-row_sm_vc { display: grid; grid-template-columns: 1fr auto; gap: .75rem; align-items: flex-end; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: .3rem; }
.field-label_sm_vc {
  font-size: .6rem; letter-spacing: .12em; text-transform: uppercase;
  color: var(--sn-texto-terciario); font-weight: 500;
}
.req-mark_sm_vc { color: var(--sn-error-claro); }
:deep(.sntnl-select_sm_vc .q-field__control),
:deep(.sntnl-input_sm_vc .q-field__control) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important;
  border-radius: 6px !important;
}
:deep(.sntnl-select_sm_vc .q-field__native),
:deep(.sntnl-input_sm_vc .q-field__native) {
  color: var(--sn-texto-principal) !important;
  font-size: .78rem !important;
  font-family: var(--sn-font-mono) !important;
}
.mini-upload_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  padding: .5rem .75rem;
  background: var(--sn-surface-alpha);
  border: 1px dashed rgba(111,255,233,.18);
  border-radius: 6px; cursor: pointer;
  font-size: .72rem; color: var(--sn-texto-secundario); transition: all .15s;
}
.mini-upload_sm_vc:hover { border-color: rgba(111,255,233,.4); color: var(--sn-primario); }
.send-btn_sm_vc {
  background: var(--sn-surface-active) !important;
  color: var(--sn-primario) !important;
  border: 1px solid rgba(111,255,233,.25) !important;
  font-size: .72rem !important; font-weight: 600 !important;
  border-radius: 6px !important; align-self: flex-start;
}
</style>