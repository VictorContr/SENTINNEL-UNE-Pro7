<!-- UsuariosView.vue — Vista Admin: CRUD con Banear/Revocar + Dialog Nuevo Usuario -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="manage_accounts" size="22px" color="amber-4" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Gestión de Usuarios</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        CRUD completo · Soft-delete por auditoría (<span class="code-tag_sm_vc">activo_sm_vc = false</span>)
      </p>
    </div>

    <!-- Toolbar de acciones -->
    <div class="toolbar-row_sm_vc">
      <q-input
        v-model="busqueda_sm_vc" dense outlined
        placeholder="Buscar usuario…"
        class="sntnl-input_sm_vc search-input_sm_vc" dark color="teal-3"
      >
        <template #prepend><q-icon name="search" color="grey-6" size="18px" /></template>
      </q-input>

      <q-btn unelevated icon="person_add" label="Nuevo Usuario"
        class="btn-action_sm_vc" no-caps
        @click="dialog_nuevo_sm_vc = true" />
    </div>

    <!-- Tabla Quasar -->
    <q-table
      :rows="usuarios_filtrados_sm_vc" :columns="columns_sm_vc"
      row-key="id_sm_vc" flat dark
      class="sntnl-table_sm_vc"
      :rows-per-page-options="[10, 25, 50]"
      no-data-label="No hay usuarios registrados"
    >
      <!-- Estado activo -->
      <template #body-cell-activo_sm_vc="props">
        <q-td :props="props">
          <q-chip dense
            :color="props.value ? 'teal-9' : 'red-9'"
            :text-color="props.value ? 'teal-3' : 'red-3'"
            :label="props.value ? 'Activo' : 'Baneado'"
            square class="status-chip_sm_vc" />
        </q-td>
      </template>

      <!-- Rol -->
      <template #body-cell-rol_sm_vc="props">
        <q-td :props="props">
          <span class="role-badge_sm_vc" :class="`role-badge--${props.value.toLowerCase()}_sm_vc`">
            {{ props.value }}
          </span>
        </q-td>
      </template>

      <!-- Acciones — SIN botón eliminar, solo Banear (soft-delete) -->
      <template #body-cell-acciones="props">
        <q-td :props="props" class="text-center">
          <q-btn flat dense round icon="edit" color="teal-3" size="sm">
            <q-tooltip class="bg-dark">Editar usuario</q-tooltip>
          </q-btn>
          <q-btn flat dense round
            :icon="props.row.activo_sm_vc ? 'block' : 'restore'"
            :color="props.row.activo_sm_vc ? 'amber-4' : 'teal-3'"
            size="sm"
            :disable="props.row.id_sm_vc === auth.user?.id_sm_vc"
            @click="confirmar_ban_sm_vc(props.row)"
          >
            <q-tooltip class="bg-dark">
              {{ props.row.activo_sm_vc ? 'Revocar permisos (banear)' : 'Restaurar acceso' }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog: Confirmar Ban -->
    <q-dialog v-model="dialog_ban_sm_vc" persistent>
      <q-card class="sntnl-dialog-card_sm_vc">
        <q-card-section class="dialog-header_sm_vc">
          <q-icon name="block" color="amber-4" size="24px" class="q-mr-sm" />
          <span>Revocar Permisos</span>
        </q-card-section>
        <q-card-section class="dialog-body_sm_vc">
          <p>
            Vas a revocar el acceso de
            <strong>{{ user_target_sm_vc?.nombre_sm_vc }}</strong>.
            Esta acción aplica un <span class="code-tag_sm_vc">soft-delete</span> —
            el registro permanece para auditoría
            (<span class="code-tag_sm_vc">activo_sm_vc = false</span>).
          </p>
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions_sm_vc">
          <q-btn flat label="Cancelar" color="grey-5" v-close-popup no-caps />
          <q-btn unelevated label="Revocar Permisos" icon="block"
            color="amber-4" text-color="dark" no-caps v-close-popup
            @click="ejecutar_ban_sm_vc" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ══════════════════════════════════════════
         Dialog: Nuevo Usuario (W-06)
         ══════════════════════════════════════════ -->
    <q-dialog v-model="dialog_nuevo_sm_vc" persistent>
      <q-card class="sntnl-dialog-card_sm_vc" style="min-width: 440px">
        <q-card-section class="dialog-header_sm_vc">
          <q-icon name="person_add" color="teal-3" size="24px" class="q-mr-sm" />
          <span>Registrar Nuevo Usuario</span>
        </q-card-section>

        <q-card-section class="dialog-body_sm_vc">
          <q-form @submit.prevent="guardar_nuevo_usuario_sm_vc" class="dialog-form_sm_vc">
            <div class="field-group_sm_vc">
              <label class="field-label_sm_vc">Nombre Completo <span class="req-mark_sm_vc">*</span></label>
              <q-input v-model="form_nuevo_sm_vc.nombre_sm_vc" dense outlined dark color="teal-3"
                class="sntnl-input_sm_vc" placeholder="Ej: Juan Pérez"
                :rules="[val => !!val || 'Campo requerido']" />
            </div>

            <div class="field-group_sm_vc">
              <label class="field-label_sm_vc">Correo Institucional <span class="req-mark_sm_vc">*</span></label>
              <q-input v-model="form_nuevo_sm_vc.correo_sm_vc" dense outlined dark color="teal-3"
                class="sntnl-input_sm_vc" placeholder="usuario@une.edu.ve" type="email"
                :rules="[val => !!val || 'Campo requerido', val => /.+@.+/.test(val) || 'Correo inválido']" />
            </div>

            <div class="field-group_sm_vc">
              <label class="field-label_sm_vc">Rol <span class="req-mark_sm_vc">*</span></label>
              <q-select v-model="form_nuevo_sm_vc.rol_sm_vc" dense outlined dark color="teal-3"
                class="sntnl-select_sm_vc"
                :options="['ADMINISTRADOR', 'PROFESOR', 'ESTUDIANTE']"
                :rules="[val => !!val || 'Selecciona un rol']" />
            </div>

            <div class="field-group_sm_vc">
              <label class="field-label_sm_vc">Contraseña Temporal</label>
              <q-input v-model="form_nuevo_sm_vc.clave_sm_vc" dense outlined dark color="teal-3"
                class="sntnl-input_sm_vc" placeholder="temp123" type="password" />
            </div>

            <div v-if="form_nuevo_sm_vc.rol_sm_vc === 'ESTUDIANTE'" class="field-group_sm_vc">
              <label class="field-label_sm_vc">Cohorte</label>
              <q-input v-model="form_nuevo_sm_vc.cohorte_sm_vc" dense outlined dark color="teal-3"
                class="sntnl-input_sm_vc" placeholder="2024-A" />
            </div>

            <div v-if="form_nuevo_sm_vc.rol_sm_vc === 'ESTUDIANTE'" class="field-group_sm_vc">
              <label class="field-label_sm_vc">Profesor Asignado</label>
              <q-select v-model="form_nuevo_sm_vc.profesor_id_sm_vc" dense outlined dark color="teal-3"
                class="sntnl-select_sm_vc" emit-value map-options
                :options="profesores_options_sm_vc" clearable />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions_sm_vc">
          <q-btn flat label="Cancelar" color="grey-5" v-close-popup no-caps @click="reset_form_nuevo_sm_vc" />
          <q-btn unelevated label="Guardar Usuario" icon="save"
            class="btn-cta_sm_vc" no-caps
            @click="guardar_nuevo_usuario_sm_vc" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const auth = useAuthStore()
const $q = useQuasar()

const busqueda_sm_vc = ref('')
const dialog_nuevo_sm_vc = ref(false)
const dialog_ban_sm_vc = ref(false)
const user_target_sm_vc = ref(null)

const columns_sm_vc = [
  { name: 'id_sm_vc', label: 'ID', field: 'id_sm_vc', sortable: true, align: 'left' },
  { name: 'nombre_sm_vc', label: 'Nombre', field: 'nombre_sm_vc', sortable: true, align: 'left' },
  { name: 'correo_sm_vc', label: 'Correo', field: 'correo_sm_vc', align: 'left' },
  { name: 'rol_sm_vc', label: 'Rol', field: 'rol_sm_vc', sortable: true, align: 'center' },
  { name: 'activo_sm_vc', label: 'Estado', field: 'activo_sm_vc', sortable: true, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const usuarios_filtrados_sm_vc = computed(() => {
  const q_sm_vc = busqueda_sm_vc.value.toLowerCase()
  return auth.MOCK_USERS.filter(
    (u) =>
      u.nombre_sm_vc.toLowerCase().includes(q_sm_vc) ||
      u.correo_sm_vc.toLowerCase().includes(q_sm_vc) ||
      u.rol_sm_vc.toLowerCase().includes(q_sm_vc)
  )
})

const profesores_options_sm_vc = computed(() =>
  auth.MOCK_USERS
    .filter((u) => u.rol_sm_vc === 'PROFESOR' && u.activo_sm_vc)
    .map((u) => ({ label: u.nombre_sm_vc, value: u.id_sm_vc }))
)

/* ── Ban ── */
function confirmar_ban_sm_vc(usuario_sm_vc) {
  user_target_sm_vc.value = usuario_sm_vc
  dialog_ban_sm_vc.value = true
}

function ejecutar_ban_sm_vc() {
  if (user_target_sm_vc.value) {
    auth.banUser(user_target_sm_vc.value.id_sm_vc)
    const accion_sm_vc = user_target_sm_vc.value.activo_sm_vc ? 'restaurado' : 'revocado'
    $q.notify({
      type: 'info',
      message: `Acceso ${accion_sm_vc} para ${user_target_sm_vc.value.nombre_sm_vc}.`,
      position: 'top-right',
      timeout: 3000
    })
  }
}

/* ── Nuevo Usuario ── */
const form_nuevo_sm_vc = ref({
  nombre_sm_vc: '',
  correo_sm_vc: '',
  rol_sm_vc: 'ESTUDIANTE',
  clave_sm_vc: '',
  cohorte_sm_vc: '',
  profesor_id_sm_vc: null
})

function reset_form_nuevo_sm_vc() {
  form_nuevo_sm_vc.value = {
    nombre_sm_vc: '', correo_sm_vc: '', rol_sm_vc: 'ESTUDIANTE',
    clave_sm_vc: '', cohorte_sm_vc: '', profesor_id_sm_vc: null
  }
}

function guardar_nuevo_usuario_sm_vc() {
  try {
    if (!form_nuevo_sm_vc.value.nombre_sm_vc || !form_nuevo_sm_vc.value.correo_sm_vc) {
      $q.notify({ type: 'warning', message: 'Completa los campos requeridos.', position: 'top-right' })
      return
    }
    const nuevo_sm_vc = auth.crearUsuario(form_nuevo_sm_vc.value)
    $q.notify({
      type: 'positive',
      message: `Usuario ${nuevo_sm_vc.nombre_sm_vc} registrado exitosamente.`,
      caption: `ID: ${nuevo_sm_vc.id_sm_vc}`,
      icon: 'check_circle',
      position: 'top-right',
      timeout: 4000
    })
    dialog_nuevo_sm_vc.value = false
    reset_form_nuevo_sm_vc()
  } catch (err_sm_vc) {
    $q.notify({ type: 'negative', message: err_sm_vc?.message || 'Error al crear usuario.', position: 'top-right' })
  }
}
</script>

<style scoped>
.toolbar-row_sm_vc { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-input_sm_vc { min-width: 260px; }
.status-chip_sm_vc { font-size: 0.58rem !important; letter-spacing: 0.08em; }
.role-badge_sm_vc { font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 8px; border-radius: var(--radius-sm_vc); font-weight: 600; }
.role-badge--administrador_sm_vc { background: rgba(240, 165, 0, 0.12); color: var(--color-admin_vc); }
.role-badge--profesor_sm_vc { background: rgba(111, 255, 233, 0.1); color: var(--color-cta_vc); }
.role-badge--estudiante_sm_vc { background: rgba(126, 200, 227, 0.1); color: var(--color-estudiante_vc); }

/* ── Dialog ── */
.sntnl-dialog-card_sm_vc { background: var(--color-primario-claro_vc) !important; border: 1px solid rgba(111, 255, 233, 0.12) !important; border-radius: 12px !important; }
.dialog-header_sm_vc { display: flex; align-items: center; font-size: 0.9rem; font-weight: 600; color: var(--color-texto-primario_vc); letter-spacing: 0.06em; font-family: var(--font-mono_vc); }
.dialog-body_sm_vc p { font-size: 0.8rem; color: var(--color-texto-secundario_vc); line-height: 1.7; font-family: var(--font-sans_vc); }
.dialog-body_sm_vc strong { color: var(--color-texto-primario_vc); }
.dialog-actions_sm_vc { padding: 0.75rem 1rem; gap: 0.5rem; }
.dialog-form_sm_vc { display: flex; flex-direction: column; gap: 0.75rem; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: 0.25rem; }
.field-label_sm_vc { font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-acento_vc); font-weight: 500; font-family: var(--font-mono_vc); }
.req-mark_sm_vc { color: var(--color-error-claro_vc); }
</style>
