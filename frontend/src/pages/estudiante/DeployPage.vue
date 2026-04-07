<!-- ════════════════════════════════════════════════════════════════
     DeployPage.vue — Vista diferenciada por rol para gestión de deploys
     ESTUDIANTE: Formulario activo con validaciones
     ADMIN/PROFESOR: Modo "Solo Lectura" con descargas
     ════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <q-btn
      flat no-caps icon="arrow_back" label="Volver"
      color="grey-5" size="sm" class="q-mb-md"
      @click="$router.back()" />

    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="rocket_launch" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">
          {{ esEstudiante ? 'Registrar Deploy Final' : 'Información de Deploy' }}
        </h1>
      </div>
      <p class="page-subtitle_sm_vc">
        {{ esEstudiante 
          ? 'Solo habilitado cuando las 4 materias estén aprobadas.'
          : 'Vista de solo lectura para administradores y profesores.'
        }}
      </p>
    </div>

    <!-- Vista ESTUDIANTE: Formulario activo -->
    <template v-if="esEstudiante">
      <!-- Estado bloqueado -->
      <div v-if="!puedeHacerDeploy_sm_vc" class="locked-state_sm_vc">
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

      <!-- Formulario activo -->
      <template v-else>
        <div class="section-notice_sm_vc">
          <q-icon name="check_circle" size="16px" color="teal-4" />
          <span>Elegibilidad académica confirmada. Completa los datos a continuación.</span>
        </div>

        <q-form @submit.prevent="registrarDeploy_sm_vc" class="deploy-form_sm_vc">
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
            <DeployUploadZone
              v-model="form_sm_vc.archivo_zip_nombre_sm_vc"
              @archivo-seleccionado="handleZipSeleccionado_sm_vc"
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
              @archivo-seleccionado="handlePdfSeleccionado_sm_vc"
              accept=".pdf"
              icon="picture_as_pdf"
              accent-color="amber" />
          </div>

          <!-- Checklist preflight -->
          <DeployChecklist :checks="preflightChecks_sm_vc" />

          <q-btn
            type="submit" unelevated no-caps
            label="Registrar Deploy en Producción"
            icon="rocket_launch"
            class="submit-btn_sm_vc"
            :loading="deployStore_sm_vc.loading_sm_vc"
            :disable="!todosOk_sm_vc" >
            <template #loading>
              <q-spinner-dots color="#0b132b" size="20px" />
              <span class="q-ml-sm loader-text_sm_vc">Subiendo archivos…</span>
            </template>
          </q-btn>
        </q-form>
      </template>
    </template>

    <!-- Vista ADMIN/PROFESOR: Modo Solo Lectura -->
    <template v-else>
      <div v-if="deployStore_sm_vc.loading_sm_vc" class="loading-state_sm_vc">
        <q-spinner-dots color="teal-3" size="40px" />
        <p class="q-mt-md">Cargando información del deploy...</p>
      </div>

      <div v-else-if="deployInfo" class="readonly-view_sm_vc">
        <!-- Banner de información -->
        <q-card flat bordered class="info-banner_sm_vc">
          <q-card-section class="row items-center q-pa-md">
            <q-icon name="info" size="24px" color="teal-3" class="q-mr-md" />
            <div>
              <div class="text-weight-medium">Vista de Solo Lectura</div>
              <div class="text-caption text-grey-6">
                Como {{ authStore_sm_vc.user_sm_vc?.rol_sm_vc?.toLowerCase() }}, puedes ver la información del deploy 
                pero no modificarla. Solo los estudiantes pueden registrar sus propios deploys.
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Información del Estudiante -->
        <q-card flat bordered class="info-card_sm_vc q-mt-md">
          <q-card-section>
            <div class="card-title_sm_vc">
              <q-icon name="person" size="18px" color="teal-3" class="q-mr-sm" />
              Información del Estudiante
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="info-grid_sm_vc">
              <div class="info-item_sm_vc">
                <span class="info-label_sm_vc">Nombre:</span>
                <span class="info-value_sm_vc">{{ deployInfo.estudiante?.nombre_completo_sm_vc || 'N/A' }}</span>
              </div>
              <div class="info-item_sm_vc">
                <span class="info-label_sm_vc">Cédula:</span>
                <span class="info-value_sm_vc">{{ deployInfo.estudiante?.cedula_sm_vc || 'N/A' }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Información del Deploy -->
        <q-card flat bordered class="info-card_sm_vc q-mt-md">
          <q-card-section>
            <div class="card-title_sm_vc">
              <q-icon name="rocket_launch" size="18px" color="teal-3" class="q-mr-sm" />
              Información del Deploy
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="info-grid_sm_vc">
              <div class="info-item_sm_vc">
                <span class="info-label_sm_vc">URL Producción:</span>
                <a 
                  :href="deployInfo.url_produccion_sm_vc" 
                  target="_blank" 
                  class="production-link_sm_vc"
                >
                  {{ deployInfo.url_produccion_sm_vc }}
                  <q-icon name="open_in_new" size="14px" class="q-ml-xs" />
                </a>
              </div>
              <div class="info-item_sm_vc">
                <span class="info-label_sm_vc">Fecha Deploy:</span>
                <span class="info-value_sm_vc">
                  {{ formatDate(deployInfo.fecha_deploy_sm_vc) }}
                </span>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Archivos disponibles -->
        <q-card flat bordered class="info-card_sm_vc q-mt-md">
          <q-card-section>
            <div class="card-title_sm_vc">
              <q-icon name="folder" size="18px" color="teal-3" class="q-mr-sm" />
              Archivos del Deploy
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="files-grid_sm_vc">
              <!-- Archivo ZIP -->
              <div v-if="deployInfo.archivo_codigo_sm_vc" class="file-item_sm_vc">
                <div class="file-info_sm_vc">
                  <q-icon name="folder_zip" size="24px" color="teal-3" />
                  <div class="file-details_sm_vc">
                    <div class="file-name_sm_vc">{{ deployInfo.archivo_codigo_sm_vc.nombre_sm_vc }}</div>
                    <div class="file-size_sm_vc">{{ formatFileSize(deployInfo.archivo_codigo_sm_vc.tamanio_bytes_sm_vc) }}</div>
                  </div>
                </div>
                <q-btn
                  flat
                  dense
                  color="teal-3"
                  icon="download"
                  label="Descargar ZIP"
                  @click="downloadFile(deployInfo.archivo_codigo_sm_vc, 'zip')"
                />
              </div>

              <!-- Archivo PDF -->
              <div v-if="deployInfo.documentacion_sm_vc" class="file-item_sm_vc">
                <div class="file-info_sm_vc">
                  <q-icon name="picture_as_pdf" size="24px" color="amber-6" />
                  <div class="file-details_sm_vc">
                    <div class="file-name_sm_vc">{{ deployInfo.documentacion_sm_vc.nombre_sm_vc }}</div>
                    <div class="file-size_sm_vc">{{ formatFileSize(deployInfo.documentacion_sm_vc.tamanio_bytes_sm_vc) }}</div>
                  </div>
                </div>
                <q-btn
                  flat
                  dense
                  color="amber-6"
                  icon="download"
                  label="Descargar PDF"
                  @click="downloadFile(deployInfo.documentacion_sm_vc, 'pdf')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Sin deploy registrado -->
        <q-card v-else flat bordered class="no-deploy-card_sm_vc">
          <q-card-section class="text-center q-pa-lg">
            <q-icon name="rocket_launch" size="48px" color="blue-grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-7">Sin Deploy Registrado</div>
            <div class="text-grey-6 q-mt-sm">
              Este estudiante aún no ha registrado su deploy final.
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Error state -->
      <div v-else-if="deployStore_sm_vc.error_sm_vc" class="error-state_sm_vc">
        <q-icon name="error" size="48px" color="negative" class="q-mb-md" />
        <div class="text-h6 text-negative q-mb-sm">Error al cargar información</div>
        <div class="text-grey-6">{{ deployStore_sm_vc.error_sm_vc }}</div>
        <q-btn
          flat
          color="teal-3"
          icon="refresh"
          label="Reintentar"
          @click="cargarDeployInfo"
          class="q-mt-md"
        />
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useDeployStore } from 'src/stores/deployStore'
import DeployUploadZone from 'src/components/shared/deploy/DeployUploadZone.vue'
import DeployChecklist from 'src/components/shared/deploy/DeployChecklist.vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'

