<template>
  <div class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <h4 class="q-ma-none">Gestión de Usuarios</h4>
        <p class="text-grey-6 q-ma-none">Administra todos los usuarios del sistema</p>
      </div>
      <div class="col-12 col-md-6 text-right">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo Usuario"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Buscador -->
    <div class="row q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="searchTerm"
          placeholder="Buscar por cédula, nombre o correo..."
          outlined
          dense
          clearable
          @clear="onSearchClear"
          @keyup.enter="onSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              icon="search"
              @click="onSearch"
              :loading="usuariosStore.loading_sm_vc"
            />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Tabla de Usuarios -->
    <q-table
      :rows="usuariosStore.usuarios_sm_vc"
      :columns="columns"
      row-key="id_sm_vc"
      :loading="usuariosStore.loading_sm_vc"
      :pagination="tablePagination"
      @request="onTableRequest"
      flat
      bordered
      class="users-table"
    >
      <!-- Columna de estado -->
      <template v-slot:body-cell-activo_sm_vc="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.activo_sm_vc ? 'positive' : 'negative'"
            :label="props.row.activo_sm_vc ? 'Activo' : 'Inactivo'"
          />
        </q-td>
      </template>

      <!-- Columna de rol -->
      <template v-slot:body-cell-rol_sm_vc="props">
        <q-td :props="props">
          <q-badge
            :color="getRoleColor(props.row.rol_sm_vc)"
            :label="props.row.rol_sm_vc"
          />
        </q-td>
      </template>

      <!-- Columna de acciones -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              dense
              color="primary"
              icon="edit"
              @click="editUser(props.row)"
              title="Editar"
            />
            <q-btn
              flat
              dense
              :color="props.row.activo_sm_vc ? 'negative' : 'positive'"
              :icon="props.row.activo_sm_vc ? 'block' : 'check_circle'"
              @click="toggleBanUser(props.row)"
              :title="props.row.activo_sm_vc ? 'Desactivar' : 'Activar'"
            />
            <q-btn
              flat
              dense
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row)"
              title="Eliminar"
            />
          </div>
        </q-td>
      </template>

      <!-- No data -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-6 q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>No se encontraron usuarios</span>
        </div>
      </template>
    </q-table>

    <!-- Diálogo de Creación/Edición -->
    <UserDialog
      v-model="showCreateDialog"
      :user="selectedUser"
      @save="onUserSave"
      @cancel="onUserCancel"
    />

    <!-- Diálogo de Confirmación de Eliminación -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar
            icon="delete"
            color="negative"
            text-color="white"
            size="md"
            class="q-mr-md"
          />
          <div>
            <div class="text-h6">Confirmar Eliminación</div>
            <div class="text-grey-6">
              ¿Estás seguro de eliminar al usuario "{{ userToDelete?.nombre_sm_vc }}"?
              Esta acción desactivará la cuenta permanentemente.
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            flat
            label="Eliminar"
            color="negative"
            @click="deleteUser"
            :loading="usuariosStore.loading_sm_vc"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useUsuariosStore } from 'src/stores/usuariosStore';
import { useQuasar } from 'quasar';
import UserDialog from 'src/components/admin/UserDialog.vue';

