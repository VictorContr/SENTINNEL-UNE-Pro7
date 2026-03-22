<template>
  <q-page class="sntnl-page">
    <q-btn flat no-caps icon="arrow_back" label="Volver" color="grey-5" size="sm" class="q-mb-md" @click="router.back()" />
    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="rocket_launch" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title">Registrar Deploy Final</h1>
      </div>
      <p class="page-subtitle">Solo habilitado si tu última materia está aprobada.</p>
    </div>

    <!-- Estado bloqueado si no están todas aprobadas -->
    <div v-if="!habilitado" class="locked-state">
      <q-icon name="lock" size="40px" color="blue-grey-7" />
      <div>
        <p class="locked-title">Formulario bloqueado</p>
        <p class="locked-desc">Debes aprobar las 3 materias de pasantía antes de registrar tu deploy.</p>
      </div>
    </div>

    <!-- Formulario de deploy -->
    <div v-else class="deploy-form-wrap">
      <div class="section-notice">
        <q-icon name="check_circle" size="16px" color="teal-4" />
        <span>Todas tus materias están aprobadas. Puedes registrar tu proyecto final.</span>
      </div>

      <q-form @submit.prevent="registrarDeploy" class="deploy-form">

        <!-- URL de Producción -->
        <div class="field-group">
          <label class="field-label">URL de Producción <span class="required">*</span></label>
          <q-input
            v-model="form.url_produccion_sm_vc"
            dense outlined color="teal-3"
            placeholder="https://mi-proyecto.netlify.app"
            class="sntnl-input"
            :rules="[val => !!val || 'Campo requerido', val => /^https?:\/\/.+/.test(val) || 'URL inválida']"
          >
            <template #prepend><q-icon name="link" color="teal-3" size="18px" /></template>
          </q-input>
        </div>

        <!-- Archivo .zip (código fuente) -->
        <div class="field-group">
          <label class="field-label">Código Fuente (.zip) <span class="required">*</span></label>
          <div
            class="upload-zone"
            :class="{ 'upload-zone--active': dragZip }"
            @dragover.prevent="dragZip = true"
            @dragleave="dragZip = false"
            @drop.prevent="handleDrop($event, 'zip')"
          >
            <template v-if="!form.archivo_codigo_id_sm_vc">
              <q-icon name="folder_zip" size="28px" color="teal-3" />
              <p>Arrastra tu <span class="code-tag">.zip</span> aquí o</p>
              <q-btn flat no-caps label="Seleccionar .zip" color="teal-3" size="sm" @click="inputZip?.click()" />
              <input ref="inputZip" type="file" accept=".zip" hidden @change="handleFile($event, 'zip')" />
            </template>
            <template v-else>
              <q-icon name="task" size="24px" color="teal-4" />
              <p class="file-name-text">{{ form.archivo_codigo_id_sm_vc.name }}</p>
              <q-btn flat no-caps label="Cambiar" color="grey-5" size="xs" @click="form.archivo_codigo_id_sm_vc = null" />
            </template>
          </div>
        </div>

        <!-- Documentación técnica (.pdf) -->
        <div class="field-group">
          <label class="field-label">Documentación Técnica (.pdf) <span class="required">*</span></label>
          <div
            class="upload-zone"
            :class="{ 'upload-zone--active': dragPdf }"
            @dragover.prevent="dragPdf = true"
            @dragleave="dragPdf = false"
            @drop.prevent="handleDrop($event, 'pdf')"
          >
            <template v-if="!form.documentacion_tecnica_id_sm_vc">
              <q-icon name="picture_as_pdf" size="28px" color="amber-4" />
              <p>Arrastra tu <span class="code-tag">.pdf</span> aquí o</p>
              <q-btn flat no-caps label="Seleccionar .pdf" color="amber-4" size="sm" @click="inputPdf?.click()" />
              <input ref="inputPdf" type="file" accept=".pdf" hidden @change="handleFile($event, 'pdf')" />
            </template>
            <template v-else>
              <q-icon name="task" size="24px" color="amber-4" />
              <p class="file-name-text">{{ form.documentacion_tecnica_id_sm_vc.name }}</p>
              <q-btn flat no-caps label="Cambiar" color="grey-5" size="xs" @click="form.documentacion_tecnica_id_sm_vc = null" />
            </template>
          </div>
        </div>

        <!-- Submit -->
        <q-btn
          type="submit"
          unelevated no-caps
          label="Registrar Deploy"
          icon="rocket_launch"
          class="submit-btn"
          :loading="submitting"
        />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

/* Para el prototipo: simular que la última materia está aprobada */
const habilitado = ref(true)
const submitting = ref(false)
const dragZip = ref(false)
const dragPdf = ref(false)
const inputZip = ref(null)
const inputPdf = ref(null)

