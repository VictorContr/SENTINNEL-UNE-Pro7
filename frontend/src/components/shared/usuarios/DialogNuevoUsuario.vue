<!-- ══════════════════════════════════════════════════════════════════
     DialogNuevoUsuario.vue — Modal de registro de nuevo usuario.
     Extraído de UsuariosPage para respetar SRP. Emite 'guardar'
     con el payload del formulario; no toca el store directamente.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-dialog :model-value="modelValue" persistent
    @update:model-value="emit('update:modelValue', $event)">
    <q-card class="dialog-card_sm_vc">
      <q-card-section class="dialog-header_sm_vc">
        <q-icon :name="usuarioAEditar ? 'manage_accounts' : 'person_add'" color="teal-3" size="24px" class="q-mr-sm" />
        <span>{{ usuarioAEditar ? 'Editar Usuario' : 'Registrar Nuevo Usuario' }}</span>
      </q-card-section>

      <q-card-section class="relative-position">
        <!-- Spinner de carga para sincronización -->
        <q-inner-loading :showing="loadingData_sm_vc" style="z-index: 10;">
          <q-spinner-tail color="teal-3" size="2.5em" />
          <div class="q-mt-sm text-caption text-teal-3 font-mono uppercase">Sincronizando...</div>
        </q-inner-loading>

        <div class="dialog-form_sm_vc">

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <div class="field-group_sm_vc">
                <label class="field-label_sm_vc">
                  Nombre <span class="req-mark_sm_vc">*</span>
                </label>
                <q-input
                  v-model="form_sm_vc.nombre_sm_vc"
                  dense outlined color="teal-3" class="sntnl-input_sm_vc"
                  placeholder="Ej: Juan" />
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="field-group_sm_vc">
                <label class="field-label_sm_vc">
                  Apellido <span class="req-mark_sm_vc">*</span>
                </label>
                <q-input
                  v-model="form_sm_vc.apellido_sm_vc"
                  dense outlined color="teal-3" class="sntnl-input_sm_vc"
                  placeholder="Ej: Pérez" />
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <div class="field-group_sm_vc">
                <label class="field-label_sm_vc">
                  Cédula <span class="req-mark_sm_vc">*</span>
                </label>
                <q-input
                  v-model="form_sm_vc.cedula_sm_vc"
                  dense outlined color="teal-3" class="sntnl-input_sm_vc"
                  placeholder="V-12345678" />
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="field-group_sm_vc">
                <label class="field-label_sm_vc">
                  Rol <span class="req-mark_sm_vc">*</span>
                </label>
                <q-select
                  v-model="form_sm_vc.rol_sm_vc"
                  :options="rolOptions_sm_vc"
                  dense outlined color="teal-3"
                  class="sntnl-select_sm_vc"
                  emit-value map-options />
              </div>
            </div>
          </div>

          <div class="field-group_sm_vc">
            <label class="field-label_sm_vc">
              Correo Institucional <span class="req-mark_sm_vc">*</span>
            </label>
            <q-input
              v-model="form_sm_vc.correo_sm_vc"
              dense outlined color="teal-3" class="sntnl-input_sm_vc"
              placeholder="usuario@une.edu.ve" type="email" />
          </div>

          <div class="field-group_sm_vc">
            <label class="field-label_sm_vc">
              Teléfono
            </label>
            <q-input
              v-model="form_sm_vc.telefono_sm_vc"
              dense outlined color="teal-3" class="sntnl-input_sm_vc"
              placeholder="Ej: +584141234567" />
          </div>

          <div class="field-group_sm_vc">
            <label class="field-label_sm_vc">{{ usuarioAEditar ? 'Nueva Contraseña (opcional)' : 'Contraseña Temporal *' }}</label>
            <q-input
              v-model="form_sm_vc.clave_sm_vc"
              dense outlined color="teal-3" class="sntnl-input_sm_vc"
              placeholder="********" type="password" />
          </div>

          <!-- Campos extra para estudiante -->
          <template v-if="form_sm_vc.rol_sm_vc === 'ESTUDIANTE'">
            <div class="q-mt-sm sntnl-student-panel_sm_vc q-pa-md">
              <div class="text-caption text-teal-3 font-mono uppercase q-mb-md flex items-center gap-2">
                 <q-icon name="school" size="16px"/> Ficha Académica del Estudiante
              </div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <div class="field-group_sm_vc">
                    <label class="field-label_sm_vc">Profesor Asignado</label>
                    <q-select
                      v-model="form_sm_vc.estudiante_sm_vc.profesor_id_sm_vc"
                      :options="profesoresOpc"
                      dense outlined color="teal-3"
                      class="sntnl-select_sm_vc"
                      emit-value map-options clearable />
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="field-group_sm_vc">
                    <label class="field-label_sm_vc">Materia Activa <span class="req-mark_sm_vc">*</span></label>
                    <q-select
                      v-model="form_sm_vc.estudiante_sm_vc.materia_activa_id_sm_vc"
                      :options="materiasOpc_sm_vc"
                      dense outlined color="teal-3"
                      class="sntnl-select_sm_vc"
                      emit-value map-options />
                  </div>
                </div>
                <div class="col-12">
                  <div class="field-group_sm_vc">
                    <label class="field-label_sm_vc">Título del Proyecto <span class="req-mark_sm_vc">*</span></label>
                    <q-input
                      v-model="form_sm_vc.estudiante_sm_vc.titulo_proyecto_sm_vc"
                      dense outlined color="teal-3" class="sntnl-input_sm_vc"
                      placeholder="Ej: Sistema de Control..." />
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="field-group_sm_vc">
                    <label class="field-label_sm_vc">Empresa <span class="req-mark_sm_vc">*</span></label>
                    <q-input
                      v-model="form_sm_vc.estudiante_sm_vc.empresa_sm_vc"
                      dense outlined color="teal-3" class="sntnl-input_sm_vc"
                      placeholder="Ej: TechCorp" />
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="field-group_sm_vc">
                    <label class="field-label_sm_vc">Tutor Empresarial <span class="req-mark_sm_vc">*</span></label>
                    <q-input
                      v-model="form_sm_vc.estudiante_sm_vc.tutor_empresarial_sm_vc"
                      dense outlined color="teal-3" class="sntnl-input_sm_vc"
                      placeholder="Ej: Ing. Pérez" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="dialog-actions_sm_vc">
        <q-btn flat label="Cancelar" color="grey-5" no-caps @click="cancelar_sm_vc" />
        <q-btn unelevated :label="usuarioAEditar ? 'Actualizar Usuario' : 'Guardar Usuario'" icon="save"
          class="btn-cta_sm_vc" no-caps @click="guardar_sm_vc" :disabled="loadingData_sm_vc" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useUsersStore } from 'src/stores/usersStore'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  profesoresOpc: { type: Array, default: () => [] },
  usuarioAEditar: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'guardar'])
