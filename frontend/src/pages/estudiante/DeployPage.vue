<!-- ══════════════════════════════════════════════════════════════════
     DeployPage.vue (estudiante) — Registro del deploy final.
     Thin Page: toda la lógica de validación y estado vive en computed
     y en el pasantiasStore. Extrae DeployUploadZone y DeployChecklist.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <q-btn
      flat no-caps icon="arrow_back" label="Volver"
      color="grey-5" size="sm" class="q-mb-md"
      @click="router_sm_vc.push('/estudiante/trazabilidad')" />

    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="rocket_launch" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Registrar Deploy Final</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Solo habilitado cuando las 4 materias estén aprobadas.
      </p>
    </div>

    <!-- Estado: Deploy Completado (Aviso de persistencia) -->
    <div v-if="deployStore_sm_vc.deployCompletado_sm_vc" class="existing-deploy-banner_sm_vc animate-in fade-in duration-500">
      <q-icon name="info" size="20px" color="teal-3" />
      <div class="banner-content_sm_vc">
        <p class="banner-title_sm_vc">Ya cuentas con un despliegue registrado</p>
        <p class="banner-desc_sm_vc">
          Los datos a continuación son los actuales. Puedes modificarlos y volver a subir los archivos si necesitas actualizar tu entrega.
        </p>
      </div>
      <q-btn
        flat no-caps label="Ver App" icon="open_in_new"
        color="teal-3" size="sm" class="ml-auto"
        type="a" :href="deployStore_sm_vc.datosDeploy_sm_vc?.url_produccion_sm_vc" target="_blank" />
    </div>

    <!-- Botón de actualización: destruye y remonta el formulario completo -->
    <div
      v-if="deployStore_sm_vc.deployCompletado_sm_vc && !mostrarFormularioActualizar_sm_vc"
      class="update-deploy-action_sm_vc"
    >
      <q-btn
        unelevated no-caps
        label="Actualizar mi Deploy"
        icon="sync"
        color="teal"
        size="sm"
        class="update-deploy-btn_sm_vc"
        @click="activarActualizacion_sm_vc" />
    </div>

    <!-- Estado bloqueado: independiente, solo cuando no puede hacer deploy y no tiene deploy existente -->
    <div
      v-if="!deployStore_sm_vc.deployCompletado_sm_vc && !puedeHacerDeploy_sm_vc"
      class="locked-state_sm_vc"
    >
      <div class="locked-icon_sm_vc">
        <q-icon name="lock" size="32px" color="blue-grey-7" />
      </div>
      <div>
        <p class="locked-title_sm_vc">Formulario bloqueado</p>
        <p class="locked-desc_sm_vc">
          Debes aprobar todos los requisitos académicos antes de registrar tu deploy.
        </p>
      </div>
    </div>

    <!-- Formulario activo: visible cuando puede hacer deploy y (no hay deploy previo O activó actualización) -->
    <template v-if="puedeHacerDeploy_sm_vc && (!deployStore_sm_vc.deployCompletado_sm_vc || mostrarFormularioActualizar_sm_vc)">
      <div class="section-notice_sm_vc">
        <q-icon name="check_circle" size="16px" color="teal-4" />
        <span>Elegibilidad académica confirmada. Completa los datos a continuación.</span>
      </div>

      <!--
        La :key reactiva deriva de formKey_sm_vc.
        Al incrementarla, Vue destruye y remonta este bloque completo,
        limpiando cualquier estado interno de DeployUploadZone.
      -->
      <q-form :key="formKey_sm_vc" @submit.prevent="registrarDeploy_sm_vc" class="deploy-form_sm_vc">
        <!-- URL producción -->
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            URL de Producción <span class="req-mark_sm_vc">*</span>
            <q-icon name="help_outline" size="12px" color="blue-grey-6" class="q-ml-xs">
              <q-tooltip class="bg-dark text-caption">
                URL donde está desplegada tu app (vía HTTPS)
              </q-tooltip>
            </q-icon>
          </label>
          <q-input
            v-model="form_sm_vc.url_produccion_sm_vc"
            dense outlined color="teal-3" class="sntnl-input_sm_vc"
            placeholder="https://mi-proyecto.netlify.app"
            lazy-rules
            :rules="[
              val => !!val || 'Campo requerido',
              val => /^https:\/\/.+/.test(val) || 'La URL debe empezar con https://'
            ]">
            <template #prepend>
              <q-icon name="link" color="teal-3" size="18px" />
            </template>
          </q-input>
        </div>

        <!-- Código fuente .zip -->
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            Código Fuente <span class="req-mark_sm_vc">*</span>
            <span class="format-hint_sm_vc">.zip</span>
          </label>
          <!--
            archivoExistente: nombre del .zip ya guardado en el servidor.
            Si está presente, DeployUploadZone muestra el chip de descarga.
            solicitarDescarga: el estudiante hizo clic en su archivo previo → lo descargamos.
          -->
          <DeployUploadZone
            v-model="form_sm_vc.archivo_zip_nombre_sm_vc"
            :archivo-existente="archivosExistentes_sm_vc.zip"
            @archivo-seleccionado="handleZipSeleccionado_sm_vc"
            @solicitar-descarga="deployStore_sm_vc.descargarArchivo_sm_vc(estudiante_sm_vc.id_sm_vc, 'zip')"
            accept=".zip"
            icon="folder_zip"
            accent-color="teal" />
        </div>

        <!-- Documentación .pdf -->
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            Documentación Técnica <span class="req-mark_sm_vc">*</span>
            <span class="format-hint_sm_vc">.pdf</span>
          </label>
          <DeployUploadZone
            v-model="form_sm_vc.archivo_pdf_nombre_sm_vc"
            :archivo-existente="archivosExistentes_sm_vc.pdf"
            @archivo-seleccionado="handlePdfSeleccionado_sm_vc"
            @solicitar-descarga="deployStore_sm_vc.descargarArchivo_sm_vc(estudiante_sm_vc.id_sm_vc, 'pdf')"
            accept=".pdf"
            icon="picture_as_pdf"
            accent-color="amber" />
        </div>

        <!-- Checklist preflight -->
        <DeployChecklist :checks="preflightChecks_sm_vc" />

        <q-btn
          type="submit" unelevated no-caps
          :label="deployStore_sm_vc.deployCompletado_sm_vc ? 'Actualizar Deploy en Producción' : 'Registrar Deploy en Producción'"
          :icon="deployStore_sm_vc.deployCompletado_sm_vc ? 'sync' : 'rocket_launch'"
          class="submit-btn_sm_vc"
          :class="{ 'update-mode_sm_vc': deployStore_sm_vc.deployCompletado_sm_vc }"
          :loading="deployStore_sm_vc.loading_sm_vc"
          :disable="!todosOk_sm_vc" >
          <template #loading>
            <q-spinner-dots color="#0b132b" size="20px" />
            <span class="q-ml-sm loader-text_sm_vc">{{ deployStore_sm_vc.deployCompletado_sm_vc ? 'Actualizando...' : 'Subiendo archivos...' }}</span>
          </template>
        </q-btn>
      </q-form>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useDeployStore } from 'src/stores/deployStore'
