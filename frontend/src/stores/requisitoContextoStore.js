/**
 * SENTINNEL – Requisito Contexto Store
 * Store de Pinia para persistencia de contexto de requisitos en localStorage.
 *
 * Funcionalidad original de: src/composables/useRequisitoContexto.js
 * Adaptado a store para mantener consistencia arquitectónica.
 *
 * CONTRATO DE DISEÑO:
 * ─────────────────────────────────────────────────
 * • Clave: `requisito_seleccionado_materia_${materia_id_sm_vc}`
 * • Valor: id_sm_vc del requisito (primitivo string/number).
 * • Consumo único: getRequisitoSeleccionado_sm_vc auto-destruye el dato
 *   después de leerlo para evitar "contaminación" en sesiones futuras.
 * • Purga total: purgarContextoRequisitos_sm_vc() escanea el prefijo
 *   y elimina TODAS las claves asociadas. Se invoca en logout_sm_vc.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

const PREFIJO_CLAVE_sm_vc = "requisito_seleccionado_materia_";

const _buildKey_sm_vc = (materiaId_sm_vc) =>
  `${PREFIJO_CLAVE_sm_vc}${materiaId_sm_vc}`;

export const useRequisitoContextoStore = defineStore(
  "requisitoContexto",
  () => {
    // ═══════════════════════════════════════════════════════════════
    // STATE (reactivo)
    // ═══════════════════════════════════════════════════════════════
    const clavesActivas_sm_vc = ref([]);

    // ═══════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════
    const totalContextos_sm_vc = computed(
      () => clavesActivas_sm_vc.value.length,
    );

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Persiste el ID del requisito seleccionado para una materia concreta.
     * Llamar ANTES de navegar a la vista de conversación.
     *
     * @param {string|number} materiaId_sm_vc  — ID de la materia
     * @param {string|number} requisitoId_sm_vc — ID del requisito (id_sm_vc)
     */
    function setRequisitoSeleccionado_sm_vc(
      materiaId_sm_vc,
      requisitoId_sm_vc,
    ) {
      if (!materiaId_sm_vc || requisitoId_sm_vc == null) return;
      try {
        const clave = _buildKey_sm_vc(materiaId_sm_vc);
        localStorage.setItem(clave, String(requisitoId_sm_vc));
        // Trackear clave activa
        if (!clavesActivas_sm_vc.value.includes(clave)) {
          clavesActivas_sm_vc.value.push(clave);
        }
      } catch {
        console.warn(
          "[requisitoContextoStore] No se pudo persistir el requisito en localStorage.",
        );
      }
    }

    /**
     * Lee el ID del requisito persistido para una materia y lo consume
     * (lo borra del localStorage inmediatamente después de leerlo).
     *
     * @param {string|number} materiaId_sm_vc
     * @returns {string|null} El id_sm_vc del requisito, o null si no existe.
     */
    function getRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
      if (!materiaId_sm_vc) return null;
      try {
        const clave_sm_vc = _buildKey_sm_vc(materiaId_sm_vc);
        const valor_sm_vc = localStorage.getItem(clave_sm_vc);
        if (valor_sm_vc !== null) {
          // AUTO-DESTRUCCIÓN: consumo único.
          localStorage.removeItem(clave_sm_vc);
          // Remover de claves activas
          clavesActivas_sm_vc.value = clavesActivas_sm_vc.value.filter(
            (k) => k !== clave_sm_vc,
          );
        }
        return valor_sm_vc;
      } catch {
        return null;
      }
    }

    /**
     * Lee el ID del requisito SIN consumirlo (sin borrar).
     * Útil para verificar si hay un requisito pendiente.
     *
     * @param {string|number} materiaId_sm_vc
     * @returns {string|null}
     */
    function peekRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
      if (!materiaId_sm_vc) return null;
      try {
        return localStorage.getItem(_buildKey_sm_vc(materiaId_sm_vc));
      } catch {
        return null;
      }
    }

    /**
     * Borra explícitamente el contexto de una materia sin leerlo.
     *
     * @param {string|number} materiaId_sm_vc
     */
    function clearRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
      if (!materiaId_sm_vc) return;
      try {
        const clave = _buildKey_sm_vc(materiaId_sm_vc);
        localStorage.removeItem(clave);
        clavesActivas_sm_vc.value = clavesActivas_sm_vc.value.filter(
          (k) => k !== clave,
        );
      } catch {
        // No-op silencioso
      }
    }

    /**
     * Purga TODAS las claves de contexto de requisito del localStorage,
     * independientemente de la materia. Se invoca en logout_sm_vc del
     * authStore para garantizar sesión completamente limpia.
     */
    function purgarContextoRequisitos_sm_vc() {
      try {
        const clavesABorrar_sm_vc = Object.keys(localStorage).filter(
          (k_sm_vc) => k_sm_vc.startsWith(PREFIJO_CLAVE_sm_vc),
        );
        clavesABorrar_sm_vc.forEach((k_sm_vc) =>
          localStorage.removeItem(k_sm_vc),
        );

        // Limpiar estado reactivo
        clavesActivas_sm_vc.value = [];

        if (clavesABorrar_sm_vc.length > 0) {
          console.info(
            `[requisitoContextoStore] Purgadas ${clavesABorrar_sm_vc.length} clave(s) de contexto.`,
          );
        }
      } catch {
        // No-op silencioso
      }
    }

    /**
     * Sincroniza el estado reactivo con localStorage real.
     * Útil al inicializar la store.
     */
    function sincronizarClavesActivas_sm_vc() {
      try {
        clavesActivas_sm_vc.value = Object.keys(localStorage).filter((k) =>
          k.startsWith(PREFIJO_CLAVE_sm_vc),
        );
      } catch {
        clavesActivas_sm_vc.value = [];
      }
    }

    // Inicializar al crear la store
    sincronizarClavesActivas_sm_vc();

    return {
      // State
      clavesActivas_sm_vc,
      // Getters
      totalContextos_sm_vc,
      // Actions
      setRequisitoSeleccionado_sm_vc,
      getRequisitoSeleccionado_sm_vc,
      peekRequisitoSeleccionado_sm_vc,
      clearRequisitoSeleccionado_sm_vc,
      purgarContextoRequisitos_sm_vc,
      sincronizarClavesActivas_sm_vc,
    };
  },
);

