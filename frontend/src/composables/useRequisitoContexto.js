// ══════════════════════════════════════════════════════════════════
// useRequisitoContexto.js — Composable de Persistencia de Contexto.
//
// Responsabilidad única: leer, escribir y purgar el requisito
// seleccionado por el usuario en localStorage, indexado por materia_id.
//
// CONTRATO DE DISEÑO (Directiva técnica 2026-04-07):
// ─────────────────────────────────────────────────
// • Clave: `requisito_seleccionado_materia_${materia_id_sm_vc}`
// • Valor: id_sm_vc del requisito (primitivo string/number).
//   El store es responsable de hidratar el objeto completo en memoria.
// • Consumo único: getRequisitoSeleccionado_sm_vc auto-destruye el dato
//   después de leerlo para evitar "contaminación" en sesiones futuras.
// • Todas las operaciones tienen try/catch → degradación silenciosa
//   en entornos con localStorage bloqueado (ej. browsers en modo privado estricto).
// • Purga total: purgarContextoRequisitos_sm_vc() escanea el prefijo
//   y elimina TODAS las claves asociadas. Se invoca en logout_sm_vc.
//
// API PÚBLICA:
// ─────────────────────────────────────────────────
// Llama esto ANTES de navegar a la conversación:
//   import { useRequisitoContexto_sm_vc } from 'src/composables/useRequisitoContexto'
//   const { setRequisitoSeleccionado_sm_vc } = useRequisitoContexto_sm_vc()
//   setRequisitoSeleccionado_sm_vc(materia_id_sm_vc, requisito_id_sm_vc)
//   router.push(...)
// ══════════════════════════════════════════════════════════════════

/** Prefijo de clave — constante interna, no expuesta */
const PREFIJO_CLAVE_sm_vc = 'requisito_seleccionado_materia_'

/**
 * Construye la clave de localStorage para una materia específica.
 * @param {string|number} materiaId_sm_vc
 * @returns {string}
 */
const _buildKey_sm_vc = (materiaId_sm_vc) =>
  `${PREFIJO_CLAVE_sm_vc}${materiaId_sm_vc}`

// ──────────────────────────────────────────────────────────────────
// FUNCIONES PURAS (no requieren instancia, exportables directamente)
// ──────────────────────────────────────────────────────────────────

/**
 * Persiste el ID del requisito seleccionado para una materia concreta.
 * Llamar ANTES de navegar a la vista de conversación.
 *
 * @param {string|number} materiaId_sm_vc  — ID de la materia
 * @param {string|number} requisitoId_sm_vc — ID del requisito (id_sm_vc)
 */
export const setRequisitoSeleccionado_sm_vc = (materiaId_sm_vc, requisitoId_sm_vc) => {
  if (!materiaId_sm_vc || requisitoId_sm_vc == null) return
  try {
    localStorage.setItem(_buildKey_sm_vc(materiaId_sm_vc), String(requisitoId_sm_vc))
  } catch {
    // En modo privado estricto el localStorage puede estar bloqueado.
    // No se propaga el error para no romper el flujo de navegación.
    console.warn('[useRequisitoContexto] No se pudo persistir el requisito en localStorage.')
  }
}

/**
 * Lee el ID del requisito persistido para una materia y lo consume
 * (lo borra del localStorage inmediatamente después de leerlo).
 *
 * Consumo único: garantiza que la intención del usuario solo se aplica
 * a la conversación destino y no "contamina" navegaciones futuras.
 *
 * @param {string|number} materiaId_sm_vc
 * @returns {string|null} El id_sm_vc del requisito, o null si no existe.
 */
export const getRequisitoSeleccionado_sm_vc = (materiaId_sm_vc) => {
  if (!materiaId_sm_vc) return null
  try {
    const clave_sm_vc = _buildKey_sm_vc(materiaId_sm_vc)
    const valor_sm_vc = localStorage.getItem(clave_sm_vc)
    if (valor_sm_vc !== null) {
      // AUTO-DESTRUCCIÓN: consumo único.
      localStorage.removeItem(clave_sm_vc)
    }
    return valor_sm_vc // null si no existía
  } catch {
    return null
  }
}

/**
 * Borra explícitamente el contexto de una materia sin leerlo.
 * Útil si el usuario cancela la navegación desde el componente emisor.
 *
 * @param {string|number} materiaId_sm_vc
 */
export const clearRequisitoSeleccionado_sm_vc = (materiaId_sm_vc) => {
  if (!materiaId_sm_vc) return
  try {
    localStorage.removeItem(_buildKey_sm_vc(materiaId_sm_vc))
  } catch {
    // No-op silencioso
  }
}

/**
 * Purga TODAS las claves de contexto de requisito del localStorage,
 * independientemente de la materia. Se invoca en logout_sm_vc del
 * authStore para garantizar sesión completamente limpia.
 */
export const purgarContextoRequisitos_sm_vc = () => {
  try {
    // Iteramos sobre una copia de las claves porque no se puede
    // mutar Object.keys() mientras se itera en algunos entornos.
    const clavesABorrar_sm_vc = Object.keys(localStorage).filter(
      (k_sm_vc) => k_sm_vc.startsWith(PREFIJO_CLAVE_sm_vc)
    )
    clavesABorrar_sm_vc.forEach((k_sm_vc) => localStorage.removeItem(k_sm_vc))

    if (clavesABorrar_sm_vc.length > 0) {
      console.info(
        `[useRequisitoContexto] Purgadas ${clavesABorrar_sm_vc.length} clave(s) de contexto.`
      )
    }
  } catch {
    // No-op silencioso
  }
}

// ──────────────────────────────────────────────────────────────────
// COMPOSABLE: wrapper de Vue para uso con <script setup>
// ──────────────────────────────────────────────────────────────────

/**
 * Composable principal. Retorna todas las funciones de la API pública.
 * Uso recomendado dentro de <script setup>:
 *
 *   const { setRequisitoSeleccionado_sm_vc } = useRequisitoContexto_sm_vc()
 *
 * También se pueden importar las funciones puras directamente si se
 * necesita fuera de un componente (ej. en authStore.js).
 */
export const useRequisitoContexto_sm_vc = () => ({
  setRequisitoSeleccionado_sm_vc,
  getRequisitoSeleccionado_sm_vc,
  clearRequisitoSeleccionado_sm_vc,
  purgarContextoRequisitos_sm_vc
})
