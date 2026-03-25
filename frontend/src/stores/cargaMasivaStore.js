// ══════════════════════════════════════════════════════════════════
// cargaMasivaStore.js — Store dedicado al asistente de Carga Masiva.
// Responsabilidades: validación de columnas xlsx, descarga de
// plantillas, manejo de archivos y ejecución de la importación.
// Principio: la Page es un Thin View — cero lógica de negocio allí.
// ══════════════════════════════════════════════════════════════════

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate'

/* ── Fuente de Verdad: columnas oficiales del schema.prisma ── */
export const COLS_USUARIOS_vc   = ['Nombre', 'Apellido', 'Cedula', 'Correo', 'Telefono', 'Clave', 'Rol']
export const COLS_REQUISITOS_vc = ['MateriaId', 'Nombre', 'Descripcion', 'Posicion']

/* ── Opciones del Radio Group de importación ── */
export const OPCIONES_CARGA_vc = [
  { label: 'Eliminar registros anteriores', value: 'eliminar' },
  { label: 'Continuar registros',           value: 'continuar' }
]

const DELAY_MOCK_vc = 1500

export const useCargaMasivaStore = defineStore('cargaMasiva', () => {
  const $q_vc = useQuasar()

  /* ── State ── */
  const archivos_vc      = ref({ 1: null, 2: null })   // File | null por paso
  const columnaError_vc  = ref({ 1: false, 2: false }) // true si la validación falló
  const opcionCarga_vc   = ref('continuar')             // 'eliminar' | 'continuar'
  const validando_vc     = ref(false)                   // spinner durante lectura xlsx
  const importando_vc    = ref(false)                   // spinner durante envío

  /* ── Getter helpers ── */
  const colsPorPaso_vc = (paso_vc) =>
    paso_vc === 1 ? COLS_USUARIOS_vc : COLS_REQUISITOS_vc

  const archivoPasoValido_vc = (paso_vc) =>
    !!archivos_vc.value[paso_vc] && !columnaError_vc.value[paso_vc]

  const puedeEjecutar_vc = () =>
    archivoPasoValido_vc(1) && archivoPasoValido_vc(2) && !validando_vc.value

  /* ── Acción: validar columnas de un archivo XLSX ── */
  // Retorna { valido: bool, razon?: string }
  const validarColumnas_vc = async (file_vc, paso_vc) => {
    const esperadas_vc = colsPorPaso_vc(paso_vc)
    try {
      const buffer_vc   = await file_vc.arrayBuffer()
      const workbook_vc = await XlsxPopulate.fromDataAsync(buffer_vc)
      const sheet_vc    = workbook_vc.sheet(0)

      // Total de columnas usadas en la fila 1
      const totalCols_vc = sheet_vc.usedRange()?.endCell()?.columnNumber() ?? 0

      if (totalCols_vc !== esperadas_vc.length) {
        return {
          valido: false,
          razon: `Se esperan ${esperadas_vc.length} columnas, se detectaron ${totalCols_vc}.`
        }
      }

      // Comparar header a header (case-sensitive)
      const headers_vc     = esperadas_vc.map((_, i) => sheet_vc.cell(1, i + 1).value())
      const malNombradas_vc = esperadas_vc.filter((col, i) => headers_vc[i] !== col)

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

  /* ── Acción: procesar un archivo (validar + guardar en state) ── */
  const procesarArchivo_vc = async (file_vc, paso_vc) => {
    if (!file_vc) return

    validando_vc.value = true
    columnaError_vc.value[paso_vc] = false

    const resultado_vc = await validarColumnas_vc(file_vc, paso_vc)

    // Siempre asignamos el archivo para mostrar su nombre en la UI
    archivos_vc.value[paso_vc] = file_vc

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
        message: `Archivo válido — ${file_vc.name}`,
        caption: `${colsPorPaso_vc(paso_vc).length} columnas verificadas correctamente.`,
        icon: 'check_circle',
        position: 'top-right',
        timeout: 3000
      })
    }

    validando_vc.value = false
  }

  /* ── Acción: limpiar el archivo de un paso ── */
  const limpiarArchivo_vc = (paso_vc) => {
    archivos_vc.value[paso_vc]     = null
    columnaError_vc.value[paso_vc] = false
  }

  /* ── Acción: descargar plantilla oficial con headers reales ── */
  const descargarPlantilla_vc = async (paso_vc) => {
    const cols_vc   = colsPorPaso_vc(paso_vc)
    const nombre_vc = paso_vc === 1 ? 'plantilla_usuarios.xlsx' : 'plantilla_requisitos.xlsx'

    try {
      const workbook_vc = await XlsxPopulate.fromBlankAsync()
      const sheet_vc    = workbook_vc.sheet(0)

      cols_vc.forEach((col_vc, i_vc) => {
        sheet_vc.cell(1, i_vc + 1).value(col_vc)
      })

      const blob_vc  = await workbook_vc.outputAsync()
      const url_vc   = URL.createObjectURL(blob_vc)
      const a_vc     = document.createElement('a')
      a_vc.href      = url_vc
      a_vc.download  = nombre_vc
      a_vc.click()
      URL.revokeObjectURL(url_vc)

      $q_vc.notify({
        type: 'positive',
        message: `Plantilla descargada: ${nombre_vc}`,
        icon: 'table_chart', position: 'top-right', timeout: 3000
      })
    } catch {
      $q_vc.notify({
        type: 'negative',
        message: 'Error al generar la plantilla.',
        position: 'top-right', timeout: 3000
      })
    }
  }

  /* ── Acción: notificar descarga de datos actuales (Mock) ── */
  const descargarDatos_vc = (tipo_vc) => {
    $q_vc.notify({
      type: 'info',
      message: `Iniciando descarga de datos actuales (${tipo_vc})…`,
      position: 'top-right', icon: 'download', timeout: 2500
    })
  }

  /* ── Acción: ejecutar la importación completa ── */
  // Recibe los archivos y el modo; retorna true si tuvo éxito.
  const ejecutarImportacion_vc = async () => {
    if (!puedeEjecutar_vc()) return false

    importando_vc.value = true
    try {
      // Mock: simular latencia de red
      // TODO: reemplazar con la llamada Axios real al endpoint de importación
      // Ej: await axios.post('/api/admin/carga-masiva', formData)
      await new Promise((r) => setTimeout(r, DELAY_MOCK_vc))

      $q_vc.notify({
        type: 'positive',
        message: 'Importación completada con éxito.',
        caption: `Modo: ${opcionCarga_vc.value === 'eliminar' ? 'Registros anteriores eliminados' : 'Registros continuados'}.`,
        icon: 'check_circle', position: 'top-right', timeout: 4000
      })

      // Resetear estado tras importación exitosa
      resetear_vc()
      return true
    } catch {
      $q_vc.notify({
        type: 'negative',
        message: 'Error durante la importación.',
        caption: 'Verifica los archivos e inténtalo de nuevo.',
        icon: 'error', position: 'top-right', timeout: 5000
      })
      return false
    } finally {
      importando_vc.value = false
    }
  }

  /* ── Acción: resetear todo el estado de la página ── */
  const resetear_vc = () => {
    archivos_vc.value     = { 1: null, 2: null }
    columnaError_vc.value = { 1: false, 2: false }
    opcionCarga_vc.value  = 'continuar'
  }

  return {
    /* State */
    archivos_vc,
    columnaError_vc,
    opcionCarga_vc,
    validando_vc,
    importando_vc,
    /* Constantes exportadas */
    COLS_USUARIOS_vc,
    COLS_REQUISITOS_vc,
    OPCIONES_CARGA_vc,
    /* Getters */
    colsPorPaso_vc,
    archivoPasoValido_vc,
    puedeEjecutar_vc,
    /* Actions */
    procesarArchivo_vc,
    limpiarArchivo_vc,
    descargarPlantilla_vc,
    descargarDatos_vc,
    ejecutarImportacion_vc,
    resetear_vc
  }
})
