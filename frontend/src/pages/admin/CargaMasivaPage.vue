<!-- ══════════════════════════════════════════════════════════════════
     CargaMasivaPage.vue — Asistente de importación paso a paso.
     Thin Page: toda la lógica de steps en el script con sufijos _sm_vc.
     Radio Group reemplaza el toggle de truncar datos.
     Validación de columnas con xlsx-populate antes de llamar al store.
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

    <!-- ── Opciones de Carga ── -->
    <div class="opciones-panel_vc">
      <div class="opciones-header_vc">
        <q-icon name="tune" size="16px" color="teal-3" class="q-mr-xs" />
        <p class="opciones-title_vc">Modo de Importación</p>
      </div>
      <p class="opciones-desc_vc">
        Define cómo se manejarán los registros existentes en la base de datos al importar los nuevos datos.
      </p>
      <q-option-group
        v-model="store_vc.opcionCarga_vc"
        :options="store_vc.OPCIONES_CARGA_vc"
        color="teal-3"
        dark
        class="carga-option-group_vc"
      />
      <!-- Aviso contextual según opción seleccionada -->
      <transition name="slide-down">
        <div v-if="store_vc.opcionCarga_vc === 'eliminar'" class="opcion-warning_vc">
          <q-icon name="warning_amber" size="14px" color="amber-4" />
          <span>Esta operación eliminará todos los registros previos (excepto tu cuenta de administrador). Es irreversible.</span>
        </div>
        <div v-else class="opcion-info_vc">
          <q-icon name="info" size="14px" color="teal-3" />
          <span>Se agregarán los nuevos registros sin eliminar los existentes.</span>
        </div>
      </transition>
    </div>

    <!-- Aviso de Plantilla Oficial -->
    <div class="plantilla-aviso_vc">
      <q-icon name="verified_user" size="18px" color="amber-4" />
      <div>
        <p class="plantilla-aviso-titulo_vc">Solo se acepta la Plantilla Oficial</p>
        <p class="plantilla-aviso-desc_vc">
          El sistema validará automáticamente el número y nombre exacto de las columnas.
          Descargar la plantilla con el botón correspondiente garantiza el formato correcto.
        </p>
      </div>
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
            Sube un archivo <span class="code-tag_sm_vc">.xlsx</span> con los usuarios.
            Columnas requeridas (en este orden exacto):
          </p>
          <!-- Badges de columnas esperadas -->
          <div class="columnas-badge-row_vc">
            <span v-for="col in store_vc.COLS_USUARIOS_vc" :key="col" class="col-badge_vc">{{ col }}</span>
          </div>

          <!-- Banner de error de columnas -->
          <q-banner
            v-if="store_vc.columnaError_vc[1]"
            dense rounded
            class="col-error-banner_vc q-mb-md">
            <template #avatar>
              <q-icon name="error" color="red-4" />
            </template>
            El archivo no cumple con las <strong>{{ store_vc.COLS_USUARIOS_vc.length }} columnas</strong> requeridas.
            Descarga la plantilla oficial e inténtalo de nuevo.
          </q-banner>

          <div
            class="upload-zone_sm_vc"
            :class="{
              'upload-zone--active_sm_vc': dragActivo_vc[1],
              'upload-zone--error_vc': store_vc.columnaError_vc[1]
            }"
            @dragover.prevent="dragActivo_vc[1] = true"
            @dragleave="dragActivo_vc[1] = false"
            @drop.prevent="handleDrop_sm_vc($event, 1)"
            @click="triggerInput_sm_vc(1)">
            <template v-if="!store_vc.archivos_vc[1]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" />
              <input
                ref="inputRef1_vc"
                type="file" accept=".xlsx" hidden
                @change="handleFile_sm_vc($event, 1)" />
            </template>
            <template v-else>
              <q-icon
                :name="store_vc.columnaError_vc[1] ? 'error' : 'task'"
                size="32px"
                :color="store_vc.columnaError_vc[1] ? 'red-4' : 'teal-4'" />
              <p class="file-name_sm_vc">{{ store_vc.archivos_vc[1].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm"
                @click.stop="store_vc.limpiarArchivo_vc(1)" />
            </template>
          </div>

          <div class="action-btn-row_sm_vc q-mt-md">
            <q-btn unelevated color="teal-9" text-color="teal-3"
              icon="download" label="Descargar Datos Actuales" no-caps size="sm"
              @click="store_vc.descargarDatos_vc('usuarios')" />
            <q-btn outline color="teal-3"
              icon="table_chart" label="Descargar Plantilla" no-caps size="sm"
              @click="store_vc.descargarPlantilla_vc(1)" />
          </div>

          <!-- Preview real de columnas -->
          <div v-if="store_vc.archivos_vc[1] && !store_vc.columnaError_vc[1]" class="preview-table_sm_vc q-mt-md">
            <p class="preview-label_sm_vc">Columnas detectadas (Paso 1):</p>
            <div class="preview-row_sm_vc preview-row--header_sm_vc"
              :style="`grid-template-columns: repeat(${store_vc.COLS_USUARIOS_vc.length}, 1fr)`">
              <span v-for="col in store_vc.COLS_USUARIOS_vc" :key="col">{{ col }}</span>
            </div>
            <div class="preview-row_sm_vc"
              :style="`grid-template-columns: repeat(${store_vc.COLS_USUARIOS_vc.length}, 1fr)`">
              <span v-for="col in store_vc.COLS_USUARIOS_vc" :key="col" class="preview-placeholder_vc">—</span>
            </div>
          </div>
        </div>
      </q-step>

      <!-- ── Paso 2: Requisitos ── -->
      <q-step :name="2" title="Requisitos" icon="checklist" prefix="02">
        <div class="step-content_sm_vc">
          <p class="step-desc_sm_vc">
            Sube el archivo de requisitos. Columnas requeridas (en este orden exacto):
          </p>
          <div class="columnas-badge-row_vc">
            <span v-for="col in store_vc.COLS_REQUISITOS_vc" :key="col" class="col-badge_vc">{{ col }}</span>
          </div>

          <!-- Banner de error de columnas -->
          <q-banner
            v-if="store_vc.columnaError_vc[2]"
            dense rounded
            class="col-error-banner_vc q-mb-md">
            <template #avatar>
              <q-icon name="error" color="red-4" />
            </template>
            El archivo no cumple con las <strong>{{ store_vc.COLS_REQUISITOS_vc.length }} columnas</strong> requeridas.
            Descarga la plantilla oficial e inténtalo de nuevo.
          </q-banner>

          <div
            class="upload-zone_sm_vc"
            :class="{
              'upload-zone--active_sm_vc': dragActivo_vc[2],
              'upload-zone--error_vc': store_vc.columnaError_vc[2]
            }"
            @dragover.prevent="dragActivo_vc[2] = true"
            @dragleave="dragActivo_vc[2] = false"
            @drop.prevent="handleDrop_sm_vc($event, 2)"
            @click="triggerInput_sm_vc(2)">
            <template v-if="!store_vc.archivos_vc[2]">
              <q-icon name="cloud_upload" size="40px" color="teal-3" />
              <p>Arrastra tu archivo aquí o</p>
              <q-btn flat no-caps label="Seleccionar archivo" color="teal-3" />
              <input
                ref="inputRef2_vc"
                type="file" accept=".xlsx" hidden
                @change="handleFile_sm_vc($event, 2)" />
            </template>
            <template v-else>
              <q-icon
                :name="store_vc.columnaError_vc[2] ? 'error' : 'task'"
                size="32px"
                :color="store_vc.columnaError_vc[2] ? 'red-4' : 'teal-4'" />
              <p class="file-name_sm_vc">{{ store_vc.archivos_vc[2].name }}</p>
              <q-btn flat no-caps label="Cambiar archivo" color="grey-5" size="sm"
                @click.stop="store_vc.limpiarArchivo_vc(2)" />
            </template>
          </div>

          <div class="action-btn-row_sm_vc q-mt-md">
            <q-btn unelevated color="teal-9" text-color="teal-3"
              icon="download" label="Descargar Datos Actuales" no-caps size="sm"
              @click="store_vc.descargarDatos_vc('requisitos')" />
            <q-btn outline color="teal-3"
              icon="table_chart" label="Descargar Plantilla" no-caps size="sm"
              @click="store_vc.descargarPlantilla_vc(2)" />
          </div>

          <!-- Resumen antes de importar -->
          <div class="import-summary_sm_vc">
            <p class="summary-title_sm_vc">Resumen de importación:</p>
            <div
              v-for="(label, idx) in ['Usuarios', 'Requisitos']"
              :key="idx"
              class="summary-row_sm_vc">
              <q-icon
                :name="store_vc.archivos_vc[idx + 1] && !store_vc.columnaError_vc[idx + 1] ? 'check_circle' : 'cancel'"
                :color="store_vc.archivos_vc[idx + 1] && !store_vc.columnaError_vc[idx + 1] ? 'teal-4' : 'red-4'"
                size="16px" />
              <span>{{ label }}: {{ store_vc.archivos_vc[idx + 1] ? store_vc.archivos_vc[idx + 1].name : 'Sin archivo' }}</span>
            </div>
            <!-- Modo de importación -->
            <div class="summary-row_sm_vc" :class="{ 'summary-row--warn_sm_vc': store_vc.opcionCarga_vc === 'eliminar' }">
              <q-icon
                :name="store_vc.opcionCarga_vc === 'eliminar' ? 'warning' : 'add_circle'"
                :color="store_vc.opcionCarga_vc === 'eliminar' ? 'amber-4' : 'teal-4'"
                size="16px" />
              <span>
                Modo: {{ store_vc.opcionCarga_vc === 'eliminar' ? 'Eliminar registros anteriores' : 'Continuar registros' }}
              </span>
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
            :disable="!store_vc.archivos_vc[step_sm_vc] || store_vc.columnaError_vc[step_sm_vc] || store_vc.validando_vc"
            :loading="store_vc.validando_vc"
            class="nav-btn-next_sm_vc"
            @click="step_sm_vc++" />
          <q-btn
            v-else
            unelevated no-caps
            label="Ejecutar Importación" icon="rocket_launch"
            class="nav-btn-submit_sm_vc"
            :disable="!store_vc.puedeEjecutar_vc()"
            :loading="store_vc.importando_vc"
            @click="ejecutarImportacion_sm_vc" />
        </q-stepper-navigation>
      </template>
    </q-stepper>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useCargaMasivaStore } from 'src/stores/cargaMasivaStore'

