<!-- ══════════════════════════════════════════════════════════════════
     UsuariosPage.vue — CRUD de usuarios con soft-delete.
     Thin Page: extrae el dialog a DialogNuevoUsuario y delega
     todas las mutaciones al authStore. Sufijos _sm_vc en todo.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="manage_accounts" size="22px" color="amber-4" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Gestión de Usuarios</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        CRUD completo · Soft-delete por auditoría
        (<span class="code-tag_sm_vc">activo_sm_vc = false</span>)
      </p>
    </div>

    <!-- Toolbar -->
    <div class="toolbar-row_sm_vc">
      <q-input
        v-model="busqueda_sm_vc"
        dense outlined placeholder="Buscar usuario…"
        class="sntnl-input_sm_vc search-input_sm_vc" color="teal-3">
        <template #prepend>
          <q-icon name="search" color="grey-6" size="18px" />
        </template>
      </q-input>

      <q-btn unelevated icon="person_add" label="Nuevo Usuario"
        class="btn-action_sm_vc" no-caps
        @click="dialogNuevo_sm_vc = true" />
    </div>

    <!-- Tabla Quasar -->
    <q-table
      :rows="usuariosFiltrados_sm_vc"
      :columns="columns_sm_vc"
      row-key="id_sm_vc"
      flat
      class="sntnl-table_sm_vc"
      :rows-per-page-options="[10, 25, 50]"
      no-data-label="No hay usuarios registrados">

      <template #body-cell-activo_sm_vc="props">
        <q-td :props="props">
          <q-chip dense
            :color="props.value ? 'teal-9' : 'red-9'"
            :text-color="props.value ? 'teal-3' : 'red-3'"
            :label="props.value ? 'Activo' : 'Baneado'"
            square class="status-chip_sm_vc" />
        </q-td>
      </template>

      <template #body-cell-nombre_sm_vc="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-x-sm">
            <q-avatar size="32px" color="teal-9" text-color="teal-3" class="q-mr-xs">
              {{ props.value.charAt(0).toUpperCase() }}
            </q-avatar>
            <span>{{ props.value }}</span>
          </div>
        </q-td>
      </template>

      <template #body-cell-rol_sm_vc="props">
        <q-td :props="props">
          <span class="role-badge_sm_vc"
            :class="`role-badge--${props.value.toLowerCase()}_sm_vc`">
            {{ props.value }}
          </span>
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props" class="text-center">
          <q-btn
            v-if="props.row.rol_sm_vc === 'ESTUDIANTE'"
            flat
            dense
            round
            icon="track_changes"
            color="teal-3"
            size="sm"
            :to="`/admin/trazabilidad/${props.row.id_sm_vc}`">
            <q-tooltip class="bg-dark">Trazabilidad académica</q-tooltip>
          </q-btn>
          <q-btn
            v-if="props.row.rol_sm_vc === 'ESTUDIANTE'"
            flat
            dense
            round
            icon="rocket_launch"
            color="teal-3"
            size="sm"
            :to="`/admin/trazabilidad/${props.row.id_sm_vc}/deploy`">
            <q-tooltip class="bg-dark">Deploy Final</q-tooltip>
          </q-btn>
          <q-btn flat dense round icon="edit" color="teal-3" size="sm" @click="abrirEditar_sm_vc(props.row)">
            <q-tooltip class="bg-dark">Editar usuario</q-tooltip>
          </q-btn>
          <q-btn flat dense round
            :icon="props.row.activo_sm_vc ? 'block' : 'restore'"
            :color="props.row.activo_sm_vc ? 'amber-4' : 'teal-3'"
            size="sm"
            :disable="props.row.id_sm_vc === auth_sm_vc.user_sm_vc?.id_sm_vc"
            @click="confirmarBan_sm_vc(props.row)">
            <q-tooltip class="bg-dark">
              {{ props.row.activo_sm_vc ? 'Revocar permisos' : 'Restaurar acceso' }}
            </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog: Confirmar ban -->
    <q-dialog v-model="dialogBan_sm_vc" persistent>
      <q-card class="dialog-card_sm_vc">
        <q-card-section class="dialog-header_sm_vc">
          <q-icon name="block" color="amber-4" size="24px" class="q-mr-sm" />
          <span>Revocar Permisos</span>
        </q-card-section>
        <q-card-section>
          <p class="dialog-body-text_sm_vc">
            Vas a revocar el acceso de
            <strong>{{ usuarioTarget_sm_vc?.nombre_sm_vc }}</strong>.
            Esta acción aplica un <span class="code-tag_sm_vc">soft-delete</span>
            — el registro permanece para auditoría
            (<span class="code-tag_sm_vc">activo_sm_vc = false</span>).
          </p>
        </q-card-section>
        <q-card-actions align="right" class="q-pb-md q-pr-md" style="gap:.5rem">
          <q-btn flat label="Cancelar" color="grey-5" v-close-popup no-caps />
          <q-btn unelevated label="Revocar Permisos" icon="block"
            color="amber-4" text-color="dark" no-caps v-close-popup
            @click="ejecutarBan_sm_vc" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog: Nuevo/Editar usuario (componente atómico) -->
    <DialogNuevoUsuario
      v-model="dialogNuevo_sm_vc"
      :profesores-opc="profesoresOpc_sm_vc"
      :usuario-a-editar="usuarioEditar_sm_vc"
      @guardar="handleGuardar_sm_vc"
      @update:model-value="(val) => !val && (usuarioEditar_sm_vc = null)" />

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useUsersStore } from 'src/stores/usersStore'
import DialogNuevoUsuario from 'src/components/shared/usuarios/DialogNuevoUsuario.vue'