const form = ref({
  url_produccion_sm_vc: '',
  archivo_codigo_id_sm_vc: null,       // mapea a FK archivo .zip
  documentacion_tecnica_id_sm_vc: null  // mapea a FK archivo .pdf
})

function handleFile(e, tipo) {
  const file = e.target.files[0]
  if (!file) return
  if (tipo === 'zip') form.value.archivo_codigo_id_sm_vc = file
  else form.value.documentacion_tecnica_id_sm_vc = file
}

function handleDrop(e, tipo) {
  dragZip.value = false; dragPdf.value = false
  const file = e.dataTransfer.files[0]
  if (!file) return
  if (tipo === 'zip') form.value.archivo_codigo_id_sm_vc = file
  else form.value.documentacion_tecnica_id_sm_vc = file
}

async function registrarDeploy() {
  if (!form.value.archivo_codigo_id_sm_vc || !form.value.documentacion_tecnica_id_sm_vc) {
    $q.notify({ type: 'warning', message: 'Debes subir el .zip y el .pdf.', position: 'top-right' })
    return
  }
  submitting.value = true
  await new Promise((r) => setTimeout(r, 1200))
  submitting.value = false
  $q.notify({
    type: 'positive',
    message: '¡Deploy registrado exitosamente!',
    caption: form.value.url_produccion_sm_vc,
    icon: 'rocket_launch',
    position: 'top-right',
    timeout: 5000
  })
  router.push('/estudiante/trazabilidad')
}
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.page-header { margin-bottom: 1.5rem; }
.page-title-row { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: 0.06em; margin: 0; font-family: var(--sn-font-mono); }
.page-subtitle { font-size: 0.72rem; color: var(--sn-texto-terciario); margin: 0; font-family: var(--sn-font-sans); }
.code-tag { background: rgba(111,255,233,0.08); color: var(--sn-acento-sec); padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; font-family: var(--sn-font-mono); }
.locked-state { display: flex; align-items: center; gap: 1.25rem; padding: 2rem; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.07); border-radius: 12px; max-width: 480px; }
.locked-title { font-size: 0.88rem; font-weight: 600; color: var(--sn-texto-secundario); margin: 0 0 3px; font-family: var(--sn-font-mono); }
.locked-desc { font-size: 0.75rem; color: var(--sn-texto-apagado); margin: 0; font-family: var(--sn-font-sans); line-height: 1.6; }
.deploy-form-wrap { max-width: 520px; }
.section-notice { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: var(--sn-acento-sec); background: rgba(111,255,233,0.05); border: 1px solid rgba(111,255,233,0.15); border-radius: 8px; padding: 0.6rem 0.875rem; margin-bottom: 1.5rem; font-family: var(--sn-font-sans); }
.deploy-form { display: flex; flex-direction: column; gap: 1.1rem; }
.field-group { display: flex; flex-direction: column; gap: 0.35rem; }
.field-label { font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sn-acento-sec); font-weight: 500; font-family: var(--sn-font-mono); }
.required { color: var(--sn-error-claro); }
:deep(.sntnl-input .q-field__control) { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(91,192,190,0.2) !important; border-radius: 6px !important; }
:deep(.sntnl-input .q-field__control:hover) { border-color: rgba(111,255,233,0.4) !important; }
:deep(.sntnl-input.q-field--focused .q-field__control) { border-color: rgba(111,255,233,0.7) !important; box-shadow: 0 0 0 3px rgba(111,255,233,0.08) !important; }
:deep(.sntnl-input .q-field__native) { color: var(--sn-texto-principal) !important; font-size: 0.82rem !important; font-family: var(--sn-font-mono) !important; }
.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem; padding: 1.5rem; border: 2px dashed var(--sn-borde-hover); border-radius: 10px; background: var(--sn-surface-alpha); cursor: pointer; transition: all 0.2s; min-height: 120px; text-align: center; }
.upload-zone p { font-size: 0.75rem; color: var(--sn-texto-secundario); margin: 0; font-family: var(--sn-font-sans); }
.upload-zone--active { border-color: rgba(111,255,233,0.5) !important; background: rgba(111,255,233,0.05) !important; }
.file-name-text { font-size: 0.75rem; color: var(--sn-primario); font-family: var(--sn-font-mono); }
.submit-btn { background: #6fffe9 !important; color: #0b132b !important; font-size: 0.75rem !important; font-weight: 700 !important; letter-spacing: 0.1em !important; border-radius: 6px !important; padding: 0.6rem 1.5rem !important; box-shadow: 0 0 20px rgba(111,255,233,0.2); margin-top: 0.5rem; align-self: flex-start; }
.submit-btn:hover { box-shadow: 0 0 30px rgba(111,255,233,0.35) !important; }
</style>
