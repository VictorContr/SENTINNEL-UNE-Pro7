// ══════════════════════════════════════════════════════════════════
// cargaMasivaStore.js — Store del asistente de Carga Masiva.
// CORRECCIÓN: reemplaza document.createElement('a') por
// exportFile() de Quasar — cero manipulación directa del DOM.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useQuasar, exportFile } from 'quasar'
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate'

/* Columnas oficiales por paso — fuente de verdad para validación */
export const COLS_USUARIOS_vc   = ['Nombre', 'Apellido', 'Cedula', 'Correo', 'Telefono', 'Clave', 'Rol']
export const COLS_REQUISITOS_vc = ['MateriaId', 'Nombre', 'Descripcion', 'Posicion']

export const OPCIONES_CARGA_vc = [
  { label: 'Eliminar registros anteriores', value: 'eliminar' },
  { label: 'Continuar registros',           value: 'continuar' }
]

const DELAY_MOCK_vc = 1500

export const useCargaMasivaStore = defineStore('cargaMasiva', () => {
  const $q_vc = useQuasar()

  /* ── Estado ── */
  const archivos_vc     = ref({ 1: null, 2: null })
  const columnaError_vc = ref({ 1: false, 2: false })
  const opcionCarga_vc  = ref('continuar')
  const validando_vc    = ref(false)
  const importando_vc   = ref(false)

  /* Devuelve las columnas esperadas según el paso */
  const colsPorPaso_vc = (paso_vc) =>
    paso_vc === 1 ? COLS_USUARIOS_vc : COLS_REQUISITOS_vc

  const archivoPasoValido_vc = (paso_vc) =>
    !!archivos_vc.value[paso_vc] && !columnaError_vc.value[paso_vc]

  const puedeEjecutar_vc = () =>
    archivoPasoValido_vc(1) && archivoPasoValido_vc(2) && !validando_vc.value

  /* Valida columnas del xlsx contra el esquema esperado */
  const validarColumnas_vc = async (archivo_vc, paso_vc) => {
    const esperadas_vc = colsPorPaso_vc(paso_vc)
    try {
      const buffer_vc   = await archivo_vc.arrayBuffer()
      const libro_vc    = await XlsxPopulate.fromDataAsync(buffer_vc)
      const hoja_vc     = libro_vc.sheet(0)
      const totalCols_vc = hoja_vc.usedRange()?.endCell()?.columnNumber() ?? 0

      if (totalCols_vc !== esperadas_vc.length) {
        return {
          valido: false,
          razon: `Se esperan ${esperadas_vc.length} columnas, se detectaron ${totalCols_vc}.`
        }
      }

      const encabezados_vc  = esperadas_vc.map((_, i_vc) => hoja_vc.cell(1, i_vc + 1).value())
      const malNombradas_vc = esperadas_vc.filter((col_vc, i_vc) => encabezados_vc[i_vc] !== col_vc)

      if (malNombradas_vc.length > 0) {
        return {
          valido: false,
          razon: `Columnas con nombre incorrecto: ${malNombradas_vc.join(', ')}.`
        }
      }

      return { valido: true }
    } catch {
      return { valido: false, razon: 'El archivo no pudo ser leído. Verifica que sea un .xlsx válido.' }
    }
  }

  /* Procesa y valida el archivo seleccionado para un paso */
  const procesarArchivo_vc = async (archivo_vc, paso_vc) => {
    if (!archivo_vc) return

    validando_vc.value = true
    columnaError_vc.value[paso_vc] = false
    archivos_vc.value[paso_vc] = archivo_vc

    const resultado_vc = await validarColumnas_vc(archivo_vc, paso_vc)

    if (!resultado_vc.valido) {
      columnaError_vc.value[paso_vc] = true
      $q_vc.notify({
        type: 'negative',
        message: 'Plantilla inválida',
        caption: resultado_vc.razon,
        icon: 'error',
        position: 'top-right',
        timeout: 5000
      })
    } else {
      columnaError_vc.value[paso_vc] = false
      $q_vc.notify({
        type: 'positive',
        message: `Archivo válido — ${archivo_vc.name}`,
        caption: `${colsPorPaso_vc(paso_vc).length} columnas verificadas correctamente.`,
        icon: 'check_circle',
        position: 'top-right',
        timeout: 3000
      })
    }

    validando_vc.value = false
  }

  /* Limpia el archivo y el error de un paso */
  const limpiarArchivo_vc = (paso_vc) => {
    archivos_vc.value[paso_vc]     = null
    columnaError_vc.value[paso_vc] = false
  }

  /* ── CORRECCIÓN CRÍTICA ──
     Genera y descarga la plantilla xlsx usando exportFile() de Quasar.
     Elimina el uso prohibido de document.createElement('a').         */
  const descargarPlantilla_vc = async (paso_vc) => {
    const cols_vc   = colsPorPaso_vc(paso_vc)
    const nombre_vc = paso_vc === 1 ? 'plantilla_usuarios.xlsx' : 'plantilla_requisitos.xlsx'

    try {
      const libro_vc = await XlsxPopulate.fromBlankAsync()
      const hoja_vc  = libro_vc.sheet(0)

      /* Escribe los encabezados en la primera fila */
      cols_vc.forEach((col_vc, i_vc) => {
        hoja_vc.cell(1, i_vc + 1).value(col_vc)
      })

      /* Obtiene el Blob y lo descarga vía exportFile — sin DOM directo */
      const blob_vc   = await libro_vc.outputAsync()
      const estado_vc = exportFile(
        nombre_vc,
        blob_vc,
        { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      )

      if (estado_vc !== true) {
        throw new Error('El navegador bloqueó la descarga.')
      }

      $q_vc.notify({
        type: 'positive',
        message: `Plantilla descargada: ${nombre_vc}`,
        icon: 'table_chart',
        position: 'top-right',
        timeout: 3000
      })
    } catch (err_vc) {
      $q_vc.notify({
        type: 'negative',
        message: err_vc?.message || 'Error al generar la plantilla.',
        position: 'top-right',
        timeout: 3000
      })
    }
  }

  /* Notifica inicio de descarga de datos actuales (mock) */
  const descargarDatos_vc = (tipo_vc) => {
    $q_vc.notify({
      type: 'info',
      message: `Iniciando descarga de datos actuales (${tipo_vc})…`,
      position: 'top-right',
      icon: 'download',
      timeout: 2500
    })
  }

  /* Ejecuta la importación completa — retorna true si tuvo éxito */
  const ejecutarImportacion_vc = async () => {
    if (!puedeEjecutar_vc()) return false

    importando_vc.value = true
    try {
      await new Promise((r) => setTimeout(r, DELAY_MOCK_vc))

      $q_vc.notify({
        type: 'positive',
        message: 'Importación completada con éxito.',
        caption: `Modo: ${opcionCarga_vc.value === 'eliminar' ? 'Registros anteriores eliminados' : 'Registros continuados'}.`,
        icon: 'check_circle',
        position: 'top-right',
        timeout: 4000
      })

      resetear_vc()
      return true
    } catch {
      $q_vc.notify({
        type: 'negative',
        message: 'Error durante la importación.',
        caption: 'Verifica los archivos e inténtalo de nuevo.',
        icon: 'error',
        position: 'top-right',
        timeout: 5000
      })
      return false
    } finally {
      importando_vc.value = false
    }
  }

  /* Reinicia el estado del asistente */
  const resetear_vc = () => {
    archivos_vc.value     = { 1: null, 2: null }
    columnaError_vc.value = { 1: false, 2: false }
    opcionCarga_vc.value  = 'continuar'
  }

  return {
    archivos_vc,
    columnaError_vc,
    opcionCarga_vc,
    validando_vc,
    importando_vc,
    COLS_USUARIOS_vc,
    COLS_REQUISITOS_vc,
    OPCIONES_CARGA_vc,
    colsPorPaso_vc,
    archivoPasoValido_vc,
    puedeEjecutar_vc,
    procesarArchivo_vc,
    limpiarArchivo_vc,
    descargarPlantilla_vc,
    descargarDatos_vc,
    ejecutarImportacion_vc,
    resetear_vc
  }
})