import DeployUploadZone from 'src/components/shared/deploy/DeployUploadZone.vue'
import DeployChecklist from 'src/components/shared/deploy/DeployChecklist.vue'

const router_sm_vc = useRouter()
const authStore_sm_vc = useAuthStore()
const deployStore_sm_vc = useDeployStore()

// Acceso reactivo al estado del estudiante
const estudiante_sm_vc = computed(() => authStore_sm_vc.user_sm_vc?.estudiante_sm_vc)
const puedeHacerDeploy_sm_vc = computed(() => estudiante_sm_vc.value?.puede_hacer_deploy_sm_vc ?? false)

// ── Estado del flujo de actualización ────────────────────────────────
// Controla si se muestra el formulario cuando ya hay un deploy previo.
// El botón "Actualizar mi Deploy" lo activa, lo que también incrementa
// formKey_sm_vc para forzar el remount completo del <q-form>.
const mostrarFormularioActualizar_sm_vc = ref(false)
const formKey_sm_vc = ref(0)

/**
 * Activa el modo actualización:
 * 1. Muestra el formulario de subida.
 * 2. Incrementa la key → Vue destruye y remonta el <q-form> y todos
 *    sus hijos (DeployUploadZone), limpiando el estado interno.
 * 3. Pre-carga la URL existente para que el usuario no la pierda.
 */
