// =============================================================
// SRC/STORES/MAPASTORE.JS — Store Pinia del Mapa UNE
//
// Gestiona las coordenadas de la Universidad Nueva Esparta.
// Primero intenta obtenerlas en tiempo real desde Nominatim (OSM)
// vía mapaService.js. Si la red falla, usa las coordenadas
// verificadas de Google Maps como fallback (mismo patrón que
// testimoniosStore.js con datos locales de respaldo).
// =============================================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { obtenerUbicacionUNE_sm_vc as fetchUbicacion_sm_vc } from 'src/services/mapaService.js';

/**
 * Coordenadas de respaldo verificadas desde Google Maps:
 * https://maps.app.goo.gl/THbDajKPPvWEQsrz7
 * => Universidad Nueva Esparta, Los Naranjos, Caracas, Venezuela
 */
const COORDS_FALLBACK_sm_vc = {
  latitud_sm_vc:  10.4374895,
  longitud_sm_vc: -66.841982,
};

export const useMapaStore = defineStore('mapa', () => {
  const $q_sm_vc = useQuasar();

  /* ── State ── */
  const latitud_sm_vc   = ref(COORDS_FALLBACK_sm_vc.latitud_sm_vc);
  const longitud_sm_vc  = ref(COORDS_FALLBACK_sm_vc.longitud_sm_vc);
  const cargando_sm_vc  = ref(false);
  const error_sm_vc     = ref(null);

  /* ── Action principal ── */
  /**
   * Consulta Nominatim para obtener las coordenadas actualizadas de la UNE.
   * En caso de fallo, mantiene las coordenadas del fallback sin interrumpir
   * la experiencia del usuario.
   */
  const cargarUbicacion_sm_vc = async () => {
    cargando_sm_vc.value = true;
    error_sm_vc.value    = null;

    try {
      const resultado_sm_vc = await fetchUbicacion_sm_vc();

      // Nominatim devuelve lat/lon como strings; convertimos a número
      latitud_sm_vc.value  = parseFloat(resultado_sm_vc.lat);
      longitud_sm_vc.value = parseFloat(resultado_sm_vc.lon);
    } catch (err_sm_vc) {
      console.warn('[mapaStore] Nominatim falló, usando coordenadas de fallback:', err_sm_vc);
      error_sm_vc.value = err_sm_vc?.message ?? 'Error al obtener ubicación';

      // Restaurar fallback explícitamente (por si alguna asignación parcial ocurrió)
      latitud_sm_vc.value  = COORDS_FALLBACK_sm_vc.latitud_sm_vc;
      longitud_sm_vc.value = COORDS_FALLBACK_sm_vc.longitud_sm_vc;

      $q_sm_vc.notify({
        type:     'warning',
        message:  'Mapa cargado con ubicación estática',
        caption:  'No se pudo conectar con el servicio de geocodificación.',
        icon:     'wifi_off',
        position: 'top-right',
        timeout:  4000,
      });
    } finally {
      cargando_sm_vc.value = false;
    }
  };

  return {
    latitud_sm_vc,
    longitud_sm_vc,
    cargando_sm_vc,
    error_sm_vc,
    cargarUbicacion_sm_vc,
  };
});
