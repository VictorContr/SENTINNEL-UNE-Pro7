// ══════════════════════════════════════════════════════════════════
// documentosService.js — Servicio de gestión de documentos.
//
// [FIX] Descarga Binaria (Bad-Wrapping):
//   Axios con responseType:'blob' ya entrega respuesta_sm_vc.data como
//   Blob. Envolverlo en `new Blob([blob])` creaba un objeto binario
//   inválido (blob-dentro-de-blob), corrompiendo PDFs y ZIPs.
//   Se usa respuesta_sm_vc.data directamente en createObjectURL.
// ══════════════════════════════════════════════════════════════════

import { api } from 'src/boot/axios'

// ─────────────────────────────────────────────────────────────────
// POST /api/documentos
// ─────────────────────────────────────────────────────────────────
export const subirDocumento_sm_vc = async (formData_sm_vc) => {
  const respuesta_sm_vc = await api.post('/documentos', formData_sm_vc, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return respuesta_sm_vc.data
}

// ─────────────────────────────────────────────────────────────────
// GET /api/documentos/:documentoId/descargar
// Fuerza la descarga del archivo en el navegador.
//
// [FIX] respuesta_sm_vc.data YA ES un Blob gracias a responseType:'blob'.
//   Antes: new Blob([respuesta_sm_vc.data]) → doble-wrapping → archivo corrupto.
//   Ahora: se pasa directamente a createObjectURL.
// ─────────────────────────────────────────────────────────────────
export const descargarDocumento_sm_vc = async (
  documentoId_sm_vc,
  fallbackNombre_sm_vc = 'documento_sentinnel.pdf',
) => {
  const respuesta_sm_vc = await api.get(
    `/documentos/${documentoId_sm_vc}/descargar`,
    { responseType: 'blob' },
  )

  // Extraer nombre real del header Content-Disposition
  const contentDisp_sm_vc = respuesta_sm_vc.headers['content-disposition'] ?? ''
  const nombreMatch_sm_vc  = contentDisp_sm_vc.match(/filename="?([^";\n]+)"?/)
  const nombre_sm_vc       = nombreMatch_sm_vc?.[1]?.trim() ?? fallbackNombre_sm_vc

  // [FIX] respuesta_sm_vc.data ya es un Blob — no re-envolver
  const url_sm_vc      = window.URL.createObjectURL(respuesta_sm_vc.data)
  const anchor_sm_vc   = document.createElement('a')
  anchor_sm_vc.href    = url_sm_vc
  anchor_sm_vc.download = nombre_sm_vc

  document.body.appendChild(anchor_sm_vc)
  anchor_sm_vc.click()
  document.body.removeChild(anchor_sm_vc)

  // Liberar memoria tras 60 s (suficiente para que el navegador inicie la descarga)
  setTimeout(() => window.URL.revokeObjectURL(url_sm_vc), 60_000)

  return { nombre_sm_vc }
}

// ─────────────────────────────────────────────────────────────────
// Abre el documento en una pestaña nueva (previsualización inline).
//
// [FIX] Mismo fix: respuesta_sm_vc.data directo a createObjectURL.
//   Revocación diferida a 5 min para que el PDF cargue completamente
//   antes de que la URL sea invalidada.
// ─────────────────────────────────────────────────────────────────
export const visualizarDocumento_sm_vc = async (documentoId_sm_vc) => {
  const respuesta_sm_vc = await api.get(
    `/documentos/${documentoId_sm_vc}/descargar`,
    { responseType: 'blob' },
  )

  // [FIX] respuesta_sm_vc.data ya es un Blob — no re-envolver
  const url_sm_vc = window.URL.createObjectURL(respuesta_sm_vc.data)

  window.open(url_sm_vc, '_blank', 'noopener,noreferrer')

  // Revocar a los 5 min: el PDF necesita tiempo para cargar en la nueva pestaña
  setTimeout(() => window.URL.revokeObjectURL(url_sm_vc), 300_000)
}