const store_vc = useCargaMasivaStore()

/* ── State de UI pura (DOM refs y stepper — no pertenecen al store) ── */
const step_sm_vc      = ref(1)
const dragActivo_vc   = ref({ 1: false, 2: false })
const inputRef1_vc    = ref(null)
const inputRef2_vc    = ref(null)

/* ── Helpers de UI: triggers del input nativo oculto ── */
const triggerInput_sm_vc = (paso_vc) => {
  const refs_vc = { 1: inputRef1_vc, 2: inputRef2_vc }
  refs_vc[paso_vc].value?.click()
}

/* ── Handlers de eventos del DOM → delegan al store ── */
const handleFile_sm_vc = (e_vc, paso_vc) => {
  store_vc.procesarArchivo_vc(e_vc.target.files[0] || null, paso_vc)
}

const handleDrop_sm_vc = (e_vc, paso_vc) => {
  dragActivo_vc.value[paso_vc] = false
  store_vc.procesarArchivo_vc(e_vc.dataTransfer.files[0] || null, paso_vc)
}

/* ── Ejecutar importación → delega al store y resetea el stepper ── */
const ejecutarImportacion_sm_vc = async () => {
  const ok_vc = await store_vc.ejecutarImportacion_vc()
  if (ok_vc) step_sm_vc.value = 1
}
</script>

