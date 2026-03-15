<!-- UsuariosView.vue — Vista Admin: CRUD con Banear/Revocar -->
<template>
  <q-page class="sntnl-page">
    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="manage_accounts" size="22px" color="amber-4" class="q-mr-sm" />
        <h1 class="page-title">Gestión de Usuarios</h1>
      </div>
      <p class="page-subtitle">
        CRUD completo · Soft-delete por auditoría (<span class="code-tag">activo_sm_vc = false</span>)
      </p>
    </div>

    <!-- Toolbar de acciones -->
    <div class="toolbar-row">
      <q-input
        v-model="busqueda"
        dense
        outlined
        placeholder="Buscar usuario…"
        class="sntnl-input search-input"
        dark
        color="teal-3"
      >
        <template #prepend><q-icon name="search" color="grey-6" size="18px" /></template>
      </q-input>

      <q-btn
        unelevated
        icon="person_add"
        label="Nuevo Usuario"
        class="action-btn"
        no-caps
        @click="dialogNuevo = true"
      />
    </div>

    <!-- Tabla Quasar -->
    <q-table
      :rows="usuariosFiltrados"
      :columns="columns"
      row-key="id_sm_vc"
      flat
      dark
      class="sntnl-table"
      :rows-per-page-options="[10, 25, 50]"
      no-data-label="No hay usuarios registrados"
    >
      <!-- Estado activo -->
      <template #body-cell-activo_sm_vc="props">
        <q-td :props="props">
          <q-chip
            dense
            :color="props.value ? 'teal-9' : 'red-9'"
            :text-color="props.value ? 'teal-3' : 'red-3'"
            :label="props.value ? 'Activo' : 'Baneado'"
            square
            class="status-chip"
          />
        </q-td>
      </template>

      <!-- Rol -->
      <template #body-cell-rol_sm_vc="props">
        <q-td :props="props">
          <span class="role-badge" :class="`role-badge--${props.value.toLowerCase()}`">
            {{ props.value }}
          </span>
        </q-td>
      </template>

      <!-- Acciones — SIN botón eliminar, solo Banear (soft-delete) -->
      <template #body-cell-acciones="props">
        <q-td :props="props" class="actions-td">
          <!-- Editar -->
          <q-btn flat dense round icon="edit" color="teal-3" size="sm">
            <q-tooltip class="bg-dark">Editar usuario</q-tooltip>
          </q-btn>

          <!-- Banear / Restaurar -->
          <q-btn
            flat
            dense
            round
            :icon="props.row.activo_sm_vc ? 'block' : 'restore'"
            :color="props.row.activo_sm_vc ? 'amber-4' : 'teal-3'"
            size="sm"
            :disable="props.row.id_sm_vc === auth.user?.id_sm_vc"
            @click="confirmarBan(props.row)"
          >
            <q-tooltip class="bg-dark">
              {{ props.row.activo_sm_vc ? 'Revocar permisos (banear)' : 'Restaurar acceso' }}
            </q-tooltip>
          </q-btn>
          <!-- NOTA: No existe botón DELETE por política de auditoría -->
        </q-td>
      </template>
    </q-table>

    <!-- Dialog: Confirmar Ban -->
    <q-dialog v-model="dialogBan" persistent>
      <q-card class="sntnl-dialog">
        <q-card-section class="dialog-header">
          <q-icon name="block" color="amber-4" size="24px" class="q-mr-sm" />
          <span>Revocar Permisos</span>
        </q-card-section>
        <q-card-section class="dialog-body">
          <p>
            Vas a revocar el acceso de
            <strong>{{ userTarget?.nombre_sm_vc }}</strong>.
            Esta acción aplica un <span class="code-tag">soft-delete</span> —
            el registro permanece para auditoría
            (<span class="code-tag">activo_sm_vc = false</span>).
          </p>
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey-5" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Revocar Permisos"
            icon="block"
            color="amber-4"
            text-color="dark"
            no-caps
            v-close-popup
            @click="ejecutarBan"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'

const auth = useAuthStore()
const busqueda = ref('')
const dialogNuevo = ref(false)
const dialogBan = ref(false)
const userTarget = ref(null)

