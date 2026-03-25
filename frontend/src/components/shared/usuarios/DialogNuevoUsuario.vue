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

      <q-card-section>
        <div class="dialog-form_sm_vc">

          <div class="field-group_sm_vc">
            <label class="field-label_sm_vc">
              Nombre Completo <span class="req-mark_sm_vc">*</span>
            </label>
            <q-input
              v-model="form_sm_vc.nombre_sm_vc"
              dense outlined color="teal-3" class="sntnl-input_sm_vc"
              placeholder="Ej: Juan Pérez" />
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
              Rol <span class="req-mark_sm_vc">*</span>
            </label>
            <q-select
              v-model="form_sm_vc.rol_sm_vc"
              :options="['ADMINISTRADOR', 'PROFESOR', 'ESTUDIANTE']"
              dense outlined color="teal-3"
              class="sntnl-select_sm_vc" />
          </div>

          <div class="field-group_sm_vc">
            <label class="field-label_sm_vc">Contraseña Temporal</label>
            <q-input
              v-model="form_sm_vc.clave_sm_vc"
              dense outlined color="teal-3" class="sntnl-input_sm_vc"
              placeholder="temp123" type="password" />
          </div>

          <!-- Campos extra para estudiante -->
          <template v-if="form_sm_vc.rol_sm_vc === 'ESTUDIANTE'">
            <div class="field-group_sm_vc">
              <label class="field-label_sm_vc">Periodo</label>
              <q-input
                v-model="form_sm_vc.cohorte_sm_vc"
                dense outlined color="teal-3" class="sntnl-input_sm_vc"
                placeholder="2024-A" />
            </div>

            <div class="field-group_sm_vc">
              <label class="field-label_sm_vc">Profesor Asignado</label>
              <q-select
                v-model="form_sm_vc.profesor_id_sm_vc"
                :options="profesoresOpc"
                dense outlined color="teal-3"
                class="sntnl-select_sm_vc"
                emit-value map-options clearable />
            </div>
          </template>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="dialog-actions_sm_vc">
        <q-btn flat label="Cancelar" color="grey-5" no-caps @click="cancelar_sm_vc" />
        <q-btn unelevated :label="usuarioAEditar ? 'Actualizar Usuario' : 'Guardar Usuario'" icon="save"
          class="btn-cta_sm_vc" no-caps @click="guardar_sm_vc" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  profesoresOpc: { type: Array, default: () => [] },
  usuarioAEditar: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'guardar'])

const estadoInicial_sm_vc = () => ({
  nombre_sm_vc: '',
  correo_sm_vc: '',
  rol_sm_vc: 'ESTUDIANTE',
  clave_sm_vc: '',
  cohorte_sm_vc: '',
  profesor_id_sm_vc: null
})

const form_sm_vc = ref(estadoInicial_sm_vc())

watch(() => props.usuarioAEditar, (newVal) => {
  if (newVal) {
    // Rellenamos el form si es edición
    form_sm_vc.value = { ...newVal, clave_sm_vc: '' } // no traemos la clave por seguridad mock
  } else {
    form_sm_vc.value = estadoInicial_sm_vc()
  }
}, { immediate: true })

const cancelar_sm_vc = () => {
  form_sm_vc.value = estadoInicial_sm_vc()
  emit('update:modelValue', false)
}

const guardar_sm_vc = () => {
  if (!form_sm_vc.value.nombre_sm_vc || !form_sm_vc.value.correo_sm_vc) return
  emit('guardar', { ...form_sm_vc.value })
  form_sm_vc.value = estadoInicial_sm_vc()
  emit('update:modelValue', false)
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
</style>