<style scoped>
/* ── Layout general ── */
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.page-header_sm_vc { margin-bottom: 1.25rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.page-title_sm_vc { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: .06em; margin: 0; font-family: var(--sn-font-mono); }
.page-subtitle_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; font-family: var(--sn-font-sans); }
.code-tag_sm_vc { background: rgba(111,255,233,.08); color: var(--sn-acento-sec); padding: 1px 5px; border-radius: 3px; font-size: .68rem; font-family: var(--sn-font-mono); }

/* ── Panel de Opciones de Carga ── */
.opciones-panel_vc {
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  max-width: 720px;
}
.opciones-header_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.opciones-title_vc { font-size: .82rem; font-weight: 600; color: var(--sn-texto-principal); margin: 0; font-family: var(--sn-font-mono); }
.opciones-desc_vc { font-size: .72rem; color: var(--sn-texto-secundario); margin: 0 0 .75rem; font-family: var(--sn-font-sans); line-height: 1.6; }
:deep(.carga-option-group_vc .q-radio__label) { font-size: .78rem; color: var(--sn-texto-secundario); font-family: var(--sn-font-sans); }
.opcion-warning_vc,
.opcion-info_vc {
  display: flex; align-items: center; gap: .4rem;
  font-size: .68rem; margin-top: .75rem;
  font-family: var(--sn-font-sans); line-height: 1.5;
}
.opcion-warning_vc { color: var(--sn-advertencia); }
.opcion-info_vc { color: var(--sn-texto-terciario); }