const $q = useQuasar()

const rolOptions_sm_vc = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Profesor', value: 'PROFESOR' },
  { label: 'Estudiante', value: 'ESTUDIANTE' }
]

const usersStore_sm_vc = useUsersStore()
const loadingData_sm_vc = ref(false)
const materiasOpc_sm_vc = ref([])

const loadMaterias_sm_vc = async () => {
  try {
    const res = await api.get('/pasantias/materias')
    materiasOpc_sm_vc.value = res.data.map(m => ({
      // ✅ FIX: periodo_sm_vc (string legacy) ya no existe tras la refactorización.
      // Ahora navegamos por la relación anidada: periodo?.nombre_sm_vc.
      // El operador ?. previene crashes si el endpoint no incluye el join.
      label: `${m.nombre_sm_vc} (${m.periodo?.nombre_sm_vc ?? m.periodo_id_sm_vc})`,
      value: m.id_sm_vc
    }))
  } catch(e) {
    console.error('Error cargando materias', e)
  }
}

onMounted(() => {
  loadMaterias_sm_vc()
})

const estadoInicial_sm_vc = () => ({
  nombre_sm_vc: '',
  apellido_sm_vc: '',
  cedula_sm_vc: '',
  correo_sm_vc: '',
  telefono_sm_vc: '',
  rol_sm_vc: 'ESTUDIANTE',
  clave_sm_vc: '',
  estudiante_sm_vc: {
    profesor_id_sm_vc: null,
    materia_activa_id_sm_vc: null,
    empresa_sm_vc: '',
    tutor_empresarial_sm_vc: '',
    titulo_proyecto_sm_vc: ''
  }
})

const form_sm_vc = reactive(estadoInicial_sm_vc())

