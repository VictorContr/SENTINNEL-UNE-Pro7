<template>
  <q-dialog
    v-model="dialogValue"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bulk-upload-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="upload_file" size="24px" color="primary" class="q-mr-sm" />
          Carga Masiva de Usuarios
        </div>
        <q-space />
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="row q-gutter-md">
          <!-- Columna izquierda: Instrucciones y descarga -->
          <div class="col-12 col-md-5">
            <q-card flat bordered class="instructions-card">
              <q-card-section>
                <div class="text-subtitle2 text-weight-medium q-mb-md">
                  <q-icon name="info" size="18px" color="primary" class="q-mr-sm" />
                  Instrucciones
                </div>
                <ol class="instruction-list">
                  <li>Descarga la plantilla Excel</li>
                  <li>Llena los datos de los usuarios</li>
                  <li>Usa roles válidos: ADMIN, PROFESOR, ESTUDIANTE</li>
                  <li>Campos requeridos: Nombre, Apellido, Cédula, Correo, Rol</li>
                  <li>El teléfono es opcional</li>
                  <li>Tamaño máximo del archivo: 5MB</li>
                </ol>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="text-subtitle2 text-weight-medium q-mb-md">
                  <q-icon name="download" size="18px" color="primary" class="q-mr-sm" />
                  Descargar Plantilla
                </div>
                <q-btn
                  color="primary"
                  icon="download"
                  label="Descargar Plantilla Excel"
                  @click="downloadTemplate"
                  :loading="downloadingTemplate"
                  class="full-width"
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Columna derecha: Upload y resultados -->
          <div class="col-12 col-md-7">
            <!-- Upload section -->
            <q-card flat bordered class="upload-card">
              <q-card-section>
                <div class="text-subtitle2 text-weight-medium q-mb-md">
                  <q-icon name="cloud_upload" size="18px" color="primary" class="q-mr-sm" />
                  Subir Archivo Excel
                </div>
                
                <q-uploader
                  v-model="selectedFile"
                  url="/api/users/bulk"
                  method="POST"
                  label="Seleccionar archivo Excel (.xlsx, .xls)"
                  accept=".xlsx,.xls"
                  :filter="checkFileType"
                  :max-file-size="5 * 1024 * 1024"
                  :max-files="1"
                  :loading="uploading"
                  @added="onFileAdded"
                  @removed="onFileRemoved"
                  @uploaded="onFileUploaded"
                  @failed="onUploadFailed"
                  class="full-width"
                >
                  <template v-if="!selectedFile" #header>
                    <div class="upload-area">
                      <q-icon name="upload_file" size="48px" color="primary" />
                      <div class="text-h6 q-mt-sm">Arrastra el archivo aquí</div>
                      <div class="text-caption text-grey-6">
                        o haz clic para seleccionar
                      </div>
                    </div>
                  </template>
                </q-uploader>

                <div v-if="selectedFile" class="selected-file-info q-mt-md">
                  <q-chip
                    icon="description"
                    :label="selectedFile.name"
                    color="primary"
                    text-color="white"
                    removable
                    @remove="clearFile"
                  />
                  <q-chip
                    icon="storage"
                    :label="formatFileSize(selectedFile.size)"
                    color="grey-5"
                    text-color="white"
                    class="q-ml-sm"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- Results section -->
            <q-card 
              v-if="uploadResult" 
              flat 
              bordered 
              class="results-card q-mt-md"
            >
              <q-card-section>
                <div class="text-subtitle2 text-weight-medium q-mb-md">
                  <q-icon name="assessment" size="18px" color="primary" class="q-mr-sm" />
                  Resultados del Procesamiento
                </div>

                <!-- Resumen -->
                <div class="row q-gutter-md q-mb-md">
                  <div class="col">
                    <q-card flat class="stat-card">
                      <q-card-section class="text-center">
                        <div class="stat-number">{{ uploadResult.total_filas }}</div>
                        <div class="stat-label">Total Filas</div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col">
                    <q-card flat class="stat-card success">
                      <q-card-section class="text-center">
                        <div class="stat-number">{{ uploadResult.exitosos }}</div>
                        <div class="stat-label">Exitosos</div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col">
                    <q-card flat class="stat-card error">
                      <q-card-section class="text-center">
                        <div class="stat-number">{{ uploadResult.errores }}</div>
                        <div class="stat-label">Errores</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Errores detallados -->
                <div v-if="uploadResult.errores > 0">
                  <q-separator class="q-mb-md" />
                  <div class="text-subtitle2 text-weight-medium q-mb-md">
                    <q-icon name="error" size="18px" color="negative" class="q-mr-sm" />
                    Detalles de Errores
                  </div>
                  
                  <q-table
                    :rows="uploadResult.detalles"
                    :columns="errorColumns"
                    row-key="fila"
                    flat
                    bordered
                    dense
                    :pagination="{ rowsPerPage: 0 }"
                    class="errors-table"
                  >
                    <template #body-cell-error="props">
                      <q-td :props="props">
                        <q-badge
                          :color="getErrorColor(props.value)"
                          :label="props.value"
                          class="error-badge"
                        />
                      </q-td>
                    </template>
                  </q-table>
                </div>

                <!-- Mensaje de éxito -->
                <div v-else-if="uploadResult.exitosos > 0">
                  <q-separator class="q-mb-md" />
                  <div class="success-message text-center">
                    <q-icon name="check_circle" size="48px" color="positive" class="q-mb-md" />
                    <div class="text-h6 text-positive q-mb-sm">
                      ¡Carga Masiva Exitosa!
                    </div>
                    <div class="text-grey-6">
                      Se han creado {{ uploadResult.exitosos }} usuarios correctamente.
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cerrar"
          @click="closeDialog"
        />
        <q-btn
          v-if="uploadResult && uploadResult.exitosos > 0"
          color="primary"
          label="Recargar Usuarios"
          @click="$emit('reload-users')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from 'boot/axios'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'reload-users'])

