// ══════════════════════════════════════════════════════════════════
// documentosService.js — Servicio de gestión de documentos.
//
// Responsabilidades:
//   1. subirDocumento_sm_vc   → POST multipart a /api/documentos
//   2. descargarDocumento_sm_vc → GET con responseType: 'blob' +
//      descarga forzada en el navegador via createObjectURL
//   3. visualizarDocumento_sm_vc → Abre el blob en una pestaña
//      nueva para previsualización sin descarga.
//
// DECISIÓN DE DISEÑO:
//   El Blob se libera con URL.revokeObjectURL() tras 60s para evitar
//   fugas de memoria en sesiones largas. No es un valor arbitrario:
//   60s garantiza que el navegador inicie la descarga antes de que
//   se revoque el Object URL.
// ══════════════════════════════════════════════════════════════════

import { api } from 'src/boot/axios'

// ─────────────────────────────────────────────────────────────────
// POST /api/documentos
// Sube un archivo al backend y retorna el objeto Documento creado.
//
// @param {FormData} formData_sm_vc — Debe incluir:
//     - archivo_sm_vc: File (el PDF)
//     - tipo_sm_vc: string (ej: 'ENTREGABLE_ESTUDIANTE')
//     - [Opcional] entrega_id_sm_vc: number  (Caso C)
//     - [Opcional] requisito_id_sm_vc: number (Caso B)
//     - [Opcional] estudiante_id_sm_vc: number (Caso B)
//
// @returns {Promise<{ id_sm_vc: number, nombre_archivo_sm_vc: string, ... }>}
// ─────────────────────────────────────────────────────────────────
export const subirDocumento_sm_vc = async (formData_sm_vc) => {
  const respuesta_sm_vc = await api.post('/documentos', formData_sm_vc, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return respuesta_sm_vc.data
}

// ─────────────────────────────────────────────────────────────────
// GET /api/documentos/:documentoId/descargar
// Descarga el archivo físico con respuesta tipo Blob y fuerza la
// descarga en el navegador usando createObjectURL.
//
// Extrae el nombre del archivo del header Content-Disposition con
// la regex: filename="<nombre>". Si el header no está presente,
// usa el nombre que le pasemos como fallback.
//
// @param {number} documentoId_sm_vc
// @param {string} [fallbackNombre_sm_vc] — Nombre de fallback
// ─────────────────────────────────────────────────────────────────
export const descargarDocumento_sm_vc = async (
  documentoId_sm_vc,
  fallbackNombre_sm_vc = 'documento_sentinnel.pdf',
) => {
  const respuesta_sm_vc = await api.get(
    `/documentos/${documentoId_sm_vc}/descargar`,
    { responseType: 'blob' },
  )

  // Extraer nombre real del archivo desde el header Content-Disposition
  const contentDisp_sm_vc = respuesta_sm_vc.headers['content-disposition'] ?? ''
  const nombreMatch_sm_vc  = contentDisp_sm_vc.match(/filename="?([^";\n]+)"?/)
  const nombre_sm_vc       = nombreMatch_sm_vc?.[1]?.trim() ?? fallbackNombre_sm_vc

  // Crear Object URL para el Blob y forzar la descarga
  const blob_sm_vc     = new Blob([respuesta_sm_vc.data], {
    type: respuesta_sm_vc.data.type || 'application/pdf',
  })
  const url_sm_vc      = window.URL.createObjectURL(blob_sm_vc)
  const anchor_sm_vc   = document.createElement('a')
  anchor_sm_vc.href    = url_sm_vc
  anchor_sm_vc.download = nombre_sm_vc

  // Montaje y clic programático (necesario para Firefox y Chrome)
  document.body.appendChild(anchor_sm_vc)
  anchor_sm_vc.click()
  document.body.removeChild(anchor_sm_vc)

  // Liberar la URL del heap tras 60s para evitar memory leak
  // (60s es suficiente para que el navegador inicie la descarga)
  setTimeout(() => window.URL.revokeObjectURL(url_sm_vc), 60_000)

  return { nombre_sm_vc }
}

// ─────────────────────────────────────────────────────────────────
// Visualiza el documento en una pestaña nueva sin forzar descarga.
// Útil para PDFs que el navegador puede renderizar inline.
//
// El Object URL se revoca cuando el usuario cierra la pestaña a
// través del evento `beforeunload`. Dado que no podemos detectar
// ese evento en una pestaña ajena, aplicamos revocación a los 5min.
//
// @param {number} documentoId_sm_vc
// ─────────────────────────────────────────────────────────────────
export const visualizarDocumento_sm_vc = async (documentoId_sm_vc) => {
  const respuesta_sm_vc = await api.get(
    `/documentos/${documentoId_sm_vc}/descargar`,
    { responseType: 'blob' },
  )

  const blob_sm_vc = new Blob([respuesta_sm_vc.data], {
    type: respuesta_sm_vc.data.type || 'application/pdf',
  })
  const url_sm_vc  = window.URL.createObjectURL(blob_sm_vc)

  window.open(url_sm_vc, '_blank', 'noopener,noreferrer')

  // Revocación diferida a 5min: suficiente para que el PDF cargue
  setTimeout(() => window.URL.revokeObjectURL(url_sm_vc), 300_000)
}
