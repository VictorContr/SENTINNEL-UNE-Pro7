<template>
  <q-dialog
    v-model="dialogValue"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="user-dialog-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form
          ref="userForm"
          @submit="onSubmit"
          @validation-error="onValidationError"
          class="q-gutter-md"
        >
          <div class="row q-col-gutter-md">
            <!-- Información Personal -->
            <div class="col-12">
              <div class="text-subtitle2 text-weight-medium q-mb-md">
                Información Personal
              </div>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.nombre_sm_vc"
                label="Nombre *"
                outlined
                dense
                :rules="[(val) => !!val || 'El nombre es requerido']"
                maxlength="50"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.apellido_sm_vc"
                label="Apellido *"
                outlined
                dense
                :rules="[(val) => !!val || 'El apellido es requerido']"
                maxlength="50"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.cedula_sm_vc"
                label="Cédula *"
                outlined
                dense
                :rules="cedulaRules"
                maxlength="12"
                :readonly="isEdit"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.telefono_sm_vc"
                label="Teléfono"
                outlined
                dense
                maxlength="20"
              />
            </div>

            <!-- Información de Cuenta -->
            <div class="col-12 q-mt-md">
              <div class="text-subtitle2 text-weight-medium q-mb-md">
                Información de Cuenta
              </div>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.correo_sm_vc"
                label="Correo Electrónico *"
                outlined
                dense
                type="email"
                :rules="emailRules"
                :readonly="isEdit"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.rol_sm_vc"
                :options="roleOptions"
                label="Rol *"
                outlined
                dense
                emit-value
                map-options
                :rules="[(val) => !!val || 'El rol es requerido']"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.clave_sm_vc"
                label="Contraseña *"
                outlined
                dense
                :type="showPassword ? 'text' : 'password'"
                :rules="passwordRules"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="confirmPassword"
                label="Confirmar Contraseña *"
                outlined
                dense
                :type="showConfirmPassword ? 'text' : 'password'"
                :rules="confirmPasswordRules"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </q-input>
            </div>

            <div class="col-12">
              <q-checkbox
                v-model="form.activo_sm_vc"
                label="Usuario activo"
                color="primary"
              />
            </div>
          </div>

          <div class="row q-mt-lg justify-end">
            <q-btn
              flat
              label="Cancelar"
              color="primary"
              v-close-popup
              @click="$emit('cancel')"
            />
            <q-btn
              type="submit"
              label="Guardar"
              color="primary"
              class="q-ml-sm"
              :loading="loading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import { useUsuariosStore } from 'src/stores/usuariosStore';

export default defineComponent({
  name: 'UserDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:modelValue', 'save', 'cancel'],
  setup(props, { emit }) {
    const usuariosStore = useUsuariosStore();

    // Estado local
    const userForm = ref(null);
    const loading = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const confirmPassword = ref('');

    // Formulario
    const form = ref({
      nombre_sm_vc: '',
      apellido_sm_vc: '',
      cedula_sm_vc: '',
      correo_sm_vc: '',
      telefono_sm_vc: '',
      rol_sm_vc: '',
      clave_sm_vc: '',
      activo_sm_vc: true,
    });

    // Computed
    const dialogValue = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    });

    const isEdit = computed(() => !!props.user);

    const roleOptions = [
      { label: 'Administrador', value: 'ADMIN' },
      { label: 'Profesor', value: 'PROFESOR' },
      { label: 'Estudiante', value: 'ESTUDIANTE' },
    ];

    // Reglas de validación
    const cedulaRules = [
      (val) => !!val || 'La cédula es requerida',
      (val) => /^\d+$/.test(val) || 'La cédula debe contener solo números',
      (val) => val.length >= 7 || 'La cédula debe tener al menos 7 dígitos',
    ];

    const emailRules = [
      (val) => !!val || 'El correo es requerido',
      (val) => /.+@.+\..+/.test(val) || 'El correo no es válido',
    ];

    const passwordRules = [
      (val) => {
        if (!isEdit.value) return !!val || 'La contraseña es requerida';
        return true; // En edición, la contraseña es opcional
      },
      (val) => {
        if (val && val.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return true;
      },
    ];

    const confirmPasswordRules = [
      (val) => {
        if (!isEdit.value) return !!val || 'Debe confirmar la contraseña';
        if (form.value.clave_sm_vc) return !!val || 'Debe confirmar la contraseña';
        return true;
      },
      (val) => {
        if (val && val !== form.value.clave_sm_vc) return 'Las contraseñas no coinciden';
        return true;
      },
    ];

    // Métodos
    const resetForm = () => {
      form.value = {
        nombre_sm_vc: '',
        apellido_sm_vc: '',
        cedula_sm_vc: '',
        correo_sm_vc: '',
        telefono_sm_vc: '',
        rol_sm_vc: '',
        clave_sm_vc: '',
        activo_sm_vc: true,
      };
      confirmPassword.value = '';
      showPassword.value = false;
      showConfirmPassword.value = false;
    };

    const loadUserData = () => {
      if (props.user) {
        form.value = {
          ...props.user,
          clave_sm_vc: '', // No cargar la contraseña existente
        };
      } else {
        resetForm();
      }
    };

    const onSubmit = async () => {
      loading.value = true;
      try {
        const userData = { ...form.value };
        
        // Si no se proporciona contraseña en edición, eliminarla del objeto
        if (isEdit.value && !userData.clave_sm_vc) {
          delete userData.clave_sm_vc;
        }

        if (isEdit.value) {
          await usuariosStore.updateUser_sm_vc(props.user.id_sm_vc, userData);
        } else {
          await usuariosStore.createUser_sm_vc(userData);
        }

        emit('save');
      } catch (error) {
        console.error('Error al guardar usuario:', error);
      } finally {
        loading.value = false;
      }
    };

    const onValidationError = () => {
      console.log('Formulario inválido');
    };

    // Watchers
    watch(() => props.user, loadUserData, { immediate: true });
    watch(dialogValue, (val) => {
      if (val) {
        loadUserData();
      } else {
        resetForm();
      }
    });

    return {
      userForm,
      loading,
      showPassword,
      showConfirmPassword,
      confirmPassword,
      form,
      dialogValue,
      isEdit,
      roleOptions,
      cedulaRules,
      emailRules,
      passwordRules,
      confirmPasswordRules,
      onSubmit,
      onValidationError,
    };
  },
});
</script>

<style lang="scss" scoped>
.user-dialog-card {
  max-width: 800px;
  margin: 0 auto;
}

@media (min-width: 600px) {
  .user-dialog-card {
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style>