const authStore_sm_vc = useAuthStore()
const deployStore_sm_vc = useDeployStore()
const route = useRoute()

// Estado para vista de solo lectura
const deployInfo = ref(null)

// Computed properties
const esEstudiante = computed(() => 
  authStore_sm_vc.user_sm_vc?.rol_sm_vc === 'ESTUDIANTE'
)

// Acceso reactivo al estado del estudiante
const estudiante_sm_vc = computed(() => authStore_sm_vc.user_sm_vc?.estudiante_sm_vc)
const puedeHacerDeploy_sm_vc = computed(() => 
  estudiante_sm_vc.value?.puede_hacer_deploy_sm_vc ?? false
)

const form_sm_vc = ref({
  url_produccion_sm_vc: '',
  archivo_zip_sm_vc: null,
  archivo_pdf_sm_vc: null,
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

// Métodos
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
    // Recargar información para vista de solo lectura
    if (!esEstudiante.value) {
      await cargarDeployInfo()
    } else {
      // Redirigir al estudiante
      window.history.back()
    }
  } catch (error_sm_vc) {
    console.error('Error en el despliegue:', error_sm_vc)
  }
}

// Métodos para vista de solo lectura
const cargarDeployInfo = async () => {
  const estudianteId = route.params.id || estudiante_sm_vc.value?.id_sm_vc
  if (!estudianteId) return

  try {
    const response = await api.get(`/deploy/${estudianteId}`)
    deployInfo.value = response.data
  } catch (error) {
    console.error('Error cargando deploy:', error)
    deployStore_sm_vc.error_sm_vc = error.response?.data?.message || 'Error al cargar información del deploy'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadFile = async (fileInfo, type) => {
  try {
    // Crear URL de descarga (asumimos que hay un endpoint para esto)
    const downloadUrl = `/api/deploy/download/${fileInfo.id_sm_vc}`
    
    // Crear un link temporal y hacer click
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileInfo.nombre_sm_vc
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error descargando archivo:', error)
  }
}

// Lifecycle
onMounted(() => {
  if (!esEstudiante.value) {
    // Modo solo lectura: cargar información del deploy
    cargarDeployInfo()
  }
})
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
.existing-deploy-banner_sm_vc { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; padding: .75rem 1rem; background: rgba(111,255,233,.04); border: 1px solid rgba(111,255,233,.12); border-radius: 8px; margin-bottom: 1rem; max-width: 600px; font-size: .72rem; color: var(--sn-acento-sec); }
.existing-url_sm_vc { display: flex; align-items: center; gap: .3rem; }
.url-link_sm_vc { color: var(--sn-primario); text-decoration: none; font-size: .7rem; }
.url-link_sm_vc:hover { text-decoration: underline; }
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

/* Estilos para vista de solo lectura */
.loading-state_sm_vc { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-height: 200px; 
  gap: 1rem; 
}

.readonly-view_sm_vc { 
  display: flex; 
  flex-direction: column; 
  gap: 1.5rem; 
}

.info-banner_sm_vc { 
  background: rgba(111,255,233,.05); 
  border: 1px solid rgba(111,255,233,.15); 
  border-radius: 8px; 
}

.info-card_sm_vc { 
  background: rgba(255,255,255,.02); 
  border: 1px solid rgba(255,255,255,.07); 
  border-radius: 8px; 
}

.card-title_sm_vc { 
  display: flex; 
  align-items: center; 
  font-size: .88rem; 
  font-weight: 600; 
  color: var(--sn-texto-secundario); 
  margin-bottom: .75rem; 
}

.info-grid_sm_vc { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
  gap: 1rem; 
}

.info-item_sm_vc { 
  display: flex; 
  flex-direction: column; 
  gap: .25rem; 
}

.info-label_sm_vc { 
  font-size: .65rem; 
  color: var(--sn-texto-terciario); 
  font-weight: 500; 
  text-transform: uppercase; 
  letter-spacing: .05em; 
}

.info-value_sm_vc { 
  font-size: .8rem; 
  color: var(--sn-texto-principal); 
  font-weight: 500; 
}

.production-link_sm_vc { 
  color: var(--sn-primario); 
  text-decoration: none; 
  font-size: .8rem; 
  display: flex; 
  align-items: center; 
  gap: .25rem; 
}

.production-link_sm_vc:hover { 
  text-decoration: underline; 
}

.files-grid_sm_vc { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 1rem; 
}

.file-item_sm_vc { 
  display: flex; 
  flex-direction: column; 
  gap: .75rem; 
  padding: 1rem; 
  background: rgba(255,255,255,.02); 
  border: 1px solid rgba(255,255,255,.05); 
  border-radius: 8px; 
}

.file-info_sm_vc { 
  display: flex; 
  align-items: center; 
  gap: .75rem; 
}

.file-details_sm_vc { 
  flex: 1; 
}

.file-name_sm_vc { 
  font-size: .75rem; 
  color: var(--sn-texto-principal); 
  font-weight: 500; 
  margin-bottom: .25rem; 
}

.file-size_sm_vc { 
  font-size: .65rem; 
  color: var(--sn-texto-terciario); 
}

.no-deploy-card_sm_vc { 
  text-align: center; 
  background: rgba(255,255,255,.02); 
  border: 1px dashed rgba(255,255,255,.07); 
  border-radius: 8px; 
}

.error-state_sm_vc { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  min-height: 200px; 
  gap: 1rem; 
  text-align: center; 
}
</style>