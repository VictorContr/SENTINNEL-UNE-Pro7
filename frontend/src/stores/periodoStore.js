import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useQuasar } from "quasar";

/**
 * Store de Periodo Académico - Gestión del periodo académico global
 * Maneja el estado reactivo del periodo actual y las operaciones de administración
 */
export const usePeriodoStore = defineStore("periodo", () => {
  // Estado reactivo del periodo actual
  const periodoActual_vc = ref("P-165");
  const loading_vc = ref(false);
  const q = useQuasar();

  /**
   * Carga el periodo académico actual desde el backend
   * Actualiza el estado reactivo con el valor obtenido
   */
  const cargarPeriodoActual_vc = async () => {
    try {
      loading_vc.value = true;
      const response = await axios.get("/api/admin/configuracion/periodo");
      periodoActual_vc.value = response.data.periodo_actual_sm_vc;
    } catch (error) {
      console.error("Error al cargar periodo actual:", error);
      q.notify({
        type: "negative",
        message: "No se pudo cargar el periodo académico actual",
        position: "top",
      });
    } finally {
      loading_vc.value = false;
    }
  };

  /**
   * Actualiza el periodo académico actual
   * @param {string} nuevoPeriodo - Nuevo periodo a establecer (ej: "P-166")
   * @returns {Promise<boolean>} - true si la actualización fue exitosa
   */
  const actualizarPeriodo_vc = async (nuevoPeriodo) => {
    try {
      loading_vc.value = true;

      // Validación básica del formato
      if (!nuevoPeriodo || nuevoPeriodo.length < 4) {
        q.notify({
          type: "negative",
          message: "El periodo debe tener al menos 4 caracteres",
          position: "top",
        });
        return false;
      }

      const response = await axios.put("/api/admin/configuracion/periodo", {
        periodo_actual_sm_vc: nuevoPeriodo,
      });

      // Actualiza el estado local con la respuesta del servidor
      periodoActual_vc.value = response.data.periodo_actual_sm_vc;

      q.notify({
        type: "positive",
        message: `Periodo académico actualizado a: ${response.data.periodo_actual_sm_vc}`,
        position: "top",
      });
      return true;
    } catch (error) {
      console.error("Error al actualizar periodo:", error);

      // Manejo de errores específicos
      if (error.response?.status === 400) {
        q.notify({
          type: "negative",
          message: error.response.data.message || "Datos inválidos",
          position: "top",
        });
      } else if (error.response?.status === 403) {
        q.notify({
          type: "negative",
          message: "No tienes permisos para realizar esta acción",
          position: "top",
        });
      } else {
        q.notify({
          type: "negative",
          message: "Error al actualizar el periodo académico",
          position: "top",
        });
      }
      return false;
    } finally {
      loading_vc.value = false;
    }
  };

  /**
   * Formatea el periodo para visualización (ej: "P-165" → "Periodo 165")
   * @returns {string} - Periodo formateado para mostrar
   */
  const periodoFormateado_vc = () => {
    return periodoActual_vc.value.replace("P-", "Periodo ");
  };

  return {
    // Estado
    periodoActual_vc,
    loading_vc,

    // Acciones
    cargarPeriodoActual_vc,
    actualizarPeriodo_vc,

    // Getters computados
    periodoFormateado_vc,
  };
});
