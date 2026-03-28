/**
 * Metadatos visuales compartidos para el stepper de trazabilidad (4 materias).
 * DRY: una sola fuente para layout admin, estudiante y profesor.
 */
export const FASES_META_sm_vc = {
  'MAT-001': {
    icono_sm_vc: 'science',
    captionFase_sm_vc: 'Contexto · Objetivos · Justificación · Delimitación',
  },
  'MAT-002': {
    icono_sm_vc: 'school',
    captionFase_sm_vc: 'Refinamiento · Técnica · Desarrollo Temprano (Obj 1-3)',
  },
  'MAT-003': {
    icono_sm_vc: 'engineering',
    captionFase_sm_vc: 'Desarrollo Avanzado · Cierre Técnico (Obj 4-5) · Fase Opcional',
  },
  'MAT-004': {
    icono_sm_vc: 'workspace_premium',
    captionFase_sm_vc: 'Doc. Final · Aprobación · Defensa · Solvencias',
  },
}

/** @param {Array<Object>} listaProgreso — filas de getProgresoEstudiante */
export function enriquecerMateriasTrazabilidad_sm_vc(listaProgreso) {
  return listaProgreso.map((materia_sm_vc) => ({
    ...materia_sm_vc,
    icono_sm_vc:
      FASES_META_sm_vc[materia_sm_vc.id_sm_vc]?.icono_sm_vc ?? 'book',
    captionFase_sm_vc:
      FASES_META_sm_vc[materia_sm_vc.id_sm_vc]?.captionFase_sm_vc ?? '',
  }))
}