// ══════════════════════════════════════════════════════════════════
// EXPORTS DIRECTOS (compatibilidad con código existente)
// ══════════════════════════════════════════════════════════════════
// Mantenemos exports independientes para no romper imports existentes.
// En código nuevo, preferir: import { useRequisitoContextoStore } from 'stores/requisitoContextoStore'

export function setRequisitoSeleccionado_sm_vc(
  materiaId_sm_vc,
  requisitoId_sm_vc,
) {
  if (!materiaId_sm_vc || requisitoId_sm_vc == null) return;
  try {
    localStorage.setItem(
      `${PREFIJO_CLAVE_sm_vc}${materiaId_sm_vc}`,
      String(requisitoId_sm_vc),
    );
  } catch {
    console.warn(
      "[useRequisitoContexto] No se pudo persistir el requisito en localStorage.",
    );
  }
}

export function getRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
  if (!materiaId_sm_vc) return null;
  try {
    const clave_sm_vc = `${PREFIJO_CLAVE_sm_vc}${materiaId_sm_vc}`;
    const valor_sm_vc = localStorage.getItem(clave_sm_vc);
    if (valor_sm_vc !== null) {
      localStorage.removeItem(clave_sm_vc);
    }
    return valor_sm_vc;
  } catch {
    return null;
  }
}

export function clearRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
  if (!materiaId_sm_vc) return;
  try {
    localStorage.removeItem(`${PREFIJO_CLAVE_sm_vc}${materiaId_sm_vc}`);
  } catch {
    // No-op silencioso
  }
}

export function purgarContextoRequisitos_sm_vc() {
  try {
    const clavesABorrar_sm_vc = Object.keys(localStorage).filter((k_sm_vc) =>
      k_sm_vc.startsWith(PREFIJO_CLAVE_sm_vc),
    );
    clavesABorrar_sm_vc.forEach((k_sm_vc) =>
      localStorage.removeItem(k_sm_vc),
    );
    if (clavesABorrar_sm_vc.length > 0) {
      console.info(
        `[useRequisitoContexto] Purgadas ${clavesABorrar_sm_vc.length} clave(s) de contexto.`,
      );
    }
  } catch {
    // No-op silencioso
  }
}

/**
 * Composable legacy wrapper. Retorna todas las funciones de la API pública.
 * Mantenido para compatibilidad con código existente.
 */
export const useRequisitoContexto_sm_vc = () => ({
  setRequisitoSeleccionado_sm_vc,
  getRequisitoSeleccionado_sm_vc,
  clearRequisitoSeleccionado_sm_vc,
  purgarContextoRequisitos_sm_vc,
});
