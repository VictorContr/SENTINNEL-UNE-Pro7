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
import { api } from 'src/boot/axios'

/* ── Fuente de Verdad: columnas oficiales del schema.prisma ── */
export const COLS_USUARIOS_vc   = ['Nombre', 'Apellido', 'Cedula', 'Correo', 'Telefono (Opcional)', 'Clave', 'Rol', 'Profesor_Asignado_ID (Opcional)', 'Tutor_Empresarial (Opcional)', 'Empresa (Opcional)', 'Titulo_Proyecto (Opcional)']
export const COLS_REQUISITOS_vc = ['MateriaId', 'Nombre', 'Descripcion', 'Posicion']

/* ── Opciones del Radio Group de importación ── */
export const OPCIONES_CARGA_vc = [
  { label: 'Eliminar registros anteriores', value: 'eliminar' },
  { label: 'Continuar registros',           value: 'continuar' }
]


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
          razon: `<b>Columnas con nombre incorrecto u omitidas:</b><br/> ${malNombradas_vc.join(', ')}.`
        }
      }

      // Validación profunda de datos de usuarios en el Frontend
      if (paso_vc === 1) {
        const rows = sheet_vc.usedRange().value()
        const erroresData = []
        
        const cedulasExtraidas = [];
        const correosExtraidos = [];
        const cedulasEnArchivo = new Set();
        const correosEnArchivo = new Set();

        // starts at 1 to skip header
        for (let i = 1; i < rows.length; i++) {
           const row = rows[i]
           const filaNum = i + 1
           const nombre = row[0]
           const apellido = row[1]
           const cedula = row[2] ? row[2].toString().trim() : null
           const correo = row[3] ? row[3].toString().trim().toLowerCase() : null
           const telefono = row[4] ? row[4].toString().trim() : null
           const rol = row[6] ? row[6].toString().trim().toUpperCase() : ''
           
           if (!nombre) erroresData.push(`Fila ${filaNum}: Faltó el nombre.`)
           if (!apellido) erroresData.push(`Fila ${filaNum}: Faltó el apellido.`)
           
           if (!cedula) {
             erroresData.push(`Fila ${filaNum}: Faltó la cédula.`)
           } else if (!/^V-\d+$/i.test(cedula)) {
             erroresData.push(`Fila ${filaNum}: La cédula debe tener el formato V- acompañado de números (ej: V-12345678).`)
           } else {
             if (cedulasEnArchivo.has(cedula)) {
                 erroresData.push(`Fila ${filaNum}: La cédula ${cedula} está repetida dentro de este mismo archivo.`)
             } else {
                 cedulasEnArchivo.add(cedula)
                 cedulasExtraidas.push(cedula)
             }
           }
           
           if (telefono && !/^\+58\d+$/.test(telefono)) {
             erroresData.push(`Fila ${filaNum}: El teléfono debe tener el formato +58 seguido de los números.`)
           }
           
           if (!correo) {
             erroresData.push(`Fila ${filaNum}: Faltó el correo.`)
           } else if (typeof correo === 'string' && !/.+@.+\..+/.test(correo)) {
              erroresData.push(`Fila ${filaNum}: El correo introducido no tiene formato válido.`)
           } else {
             if (correosEnArchivo.has(correo)) {
                 erroresData.push(`Fila ${filaNum}: El correo ${correo} está repetido dentro de este mismo archivo.`)
             } else {
                 correosEnArchivo.add(correo)
                 correosExtraidos.push(correo)
             }
           }

           if (!['ADMIN', 'PROFESOR', 'ESTUDIANTE'].includes(rol)) {
             erroresData.push(`Fila ${filaNum}: Rol "${rol}" inválido. Usa ADMIN, PROFESOR o ESTUDIANTE.`)
           }
        }

        // Validación con BD para Continuar si no hay opción "eliminar"
        if (opcionCarga_vc.value === 'continuar' && (cedulasExtraidas.length > 0 || correosExtraidos.length > 0)) {
            try {
               const resValidacion = await api.post('/admin/validar-duplicados', {
                  cedulas: cedulasExtraidas,
                  correos: correosExtraidos
               });
               const { cedulasDuplicadas, correosDuplicadas } = resValidacion.data;

               for (let i = 1; i < rows.length; i++) {
                  const filaNum = i + 1;
                  const cedula = rows[i][2] ? rows[i][2].toString().trim() : null;
                  const correo = rows[i][3] ? rows[i][3].toString().trim().toLowerCase() : null;

                  if (cedula && cedulasDuplicadas.includes(cedula)) {
                      erroresData.push(`Fila ${filaNum}: La cédula ${cedula} ya existe en el sistema (Base de Datos).`);
                  }
                  if (correo && correosDuplicadas.includes(correo)) {
                      erroresData.push(`Fila ${filaNum}: El correo ${correo} ya existe en el sistema (Base de Datos).`);
                  }
               }
            } catch (err) {
               console.error("No se pudo pre-validar duplicados con el backend", err);
            }
        }

        if (erroresData.length > 0) {
           return {
             valido: false,
             razon: '<div style="max-height: 200px; overflow-y: auto;">' +
                    '<ul style="margin:0; padding-left: 20px;">' + 
                    erroresData.slice(0, 15).map(e => `<li>${e}</li>`).join('') + 
                    '</ul></div>' + 
                    (erroresData.length > 15 ? `<br><i>...y ${erroresData.length - 15} errores más.</i>` : '')
           }
        }
      }

      return { valido: true }
    } catch {
      return { valido: false, razon: 'El archivo no pudo ser leído. Verifica que sea un .xlsx válido y no esté corrupto.' }
    }
  }

  /* ── Acción: procesar un archivo (validar + guardar en state) ── */
  const procesarArchivo_vc = async (file_vc, paso_vc) => {
    if (!file_vc) return

    validando_vc.value = true
    columnaError_vc.value[paso_vc] = false

    const resultado_vc = await validarColumnas_vc(file_vc, paso_vc)

    if (!resultado_vc.valido) {
      // Marcamos error y ANULAMOS el archivo para que el q-file se limpie y no le deje continuar de paso
      columnaError_vc.value[paso_vc] = true
      archivos_vc.value[paso_vc] = null

      // Usamos Dialog al medio de la pantalla con estilos más grandes
      $q_vc.dialog({
        title: '<div class="text-negative text-h5 text-bold text-center"><i class="q-icon material-icons q-mr-sm" style="font-size: 32px;">error</i> Archivo Reemplazado / Inválido</div>',
        message: `<div class="text-body1 text-left q-mt-md" style="font-size: 16px; line-height: 1.6;">${resultado_vc.razon}</div>`,
        html: true,
        style: 'min-width: 50vw; border-radius: 12px; border: 2px solid var(--q-negative);',
        ok: {
          label: 'Corregir y Volver a Subir',
          color: 'negative',
          size: 'lg',
          unelevated: true
        }
      })
    } else {
      // Recién si es perfectamente válido, lo asignamos
      archivos_vc.value[paso_vc] = file_vc
      columnaError_vc.value[paso_vc] = false

      $q_vc.notify({
        type: 'positive',
        message: `Archivo válido — ${file_vc.name}`,
        caption: `${colsPorPaso_vc(paso_vc).length} columnas y todas las filas verificadas correctamente.`,
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

      // Agregar ejemplos si es la plantilla de usuarios
      if (paso_vc === 1) {
        // Ejemplo Admin
        sheet_vc.cell(2, 1).value('Carlos')
        sheet_vc.cell(2, 2).value('Administrador')
        sheet_vc.cell(2, 3).value('V-11111111')
        sheet_vc.cell(2, 4).value('admin@ejemplo.com')
        sheet_vc.cell(2, 5).value('+584141234567')
        sheet_vc.cell(2, 6).value('Admin123!')
        sheet_vc.cell(2, 7).value('ADMIN')

        // Ejemplo Profesor
        sheet_vc.cell(3, 1).value('María')
        sheet_vc.cell(3, 2).value('Gómez')
        sheet_vc.cell(3, 3).value('V-22222222')
        sheet_vc.cell(3, 4).value('profesor@ejemplo.com')
        sheet_vc.cell(3, 5).value('+584241234567')
        sheet_vc.cell(3, 6).value('Prof123!')
        sheet_vc.cell(3, 7).value('PROFESOR')

        // Ejemplo Estudiante
        sheet_vc.cell(4, 1).value('Juan')
        sheet_vc.cell(4, 2).value('Pérez')
        sheet_vc.cell(4, 3).value('V-33333333')
        sheet_vc.cell(4, 4).value('estudiante@ejemplo.com')
        sheet_vc.cell(4, 5).value('+584121234567')
        sheet_vc.cell(4, 6).value('Estud123!')
        sheet_vc.cell(4, 7).value('ESTUDIANTE')
        sheet_vc.cell(4, 8).value('1')
        sheet_vc.cell(4, 9).value('Ing. Tutor')
        sheet_vc.cell(4, 10).value('Empresa SA')
        sheet_vc.cell(4, 11).value('Proyecto Ejemplo')
      }

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

  /* ── Acción: descarga de datos actuales (Backup en DB viva) ── */
  const descargarDatos_vc = async (tipo_vc) => {
    $q_vc.notify({
      type: 'info',
      message: `Extrayendo datos de la base de datos (${tipo_vc})...`,
      position: 'top-right', icon: 'hourglass_empty', timeout: 2000
    })

    try {
      const response = await api.get(`/admin/descargar-datos/${tipo_vc}`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `SENTINNEL_Backup_${tipo_vc}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      $q_vc.notify({
        type: 'positive',
        message: 'Backup descargado exitosamente.',
        position: 'top-right', icon: 'download_done', timeout: 3000
      })
    } catch {
      $q_vc.notify({
        type: 'negative',
        message: 'Error al extraer los datos.',
        caption: 'No se pudo generar el Excel desde la base de datos.',
        position: 'top-right', icon: 'error', timeout: 4000
      })
    }
  }

  /* ── Acción: ejecutar la importación completa ── */
  // Recibe los archivos y el modo; retorna true si tuvo éxito.
  const ejecutarImportacion_vc = async () => {
    if (!archivoPasoValido_vc(1)) {
      $q_vc.dialog({
        title: '<div class="text-warning text-h5 text-center text-bold"><i class="q-icon material-icons" style="font-size: 32px;">warning</i> Acción Bloqueada</div>',
        message: '<div class="text-center text-body1 q-mt-md" style="font-size: 18px;">El archivo de <b>Usuarios</b> tiene errores estructurados o no ha sido cargado aún.</div>',
        html: true,
        style: 'min-width: 400px; border-radius: 12px; border: 2px solid var(--q-warning);',
        ok: { label: 'Entendido', color: 'warning', size: 'lg' }
      })
      return false
    }
    if (!archivoPasoValido_vc(2)) {
      $q_vc.dialog({
        title: '<div class="text-warning text-h5 text-center text-bold"><i class="q-icon material-icons" style="font-size: 32px;">warning</i> Acción Bloqueada</div>',
        message: '<div class="text-center text-body1 q-mt-md" style="font-size: 18px;">El archivo de <b>Requisitos</b> tiene errores estructurados o no ha sido cargado aún.</div>',
        html: true,
        style: 'min-width: 400px; border-radius: 12px; border: 2px solid var(--q-warning);',
        ok: { label: 'Entendido', color: 'warning', size: 'lg' }
      })
      return false
    }
    if (validando_vc.value) return false

    importando_vc.value = true
    try {
      const formData = new FormData()
      formData.append('usuarios', archivos_vc.value[1])
      formData.append('requisitos', archivos_vc.value[2])
      formData.append('modo', opcionCarga_vc.value)

      await api.post('/admin/carga-masiva', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      $q_vc.notify({
        type: 'positive',
        message: 'Importación completada con éxito.',
        caption: `Modo: ${opcionCarga_vc.value === 'eliminar' ? 'Registros anteriores eliminados' : 'Registros continuados'}.`,
        icon: 'check_circle', position: 'top-right', timeout: 4000
      })

      // Resetear estado tras importación exitosa
      resetear_vc()
      return true
    } catch (error) {
      const data = error.response?.data;
      let errMessage = 'Verifica los archivos e inténtalo de nuevo.';
      
      if (data?.message) {
        errMessage = data.message;
      }
      
      if (data?.detalles && Array.isArray(data.detalles)) {
        errMessage += '<div style="max-height: 250px; overflow-y: auto; text-align: left; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px; margin-top: 10px;"><ul style="margin:0; padding-left: 20px; font-size: 16px;">' + data.detalles.slice(0, 15).map(d => `<li>${d}</li>`).join('') + '</ul></div>';
        if (data.detalles.length > 15) {
          errMessage += `<br/><div class="text-center"><i>...y ${data.detalles.length - 15} error(es) más.</i></div>`;
        }
      }

      $q_vc.dialog({
        title: '<div class="text-negative text-h4 text-center text-bold"><i class="q-icon material-icons" style="font-size: 40px;">error_outline</i> Importación Fallida</div>',
        message: `<div class="text-body1 q-mt-md" style="font-size: 18px;">${errMessage}</div>`,
        html: true,
        style: 'min-width: 50vw; border-radius: 12px; border: 3px solid var(--q-negative);',
        ok: {
          label: 'Corregir Archivos',
          color: 'negative',
          size: 'lg',
          unelevated: true
        }
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
