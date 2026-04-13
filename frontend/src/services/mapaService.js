// =============================================================
// SRC/SERVICES/MAPASERVICE.JS — Servicio Axios de Geocodificación
//
// Consulta la API pública Nominatim de OpenStreetMap para obtener
// las coordenadas geográficas de la Universidad Nueva Esparta.
// Misma arquitectura de servicio que testimoniosService.js:
// función pura exportada que retorna la data cruda.
// =============================================================

import axios from 'axios';

/**
 * Consulta Nominatim (OSM) para obtener las coordenadas de la UNE.
 * Retorna un objeto con `lat` y `lon` como strings (formato Nominatim).
 *
 * Nominatim requiere el header User-Agent para requests desde aplicaciones.
 * Ref: https://nominatim.org/release-docs/develop/api/Search/
 *
 * @returns {Promise<{lat: string, lon: string, display_name: string}>}
 */
export const obtenerUbicacionUNE_sm_vc = async () => {
  const response = await axios.get(
    'https://nominatim.openstreetmap.org/search',
    {
      params: {
        q: 'Universidad Nueva Esparta, Caracas, Venezuela',
        format: 'json',
        limit: 1,
      }
    }
  );

  // Nominatim devuelve un arreglo; tomamos el primer resultado
  if (!response.data || response.data.length === 0) {
    throw new Error('Nominatim no encontró resultados para la Universidad Nueva Esparta.');
  }

  return response.data[0];
};
