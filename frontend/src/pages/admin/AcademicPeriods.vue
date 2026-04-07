<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col-12">
        <h4 class="q-ma-none">
          <q-icon name="date_range" size="24px" color="primary" class="q-mr-sm" />
          Gestión de Períodos Académicos
        </h4>
        <p class="text-grey-6 q-ma-none">
          Administra los períodos académicos del sistema
        </p>
      </div>
      <div class="col-12 col-md-3 text-right">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Período"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Tabla de períodos -->
    <q-card flat bordered class="periods-table">
      <q-card-section>
        <div class="row items-center justify-between q-pb-md">
          <div class="text-h6">Períodos Académicos</div>
          <q-btn
            flat
            dense
            color="primary"
            icon="refresh"
            label="Actualizar"
            @click="loadPeriodos"
            :loading="loading"
          />
        </div>
      </q-card-section>

      <q-table
        :rows="periodos"
        :columns="columns"
        row-key="id_sm_vc"
        :loading="loading"
        binary-state-sort
        flat
        bordered
        class="periods-table"
        @request="onRequest"
      >
        <!-- Columna de estado -->
        <template #body-cell-estado_activo_sm_vc="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.estado_activo_sm_vc ? 'positive' : 'negative'"
              :label="props.row.estado_activo_sm_vc ? 'Activo' : 'Inactivo'"
              class="status-badge"
            />
          </q-td>
        </template>

        <!-- Columna de acciones -->
        <template #body-cell-acciones="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-btn
                v-if="!props.row.estado_activo_sm_vc"
                flat
                dense
                color="positive"
                icon="play_arrow"
                label="Activar"
                @click="activarPeriodo(props.row.id_sm_vc)"
                class="action-btn"
              />
              <q-btn
                v-if="props.row.estado_activo_sm_vc"
                flat
                dense
                color="warning"
                icon="pause"
                label="Desactivar"
                @click="desactivarPeriodo(props.row.id_sm_vc)"
                class="action-btn"
              />
              <q-btn
                flat
                dense
                color="info"
                icon="edit"
                label="Editar"
                @click="editPeriodo(props.row)"
                class="action-btn"
              />
              <q-btn
                flat
                dense
                color="negative"
                icon="delete"
                label="Eliminar"
                @click="confirmDelete(props.row)"
                class="action-btn"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo de creación/edición -->
    <q-dialog
      v-model="showCreateDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="period-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingPeriod ? 'Editar Período' : 'Nuevo Período' }}
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
          <q-form @submit.prevent="savePeriod" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nombre_sm_vc"
                  label="Nombre del Período *"
                  outlined
                  dense
                  :rules="nombreRules"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.fecha_inicio_sm_vc"
                  label="Fecha de Inicio *"
                  type="date"
                  outlined
                  dense
                  :rules="fechaInicioRules"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.fecha_fin_sm_vc"
                  label="Fecha de Fin *"
                  type="date"
                  outlined
                  dense
                  :rules="fechaFinRules"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-toggle
                  v-model="form.estado_activo_sm_vc"
                  label="Estado Activo"
                  color="primary"
                  keep-color
                />
              </div>
            </div>
            <div class="row q-mt-md">
              <div class="col-12">
                <q-input
                  v-model="form.descripcion_sm_vc"
                  type="textarea"
                  label="Descripción"
                  outlined
                  rows="3"
                />
              </div>
            </div>

            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancelar"
                @click="closeDialog"
              />
              <q-btn
                color="primary"
                type="submit"
                :loading="saving"
                :label="editingPeriod ? 'Actualizar' : 'Crear'"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo de confirmación de eliminación -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar
            icon="warning"
            color="negative"
            text-color="white"
            class="q-mr-sm"
          />
          <div>
            <div class="text-h6">Confirmar Eliminación</div>
            <div class="text-grey-6 q-mt-sm">
              ¿Estás seguro de eliminar el período <strong>"{{ periodToDelete?.nombre_sm_vc }}"</strong>?
              Esta acción no se puede deshacer.
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            @click="showDeleteDialog = false"
          />
          <q-btn
            color="negative"
            label="Eliminar"
            @click="deletePeriod"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Mensaje de éxito -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar
            icon="check_circle"
            color="positive"
            text-color="white"
            class="q-mr-sm"
          />
          <div>
            <div class="text-h6 text-positive">¡Operación Exitosa!</div>
            <div class="text-grey-6 q-mt-sm">
              {{ successMessage }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            color="primary"
            label="OK"
            @click="showSuccessDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'

// Estado
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const showSuccessDialog = ref(false)

// Datos del formulario
const editingPeriod = ref(null)
const periodos = ref([])
const periodToDelete = ref(null)
const successMessage = ref('')

const form = ref({
  nombre_sm_vc: '',
  fecha_inicio_sm_vc: '',
  fecha_fin_sm_vc: '',
  estado_activo_sm_vc: false,
  descripcion_sm_vc: '',
})

// Reglas de validación
const nombreRules = [
  val => !!val || 'El nombre es requerido',
  val => val.length >= 3 && val.length <= 20 || 'El nombre debe tener entre 3 y 20 caracteres',
]

const fechaInicioRules = [
  val => !!val || 'La fecha de inicio es requerida',
  val => new Date(val) <= new Date(form.value.fecha_fin_sm_vc) || 'La fecha de inicio debe ser anterior a la fecha de fin',
]

const fechaFinRules = [
  val => !!val || 'La fecha de fin es requerida',
  val => new Date(val) >= new Date(form.value.fecha_inicio_sm_vc) || 'La fecha de fin debe ser posterior a la fecha de inicio',
]

// Columnas para la tabla
const columns = [
  {
    name: 'id_sm_vc',
    label: 'ID',
    field: 'id_sm_vc',
    align: 'center',
    sortable: false,
  },
  {
    name: 'nombre_sm_vc',
    label: 'Nombre',
    field: 'nombre_sm_vc',
    align: 'left',
    sortable: true,
  },
  {
    name: 'fecha_inicio_sm_vc',
    label: 'Fecha Inicio',
    field: 'fecha_inicio_sm_vc',
    align: 'center',
    sortable: true,
    format: (val) => date.formatDate(val, 'DD/MM/YYYY'),
  },
  {
    name: 'fecha_fin_sm_vc',
    label: 'Fecha Fin',
    field: 'fecha_fin_sm_vc',
    align: 'center',
    sortable: true,
    format: (val) => date.formatDate(val, 'DD/MM/YYYY'),
  },
  {
    name: 'estado_activo_sm_vc',
    label: 'Estado',
    field: 'estado_activo_sm_vc',
    align: 'center',
    sortable: false,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
    sortable: false,
  },
]

// Computed
const editingPeriodComputed = computed(() => editingPeriod.value !== null)

// Métodos
const loadPeriodos = async () => {
  loading.value = true
  try {
    const response = await api.get('/periodos')
    periodos.value = response.data
  } catch (error) {
    console.error('Error cargando períodos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los períodos académicos',
    })
  } finally {
    loading.value = false
  }
}

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const params = {
    page,
    limit: rowsPerPage,
    sort: sortBy,
    order: descending ? 'desc' : 'asc',
  }

  try {
    const response = await api.get('/periodos', { params })
    periodos.value = response.data
    props.pagination.rowsNumber = response.data.total
  } catch (error) {
    console.error('Error en paginación:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los períodos',
    })
  }
}

