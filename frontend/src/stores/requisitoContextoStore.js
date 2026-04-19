/**
 * SENTINNEL – Requisito Contexto Store
 * Store de Pinia para persistencia de contexto de requisitos en localStorage
 * Y AHORA: Motor Reactivo para filtrar requisitos en tiempo real.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { usePasantiasStore } from "./pasantiasStore"; // ✅ FIX: Conectado a la vena de pasantías

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
    // GETTERS REACTIVOS (NUEVO MOTOR EN TIEMPO REAL)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Calcula en tiempo real qué requisitos puede subir el estudiante.
     * Excluye los APROBADOS y ENTREGADOS (esperando revisión).
     */
    const getRequisitosDisponiblesEstudiante = computed(() => {
      return (estudianteId, materiaId) => {
        const pasantiasStore = usePasantiasStore();
        const progreso = pasantiasStore.getProgresoEstudiante(estudianteId);
        const materiaActiva = progreso.find(m => String(m.id_sm_vc) === String(materiaId));

        if (!materiaActiva || !materiaActiva.requisitos) return [];

        const entregas = materiaActiva.progreso?.entregas_detalle_sm_vc || [];
        return materiaActiva.requisitos.filter(req => {
          const entrega = entregas.find(e => String(e.requisito_id_sm_vc) === String(req.id_sm_vc));
          if (!entrega) return true; // Nunca entregado -> Disponible
          if (entrega.estado_sm_vc === 'REPROBADO') return true; // Reprobado -> Debe reenviar
          return false; // Aprobado o en revisión -> Bloqueado
        });
      };
    });

    /**
     * Calcula en tiempo real si un requisito específico ya está aprobado.
     * Útil para bloquear checkboxes del profesor.
     */
    const esRequisitoAprobado = computed(() => {
      return (estudianteId, materiaId, requisitoId) => {
        const pasantiasStore = usePasantiasStore();
        const progreso = pasantiasStore.getProgresoEstudiante(estudianteId);
        const materiaActiva = progreso.find(m => String(m.id_sm_vc) === String(materiaId));
        if (!materiaActiva) return false;

        const aprobados = materiaActiva.progreso?.requisitos_aprobados_detalle_sm_vc || [];
        return aprobados.some(a => String(a.requisito_id_sm_vc) === String(requisitoId));
      };
    });

    const totalContextos_sm_vc = computed(
      () => clavesActivas_sm_vc.value.length,
    );

    // ═══════════════════════════════════════════════════════════════
    // ACTIONS (LocalStorage Persistencia)
    // ═══════════════════════════════════════════════════════════════
    function setRequisitoSeleccionado_sm_vc(materiaId_sm_vc, requisitoId_sm_vc) {
      if (!materiaId_sm_vc || requisitoId_sm_vc == null) return;
      try {
        const clave = _buildKey_sm_vc(materiaId_sm_vc);
        localStorage.setItem(clave, String(requisitoId_sm_vc));
        if (!clavesActivas_sm_vc.value.includes(clave)) {
          clavesActivas_sm_vc.value.push(clave);
        }
      } catch {
        console.warn("[requisitoContextoStore] No se pudo persistir.");
      }
    }

    function getRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
      if (!materiaId_sm_vc) return null;
      try {
        const clave_sm_vc = _buildKey_sm_vc(materiaId_sm_vc);
        const valor_sm_vc = localStorage.getItem(clave_sm_vc);
        if (valor_sm_vc !== null) {
          localStorage.removeItem(clave_sm_vc);
          clavesActivas_sm_vc.value = clavesActivas_sm_vc.value.filter((k) => k !== clave_sm_vc);
        }
        return valor_sm_vc;
      } catch {
        return null;
      }
    }

    function peekRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
      if (!materiaId_sm_vc) return null;
      try {
        return localStorage.getItem(_buildKey_sm_vc(materiaId_sm_vc));
      } catch {
        return null;
      }
    }

    function clearRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
      if (!materiaId_sm_vc) return;
      try {
        const clave = _buildKey_sm_vc(materiaId_sm_vc);
        localStorage.removeItem(clave);
        clavesActivas_sm_vc.value = clavesActivas_sm_vc.value.filter((k) => k !== clave);
      } catch {
        // ignora
      }
    }

    function purgarContextoRequisitos_sm_vc() {
      try {
        const clavesABorrar_sm_vc = Object.keys(localStorage).filter((k_sm_vc) =>
          k_sm_vc.startsWith(PREFIJO_CLAVE_sm_vc),
        );
        clavesABorrar_sm_vc.forEach((k_sm_vc) => localStorage.removeItem(k_sm_vc));
        clavesActivas_sm_vc.value = [];
      } catch {
        // ignora
      }
    }

    function sincronizarClavesActivas_sm_vc() {
      try {
        clavesActivas_sm_vc.value = Object.keys(localStorage).filter((k) =>
          k.startsWith(PREFIJO_CLAVE_sm_vc),
        );
      } catch {
        clavesActivas_sm_vc.value = [];
      }
    }

    sincronizarClavesActivas_sm_vc();

    return {
      clavesActivas_sm_vc,
      totalContextos_sm_vc,
      getRequisitosDisponiblesEstudiante,
      esRequisitoAprobado,
      setRequisitoSeleccionado_sm_vc,
      getRequisitoSeleccionado_sm_vc,
      peekRequisitoSeleccionado_sm_vc,
      clearRequisitoSeleccionado_sm_vc,
      purgarContextoRequisitos_sm_vc,
      sincronizarClavesActivas_sm_vc,
    };
  },
);

export function setRequisitoSeleccionado_sm_vc(materiaId_sm_vc, requisitoId_sm_vc) {
  if (!materiaId_sm_vc || requisitoId_sm_vc == null) return;
  try {
    localStorage.setItem(`${PREFIJO_CLAVE_sm_vc}${materiaId_sm_vc}`, String(requisitoId_sm_vc));
  } catch {
    // ignora
  }
}

export function getRequisitoSeleccionado_sm_vc(materiaId_sm_vc) {
  if (!materiaId_sm_vc) return null;
  try {
    const clave_sm_vc = `${PREFIJO_CLAVE_sm_vc}${materiaId_sm_vc}`;
    const valor_sm_vc = localStorage.getItem(clave_sm_vc);
    if (valor_sm_vc !== null) localStorage.removeItem(clave_sm_vc);
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
    // ignora
  }
}

export function purgarContextoRequisitos_sm_vc() {
  try {
    const clavesABorrar_sm_vc = Object.keys(localStorage).filter((k_sm_vc) =>
      k_sm_vc.startsWith(PREFIJO_CLAVE_sm_vc),
    );
    clavesABorrar_sm_vc.forEach((k_sm_vc) => localStorage.removeItem(k_sm_vc));
  } catch {
    // ignora
  }
}

export const useRequisitoContexto_sm_vc = () => ({
  setRequisitoSeleccionado_sm_vc,
  getRequisitoSeleccionado_sm_vc,
  clearRequisitoSeleccionado_sm_vc,
  purgarContextoRequisitos_sm_vc,
});
