<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="upload_file" size="22px" color="amber-4" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Carga Masiva</h1>
      </div>
      <p class="page-subtitle_sm_vc">Asistente de importación paso a paso — Pasos 1 y 2</p>
    </div>

    <!-- ── Toggle: Truncar datos ── -->
    <div class="truncar-panel_sm_vc">
      <div class="truncar-content_sm_vc">
        <div>
          <p class="truncar-title_sm_vc">
            <q-icon name="warning" size="16px" color="amber-4" class="q-mr-xs" />
            Truncar datos existentes
          </p>
          <p class="truncar-desc_sm_vc">
            Limpia la BD antes de importar. Tu usuario actual
            (<span class="code-tag_sm_vc">{{ auth.user?.id_sm_vc }}</span>) no será eliminado.
          </p>
        </div>
        <q-toggle
          v-model="truncar_datos_sm_vc"
          color="amber"
          keep-color
          :label="truncar_datos_sm_vc ? 'Habilitado' : 'Deshabilitado'"
          class="truncar-toggle_sm_vc"
          dark
        />
      </div>
      <transition name="slide-down_sm_vc">
        <div v-if="truncar_datos_sm_vc" class="truncar-warning_sm_vc">
          <q-icon name="error" size="14px" color="amber-4" />
          <span>Esta operación es irreversible. Todos los datos existentes (excepto tu cuenta) serán eliminados.</span>
        </div>
      </transition>
    </div>

    <!-- ── Stepper ── -->
    <q-stepper
      v-model="step_sm_vc"
      flat
      dark
      animated
      class="sntnl-stepper_sm_vc"
      color="teal"
      active-color="teal-3"
      done-color="teal-4"
      inactive-color="blue-grey-7"
    >
      <!-- ── PASO 1: Usuarios ── -->
      <q-step :name="1" title="Usuarios" icon="group" :done="step_sm_vc > 1" prefix="01">
        <div class="step-content_sm_vc">
          <p class="step-desc_sm_vc">
            Sube un archivo <span class="code-tag_sm_vc">.csv</span> o
            <span class="code-tag_sm_vc">.xlsx</span> con los usuarios a importar.
            Columnas requeridas:
            <span class="code-tag_sm_vc">correo_sm_vc</span>,
            <span class="code-tag_sm_vc">nombre_sm_vc</span>,
            <span class="code-tag_sm_vc">rol_sm_vc</span>,
            <span class="code-tag_sm_vc">clave_sm_vc</span>.
          </p>

          <div
            class="upload-zone_sm_vc"
            :class="{ 'upload-zone--active_sm_vc': drag_active_sm_vc[1] }"
            @dragover.prevent="drag_active_sm_vc[1] = true"
            @dragleave="drag_active_sm_vc[1] = false"
            @drop.prevent="handle_drop_sm_vc($event, 1)"
          >
            <template v-if="!archivos_sm_vc[1]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" @click="trigger_input_sm_vc(1)" />
              <input ref="input_1_sm_vc" type="file" accept=".csv,.xlsx" hidden @change="handle_file_sm_vc($event, 1)" />
            </template>
            <template v-else>
              <q-icon name="task" size="32px" color="teal-4" />
              <p class="file-name_sm_vc">{{ archivos_sm_vc[1].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm" @click="archivos_sm_vc[1] = null" />
            </template>
          </div>
          
          <div class="action-btn-row_sm_vc q-mt-md q-gutter-x-sm text-center">
            <q-btn @click="descargar_datos_sm_vc('usuarios')" unelevated color="teal-9" text-color="teal-3" icon="download" label="Descargar Datos Actuales" no-caps size="sm" />
            <q-btn @click="descargar_plantilla_sm_vc('usuarios')" outline color="teal-3" icon="table_chart" label="Descargar Plantilla" no-caps size="sm" />
          </div>

          <!-- Preview ficticio -->
          <div v-if="archivos_sm_vc[1]" class="preview-table_sm_vc q-mt-md">
            <p class="preview-label_sm_vc">Vista previa (primeras 3 filas simuladas):</p>
            <div class="preview-row_sm_vc preview-row--header_sm_vc">
              <span>correo_sm_vc</span><span>nombre_sm_vc</span><span>rol_sm_vc</span>
            </div>
            <div v-for="n in 3" :key="n" class="preview-row_sm_vc">
              <span>usuario{{ n }}@une.edu.ve</span>
              <span>Usuario {{ n }}</span>
              <span>ESTUDIANTE</span>
            </div>
          </div>
        </div>
      </q-step>

      <!-- ── PASO 2: Requisitos ── -->
      <q-step :name="2" title="Requisitos" icon="checklist" prefix="02">
        <div class="step-content_sm_vc">
          <p class="step-desc_sm_vc">
            Sube el archivo de requisitos/documentos solicitados. Columnas:
            <span class="code-tag_sm_vc">id_requisito_sm_vc</span>,
            <span class="code-tag_sm_vc">materia_id_sm_vc</span>,
            <span class="code-tag_sm_vc">nombre_sm_vc</span>,
            <span class="code-tag_sm_vc">obligatorio_sm_vc</span>.
          </p>
          <div
            class="upload-zone_sm_vc"
            :class="{ 'upload-zone--active_sm_vc': drag_active_sm_vc[2] }"
            @dragover.prevent="drag_active_sm_vc[2] = true"
            @dragleave="drag_active_sm_vc[2] = false"
            @drop.prevent="handle_drop_sm_vc($event, 2)"
          >
            <template v-if="!archivos_sm_vc[2]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" @click="trigger_input_sm_vc(2)" />
              <input ref="input_2_sm_vc" type="file" accept=".csv,.xlsx" hidden @change="handle_file_sm_vc($event, 2)" />
            </template>
            <template v-else>
              <q-icon name="task" size="32px" color="teal-4" />
              <p class="file-name_sm_vc">{{ archivos_sm_vc[2].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm" @click="archivos_sm_vc[2] = null" />
            </template>
          </div>

          <div class="action-btn-row_sm_vc q-mt-md q-gutter-x-sm text-center">
            <q-btn @click="descargar_datos_sm_vc('requisitos')" unelevated color="teal-9" text-color="teal-3" icon="download" label="Descargar Datos Actuales" no-caps size="sm" />
            <q-btn @click="descargar_plantilla_sm_vc('requisitos')" outline color="teal-3" icon="table_chart" label="Descargar Plantilla" no-caps size="sm" />
          </div>

          <!-- Resumen final antes de importar -->
          <div class="import-summary_sm_vc">
            <p class="summary-title_sm_vc">Resumen de importación:</p>
            <div v-for="(label, idx) in ['Usuarios', 'Requisitos']" :key="idx" class="summary-row_sm_vc">
              <q-icon
                :name="archivos_sm_vc[idx+1] ? 'check_circle' : 'cancel'"
                :color="archivos_sm_vc[idx+1] ? 'teal-4' : 'red-4'"
                size="16px"
              />
              <span>{{ label }}: {{ archivos_sm_vc[idx+1] ? archivos_sm_vc[idx+1].name : 'Sin archivo' }}</span>
            </div>
            <div class="summary-row_sm_vc" :class="{ 'summary-row--warn_sm_vc': truncar_datos_sm_vc }">
              <q-icon :name="truncar_datos_sm_vc ? 'warning' : 'info'" :color="truncar_datos_sm_vc ? 'amber-4' : 'blue-grey-5'" size="16px" />
              <span>Truncar datos: {{ truncar_datos_sm_vc ? 'SÍ (activo)' : 'NO' }}</span>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Navegación del Stepper -->
      <template #navigation>
        <q-stepper-navigation class="stepper-nav_sm_vc">
          <q-btn
            v-if="step_sm_vc > 1"
            flat
            no-caps
            label="Anterior"
            icon="arrow_back"
            color="grey-5"
            @click="step_sm_vc--"
            class="nav-btn-prev_sm_vc"
          />
          <q-btn
            v-if="step_sm_vc < 2"
            unelevated
            no-caps
            :label="`Siguiente — Paso ${step_sm_vc + 1}`"
            icon-right="arrow_forward"
            :disable="!archivos_sm_vc[step_sm_vc]"
            class="nav-btn-next_sm_vc"
            @click="step_sm_vc++"
          />
          <q-btn
            v-else
            unelevated
            no-caps
            label="Ejecutar Importación"
            icon="rocket_launch"
            class="nav-btn-submit_sm_vc"
            :loading="importing_sm_vc"
            @click="ejecutar_importacion_sm_vc"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useQuasar } from 'quasar'

const auth = useAuthStore()
const $q = useQuasar()

const step_sm_vc = ref(1)
const truncar_datos_sm_vc = ref(false)
const importing_sm_vc = ref(false)

const drag_active_sm_vc = ref({ 1: false, 2: false })
const archivos_sm_vc = ref({ 1: null, 2: null })

const input_1_sm_vc = ref(null)
const input_2_sm_vc = ref(null)

function trigger_input_sm_vc(n) {
  const refs = { 1: input_1_sm_vc, 2: input_2_sm_vc }
  refs[n].value?.click()
}

function handle_file_sm_vc(e, n) {
  archivos_sm_vc.value[n] = e.target.files[0] || null
}

function handle_drop_sm_vc(e, n) {
  drag_active_sm_vc.value[n] = false
  archivos_sm_vc.value[n] = e.dataTransfer.files[0] || null
}

function descargar_datos_sm_vc(tipo) {
  $q.notify({
    type: 'info',
    message: `Iniciando descarga de datos actuales (${tipo})...`,
    position: 'top-right',
    icon: 'download',
    timeout: 2500
  })
}

function descargar_plantilla_sm_vc(tipo) {
  $q.notify({
    type: 'info',
    message: `Generando plantilla para ${tipo}...`,
    position: 'top-right',
    icon: 'table_chart',
    timeout: 2500
  })
}

async function ejecutar_importacion_sm_vc() {
  importing_sm_vc.value = true
  await new Promise((r) => setTimeout(r, 1500))
  importing_sm_vc.value = false
  $q.notify({
    type: 'positive',
    message: 'Importación completada con éxito.',
    caption: 'Los registros han sido procesados.',
    icon: 'check_circle',
    position: 'top-right',
    timeout: 4000
  })
  step_sm_vc.value = 1
  archivos_sm_vc.value[1] = null
  archivos_sm_vc.value[2] = null
  truncar_datos_sm_vc.value = false
}
</script>

<style scoped>
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.page-header_sm_vc { margin-bottom: 1.25rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title_sm_vc { font-size: 1.2rem; font-weight: 700; color: #c8dde8; letter-spacing: 0.06em; margin: 0; font-family: 'IBM Plex Mono', monospace; }
.page-subtitle_sm_vc { font-size: 0.72rem; color: #3a5a78; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.code-tag_sm_vc { background: rgba(111,255,233,0.08); color: #5bc0be; padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; font-family: 'IBM Plex Mono', monospace; }

/* Truncar Panel */
.truncar-panel_sm_vc { background: rgba(240,165,0,0.05); border: 1px solid rgba(240,165,0,0.15); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; max-width: 720px; }
.truncar-content_sm_vc { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.truncar-title_sm_vc { font-size: 0.82rem; font-weight: 600; color: #c8dde8; margin: 0 0 0.25rem; display: flex; align-items: center; font-family: 'IBM Plex Mono', monospace; }
.truncar-desc_sm_vc { font-size: 0.72rem; color: #5a7fa8; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.truncar-toggle_sm_vc :deep(.q-toggle__label) { font-size: 0.7rem; color: #7aa0b8; }
.truncar-warning_sm_vc { display: flex; align-items: center; gap: 0.4rem; font-size: 0.68rem; color: #c8982a; margin-top: 0.75rem; font-family: 'IBM Plex Sans', sans-serif; }
.slide-down_sm_vc-enter-active, .slide-down_sm_vc-leave-active { transition: all 0.2s ease; }
.slide-down_sm_vc-enter-from { opacity: 0; transform: translateY(-6px); }
.slide-down_sm_vc-leave-to { opacity: 0; }

/* Stepper */
:deep(.sntnl-stepper_sm_vc) { background: rgba(255,255,255,0.02) !important; border: 1px solid rgba(111,255,233,0.08) !important; border-radius: 12px !important; max-width: 720px; }
:deep(.sntnl-stepper_sm_vc .q-stepper__tab) { font-size: 0.72rem; }
:deep(.sntnl-stepper_sm_vc .q-stepper__step-inner) { padding: 1.25rem 1.5rem; }
:deep(.sntnl-stepper_sm_vc .q-stepper__line) { border-color: rgba(111,255,233,0.1) !important; }

.step-content_sm_vc { padding: 0.25rem 0; }
.step-desc_sm_vc { font-size: 0.78rem; color: #5a7fa8; line-height: 1.7; margin-bottom: 1.25rem; font-family: 'IBM Plex Sans', sans-serif; }

/* Upload Zone */
.upload-zone_sm_vc { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 2rem; border: 2px dashed rgba(111,255,233,0.15); border-radius: 10px; background: rgba(111,255,233,0.02); cursor: pointer; transition: all 0.2s; min-height: 160px; text-align: center; }
.upload-zone_sm_vc p { font-size: 0.78rem; color: #4a6a88; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.upload-zone--active_sm_vc { border-color: rgba(111,255,233,0.5) !important; background: rgba(111,255,233,0.05) !important; }
.file-name_sm_vc { font-size: 0.78rem; color: #6fffe9; font-family: 'IBM Plex Mono', monospace; }

/* Preview */
.preview-table_sm_vc { margin-top: 1rem; border: 1px solid rgba(111,255,233,0.08); border-radius: 8px; overflow: hidden; }
.preview-label_sm_vc { font-size: 0.65rem; color: #2e4a6a; padding: 0.5rem 0.75rem; margin: 0; background: rgba(0,0,0,0.2); letter-spacing: 0.08em; font-family: 'IBM Plex Mono', monospace; }
.preview-row_sm_vc { display: grid; grid-template-columns: repeat(3, 1fr); padding: 0.4rem 0.75rem; gap: 1rem; font-size: 0.68rem; font-family: 'IBM Plex Mono', monospace; border-bottom: 1px solid rgba(255,255,255,0.03); }
.preview-row--header_sm_vc { background: rgba(0,0,0,0.2); color: #3a5a78; }
.preview-row_sm_vc:not(.preview-row--header_sm_vc) { color: #7aa0b8; }
.preview-row_sm_vc:last-child { border-bottom: none; }

/* Import summary */
.import-summary_sm_vc { margin-top: 1.25rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; }
.summary-title_sm_vc { font-size: 0.65rem; letter-spacing: 0.12em; color: #3a5a78; text-transform: uppercase; margin: 0 0 0.6rem; font-family: 'IBM Plex Mono', monospace; }
.summary-row_sm_vc { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: #5a7fa8; padding: 0.25rem 0; font-family: 'IBM Plex Mono', monospace; }
.summary-row--warn_sm_vc { color: #c8982a; }

/* Stepper Nav */
.stepper-nav_sm_vc { display: flex; gap: 0.75rem; padding: 0.75rem 0 0.25rem; }
.nav-btn-prev_sm_vc { font-size: 0.72rem !important; color: #5a7fa8 !important; }
.nav-btn-next_sm_vc { background: rgba(111,255,233,0.12) !important; color: #6fffe9 !important; border: 1px solid rgba(111,255,233,0.25) !important; font-size: 0.72rem !important; border-radius: 6px !important; }
.nav-btn-submit_sm_vc { background: #6fffe9 !important; color: #0b132b !important; font-size: 0.72rem !important; font-weight: 700 !important; border-radius: 6px !important; }
</style>
