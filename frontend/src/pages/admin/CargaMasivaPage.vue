<!-- ══════════════════════════════════════════════════════════════════
     CargaMasivaPage.vue — Asistente de importación paso a paso.
     Thin Page: toda la lógica de steps en el script con sufijos
     _sm_vc. Elimina refs de archivos sin sufijo. Arrow Functions.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="upload_file" size="22px" color="amber-4" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Carga Masiva</h1>
      </div>
      <p class="page-subtitle_sm_vc">Asistente de importación paso a paso — 2 etapas</p>
    </div>

    <!-- Toggle truncar datos -->
    <div class="truncar-panel_sm_vc">
      <div class="truncar-content_sm_vc">
        <div>
          <p class="truncar-title_sm_vc">
            <q-icon name="warning" size="16px" color="amber-4" class="q-mr-xs" />
            Truncar datos existentes
          </p>
          <p class="truncar-desc_sm_vc">
            Limpia la BD antes de importar. Tu usuario
            (<span class="code-tag_sm_vc">{{ auth_sm_vc.user?.id_sm_vc }}</span>)
            no será eliminado.
          </p>
        </div>
        <q-toggle
          v-model="truncarDatos_sm_vc"
          color="amber" keep-color dark
          :label="truncarDatos_sm_vc ? 'Habilitado' : 'Deshabilitado'"
          class="truncar-toggle_sm_vc" />
      </div>
      <transition name="slide-down">
        <div v-if="truncarDatos_sm_vc" class="truncar-warning_sm_vc">
          <q-icon name="error" size="14px" color="amber-4" />
          <span>Esta operación es irreversible. Todos los datos (excepto tu cuenta) serán eliminados.</span>
        </div>
      </transition>
    </div>

    <!-- Stepper -->
    <q-stepper
      v-model="step_sm_vc"
      flat dark animated
      class="sntnl-stepper_sm_vc"
      color="teal" active-color="teal-3"
      done-color="teal-4" inactive-color="blue-grey-7">

      <!-- ── Paso 1: Usuarios ── -->
      <q-step :name="1" title="Usuarios" icon="group" :done="step_sm_vc > 1" prefix="01">
        <div class="step-content_sm_vc">
          <p class="step-desc_sm_vc">
            Sube un archivo <span class="code-tag_sm_vc">.csv</span> o
            <span class="code-tag_sm_vc">.xlsx</span> con los usuarios.
            Columnas requeridas:
            <span class="code-tag_sm_vc">correo_sm_vc</span>,
            <span class="code-tag_sm_vc">nombre_sm_vc</span>,
            <span class="code-tag_sm_vc">rol_sm_vc</span>,
            <span class="code-tag_sm_vc">clave_sm_vc</span>.
          </p>

          <div
            class="upload-zone_sm_vc"
            :class="{ 'upload-zone--active_sm_vc': dragActivo_sm_vc[1] }"
            @dragover.prevent="dragActivo_sm_vc[1] = true"
            @dragleave="dragActivo_sm_vc[1] = false"
            @drop.prevent="handleDrop_sm_vc($event, 1)"
            @click="triggerInput_sm_vc(1)">
            <template v-if="!archivos_sm_vc[1]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" />
              <input
                ref="inputRef1_sm_vc"
                type="file" accept=".csv,.xlsx" hidden
                @change="handleFile_sm_vc($event, 1)" />
            </template>
            <template v-else>
              <q-icon name="task" size="32px" color="teal-4" />
              <p class="file-name_sm_vc">{{ archivos_sm_vc[1].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm"
                @click.stop="archivos_sm_vc[1] = null" />
            </template>
          </div>

          <div class="action-btn-row_sm_vc q-mt-md">
            <q-btn unelevated color="teal-9" text-color="teal-3"
              icon="download" label="Descargar Datos Actuales" no-caps size="sm"
              @click="descargarDatos_sm_vc('usuarios')" />
            <q-btn outline color="teal-3"
              icon="table_chart" label="Descargar Plantilla" no-caps size="sm"
              @click="descargarPlantilla_sm_vc('usuarios')" />
          </div>

          <!-- Preview simulado -->
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

      <!-- ── Paso 2: Requisitos ── -->
      <q-step :name="2" title="Requisitos" icon="checklist" prefix="02">
        <div class="step-content_sm_vc">
          <p class="step-desc_sm_vc">
            Sube el archivo de requisitos solicitados. Columnas:
            <span class="code-tag_sm_vc">id_requisito_sm_vc</span>,
            <span class="code-tag_sm_vc">materia_id_sm_vc</span>,
            <span class="code-tag_sm_vc">nombre_sm_vc</span>,
            <span class="code-tag_sm_vc">obligatorio_sm_vc</span>.
          </p>

          <div
            class="upload-zone_sm_vc"
            :class="{ 'upload-zone--active_sm_vc': dragActivo_sm_vc[2] }"
            @dragover.prevent="dragActivo_sm_vc[2] = true"
            @dragleave="dragActivo_sm_vc[2] = false"
            @drop.prevent="handleDrop_sm_vc($event, 2)"
            @click="triggerInput_sm_vc(2)">
            <template v-if="!archivos_sm_vc[2]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" />
              <input
                ref="inputRef2_sm_vc"
                type="file" accept=".csv,.xlsx" hidden
                @change="handleFile_sm_vc($event, 2)" />
            </template>
            <template v-else>
              <q-icon name="task" size="32px" color="teal-4" />
              <p class="file-name_sm_vc">{{ archivos_sm_vc[2].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm"
                @click.stop="archivos_sm_vc[2] = null" />
            </template>
          </div>

          <div class="action-btn-row_sm_vc q-mt-md">
            <q-btn unelevated color="teal-9" text-color="teal-3"
              icon="download" label="Descargar Datos Actuales" no-caps size="sm"
              @click="descargarDatos_sm_vc('requisitos')" />
            <q-btn outline color="teal-3"
              icon="table_chart" label="Descargar Plantilla" no-caps size="sm"
              @click="descargarPlantilla_sm_vc('requisitos')" />
          </div>

          <!-- Resumen antes de importar -->
          <div class="import-summary_sm_vc">
            <p class="summary-title_sm_vc">Resumen de importación:</p>
            <div
              v-for="(label, idx) in ['Usuarios', 'Requisitos']"
              :key="idx"
              class="summary-row_sm_vc">
              <q-icon
                :name="archivos_sm_vc[idx + 1] ? 'check_circle' : 'cancel'"
                :color="archivos_sm_vc[idx + 1] ? 'teal-4' : 'red-4'"
                size="16px" />
              <span>{{ label }}: {{ archivos_sm_vc[idx + 1] ? archivos_sm_vc[idx + 1].name : 'Sin archivo' }}</span>
            </div>
            <div class="summary-row_sm_vc" :class="{ 'summary-row--warn_sm_vc': truncarDatos_sm_vc }">
              <q-icon
                :name="truncarDatos_sm_vc ? 'warning' : 'info'"
                :color="truncarDatos_sm_vc ? 'amber-4' : 'blue-grey-5'"
                size="16px" />
              <span>Truncar datos: {{ truncarDatos_sm_vc ? 'SÍ (activo)' : 'NO' }}</span>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Navegación del stepper -->
      <template #navigation>
        <q-stepper-navigation class="stepper-nav_sm_vc">
          <q-btn
            v-if="step_sm_vc > 1"
            flat no-caps label="Anterior" icon="arrow_back"
            color="grey-5" class="nav-btn-prev_sm_vc"
            @click="step_sm_vc--" />
          <q-btn
            v-if="step_sm_vc < 2"
            unelevated no-caps
            :label="`Siguiente — Paso ${step_sm_vc + 1}`"
            icon-right="arrow_forward"
            :disable="!archivos_sm_vc[step_sm_vc]"
            class="nav-btn-next_sm_vc"
            @click="step_sm_vc++" />
          <q-btn
            v-else
            unelevated no-caps
            label="Ejecutar Importación" icon="rocket_launch"
            class="nav-btn-submit_sm_vc"
            :loading="importando_sm_vc"
            @click="ejecutarImportacion_sm_vc" />
        </q-stepper-navigation>
      </template>
    </q-stepper>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useQuasar } from 'quasar'

const auth_sm_vc = useAuthStore()
const $q_sm_vc   = useQuasar()

/* ── State ── */
const step_sm_vc         = ref(1)
const truncarDatos_sm_vc = ref(false)
const importando_sm_vc   = ref(false)
const dragActivo_sm_vc   = ref({ 1: false, 2: false })
const archivos_sm_vc     = ref({ 1: null, 2: null })
const inputRef1_sm_vc    = ref(null)
const inputRef2_sm_vc    = ref(null)

/* ── Helpers ── */
const triggerInput_sm_vc = (n_sm_vc) => {
  const refs_sm_vc = { 1: inputRef1_sm_vc, 2: inputRef2_sm_vc }
  refs_sm_vc[n_sm_vc].value?.click()
}

const handleFile_sm_vc = (e_sm_vc, n_sm_vc) => {
  archivos_sm_vc.value[n_sm_vc] = e_sm_vc.target.files[0] || null
}

const handleDrop_sm_vc = (e_sm_vc, n_sm_vc) => {
  dragActivo_sm_vc.value[n_sm_vc] = false
  archivos_sm_vc.value[n_sm_vc] = e_sm_vc.dataTransfer.files[0] || null
}

const descargarDatos_sm_vc = (tipo_sm_vc) => {
  $q_sm_vc.notify({
    type: 'info',
    message: `Iniciando descarga de datos actuales (${tipo_sm_vc})…`,
    position: 'top-right', icon: 'download', timeout: 2500
  })
}

const descargarPlantilla_sm_vc = (tipo_sm_vc) => {
  $q_sm_vc.notify({
    type: 'info',
    message: `Generando plantilla para ${tipo_sm_vc}…`,
    position: 'top-right', icon: 'table_chart', timeout: 2500
  })
}

const ejecutarImportacion_sm_vc = async () => {
  importando_sm_vc.value = true
  await new Promise((r) => setTimeout(r, 1500))
  importando_sm_vc.value = false
  $q_sm_vc.notify({
    type: 'positive',
    message: 'Importación completada con éxito.',
    caption: 'Los registros han sido procesados.',
    icon: 'check_circle', position: 'top-right', timeout: 4000
  })
  step_sm_vc.value = 1
  archivos_sm_vc.value = { 1: null, 2: null }
  truncarDatos_sm_vc.value = false
}
</script>

<style scoped>
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.page-header_sm_vc { margin-bottom: 1.25rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.page-title_sm_vc { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: .06em; margin: 0; font-family: var(--sn-font-mono); }
.page-subtitle_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; font-family: var(--sn-font-sans); }
.code-tag_sm_vc { background: rgba(111,255,233,.08); color: var(--sn-acento-sec); padding: 1px 5px; border-radius: 3px; font-size: .68rem; font-family: var(--sn-font-mono); }
.truncar-panel_sm_vc { background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; max-width: 720px; }
.truncar-content_sm_vc { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.truncar-title_sm_vc { font-size: .82rem; font-weight: 600; color: var(--sn-texto-principal); margin: 0 0 .25rem; display: flex; align-items: center; font-family: var(--sn-font-mono); }
.truncar-desc_sm_vc { font-size: .72rem; color: var(--sn-texto-secundario); margin: 0; font-family: var(--sn-font-sans); }
:deep(.truncar-toggle_sm_vc .q-toggle__label) { font-size: .7rem; color: var(--sn-texto-secundario); }
.truncar-warning_sm_vc { display: flex; align-items: center; gap: .4rem; font-size: .68rem; color: var(--sn-advertencia); margin-top: .75rem; font-family: var(--sn-font-sans); }
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-6px); }
.slide-down-leave-to { opacity: 0; }
:deep(.sntnl-stepper_sm_vc) { background: rgba(255,255,255,.02) !important; border: 1px solid var(--sn-borde) !important; border-radius: 12px !important; max-width: 720px; }
:deep(.sntnl-stepper_sm_vc .q-stepper__step-inner) { padding: 1.25rem 1.5rem; }
.step-content_sm_vc { padding: .25rem 0; }
.step-desc_sm_vc { font-size: .78rem; color: var(--sn-texto-secundario); line-height: 1.7; margin-bottom: 1.25rem; font-family: var(--sn-font-sans); }
.upload-zone_sm_vc { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .5rem; padding: 2rem; border: 2px dashed var(--sn-borde-hover); border-radius: 10px; background: var(--sn-surface-alpha); cursor: pointer; transition: all .2s; min-height: 160px; text-align: center; }
.upload-zone_sm_vc p { font-size: .78rem; color: var(--sn-texto-secundario); margin: 0; font-family: var(--sn-font-sans); }
.upload-zone--active_sm_vc { border-color: rgba(111,255,233,.5) !important; background: rgba(111,255,233,.05) !important; }
.file-name_sm_vc { font-size: .78rem; color: var(--sn-primario); font-family: var(--sn-font-mono); }
.action-btn-row_sm_vc { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
.preview-table_sm_vc { border: 1px solid var(--sn-borde); border-radius: 8px; overflow: hidden; }
.preview-label_sm_vc { font-size: .65rem; color: var(--sn-texto-apagado); padding: .5rem .75rem; margin: 0; background: rgba(0,0,0,.2); letter-spacing: .08em; font-family: var(--sn-font-mono); }
.preview-row_sm_vc { display: grid; grid-template-columns: repeat(3, 1fr); padding: .4rem .75rem; gap: 1rem; font-size: .68rem; font-family: var(--sn-font-mono); border-bottom: 1px solid rgba(255,255,255,.03); }
.preview-row--header_sm_vc { background: rgba(0,0,0,.2); color: var(--sn-texto-terciario); }
.preview-row_sm_vc:not(.preview-row--header_sm_vc) { color: var(--sn-texto-secundario); }
.preview-row_sm_vc:last-child { border-bottom: none; }
.import-summary_sm_vc { margin-top: 1.25rem; background: rgba(0,0,0,.2); border: 1px solid rgba(255,255,255,.05); border-radius: 8px; padding: 1rem; }
.summary-title_sm_vc { font-size: .65rem; letter-spacing: .12em; color: var(--sn-texto-terciario); text-transform: uppercase; margin: 0 0 .6rem; font-family: var(--sn-font-mono); }
.summary-row_sm_vc { display: flex; align-items: center; gap: .5rem; font-size: .72rem; color: var(--sn-texto-secundario); padding: .25rem 0; font-family: var(--sn-font-mono); }
.summary-row--warn_sm_vc { color: var(--sn-advertencia); }
.stepper-nav_sm_vc { display: flex; gap: .75rem; padding: .75rem 0 .25rem; }
.nav-btn-prev_sm_vc { font-size: .72rem !important; color: var(--sn-texto-secundario) !important; }
.nav-btn-next_sm_vc { background: rgba(111,255,233,.12) !important; color: var(--sn-primario) !important; border: 1px solid rgba(111,255,233,.25) !important; font-size: .72rem !important; border-radius: 6px !important; }
.nav-btn-submit_sm_vc { background: #6fffe9 !important; color: #0b132b !important; font-size: .72rem !important; font-weight: 700 !important; border-radius: 6px !important; }
</style>