// Estado local
const selectedFile = ref(null)
const uploading = ref(false)
const downloadingTemplate = ref(false)
const uploadResult = ref(null)

// Computed
const dialogValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Columnas para la tabla de errores
const errorColumns = [
  {
    name: 'fila',
    label: 'Fila',
    align: 'center',
    field: 'fila',
  },
  {
    name: 'cedula_sm_vc',
    label: 'Cédula',
    align: 'left',
    field: 'cedula_sm_vc',
  },
  {
    name: 'correo_sm_vc',
    label: 'Correo',
    align: 'left',
    field: 'correo_sm_vc',
  },
  {
    name: 'error',
    label: 'Error',
    align: 'left',
    field: 'error',
  },
]

// Métodos
const checkFileType = (files) => {
  return files.filter(file => 
    file.name.toLowerCase().endsWith('.xlsx') || 
    file.name.toLowerCase().endsWith('.xls')
  )
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getErrorColor = (error) => {
  if (error.includes('ya está registrada')) return 'orange'
  if (error.includes('no es válido')) return 'red'
  if (error.includes('Faltan campos')) return 'deep-orange'
  return 'red'
}

const closeDialog = () => {
  dialogValue.value = false
  // Limpiar estado al cerrar
  setTimeout(() => {
    selectedFile.value = null
    uploadResult.value = null
  }, 300)
}

const clearFile = () => {
  selectedFile.value = null
}

const downloadTemplate = async () => {
  downloadingTemplate.value = true
  try {
    const response = await api.get('/users/bulk/template', {
      responseType: 'blob',
    })
    
    // Crear un link temporal para descargar
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla_usuarios.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error descargando plantilla:', error)
  } finally {
    downloadingTemplate.value = false
  }
}

const onFileAdded = (files) => {
  console.log('Archivo agregado:', files)
}

const onFileRemoved = (files) => {
  console.log('Archivo removido:', files)
}

const onFileUploaded = (response) => {
  console.log('Upload exitoso:', response)
  uploadResult.value = response.resultado
  uploading.value = false
}

const onUploadFailed = (error) => {
  console.error('Error en upload:', error)
  uploading.value = false
  uploadResult.value = {
    total_filas: 0,
    exitosos: 0,
    errores: 1,
    detalles: [{
      fila: 1,
      cedula_sm_vc: 'N/A',
      correo_sm_vc: 'N/A',
      error: error.message || 'Error al subir archivo',
    }],
  }
}
</script>

<style scoped>
.bulk-upload-dialog {
  width: 100%;
  max-width: 1200px;
}

.instruction-list {
  margin: 0;
  padding-left: 1.5rem;
  font-size: .9rem;
  line-height: 1.6;
  color: var(--sn-texto-secundario);
}

.instruction-list li {
  margin-bottom: .5rem;
}

.instructions-card,
.upload-card,
.results-card {
  height: 100%;
}

.upload-area {
  border: 2px dashed var(--sn-primario);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: rgba(111, 255, 233, 0.05);
  color: var(--sn-texto-secundario);
}

.selected-file-info {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
}

.stat-card.success {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.stat-card.error {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sn-texto-principal);
  line-height: 1;
}

.stat-label {
  font-size: .75rem;
  color: var(--sn-texto-terciario);
  margin-top: .25rem;
}

.errors-table {
  max-height: 300px;
}

.error-badge {
  font-weight: 500;
}

.success-message {
  padding: 2rem;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}
</style>
