import { defineStore } from 'pinia';
import { api } from 'boot/axios';

export const useUsuariosStore = defineStore('usuarios', {
  state: () => ({
    usuarios_sm_vc: [],
    pagination_sm_vc: {
      page: 1,
      limit: 10,
      total: 0,
      total_pages_sm_vc: 0,
      has_next: false,
      has_prev: false,
    },
    loading_sm_vc: false,
    error_sm_vc: null,
  }),

  getters: {
    usuariosActivos: (state) => {
      return state.usuarios_sm_vc.filter(usuario => usuario.activo_sm_vc);
    },
    usuariosPorRol: (state) => (rol) => {
      return state.usuarios_sm_vc.filter(usuario => usuario.rol_sm_vc === rol);
    },
    totalUsuarios: (state) => state.pagination_sm_vc.total,
  },

  actions: {
    async fetchUsers_sm_vc(params = {}) {
      this.loading_sm_vc = true;
      this.error_sm_vc = null;

      try {
        const {
          page_sm_vc = this.pagination_sm_vc.page,
          limit_sm_vc = this.pagination_sm_vc.limit,
          search_sm_vc = '',
        } = params;

        const response = await api.get('/users', {
          params: {
            page_sm_vc,
            limit_sm_vc,
            search_sm_vc,
          },
        });

        this.usuarios_sm_vc = response.data.usuarios_sm_vc;
        this.pagination_sm_vc = response.data.pagination_sm_vc;
        
        return response.data;
      } catch (error) {
        this.error_sm_vc = error.response?.data?.message || 'Error al cargar usuarios';
        throw error;
      } finally {
        this.loading_sm_vc = false;
      }
    },

    async createUser_sm_vc(userData) {
      this.loading_sm_vc = true;
      this.error_sm_vc = null;

      try {
        const response = await api.post('/users', userData);
        
        // Recargar la primera página para mostrar el nuevo usuario
        await this.fetchUsers_sm_vc({ page_sm_vc: 1 });
        
        return response.data;
      } catch (error) {
        this.error_sm_vc = error.response?.data?.message || 'Error al crear usuario';
        throw error;
      } finally {
        this.loading_sm_vc = false;
      }
    },

    async updateUser_sm_vc(id, userData) {
      this.loading_sm_vc = true;
      this.error_sm_vc = null;

      try {
        const response = await api.patch(`/users/${id}`, userData);
        
        // Actualizar el usuario en el estado local
        const index = this.usuarios_sm_vc.findIndex(user => user.id_sm_vc === parseInt(id));
        if (index !== -1) {
          this.usuarios_sm_vc[index] = { ...this.usuarios_sm_vc[index], ...response.data };
        }
        
        return response.data;
      } catch (error) {
        this.error_sm_vc = error.response?.data?.message || 'Error al actualizar usuario';
        throw error;
      } finally {
        this.loading_sm_vc = false;
      }
    },

    async deleteUser_sm_vc(id) {
      this.loading_sm_vc = true;
      this.error_sm_vc = null;

      try {
        await api.delete(`/users/${id}`);
        
        // Eliminar el usuario del estado local
        this.usuarios_sm_vc = this.usuarios_sm_vc.filter(user => user.id_sm_vc !== parseInt(id));
        
        // Actualizar paginación
        this.pagination_sm_vc.total -= 1;
        
        return true;
      } catch (error) {
        this.error_sm_vc = error.response?.data?.message || 'Error al eliminar usuario';
        throw error;
      } finally {
        this.loading_sm_vc = false;
      }
    },

    async toggleBanUser_sm_vc(id) {
      this.loading_sm_vc = true;
      this.error_sm_vc = null;

      try {
        const response = await api.patch(`/users/${id}/ban`);
        
        // Actualizar el usuario en el estado local
        const index = this.usuarios_sm_vc.findIndex(user => user.id_sm_vc === parseInt(id));
        if (index !== -1) {
          this.usuarios_sm_vc[index] = { ...this.usuarios_sm_vc[index], ...response.data };
        }
        
        return response.data;
      } catch (error) {
        this.error_sm_vc = error.response?.data?.message || 'Error al cambiar estado del usuario';
        throw error;
      } finally {
        this.loading_sm_vc = false;
      }
    },

    // Limpiar errores
    clearError() {
      this.error_sm_vc = null;
    },

    // Resetear estado
    resetState() {
      this.usuarios_sm_vc = [];
      this.pagination_sm_vc = {
        page: 1,
        limit: 10,
        total: 0,
        total_pages_sm_vc: 0,
        has_next: false,
        has_prev: false,
      };
      this.loading_sm_vc = false;
      this.error_sm_vc = null;
    },
  },
});