const activarActualizacion_sm_vc = () => {
  mostrarFormularioActualizar_sm_vc.value = true
  formKey_sm_vc.value++
  // Pre-cargar datos existentes para que el usuario no parta de cero
  if (deployStore_sm_vc.datosDeploy_sm_vc) {
    const data = deployStore_sm_vc.datosDeploy_sm_vc
    form_sm_vc.value.url_produccion_sm_vc = data.url_produccion_sm_vc
    // Limpiamos los archivos locales; el estudiante debe seleccionar nuevos
    form_sm_vc.value.archivo_zip_sm_vc = null
    form_sm_vc.value.archivo_pdf_sm_vc = null
    form_sm_vc.value.archivo_zip_nombre_sm_vc = ''
    form_sm_vc.value.archivo_pdf_nombre_sm_vc = ''
  }
}

/**
 * Nombres de los archivos ya guardados en el servidor.
 * Se usan como prop de DeployUploadZone para mostrar el chip previo.
 */
const archivosExistentes_sm_vc = computed(() => ({
  zip: deployStore_sm_vc.datosDeploy_sm_vc?.archivo_codigo_sm_vc?.nombre_sm_vc || '',
  pdf: deployStore_sm_vc.datosDeploy_sm_vc?.documentacion_sm_vc?.nombre_sm_vc || ''
}))

onMounted(async () => {
  if (estudiante_sm_vc.value?.id_sm_vc) {
    await deployStore_sm_vc.verificarEstadoDeploy_sm_vc(estudiante_sm_vc.value.id_sm_vc)
    
    // Si ya existe deploy, pre-cargar solo la URL en el formulario.
    // Los nombres de archivos se extraen reactivamente de archivosExistentes_sm_vc.
    if (deployStore_sm_vc.deployCompletado_sm_vc && deployStore_sm_vc.datosDeploy_sm_vc) {
      const data = deployStore_sm_vc.datosDeploy_sm_vc
      form_sm_vc.value.url_produccion_sm_vc = data.url_produccion_sm_vc
    }
  }
})

const form_sm_vc = ref({
  url_produccion_sm_vc: '',
  archivo_zip_sm_vc: null,
  archivo_pdf_sm_vc: null,
  // Estos campos guardan el nombre NUEVO seleccionado por el usuario (no el del servidor)
  archivo_zip_nombre_sm_vc: '',
  archivo_pdf_nombre_sm_vc: ''
})

const preflightChecks_sm_vc = computed(() => [
  {
    label: 'URL de producción (HTTPS obligatoria)',
    ok: /^https:\/\/.+/.test(form_sm_vc.value.url_produccion_sm_vc)
  },
  {
    label: 'Archivo de código .zip adjunto',
    // En modo actualización, el check pasa si el usuario seleccionó uno nuevo.
    // En modo nuevo registro, debe tener el archivo seleccionado.
    ok: !!form_sm_vc.value.archivo_zip_sm_vc
  },
  {
    label: 'Documentación técnica .pdf adjunta',
    ok: !!form_sm_vc.value.archivo_pdf_sm_vc
  },
  {
    label: 'Elegibilidad académica confirmada',
    ok: puedeHacerDeploy_sm_vc.value
  }
])

const todosOk_sm_vc = computed(() =>
  preflightChecks_sm_vc.value.every((c) => c.ok)
)

const handleZipSeleccionado_sm_vc = (file_sm_vc) => {
  form_sm_vc.value.archivo_zip_sm_vc = file_sm_vc
}

const handlePdfSeleccionado_sm_vc = (file_sm_vc) => {
  form_sm_vc.value.archivo_pdf_sm_vc = file_sm_vc
}

const registrarDeploy_sm_vc = async () => {
  if (!todosOk_sm_vc.value) return

  const formData_sm_vc = new FormData()
  formData_sm_vc.append('url_produccion_sm_vc', form_sm_vc.value.url_produccion_sm_vc)
  formData_sm_vc.append('archivo_zip_sm_vc', form_sm_vc.value.archivo_zip_sm_vc)
  formData_sm_vc.append('archivo_pdf_sm_vc', form_sm_vc.value.archivo_pdf_sm_vc)

  try {
    await deployStore_sm_vc.enviar_deploy_sm_vc(
      estudiante_sm_vc.value.id_sm_vc,
      formData_sm_vc
    )
    router_sm_vc.push('/estudiante/trazabilidad')
  } catch (error_sm_vc) {
    console.error('Error en el despliegue:', error_sm_vc)
  }
}
</script>