const columns = [
  { name: 'id_sm_vc', label: 'ID', field: 'id_sm_vc', sortable: true, align: 'left' },
  { name: 'nombre_sm_vc', label: 'Nombre', field: 'nombre_sm_vc', sortable: true, align: 'left' },
  { name: 'correo_sm_vc', label: 'Correo', field: 'correo_sm_vc', align: 'left' },
  { name: 'rol_sm_vc', label: 'Rol', field: 'rol_sm_vc', sortable: true, align: 'center' },
  { name: 'activo_sm_vc', label: 'Estado', field: 'activo_sm_vc', sortable: true, align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]

const usuariosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  return auth.MOCK_USERS.filter(
    (u) =>
      u.nombre_sm_vc.toLowerCase().includes(q) ||
      u.correo_sm_vc.toLowerCase().includes(q) ||
      u.rol_sm_vc.toLowerCase().includes(q)
  )
})

function confirmarBan(user) {
  userTarget.value = user
  dialogBan.value = true
}

function ejecutarBan() {
  if (userTarget.value) auth.banUser(userTarget.value.id_sm_vc)
}
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.page-header { margin-bottom: 1.5rem; }
.page-title-row { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title { font-size: 1.2rem; font-weight: 700; color: #c8dde8; letter-spacing: 0.06em; margin: 0; font-family: 'IBM Plex Mono', monospace; }
.page-subtitle { font-size: 0.72rem; color: #3a5a78; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.code-tag { background: rgba(111, 255, 233, 0.08); color: #5bc0be; padding: 1px 5px; border-radius: 3px; font-size: 0.68rem; font-family: 'IBM Plex Mono', monospace; }
.toolbar-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.search-input { min-width: 260px; }
:deep(.sntnl-input .q-field__control) { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(91,192,190,0.2) !important; border-radius: 6px !important; }
:deep(.sntnl-input .q-field__native) { color: #c8dde8 !important; font-size: 0.82rem !important; font-family: 'IBM Plex Mono', monospace !important; }
.action-btn { background: rgba(111,255,233,0.12) !important; color: #6fffe9 !important; border: 1px solid rgba(111,255,233,0.25) !important; font-size: 0.75rem !important; letter-spacing: 0.05em !important; border-radius: 6px !important; }
:deep(.sntnl-table) { background: rgba(255,255,255,0.02) !important; border: 1px solid rgba(111,255,233,0.08) !important; border-radius: 10px !important; }
:deep(.sntnl-table .q-table__top), :deep(.sntnl-table .q-table__bottom) { background: rgba(0,0,0,0.2) !important; }
:deep(.sntnl-table thead tr th) { font-size: 0.6rem !important; letter-spacing: 0.12em !important; color: #3a5a78 !important; text-transform: uppercase !important; border-bottom: 1px solid rgba(111,255,233,0.06) !important; background: rgba(0,0,0,0.15) !important; }
:deep(.sntnl-table tbody tr td) { font-size: 0.75rem !important; color: #7aa0b8 !important; border-bottom: 1px solid rgba(255,255,255,0.03) !important; font-family: 'IBM Plex Mono', monospace !important; }
:deep(.sntnl-table tbody tr:hover td) { background: rgba(111,255,233,0.03) !important; }
.status-chip { font-size: 0.58rem !important; letter-spacing: 0.08em; }
.role-badge { font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.role-badge--administrador { background: rgba(240,165,0,0.12); color: #f0a500; }
.role-badge--profesor { background: rgba(111,255,233,0.1); color: #6fffe9; }
.role-badge--estudiante { background: rgba(126,200,227,0.1); color: #7ec8e3; }
.actions-td { text-align: center !important; }
:deep(.sntnl-dialog) { background: #0d1a38 !important; border: 1px solid rgba(111,255,233,0.12) !important; border-radius: 12px !important; min-width: 360px; }
.dialog-header { display: flex; align-items: center; font-size: 0.9rem; font-weight: 600; color: #c8dde8; letter-spacing: 0.06em; font-family: 'IBM Plex Mono', monospace; }
.dialog-body p { font-size: 0.8rem; color: #5a7fa8; line-height: 1.7; font-family: 'IBM Plex Sans', sans-serif; }
.dialog-body strong { color: #c8dde8; }
.dialog-actions { padding: 0.75rem 1rem; gap: 0.5rem; }
</style>