export default defineComponent({
  name: 'UsersManagement',
  components: {
    UserDialog,
  },
  setup() {
    const usuariosStore = useUsuariosStore();
    const $q = useQuasar();

    // Estado local
    const searchTerm = ref('');
    const showCreateDialog = ref(false);
    const showDeleteDialog = ref(false);
    const selectedUser = ref(null);
    const userToDelete = ref(null);

    // Columnas de la tabla
    const columns = [
      {
        name: 'id_sm_vc',
        required: true,
        label: 'ID',
        align: 'left',
        field: 'id_sm_vc',
        sortable: false,
      },
      {
        name: 'nombre_sm_vc',
        required: true,
        label: 'Nombre',
        align: 'left',
        field: 'nombre_sm_vc',
        sortable: false,
      },
      {
        name: 'cedula_sm_vc',
        required: true,
        label: 'Cédula',
        align: 'left',
        field: 'cedula_sm_vc',
        sortable: false,
      },
      {
        name: 'correo_sm_vc',
        required: true,
        label: 'Correo',
        align: 'left',
        field: 'correo_sm_vc',
        sortable: false,
      },
      {
        name: 'rol_sm_vc',
        required: true,
        label: 'Rol',
        align: 'center',
        field: 'rol_sm_vc',
        sortable: false,
      },
      {
        name: 'activo_sm_vc',
        required: true,
        label: 'Estado',
        align: 'center',
        field: 'activo_sm_vc',
        sortable: false,
      },
      {
        name: 'fecha_creacion_sm_vc',
        required: true,
        label: 'Fecha Creación',
        align: 'center',
        field: 'fecha_creacion_sm_vc',
        sortable: false,
        format: (val) => new Date(val).toLocaleDateString(),
      },
      {
        name: 'actions',
        required: true,
        label: 'Acciones',
        align: 'center',
        field: 'actions',
        sortable: false,
      },
    ];

    // Paginación para q-table
    const tablePagination = computed(() => ({
      page: usuariosStore.pagination_sm_vc.page,
      rowsPerPage: usuariosStore.pagination_sm_vc.limit,
      rowsNumber: usuariosStore.pagination_sm_vc.total,
    }));

    // Métodos
    const loadUsers = async (props = {}) => {
      try {
        await usuariosStore.fetchUsers_sm_vc({
          page_sm_vc: props.pagination?.page || usuariosStore.pagination_sm_vc.page,
          limit_sm_vc: props.pagination?.rowsPerPage || usuariosStore.pagination_sm_vc.limit,
          search_sm_vc: searchTerm.value,
        });
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: usuariosStore.error_sm_vc || 'Error al cargar usuarios',
        });
      }
    };

    const onTableRequest = async (props) => {
      await loadUsers(props);
    };

    const onSearch = async () => {
      await loadUsers({ pagination: { page: 1 } });
    };

    const onSearchClear = async () => {
      searchTerm.value = '';
      await loadUsers({ pagination: { page: 1 } });
    };

    const editUser = (user) => {
      selectedUser.value = { ...user };
      showCreateDialog.value = true;
    };

    const toggleBanUser = async (user) => {
      try {
        await usuariosStore.toggleBanUser_sm_vc(user.id_sm_vc);
        $q.notify({
          type: 'positive',
          message: `Usuario ${user.activo_sm_vc ? 'desactivado' : 'activado'} correctamente`,
        });
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: usuariosStore.error_sm_vc || 'Error al cambiar estado del usuario',
        });
      }
    };

    const confirmDelete = (user) => {
      userToDelete.value = user;
      showDeleteDialog.value = true;
    };

    const deleteUser = async () => {
      try {
        await usuariosStore.deleteUser_sm_vc(userToDelete.value.id_sm_vc);
        showDeleteDialog.value = false;
        userToDelete.value = null;
        $q.notify({
          type: 'positive',
          message: 'Usuario eliminado correctamente',
        });
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: usuariosStore.error_sm_vc || 'Error al eliminar usuario',
        });
      }
    };

    const onUserSave = async () => {
      showCreateDialog.value = false;
      selectedUser.value = null;
      await loadUsers();
      $q.notify({
        type: 'positive',
        message: 'Usuario guardado correctamente',
      });
    };

    const onUserCancel = () => {
      showCreateDialog.value = false;
      selectedUser.value = null;
    };

    const getRoleColor = (role) => {
      const colors = {
        ADMIN: 'red',
        PROFESOR: 'blue',
        ESTUDIANTE: 'green',
      };
      return colors[role] || 'grey';
    };

    // Lifecycle
    onMounted(() => {
      loadUsers();
    });

    return {
      usuariosStore,
      searchTerm,
      showCreateDialog,
      showDeleteDialog,
      selectedUser,
      userToDelete,
      columns,
      tablePagination,
      onTableRequest,
      onSearch,
      onSearchClear,
      editUser,
      toggleBanUser,
      confirmDelete,
      deleteUser,
      onUserSave,
      onUserCancel,
      getRoleColor,
    };
  },
});
</script>

<style lang="scss" scoped>
.users-table {
  border-radius: 8px;
}

.q-table th {
  font-weight: 600;
  background-color: #f5f5f5;
}

.q-badge {
  font-weight: 500;
}
</style>
