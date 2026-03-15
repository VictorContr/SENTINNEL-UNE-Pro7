<template>
  <q-page class="sntnl-page">
    <q-btn flat no-caps icon="arrow_back" label="Volver" color="grey-5" size="sm"
      class="q-mb-md back-btn" @click="router.push('/estudiante/trazabilidad')" />

    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="rocket_launch" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title">Registrar Deploy Final</h1>
      </div>
      <p class="page-subtitle">Solo habilitado cuando las 3 materias estén aprobadas.</p>
    </div>

    <!-- Bloqueado -->
    <div v-if="!store.todasAprobadas" class="locked-state">
      <div class="locked-icon"><q-icon name="lock" size="32px" color="blue-grey-7" /></div>
      <div>
        <p class="locked-title">Formulario bloqueado</p>
        <p class="locked-desc">Debes aprobar las 3 materias antes de registrar tu deploy.</p>
        <div class="locked-progress">
          <div v-for="m in store.miProgreso" :key="m.id_sm_vc" class="lock-mat">
            <q-icon
              :name="m.estado_aprobacion_sm_vc === 'APROBADO' ? 'check_circle' : 'radio_button_unchecked'"
              :color="m.estado_aprobacion_sm_vc === 'APROBADO' ? 'teal-4' : 'blue-grey-8'"
              size="14px"
            />
            <span>{{ m.nombre_sm_vc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario activo -->
    <template v-else>
      <!-- Ya existe un deploy registrado -->
      <div v-if="store.miDeploy" class="existing-deploy-banner">
        <q-icon name="info" size="16px" color="teal-3" />
        <span>Ya tienes un deploy registrado. Puedes actualizarlo.</span>
        <div class="existing-url">
          <q-icon name="link" size="12px" color="teal-3" />
          <a :href="store.miDeploy.url_produccion_sm_vc" target="_blank" class="url-link">
            {{ store.miDeploy.url_produccion_sm_vc }}
          </a>
        </div>
      </div>

      <div class="section-notice">
        <q-icon name="check_circle" size="16px" color="teal-4" />
        <span>Todas tus materias están aprobadas. Completa los datos a continuación.</span>
      </div>

      <q-form @submit.prevent="registrarDeploy" class="deploy-form">

        <!-- URL producción -->
        <div class="field-group">
          <label class="field-label">
            URL de Producción
            <span class="req-mark">*</span>
            <q-icon name="help_outline" size="12px" color="blue-grey-6" class="q-ml-xs">
              <q-tooltip class="bg-dark text-caption">URL donde está desplegada tu aplicación (ej: Netlify, Vercel, Railway)</q-tooltip>
            </q-icon>
          </label>
          <q-input
            v-model="form.url_produccion_sm_vc"
            dense outlined dark color="teal-3" class="sntnl-input"
            :placeholder="store.miDeploy?.url_produccion_sm_vc || 'https://mi-proyecto.netlify.app'"
            :rules="[val => !!val || 'Campo requerido', val => /^https?:\/\/.+/.test(val) || 'URL inválida (debe comenzar con http:// o https://)']"
          >
            <template #prepend><q-icon name="link" color="teal-3" size="18px" /></template>
          </q-input>
        </div>

        <!-- Código fuente .zip -->
        <div class="field-group">
          <label class="field-label">
            Código Fuente
            <span class="req-mark">*</span>
            <span class="format-hint">.zip</span>
          </label>
          <div
            class="upload-zone" :class="{ 'upload-zone--active': dragZip, 'upload-zone--filled': !!form.archivo_codigo_id_sm_vc }"
            @dragover.prevent="dragZip = true"
            @dragleave="dragZip = false"
            @drop.prevent="handleDrop($event, 'zip')"
            @click="inputZip?.click()"
          >
            <template v-if="!form.archivo_codigo_id_sm_vc">
              <div class="upload-zone-inner">
                <div class="upload-icon-wrap zip"><q-icon name="folder_zip" size="28px" color="teal-3" /></div>
                <div class="upload-text">
                  <p class="upload-main">Arrastra tu archivo <span class="code-tag">.zip</span></p>
                  <p class="upload-sub">o haz clic para seleccionar</p>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="upload-zone-inner">
                <div class="upload-icon-wrap zip done"><q-icon name="task" size="24px" color="teal-4" /></div>
                <div class="upload-text">
                  <p class="upload-file-name">{{ form.archivo_codigo_id_sm_vc.name }}</p>
                  <p class="upload-sub">{{ formatFileSize(form.archivo_codigo_id_sm_vc.size) }}</p>
                </div>
                <q-btn flat no-caps label="Cambiar" color="grey-5" size="xs" @click.stop="form.archivo_codigo_id_sm_vc = null" />
              </div>
            </template>
            <input ref="inputZip" type="file" accept=".zip" hidden @change="handleFile($event, 'zip')" />
          </div>
        </div>

        <!-- Documentación técnica .pdf -->
        <div class="field-group">
          <label class="field-label">
            Documentación Técnica
            <span class="req-mark">*</span>
            <span class="format-hint">.pdf</span>
          </label>
          <div
            class="upload-zone" :class="{ 'upload-zone--active': dragPdf, 'upload-zone--filled': !!form.documentacion_tecnica_id_sm_vc, 'upload-zone--pdf': true }"
            @dragover.prevent="dragPdf = true"
            @dragleave="dragPdf = false"
            @drop.prevent="handleDrop($event, 'pdf')"
            @click="inputPdf?.click()"
          >
            <template v-if="!form.documentacion_tecnica_id_sm_vc">
              <div class="upload-zone-inner">
                <div class="upload-icon-wrap pdf"><q-icon name="picture_as_pdf" size="28px" color="amber-4" /></div>
                <div class="upload-text">
                  <p class="upload-main">Arrastra tu archivo <span class="code-tag code-tag--amber">.pdf</span></p>
                  <p class="upload-sub">o haz clic para seleccionar</p>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="upload-zone-inner">
                <div class="upload-icon-wrap pdf done"><q-icon name="task" size="24px" color="amber-4" /></div>
                <div class="upload-text">
                  <p class="upload-file-name">{{ form.documentacion_tecnica_id_sm_vc.name }}</p>
                  <p class="upload-sub">{{ formatFileSize(form.documentacion_tecnica_id_sm_vc.size) }}</p>
                </div>
                <q-btn flat no-caps label="Cambiar" color="grey-5" size="xs" @click.stop="form.documentacion_tecnica_id_sm_vc = null" />
              </div>
            </template>
            <input ref="inputPdf" type="file" accept=".pdf" hidden @change="handleFile($event, 'pdf')" />
          </div>
        </div>

        <!-- Checklist antes de enviar -->
        <div class="preflight-checklist">
          <div class="checklist-title"><q-icon name="checklist" size="14px" color="teal-3" />Pre-vuelo</div>
          <div v-for="check in preflightChecks" :key="check.label" class="check-item" :class="{ 'check-item--ok': check.ok }">
            <q-icon :name="check.ok ? 'check_circle' : 'radio_button_unchecked'" size="13px" :color="check.ok ? 'teal-4' : 'blue-grey-8'" />
            <span>{{ check.label }}</span>
          </div>
        </div>

        <q-btn
          type="submit" unelevated no-caps
          :label="store.miDeploy ? 'Actualizar Deploy' : 'Registrar Deploy'"
          icon="rocket_launch"
          class="submit-btn"
          :loading="submitting"
          :disable="!allPreflightOk"
        >
          <template #loading>
            <q-spinner-dots color="#0b132b" size="20px" />
            <span class="q-ml-sm" style="color:#0b132b;font-weight:700;font-size:0.72rem">Registrando…</span>
          </template>
        </q-btn>
      </q-form>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasantiasStore } from 'src/stores/pasantiasStore'

const router = useRouter()
const $q = useQuasar()
const store = usePasantiasStore()

const submitting = ref(false)
const dragZip = ref(false)
const dragPdf = ref(false)
const inputZip = ref(null)
const inputPdf = ref(null)

const form = ref({
  url_produccion_sm_vc: store.miDeploy?.url_produccion_sm_vc ?? '',
  archivo_codigo_id_sm_vc: null,
  documentacion_tecnica_id_sm_vc: null
})

function handleFile(e, tipo) {
  const file = e.target.files[0]; if (!file) return
  if (tipo === 'zip') form.value.archivo_codigo_id_sm_vc = file
  else form.value.documentacion_tecnica_id_sm_vc = file
}
function handleDrop(e, tipo) {
  dragZip.value = false; dragPdf.value = false
  const file = e.dataTransfer.files[0]; if (!file) return
  if (tipo === 'zip') form.value.archivo_codigo_id_sm_vc = file
  else form.value.documentacion_tecnica_id_sm_vc = file
}
function formatFileSize(bytes) {
  if (!bytes) return '—'
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${(bytes / 1e3).toFixed(0)} KB`
}

const preflightChecks = computed(() => [
  { label: 'URL de producción ingresada', ok: /^https?:\/\/.+/.test(form.value.url_produccion_sm_vc) },
  { label: 'Archivo de código .zip adjunto', ok: !!form.value.archivo_codigo_id_sm_vc },
  { label: 'Documentación técnica .pdf adjunta', ok: !!form.value.documentacion_tecnica_id_sm_vc },
  { label: 'Todas las materias aprobadas', ok: store.todasAprobadas }
])

const allPreflightOk = computed(() => preflightChecks.value.every((c) => c.ok))

async function registrarDeploy() {
  submitting.value = true
  await new Promise((r) => setTimeout(r, 1200))
  store.registrarDeploy({
    url_produccion_sm_vc: form.value.url_produccion_sm_vc,
    archivo_codigo_nombre: form.value.archivo_codigo_id_sm_vc.name,
    documentacion_nombre: form.value.documentacion_tecnica_id_sm_vc.name
  })
  submitting.value = false
  $q.notify({ type: 'positive', message: '¡Deploy registrado exitosamente!', caption: form.value.url_produccion_sm_vc, icon: 'rocket_launch', position: 'top-right', timeout: 5000 })
  router.push('/estudiante/trazabilidad')
}
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; font-family: 'IBM Plex Mono', monospace; }
.back-btn { font-size: 0.72rem !important; }
.page-header { margin-bottom: 1.5rem; }
.page-title-row { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title { font-size: 1.2rem; font-weight: 700; color: #c8dde8; letter-spacing: 0.06em; margin: 0; }
.page-subtitle { font-size: 0.72rem; color: #3a5a78; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.code-tag { background: rgba(111,255,233,0.08); color: #5bc0be; padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; }
.code-tag--amber { background: rgba(240,165,0,0.08); color: #f0a500; }
.locked-state { display: flex; align-items: flex-start; gap: 1.25rem; padding: 1.5rem; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.07); border-radius: 12px; max-width: 480px; }
.locked-icon { flex-shrink: 0; }
.locked-title { font-size: 0.88rem; font-weight: 600; color: #5a7fa8; margin: 0 0 4px; }
.locked-desc { font-size: 0.75rem; color: #2e4a6a; margin: 0 0 0.75rem; font-family: 'IBM Plex Sans', sans-serif; }
.locked-progress { display: flex; flex-direction: column; gap: 0.3rem; }
.lock-mat { display: flex; align-items: center; gap: 0.4rem; font-size: 0.68rem; color: #3a5a78; }
.existing-deploy-banner { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; padding: 0.75rem 1rem; background: rgba(111,255,233,0.04); border: 1px solid rgba(111,255,233,0.12); border-radius: 8px; margin-bottom: 1rem; max-width: 600px; font-size: 0.72rem; color: #5bc0be; }
.existing-url { display: flex; align-items: center; gap: 0.3rem; }
.url-link { color: #6fffe9; text-decoration: none; font-size: 0.7rem; }
.url-link:hover { text-decoration: underline; }
.section-notice { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: #5bc0be; background: rgba(111,255,233,0.05); border: 1px solid rgba(111,255,233,0.15); border-radius: 8px; padding: 0.6rem 0.875rem; margin-bottom: 1.5rem; max-width: 520px; font-family: 'IBM Plex Sans', sans-serif; }
.deploy-form { display: flex; flex-direction: column; gap: 1.25rem; max-width: 520px; }
.field-group { display: flex; flex-direction: column; gap: 0.35rem; }
.field-label { font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; color: #5bc0be; font-weight: 500; display: flex; align-items: center; gap: 0.35rem; }
.req-mark { color: #ff8fa3; }
.format-hint { font-size: 0.55rem; background: rgba(255,255,255,0.05); padding: 1px 5px; border-radius: 3px; color: #3a5a78; }
:deep(.sntnl-input .q-field__control) { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(91,192,190,0.2) !important; border-radius: 6px !important; }
:deep(.sntnl-input .q-field__control:hover) { border-color: rgba(111,255,233,0.4) !important; }
:deep(.sntnl-input.q-field--focused .q-field__control) { border-color: rgba(111,255,233,0.7) !important; box-shadow: 0 0 0 3px rgba(111,255,233,0.08) !important; }
:deep(.sntnl-input .q-field__native) { color: #c8dde8 !important; font-size: 0.82rem !important; font-family: 'IBM Plex Mono', monospace !important; }
.upload-zone { border: 2px dashed rgba(111,255,233,0.15); border-radius: 10px; background: rgba(111,255,233,0.02); cursor: pointer; transition: all 0.2s; overflow: hidden; }
.upload-zone--pdf { border-color: rgba(240,165,0,0.15); background: rgba(240,165,0,0.02); }
.upload-zone:hover { border-color: rgba(111,255,233,0.35); background: rgba(111,255,233,0.04); }
.upload-zone--pdf:hover { border-color: rgba(240,165,0,0.35); background: rgba(240,165,0,0.04); }
.upload-zone--active { border-color: rgba(111,255,233,0.6) !important; background: rgba(111,255,233,0.07) !important; }
.upload-zone--filled { border-style: solid; border-color: rgba(111,255,233,0.25); }
.upload-zone--pdf.upload-zone--filled { border-color: rgba(240,165,0,0.25); }
.upload-zone-inner { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
.upload-icon-wrap { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.upload-icon-wrap.zip { background: rgba(111,255,233,0.08); }
.upload-icon-wrap.pdf { background: rgba(240,165,0,0.08); }
.upload-icon-wrap.done { opacity: 0.8; }
.upload-text { flex: 1; }
.upload-main { font-size: 0.78rem; color: #7aa0b8; margin: 0 0 2px; font-family: 'IBM Plex Sans', sans-serif; }
.upload-sub { font-size: 0.62rem; color: #2e4a6a; margin: 0; }
.upload-file-name { font-size: 0.78rem; color: #6fffe9; margin: 0 0 2px; word-break: break-word; }
.preflight-checklist { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 0.875rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.checklist-title { display: flex; align-items: center; gap: 0.35rem; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3a5a78; margin-bottom: 0.25rem; }
.check-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.68rem; color: #2e4a6a; transition: color 0.2s; }
.check-item--ok { color: #5bc0be; }
.submit-btn { background: #6fffe9 !important; color: #0b132b !important; font-size: 0.75rem !important; font-weight: 700 !important; letter-spacing: 0.1em !important; border-radius: 6px !important; padding: 0.6rem 1.5rem !important; box-shadow: 0 0 20px rgba(111,255,233,0.2); align-self: flex-start; }
.submit-btn:not(:disabled):hover { box-shadow: 0 0 30px rgba(111,255,233,0.35) !important; transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.4 !important; cursor: not-allowed; }
</style>
