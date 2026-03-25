// =============================================================
// SRC/STORES/TESTIMONIOSSTORE.JS — Store Pinia de Testimonios
//
// Gestiona el ciclo de vida de los testimonios de la Landing Page.
// Llama al servicio Axios, aplica el mapeo académico y provee
// fallback local si la red falla, garantizando que la vista
// nunca quede en estado de error visible.
// =============================================================

import { defineStore } from "pinia";
import { ref } from "vue";
import { useQuasar } from "quasar";
import { obtenerTestimonios_sm_vc as fetchTestimonios_sm_vc } from "src/services/testimoniosService.js";

/** Datos locales de respaldo para cuando la API falla */
const TESTIMONIOS_FALLBACK_sm_vc = [
  {
    id_sm_vc: 1,
    pseudonimo_sm_vc: "delectus aut autem",
    rol_sm_vc: "Pasante · Ingeniería en Computación",
    cuerpo_sm_vc:
      "SENTINNEL transformó mi proceso. Antes enviaba PDFs por correo y nunca sabía si el profesor los había visto. Ahora todo queda registrado.",
    aprobado_sm_vc: true,
    cohorte_sm_vc: "P-165",
  },
  {
    id_sm_vc: 2,
    pseudonimo_sm_vc: "quis ut nam facilis",
    rol_sm_vc: "Prof. Tutor · Departamento de Sistemas",
    cuerpo_sm_vc:
      "El historial inmutable de versiones me permite dar retroalimentación precisa. Cada corrección queda vinculada al informe correspondiente.",
    aprobado_sm_vc: true,
    cohorte_sm_vc: "P-164",
  },
  {
    id_sm_vc: 3,
    pseudonimo_sm_vc: "fugiat veniam minus",
    rol_sm_vc: "Pasante · Mención Redes",
    cuerpo_sm_vc:
      "El stepper visual me indicó exactamente qué capítulo faltaba. Aprobé Pasantías III sin un solo correo de ida y vuelta.",
    aprobado_sm_vc: true,
    cohorte_sm_vc: "P-165",
  },
  {
    id_sm_vc: 4,
    pseudonimo_sm_vc: "et porro tempora",
    rol_sm_vc: "Coordinadora · UNE Computación",
    cuerpo_sm_vc:
      "El módulo de carga masiva me permite registrar una cohorte entera en minutos. La auditoría con soft-delete es invaluable para reportes.",
    aprobado_sm_vc: false,
    cohorte_sm_vc: "P-163",
  },
  {
    id_sm_vc: 5,
    pseudonimo_sm_vc: "laboriosam mollitia",
    rol_sm_vc: "Pasante · Mención Electrónica",
    cuerpo_sm_vc:
      "El módulo de Deploy me permitió registrar mi URL de producción junto con el código. El proceso completo de pasantía en una sola plataforma.",
    aprobado_sm_vc: true,
    cohorte_sm_vc: "P-165",
  },
  {
    id_sm_vc: 6,
    pseudonimo_sm_vc: "qui ullam ratione",
    rol_sm_vc: "Prof. Asesor · Trabajo de Grado",
    cuerpo_sm_vc:
      "La evaluación granular de requisitos por capítulo me da un control sin precedentes. Puedo aprobar parcialmente y dar feedback específico.",
    aprobado_sm_vc: true,
    cohorte_sm_vc: "P-164",
  },
];

/** Mapea la respuesta cruda de JSONPlaceholder a objeto de testimonio */
const mapearTestimonio_sm_vc = (item_sm_vc, index_sm_vc) => ({
  id_sm_vc: item_sm_vc.id,
  pseudonimo_sm_vc: item_sm_vc.title,
  rol_sm_vc:
    TESTIMONIOS_FALLBACK_sm_vc[index_sm_vc]?.rol_sm_vc ?? "Pasante · UNE",
  cuerpo_sm_vc:
    TESTIMONIOS_FALLBACK_sm_vc[index_sm_vc]?.cuerpo_sm_vc ?? item_sm_vc.title,
  aprobado_sm_vc: item_sm_vc.completed,
  cohorte_sm_vc:
    TESTIMONIOS_FALLBACK_sm_vc[index_sm_vc]?.cohorte_sm_vc ?? "P-165",
});

export const useTestimoniosStore = defineStore("testimonios", () => {
  const $q_sm_vc = useQuasar();

  /* ── State ── */
  const testimonios_sm_vc = ref([]);
  const cargando_sm_vc = ref(false);
  const error_sm_vc = ref(null);

  /* ── Action principal ── */
  const cargarTestimonios_sm_vc = async () => {
    cargando_sm_vc.value = true;
    error_sm_vc.value = null;

    try {
      const datos_sm_vc = await fetchTestimonios_sm_vc(6);
      testimonios_sm_vc.value = datos_sm_vc.map(mapearTestimonio_sm_vc);
    } catch (err_sm_vc) {
      console.error(
        "[testimoniosStore] Error al cargar testimonios:",
        err_sm_vc,
      );
      error_sm_vc.value = err_sm_vc?.message ?? "Error desconocido";

      // Fallback: usar datos locales para no romper la UI
      testimonios_sm_vc.value = [...TESTIMONIOS_FALLBACK_sm_vc];

      $q_sm_vc.notify({
        type: "warning",
        message: "Testimonios cargados localmente",
        caption: "No se pudo conectar con el servidor de reseñas.",
        icon: "wifi_off",
        position: "top-right",
        timeout: 4000,
      });
    } finally {
      cargando_sm_vc.value = false;
    }
  };

  return {
    testimonios_sm_vc,
    cargando_sm_vc,
    error_sm_vc,
    cargarTestimonios_sm_vc,
  };
});