const editPeriod = (period) => {
  editingPeriod.value = { ...period }
  form.value = {
    nombre_sm_vc: period.nombre_sm_vc,
    fecha_inicio_sm_vc: date.formatDate(period.fecha_inicio_sm_vc, 'YYYY-MM-DD'),
    fecha_fin_sm_vc: date.formatDate(period.fecha_fin_sm_vc, 'YYYY-MM-DD'),
    estado_activo_sm_vc: period.estado_activo_sm_vc,
    descripcion_sm_vc: period.descripcion_sm_vc || '',
  }
  showCreateDialog.value = true
}

const activarPeriod = async (id) => {
  try {
    await api.patch(`/periodos/${id}/activar`)
    await loadPeriodos()
    $q.notify({
      type: 'positive',
      message: `Período activado correctamente`,
    })
  } catch (error) {
    console.error('Error activando período:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al activar el período',
    })
  }
}

const desactivarPeriod = async (id) => {
  try {
    await api.patch(`/periodos/${id}/desactivar`)
    await loadPeriodos()
    $q.notify({
      type: 'positive',
      message: `Período desactivado correctamente`,
    })
  } catch (error) {
    console.error('Error desactivando período:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al desactivar el período',
    })
  }
}

const confirmDelete = () => {
  deleting.value = true
}

const deletePeriod = async () => {
  try {
    await api.delete(`/periodos/${periodToDelete.value.id_sm_vc}`)
    showDeleteDialog.value = false
    showSuccessDialog.value = true
    successMessage.value = `Período "${periodToDelete.value.nombre_sm_vc}" eliminado correctamente`
    periodToDelete.value = null
    await loadPeriodos()
  } catch (error) {
    console.error('Error eliminando período:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al eliminar el período',
    })
    } finally {
      deleting.value = false
    }
}

const savePeriod = async () => {
  saving.value = true
  try {
    if (editingPeriodComputed.value) {
      await api.patch(`/periodos/${editingPeriod.value.id_sm_vc}`, form.value)
      $q.notify({
        type: 'positive',
        message: 'Período actualizado correctamente',
      })
    } else {
      await api.post('/periodos', form.value)
      $q.notify({
        type: 'positive',
        message: 'Período creado correctamente',
      })
    }
    showCreateDialog.value = false
    editingPeriod.value = null
    resetForm()
    loadPeriodos()
  } catch (error) {
    console.error('Error guardando período:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el período',
    })
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  form.value = {
    nombre_sm_vc: '',
    fecha_inicio_sm_vc: '',
    fecha_fin_sm_vc: '',
    estado_activo_sm_vc: false,
    descripcion_sm_vc: '',
  }
  editingPeriod.value = null
}

const closeDialog = () => {
  showCreateDialog.value = false
  showDeleteDialog.value = false
  showSuccessDialog.value = false
  editingPeriod.value = null
  resetForm()
}

// Lifecycle
onMounted(() => {
  loadPeriodos()
})
</script>

<style scoped>
.periods-table {
  margin-top: 1rem;
}

.period-dialog {
  min-width: 500px;
}

.status-badge {
  font-weight: 500;
}

.action-btn {
  margin: 0 2px;
}

.action-btn:last-child {
  margin-left: 0;
}
</style>