const auth_sm_vc = useAuthStore()
const usersStore_sm_vc = useUsersStore()
const $q_sm_vc = useQuasar()

/* ── Initial Load ── */
onMounted(() => {
  usersStore_sm_vc.fetch_usuarios_sm_vc()
})

/* ── State ── */
const busqueda_sm_vc = ref('')
const dialogNuevo_sm_vc = ref(false)
const dialogBan_sm_vc = ref(false)
const usuarioTarget_sm_vc = ref(null)
const usuarioEditar_sm_vc = ref(null)

/* ── Columnas de la tabla ── */
const columns_sm_vc = [
  { name: 'id_sm_vc',      label: 'ID',      field: 'id_sm_vc',      sortable: true,  align: 'left' },
  { name: 'nombre_sm_vc',  label: 'Nombre',  field: 'nombre_sm_vc',  sortable: true,  align: 'left' },
  { name: 'correo_sm_vc',  label: 'Correo',  field: 'correo_sm_vc',                   align: 'left' },
  { name: 'rol_sm_vc',     label: 'Rol',     field: 'rol_sm_vc',     sortable: true,  align: 'center' },
  { name: 'activo_sm_vc',  label: 'Estado',  field: 'activo_sm_vc',  sortable: true,  align: 'center' },
  { name: 'acciones',      label: 'Acciones', field: 'acciones',                       align: 'center' }
]

/* ── Usuarios filtrados ── */
const usuariosFiltrados_sm_vc = computed(() => {
  const q_sm_vc = busqueda_sm_vc.value.toLowerCase()
  return (usersStore_sm_vc.usuarios_sm_vc || []).filter(
    (u) =>
      u.nombre_sm_vc.toLowerCase().includes(q_sm_vc) ||
      u.correo_sm_vc.toLowerCase().includes(q_sm_vc) ||
      u.rol_sm_vc.toLowerCase().includes(q_sm_vc)
  )
})

/* ── Opciones de profesores para el dialog ── */
const profesoresOpc_sm_vc = computed(() =>
  (usersStore_sm_vc.usuarios_sm_vc || [])
    .filter((u) => u.rol_sm_vc === 'PROFESOR' && u.activo_sm_vc)
    .map((u) => ({ label: u.nombre_sm_vc, value: u.id_sm_vc }))
)