/* ── Aviso Plantilla Oficial ── */
.plantilla-aviso_vc {
  display: flex; align-items: flex-start; gap: .75rem;
  background: rgba(217, 119, 6, .06);
  border: 1px solid rgba(217, 119, 6, .25);
  border-radius: 10px;
  padding: .875rem 1.1rem;
  margin-bottom: 1.5rem;
  max-width: 720px;
}
.plantilla-aviso-titulo_vc { font-size: .78rem; font-weight: 600; color: #fbbf24; margin: 0 0 .2rem; font-family: var(--sn-font-mono); }
.plantilla-aviso-desc_vc { font-size: .7rem; color: var(--sn-texto-secundario); margin: 0; font-family: var(--sn-font-sans); line-height: 1.6; }

/* ── Badges de columnas ── */
.columnas-badge-row_vc { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1rem; }
.col-badge_vc {
  background: rgba(111,255,233,.08);
  color: var(--sn-acento-sec);
  border: 1px solid rgba(111,255,233,.18);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: .65rem;
  font-family: var(--sn-font-mono);
  letter-spacing: .04em;
}

/* ── Banner de error de columnas ── */
.col-error-banner_vc {
  background: rgba(220, 38, 38, .1) !important;
  border: 1px solid rgba(220, 38, 38, .3) !important;
  color: #f87171 !important;
  font-size: .72rem;
  font-family: var(--sn-font-sans);
}

/* ── Transitions ── */
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-6px); }
.slide-down-leave-to { opacity: 0; }

/* ── Stepper ── */
:deep(.sntnl-stepper_sm_vc) { background: rgba(255,255,255,.02) !important; border: 1px solid var(--sn-borde) !important; border-radius: 12px !important; max-width: 720px; }
:deep(.sntnl-stepper_sm_vc .q-stepper__step-inner) { padding: 1.25rem 1.5rem; }
.step-content_sm_vc { padding: .25rem 0; }
.step-desc_sm_vc { font-size: .78rem; color: var(--sn-texto-secundario); line-height: 1.7; margin-bottom: .75rem; font-family: var(--sn-font-sans); }

/* ── Upload Zone ── */
.upload-zone_sm_vc { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .5rem; padding: 2rem; border: 2px dashed var(--sn-borde-hover); border-radius: 10px; background: var(--sn-surface-alpha); cursor: pointer; transition: all .2s; min-height: 160px; text-align: center; }
.upload-zone_sm_vc p { font-size: .78rem; color: var(--sn-texto-secundario); margin: 0; font-family: var(--sn-font-sans); }
.upload-zone--active_sm_vc { border-color: rgba(111,255,233,.5) !important; background: rgba(111,255,233,.05) !important; }
.upload-zone--error_vc { border-color: rgba(220,38,38,.4) !important; background: rgba(220,38,38,.04) !important; }
.file-name_sm_vc { font-size: .78rem; color: var(--sn-primario); font-family: var(--sn-font-mono); }

/* ── Botones de acción ── */
.action-btn-row_sm_vc { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }

/* ── Preview de columnas ── */
.preview-table_sm_vc { border: 1px solid var(--sn-borde); border-radius: 8px; overflow: hidden; }
.preview-label_sm_vc { font-size: .65rem; color: var(--sn-texto-apagado); padding: .5rem .75rem; margin: 0; background: rgba(0,0,0,.2); letter-spacing: .08em; font-family: var(--sn-font-mono); }
.preview-row_sm_vc { display: grid; padding: .4rem .75rem; gap: .5rem; font-size: .65rem; font-family: var(--sn-font-mono); border-bottom: 1px solid rgba(255,255,255,.03); }
.preview-row--header_sm_vc { background: rgba(0,0,0,.2); color: var(--sn-texto-terciario); }
.preview-row_sm_vc:not(.preview-row--header_sm_vc) { color: var(--sn-texto-secundario); }
.preview-row_sm_vc:last-child { border-bottom: none; }
.preview-placeholder_vc { color: var(--sn-texto-apagado); opacity: .5; }

/* ── Resumen de importación ── */
.import-summary_sm_vc { margin-top: 1.25rem; background: rgba(0,0,0,.2); border: 1px solid rgba(255,255,255,.05); border-radius: 8px; padding: 1rem; }
.summary-title_sm_vc { font-size: .65rem; letter-spacing: .12em; color: var(--sn-texto-terciario); text-transform: uppercase; margin: 0 0 .6rem; font-family: var(--sn-font-mono); }
.summary-row_sm_vc { display: flex; align-items: center; gap: .5rem; font-size: .72rem; color: var(--sn-texto-secundario); padding: .25rem 0; font-family: var(--sn-font-mono); }
.summary-row--warn_sm_vc { color: var(--sn-advertencia); }

/* ── Navegación del Stepper ── */
.stepper-nav_sm_vc { display: flex; gap: .75rem; padding: .75rem 0 .25rem; }
.nav-btn-prev_sm_vc { font-size: .72rem !important; color: var(--sn-texto-secundario) !important; }
.nav-btn-next_sm_vc { background: rgba(111,255,233,.12) !important; color: var(--sn-primario) !important; border: 1px solid rgba(111,255,233,.25) !important; font-size: .72rem !important; border-radius: 6px !important; }
.nav-btn-submit_sm_vc { background: #6fffe9 !important; color: #0b132b !important; font-size: .72rem !important; font-weight: 700 !important; border-radius: 6px !important; }
</style>