<style scoped>
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; font-family: var(--sn-font-mono); }
.page-header_sm_vc { margin-bottom: 1.5rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.page-title_sm_vc { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: .06em; margin: 0; }
.page-subtitle_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; font-family: var(--sn-font-sans); }
.locked-state_sm_vc { display: flex; align-items: flex-start; gap: 1.25rem; padding: 1.5rem; background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.07); border-radius: 12px; max-width: 480px; }
.locked-icon_sm_vc { flex-shrink: 0; }
.locked-title_sm_vc { font-size: .88rem; font-weight: 600; color: var(--sn-texto-secundario); margin: 0 0 4px; }
.locked-desc_sm_vc { font-size: .75rem; color: var(--sn-texto-apagado); margin: 0 0 .75rem; font-family: var(--sn-font-sans); }
.locked-progress_sm_vc { display: flex; flex-direction: column; gap: .3rem; }
.lock-mat_sm_vc { display: flex; align-items: center; gap: .4rem; font-size: .68rem; color: var(--sn-texto-terciario); }
.existing-deploy-banner_sm_vc { display: flex; align-items: flex-start; gap: 0.85rem; padding: 1rem 1.25rem; background: rgba(111,255,233,.04); border: 1px solid rgba(111,255,233,.12); border-radius: 12px; margin-bottom: .75rem; max-width: 650px; }
.banner-content_sm_vc { flex: 1; }
.banner-title_sm_vc { font-size: .82rem; font-weight: 700; color: var(--sn-primario); margin: 0 0 3px; letter-spacing: 0.02em; }
.banner-desc_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; line-height: 1.5; font-family: var(--sn-font-sans); }
.existing-url_sm_vc { display: flex; align-items: center; gap: .3rem; }
.url-link_sm_vc { color: var(--sn-primario); text-decoration: none; font-size: .7rem; }
.url-link_sm_vc:hover { text-decoration: underline; }
/* ── Botón de actualización ─────────────────────────────────────── */
.update-deploy-action_sm_vc { margin-bottom: 1.5rem; max-width: 650px; display: flex; justify-content: flex-end; }
.update-deploy-btn_sm_vc {
  font-size: .72rem !important;
  font-weight: 600 !important;
  letter-spacing: .08em !important;
  border-radius: 6px !important;
  padding: .45rem 1rem !important;
  background: rgba(111,255,233,.12) !important;
  color: var(--sn-primario) !important;
  border: 1px solid rgba(111,255,233,.25) !important;
  transition: all 0.2s;
}
.update-deploy-btn_sm_vc:hover {
  background: rgba(111,255,233,.22) !important;
  border-color: rgba(111,255,233,.45) !important;
  box-shadow: 0 0 12px rgba(111,255,233,.15);
}
.section-notice_sm_vc { display: flex; align-items: center; gap: .5rem; font-size: .72rem; color: var(--sn-acento-sec); background: rgba(111,255,233,.05); border: 1px solid rgba(111,255,233,.15); border-radius: 8px; padding: .6rem .875rem; margin-bottom: 1.5rem; max-width: 520px; font-family: var(--sn-font-sans); }
.deploy-form_sm_vc { display: flex; flex-direction: column; gap: 1.25rem; max-width: 520px; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: .35rem; }
.field-label_sm_vc { font-size: .62rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sn-acento-sec); font-weight: 500; display: flex; align-items: center; gap: .35rem; }
.req-mark_sm_vc { color: var(--sn-error-claro); }
.format-hint_sm_vc { font-size: .55rem; background: rgba(255,255,255,.05); padding: 1px 5px; border-radius: 3px; color: var(--sn-texto-terciario); }
:deep(.sntnl-input_sm_vc .q-field__control) { background: rgba(255,255,255,.03) !important; border: 1px solid rgba(91,192,190,.2) !important; border-radius: 6px !important; }
:deep(.sntnl-input_sm_vc .q-field__native) { color: var(--sn-texto-principal) !important; font-size: .82rem !important; font-family: var(--sn-font-mono) !important; }
.submit-btn_sm_vc { background: #6fffe9 !important; color: #0b132b !important; font-size: .75rem !important; font-weight: 700 !important; letter-spacing: .1em !important; border-radius: 6px !important; padding: .6rem 1.5rem !important; box-shadow: 0 0 20px rgba(111,255,233,.2); align-self: flex-start; }
.submit-btn_sm_vc:not(:disabled):hover { box-shadow: 0 0 30px rgba(111,255,233,.35) !important; transform: translateY(-1px); }
.submit-btn_sm_vc:disabled { opacity: .4 !important; }
.loader-text_sm_vc { color: #0b132b; font-weight: 700; font-size: .72rem; }
</style>