/* ── Handlers ban ── */
const confirmarBan_sm_vc = (usuario_sm_vc) => {
  usuarioTarget_sm_vc.value = usuario_sm_vc
  dialogBan_sm_vc.value = true
}

const ejecutarBan_sm_vc = async () => {
  if (!usuarioTarget_sm_vc.value) return
  const success_sm_vc = await usersStore_sm_vc.ban_usuario_sm_vc(usuarioTarget_sm_vc.value.id_sm_vc)
  if (success_sm_vc) {
    const accion_sm_vc = usuarioTarget_sm_vc.value.activo_sm_vc ? 'revocado' : 'restaurado'
    $q_sm_vc.notify({
      type: 'info',
      message: `Acceso ${accion_sm_vc} con éxito.`,
      position: 'top-right'
    })
  }
}

/* ── Handler editar usuario ── */
const abrirEditar_sm_vc = (usuario_sm_vc) => {
  usuarioEditar_sm_vc.value = usuario_sm_vc
  dialogNuevo_sm_vc.value = true
}

/* ── Handler nuevo/editar usuario ── */
const handleGuardar_sm_vc = async (datos_sm_vc) => {
  try {
    const esEdicion_sm_vc = !!datos_sm_vc.id_sm_vc
    let resp_sm_vc = null
    
    if (esEdicion_sm_vc) {
      resp_sm_vc = await usersStore_sm_vc.update_usuario_sm_vc(datos_sm_vc)
      if (resp_sm_vc) {
        $q_sm_vc.notify({
          type: 'positive',
          message: `Usuario ${resp_sm_vc.nombre_sm_vc} actualizado exitosamente.`,
          icon: 'check_circle',
          position: 'top-right'
        })
      }
    } else {
      resp_sm_vc = await usersStore_sm_vc.create_usuario_sm_vc(datos_sm_vc)
      if (resp_sm_vc) {
        $q_sm_vc.notify({
          type: 'positive',
          message: `Usuario ${resp_sm_vc.nombre_sm_vc} registrado exitosamente.`,
          caption: `ID: ${resp_sm_vc.id_sm_vc}`,
          icon: 'check_circle',
          position: 'top-right'
        })
      }
    }
    if (resp_sm_vc) dialogNuevo_sm_vc.value = false
  } catch (err_sm_vc) {
    $q_sm_vc.notify({
      type: 'negative',
      message: err_sm_vc?.message || 'Error al guardar el usuario.',
      position: 'top-right'
    })
  }
}
</script>

<style scoped>
.toolbar-row_sm_vc { display: flex; align-items: center; gap: .75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-input_sm_vc { min-width: 260px; }
.status-chip_sm_vc { font-size: .58rem !important; letter-spacing: .08em; }
.role-badge_sm_vc { font-size: .58rem; letter-spacing: .1em; text-transform: uppercase; padding: 2px 8px; border-radius: var(--sn-radius-sm); font-weight: 600; }
.role-badge--administrador_sm_vc { background: rgba(240,165,0,.12); color: var(--sn-admin); }
.role-badge--profesor_sm_vc { background: var(--sn-surface-active); color: var(--sn-primario); }
.role-badge--estudiante_sm_vc { background: rgba(126,200,227,.1); color: var(--sn-estudiante); }
.dialog-card_sm_vc { background: var(--sn-fondo-panel) !important; border: 1px solid var(--sn-borde-hover) !important; border-radius: 12px !important; }
.dialog-header_sm_vc { display: flex; align-items: center; font-size: .9rem; font-weight: 600; color: var(--sn-texto-principal); letter-spacing: .06em; font-family: var(--sn-font-mono); }
.dialog-body-text_sm_vc { font-size: .8rem; color: var(--sn-texto-secundario); line-height: 1.7; margin: 0; font-family: var(--sn-font-sans); }
.dialog-body-text_sm_vc strong { color: var(--sn-texto-principal); }
</style>