const loadUserData_sm_vc = async () => {
  if (props.usuarioAEditar && props.modelValue) {
    loadingData_sm_vc.value = true
    try {
      const freshData = await usersStore_sm_vc.fetch_usuario_sm_vc(`${props.usuarioAEditar.id_sm_vc}?t=${Date.now()}`)
      if (freshData) {
        Object.assign(form_sm_vc, {
          ...freshData,
          clave_sm_vc: '',
          estudiante_sm_vc: freshData.estudiante_sm_vc || estadoInicial_sm_vc().estudiante_sm_vc
        })
      } else {
        Object.assign(form_sm_vc, { ...props.usuarioAEditar, clave_sm_vc: '', estudiante_sm_vc: props.usuarioAEditar.estudiante_sm_vc || estadoInicial_sm_vc().estudiante_sm_vc })
      }
    } catch (err) {
      console.error('Error sincronizando usuario:', err)
      Object.assign(form_sm_vc, { ...props.usuarioAEditar, clave_sm_vc: '', estudiante_sm_vc: props.usuarioAEditar.estudiante_sm_vc || estadoInicial_sm_vc().estudiante_sm_vc })
    } finally {
      loadingData_sm_vc.value = false
    }
  } else if (!props.modelValue) {
    Object.assign(form_sm_vc, estadoInicial_sm_vc())
  }
}

watch([() => props.usuarioAEditar, () => props.modelValue], () => {
  loadUserData_sm_vc()
}, { immediate: true })

const cancelar_sm_vc = () => {
  Object.assign(form_sm_vc, estadoInicial_sm_vc())
  emit('update:modelValue', false)
}

const guardar_sm_vc = () => {
  const f = { ...form_sm_vc }
  
  if (!f.nombre_sm_vc || !f.apellido_sm_vc || !f.cedula_sm_vc || !f.correo_sm_vc || !f.rol_sm_vc) {
    $q.notify({ type: 'warning', message: 'Faltan campos obligatorios del usuario.' })
    return
  }
  
  if (!props.usuarioAEditar && !f.clave_sm_vc) {
    $q.notify({ type: 'warning', message: 'La contraseña es obligatoria para nuevos usuarios.' })
    return
  }

  // Saneamiento general: estudiante_sm_vc solo es válido para ESTUDIANTE
  if (f.rol_sm_vc !== 'ESTUDIANTE') {
    delete f.estudiante_sm_vc
  } else {
    // Validar ficha académica si es estudiante
    const est = f.estudiante_sm_vc
    if (!est.empresa_sm_vc || !est.tutor_empresarial_sm_vc || !est.titulo_proyecto_sm_vc || !est.materia_activa_id_sm_vc) {
      $q.notify({ type: 'warning', message: 'Debe rellenar todos los campos obligatorios de la Ficha Académica del Estudiante.' })
      return
    }

    // Saneamiento Frontend: Remover campos técnicos como prevención
    f.estudiante_sm_vc = {
      profesor_id_sm_vc: est.profesor_id_sm_vc,
      materia_activa_id_sm_vc: est.materia_activa_id_sm_vc,
      empresa_sm_vc: est.empresa_sm_vc,
      tutor_empresarial_sm_vc: est.tutor_empresarial_sm_vc,
      titulo_proyecto_sm_vc: est.titulo_proyecto_sm_vc
    };
  }
  
  if (props.usuarioAEditar) {
    delete f.fecha_creacion_sm_vc
    if (!f.clave_sm_vc) {
      delete f.clave_sm_vc
    }
  }

  emit('guardar', f)
}
</script>

<style scoped>
.dialog-card_sm_vc { background: var(--sn-fondo-panel) !important; border: 1px solid var(--sn-borde-hover) !important; border-radius: 12px !important; min-width: 440px; }
.dialog-header_sm_vc { display: flex; align-items: center; font-size: .9rem; font-weight: 600; color: var(--sn-texto-principal); letter-spacing: .06em; font-family: var(--sn-font-mono); }
.dialog-form_sm_vc { display: flex; flex-direction: column; gap: .75rem; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: .25rem; }
.field-label_sm_vc { font-size: .6rem; letter-spacing: .12em; text-transform: uppercase; color: var(--sn-acento-sec); font-weight: 500; font-family: var(--sn-font-mono); }
.req-mark_sm_vc { color: var(--sn-error-claro); }
:deep(.sntnl-input_sm_vc .q-field__control),
:deep(.sntnl-select_sm_vc .q-field__control) { background: var(--sn-surface-alpha) !important; border: 1px solid var(--sn-borde) !important; border-radius: 6px !important; }
:deep(.sntnl-input_sm_vc .q-field__native),
:deep(.sntnl-select_sm_vc .q-field__native) { color: var(--sn-texto-principal) !important; font-size: .78rem !important; font-family: var(--sn-font-mono) !important; }
.dialog-actions_sm_vc { padding: .75rem 1rem; gap: .5rem; }
.sntnl-student-panel_sm_vc { border: 1px dashed var(--sn-borde-hover); border-radius: 8px; background: rgba(0, 0, 0, 0.1); }
</style>