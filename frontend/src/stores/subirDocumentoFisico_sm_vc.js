// ══════════════════════════════════════════════════════════════════
// conversacionStore.js — Store de Conversaciones y Trazabilidad
// Consume el endpoint /conversaciones/:estudianteId
// con soporte de filtro por materia: ?materiaId=X
//
// SPRINT 3 — Patrón 2 Pasos:
//   subirDocumentoFisico_sm_vc → POST /api/documentos → devuelve id_sm_vc
//   El ID se incluye en el payload del mensaje WS para que el receptor
//   pueda descargar el archivo sin necesidad de polling.
//
// Contrato del backend:
//   { id_sm_vc, estudiante_id_sm_vc, materia_id_sm_vc, mensajes_sm_vc: [...] }
// ══════════════════════════════════════════════════════════════════

import { defineStore } from "pinia";
import { ref } from "vue";
import { Notify } from "quasar";
import { api as api_vc } from "src/boot/axios";
import { getConversacionesByEstudianteId_sm_vc } from "src/services/conversacionesService";

export const useConversacionStore_sm_vc = defineStore("conversacion", () => {
  /* ── State ── */
  const conversaciones_sm_vc = ref([]);
  const cargando_sm_vc = ref(false);
  const error_sm_vc = ref(null);
  const materiaActiva_sm_vc = ref(null);

  /** true exclusivamente durante la subida física del archivo (Fase A). */
  const subiendo_sm_vc = ref(false);

  /* ── Actions ── */

  /**
   * Obtiene el historial de trazabilidad de un estudiante.
   *
   * @param {number|string} estudianteId_sm_vc
   * @param {number|null}   materiaId_sm_vc
   * @returns {Promise<Array|null>}
   */
  const obtenerConversacion_sm_vc = async (
    estudianteId_sm_vc,
    materiaId_sm_vc = null,
  ) => {
    if (!estudianteId_sm_vc) return null;

    cargando_sm_vc.value = true;
    error_sm_vc.value = null;
    materiaActiva_sm_vc.value = materiaId_sm_vc;

    try {
      const data = await getConversacionesByEstudianteId_sm_vc(
        estudianteId_sm_vc,
        materiaId_sm_vc,
      );

      conversaciones_sm_vc.value = data.mensajes_sm_vc || [];
      return conversaciones_sm_vc.value;
    } catch (err_sm_vc) {
      const mensaje_sm_vc =
        err_sm_vc.response?.data?.message ||
        err_sm_vc?.message ||
        "Error al cargar la trazabilidad.";

      error_sm_vc.value = mensaje_sm_vc;

      Notify.create({
        type: "negative",
        message: mensaje_sm_vc,
        icon: "error",
        position: "top-right",
        timeout: 4000,
      });

      return null;
    } finally {
      cargando_sm_vc.value = false;
    }
  };

  /**
   * PASO 2 DEL PATRÓN ASÍNCRONO DE 2 PASOS.
   *
   * Sube el archivo físico al servidor vía POST /api/documentos y
   * devuelve el objeto Documento creado (con su id_sm_vc).
   *
   * Este método no envía ningún mensaje de chat; solo persiste el
   * archivo y retorna el ID para que el llamador lo incluya en el
   * payload del evento WebSocket (Fase B).
   *
   * @param {File}          archivo_sm_vc          — Archivo a subir
   * @param {number|string} estudianteId_sm_vc     — ID del estudiante propietario
   * @param {number|null}   requisitoId_sm_vc      — ID del requisito (Caso B del backend)
   * @param {string}        tipo_sm_vc             — TipoDocumento enum (default ENTREGABLE_ESTUDIANTE)
   * @returns {Promise<{ id_sm_vc: number, nombre_archivo_sm_vc: string, ... }>}
   * @throws {Error} Si el servidor rechaza el archivo
   */
  const subirDocumentoFisico_sm_vc = async (
    archivo_sm_vc,
    estudianteId_sm_vc,
    requisitoId_sm_vc = null,
    tipo_sm_vc = "ENTREGABLE_ESTUDIANTE",
  ) => {
    subiendo_sm_vc.value = true;

    try {
      const formData_sm_vc = new FormData();
      formData_sm_vc.append("archivo_sm_vc", archivo_sm_vc);
      formData_sm_vc.append("tipo_sm_vc", tipo_sm_vc);

      // Incluir contexto para que el backend haga el UPSERT de Entrega (Caso B)
      if (estudianteId_sm_vc) {
        formData_sm_vc.append(
          "estudiante_id_sm_vc",
          String(estudianteId_sm_vc),
        );
      }
      if (requisitoId_sm_vc) {
        formData_sm_vc.append("requisito_id_sm_vc", String(requisitoId_sm_vc));
      }

      const respuesta_sm_vc = await api_vc.post("/documentos", formData_sm_vc, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return respuesta_sm_vc.data; // { id_sm_vc, nombre_archivo_sm_vc, tamanio_bytes_sm_vc, ... }
    } finally {
      subiendo_sm_vc.value = false;
    }
  };

  /**
   * Resetea el estado de conversaciones al navegar entre perfiles.
   */
  const limpiarConversaciones_sm_vc = () => {
    conversaciones_sm_vc.value = [];
    error_sm_vc.value = null;
    materiaActiva_sm_vc.value = null;
  };

  return {
    /* State */
    conversaciones_sm_vc,
    cargando_sm_vc,
    subiendo_sm_vc,
    error_sm_vc,
    materiaActiva_sm_vc,

    /* Actions */
    obtenerConversacion_sm_vc,
    subirDocumentoFisico_sm_vc,
    limpiarConversaciones_sm_vc,
  };
});
