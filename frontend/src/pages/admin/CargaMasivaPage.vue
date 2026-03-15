<template>
  <q-page class="sntnl-page">
    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="upload_file" size="22px" color="amber-4" class="q-mr-sm" />
        <h1 class="page-title">Carga Masiva</h1>
      </div>
      <p class="page-subtitle">Asistente de importación paso a paso — Pasos 1-3</p>
    </div>

    <!-- ── Toggle: Truncar datos ── -->
    <div class="truncar-panel">
      <div class="truncar-content">
        <div>
          <p class="truncar-title">
            <q-icon name="warning" size="16px" color="amber-4" class="q-mr-xs" />
            Truncar datos existentes
          </p>
          <p class="truncar-desc">
            Limpia la BD antes de importar. Tu usuario actual
            (<span class="code-tag">{{ auth.user?.id_sm_vc }}</span>) no será eliminado.
          </p>
        </div>
        <q-toggle
          v-model="truncarDatos"
          color="amber"
          keep-color
          :label="truncarDatos ? 'Habilitado' : 'Deshabilitado'"
          class="truncar-toggle"
          dark
        />
      </div>
      <transition name="slide-down">
        <div v-if="truncarDatos" class="truncar-warning">
          <q-icon name="error" size="14px" color="amber-4" />
          <span>Esta operación es irreversible. Todos los datos existentes (excepto tu cuenta) serán eliminados.</span>
        </div>
      </transition>
    </div>

    <!-- ── Stepper ── -->
    <q-stepper
      v-model="step"
      flat
      dark
      animated
      class="sntnl-stepper"
      color="teal"
      active-color="teal-3"
      done-color="teal-4"
      inactive-color="blue-grey-7"
    >
      <!-- ── PASO 1: Usuarios ── -->
      <q-step :name="1" title="Usuarios" icon="group" :done="step > 1" prefix="01">
        <div class="step-content">
          <p class="step-desc">
            Sube un archivo <span class="code-tag">.csv</span> o
            <span class="code-tag">.xlsx</span> con los usuarios a importar.
            Columnas requeridas:
            <span class="code-tag">correo_sm_vc</span>,
            <span class="code-tag">nombre_sm_vc</span>,
            <span class="code-tag">rol_sm_vc</span>,
            <span class="code-tag">clave_sm_vc</span>.
          </p>

          <div
            class="upload-zone"
            :class="{ 'upload-zone--active': dragActive[1] }"
            @dragover.prevent="dragActive[1] = true"
            @dragleave="dragActive[1] = false"
            @drop.prevent="handleDrop($event, 1)"
          >
            <template v-if="!archivos[1]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" @click="triggerInput(1)" />
              <input ref="input1" type="file" accept=".csv,.xlsx" hidden @change="handleFile($event, 1)" />
            </template>
            <template v-else>
              <q-icon name="task" size="32px" color="teal-4" />
              <p class="file-name">{{ archivos[1].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm" @click="archivos[1] = null" />
            </template>
          </div>

          <!-- Preview ficticio -->
          <div v-if="archivos[1]" class="preview-table">
            <p class="preview-label">Vista previa (primeras 3 filas simuladas):</p>
            <div class="preview-row preview-row--header">
              <span>correo_sm_vc</span><span>nombre_sm_vc</span><span>rol_sm_vc</span>
            </div>
            <div v-for="n in 3" :key="n" class="preview-row">
              <span>usuario{{ n }}@une.edu.ve</span>
              <span>Usuario {{ n }}</span>
              <span>ESTUDIANTE</span>
            </div>
          </div>
        </div>
      </q-step>

      <!-- ── PASO 2: Materias ── -->
      <q-step :name="2" title="Materias" icon="book" :done="step > 2" prefix="02">
        <div class="step-content">
          <p class="step-desc">
            Sube el archivo de materias. Columnas:
            <span class="code-tag">id_materia_sm_vc</span>,
            <span class="code-tag">nombre_sm_vc</span>,
            <span class="code-tag">orden_sm_int</span>.
          </p>
          <div
            class="upload-zone"
            :class="{ 'upload-zone--active': dragActive[2] }"
            @dragover.prevent="dragActive[2] = true"
            @dragleave="dragActive[2] = false"
            @drop.prevent="handleDrop($event, 2)"
          >
            <template v-if="!archivos[2]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" @click="triggerInput(2)" />
              <input ref="input2" type="file" accept=".csv,.xlsx" hidden @change="handleFile($event, 2)" />
            </template>
            <template v-else>
              <q-icon name="task" size="32px" color="teal-4" />
              <p class="file-name">{{ archivos[2].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm" @click="archivos[2] = null" />
            </template>
          </div>
        </div>
      </q-step>

      <!-- ── PASO 3: Requisitos ── -->
      <q-step :name="3" title="Requisitos" icon="checklist" prefix="03">
        <div class="step-content">
          <p class="step-desc">
            Sube el archivo de requisitos/documentos solicitados. Columnas:
            <span class="code-tag">id_requisito_sm_vc</span>,
            <span class="code-tag">materia_id_sm_vc</span>,
            <span class="code-tag">nombre_sm_vc</span>,
            <span class="code-tag">obligatorio_sm_vc</span>.
          </p>
          <div
            class="upload-zone"
            :class="{ 'upload-zone--active': dragActive[3] }"
            @dragover.prevent="dragActive[3] = true"
            @dragleave="dragActive[3] = false"
            @drop.prevent="handleDrop($event, 3)"
          >
            <template v-if="!archivos[3]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" @click="triggerInput(3)" />
              <input ref="input3" type="file" accept=".csv,.xlsx" hidden @change="handleFile($event, 3)" />
            </template>
            <template v-else>
              <q-icon name="task" size="32px" color="teal-4" />
              <p class="file-name">{{ archivos[3].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm" @click="archivos[3] = null" />
            </template>
          </div>

          <!-- Resumen final antes de importar -->
          <div class="import-summary">
            <p class="summary-title">Resumen de importación:</p>
            <div v-for="(label, idx) in ['Usuarios', 'Materias', 'Requisitos']" :key="idx" class="summary-row">
              <q-icon
                :name="archivos[idx+1] ? 'check_circle' : 'cancel'"
                :color="archivos[idx+1] ? 'teal-4' : 'red-4'"
                size="16px"
              />
              <span>{{ label }}: {{ archivos[idx+1] ? archivos[idx+1].name : 'Sin archivo' }}</span>
            </div>
            <div class="summary-row" :class="{ 'summary-row--warn': truncarDatos }">
              <q-icon :name="truncarDatos ? 'warning' : 'info'" :color="truncarDatos ? 'amber-4' : 'blue-grey-5'" size="16px" />
              <span>Truncar datos: {{ truncarDatos ? 'SÍ (activo)' : 'NO' }}</span>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Navegación del Stepper -->
      <template #navigation>
        <q-stepper-navigation class="stepper-nav">
          <q-btn
            v-if="step > 1"
            flat
            no-caps
            label="Anterior"
            icon="arrow_back"
            color="grey-5"
            @click="step--"
            class="nav-btn-prev"
          />
          <q-btn
            v-if="step < 3"
            unelevated
            no-caps
            :label="`Siguiente — Paso ${step + 1}`"
            icon-right="arrow_forward"
            :disable="!archivos[step]"
            class="nav-btn-next"
            @click="step++"
          />
          <q-btn
            v-else
            unelevated
            no-caps
            label="Ejecutar Importación"
            icon="rocket_launch"
            class="nav-btn-submit"
            :loading="importing"
            @click="ejecutarImportacion"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>

  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useQuasar } from 'quasar'

const auth = useAuthStore()
const $q = useQuasar()

const step = ref(1)
const truncarDatos = ref(false)
const importing = ref(false)
const dragActive = reactive({ 1: false, 2: false, 3: false })
const archivos = reactive({ 1: null, 2: null, 3: null })
const input1 = ref(null)
const input2 = ref(null)
const input3 = ref(null)

function triggerInput(n) {
  const refs = { 1: input1, 2: input2, 3: input3 }
  refs[n].value?.click()
}

function handleFile(e, n) {
  archivos[n] = e.target.files[0] || null
}

function handleDrop(e, n) {
  dragActive[n] = false
  archivos[n] = e.dataTransfer.files[0] || null
}

async function ejecutarImportacion() {
  importing.value = true
  await new Promise((r) => setTimeout(r, 1500))
  importing.value = false
  $q.notify({
    type: 'positive',
    message: 'Importación completada con éxito.',
    caption: 'Los registros han sido procesados.',
    icon: 'check_circle',
    position: 'top-right',
    timeout: 4000
  })
  step.value = 1
  archivos[1] = archivos[2] = archivos[3] = null
  truncarDatos.value = false
}
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.page-header { margin-bottom: 1.25rem; }
.page-title-row { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title { font-size: 1.2rem; font-weight: 700; color: #c8dde8; letter-spacing: 0.06em; margin: 0; font-family: 'IBM Plex Mono', monospace; }
.page-subtitle { font-size: 0.72rem; color: #3a5a78; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.code-tag { background: rgba(111,255,233,0.08); color: #5bc0be; padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; font-family: 'IBM Plex Mono', monospace; }

/* Truncar Panel */
.truncar-panel { background: rgba(240,165,0,0.05); border: 1px solid rgba(240,165,0,0.15); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; max-width: 720px; }
.truncar-content { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.truncar-title { font-size: 0.82rem; font-weight: 600; color: #c8dde8; margin: 0 0 0.25rem; display: flex; align-items: center; font-family: 'IBM Plex Mono', monospace; }
.truncar-desc { font-size: 0.72rem; color: #5a7fa8; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.truncar-toggle :deep(.q-toggle__label) { font-size: 0.7rem; color: #7aa0b8; }
.truncar-warning { display: flex; align-items: center; gap: 0.4rem; font-size: 0.68rem; color: #c8982a; margin-top: 0.75rem; font-family: 'IBM Plex Sans', sans-serif; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-6px); }
.slide-down-leave-to { opacity: 0; }

/* Stepper */
:deep(.sntnl-stepper) { background: rgba(255,255,255,0.02) !important; border: 1px solid rgba(111,255,233,0.08) !important; border-radius: 12px !important; max-width: 720px; }
:deep(.sntnl-stepper .q-stepper__tab) { font-size: 0.72rem; }
:deep(.sntnl-stepper .q-stepper__step-inner) { padding: 1.25rem 1.5rem; }
:deep(.sntnl-stepper .q-stepper__line) { border-color: rgba(111,255,233,0.1) !important; }

.step-content { padding: 0.25rem 0; }
.step-desc { font-size: 0.78rem; color: #5a7fa8; line-height: 1.7; margin-bottom: 1.25rem; font-family: 'IBM Plex Sans', sans-serif; }

/* Upload Zone */
.upload-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 2rem; border: 2px dashed rgba(111,255,233,0.15); border-radius: 10px; background: rgba(111,255,233,0.02); cursor: pointer; transition: all 0.2s; min-height: 160px; text-align: center; }
.upload-zone p { font-size: 0.78rem; color: #4a6a88; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.upload-zone--active { border-color: rgba(111,255,233,0.5) !important; background: rgba(111,255,233,0.05) !important; }
.file-name { font-size: 0.78rem; color: #6fffe9; font-family: 'IBM Plex Mono', monospace; }

/* Preview */
.preview-table { margin-top: 1rem; border: 1px solid rgba(111,255,233,0.08); border-radius: 8px; overflow: hidden; }
.preview-label { font-size: 0.65rem; color: #2e4a6a; padding: 0.5rem 0.75rem; margin: 0; background: rgba(0,0,0,0.2); letter-spacing: 0.08em; font-family: 'IBM Plex Mono', monospace; }
.preview-row { display: grid; grid-template-columns: repeat(3, 1fr); padding: 0.4rem 0.75rem; gap: 1rem; font-size: 0.68rem; font-family: 'IBM Plex Mono', monospace; border-bottom: 1px solid rgba(255,255,255,0.03); }
.preview-row--header { background: rgba(0,0,0,0.2); color: #3a5a78; }
.preview-row:not(.preview-row--header) { color: #7aa0b8; }
.preview-row:last-child { border-bottom: none; }

/* Import summary */
.import-summary { margin-top: 1.25rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; }
.summary-title { font-size: 0.65rem; letter-spacing: 0.12em; color: #3a5a78; text-transform: uppercase; margin: 0 0 0.6rem; font-family: 'IBM Plex Mono', monospace; }
.summary-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: #5a7fa8; padding: 0.25rem 0; font-family: 'IBM Plex Mono', monospace; }
.summary-row--warn { color: #c8982a; }

/* Stepper Nav */
.stepper-nav { display: flex; gap: 0.75rem; padding: 0.75rem 0 0.25rem; }
.nav-btn-prev { font-size: 0.72rem !important; color: #5a7fa8 !important; }
.nav-btn-next { background: rgba(111,255,233,0.12) !important; color: #6fffe9 !important; border: 1px solid rgba(111,255,233,0.25) !important; font-size: 0.72rem !important; border-radius: 6px !important; }
.nav-btn-submit { background: #6fffe9 !important; color: #0b132b !important; font-size: 0.72rem !important; font-weight: 700 !important; border-radius: 6px !important; }
</style>
