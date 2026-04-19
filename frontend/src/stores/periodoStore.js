import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { usePasantiasStore } from './pasantiasStore'
import { actualizarPeriodo_sm_vc as putPeriodoApi_sm_vc } from 'src/services/adminService'

export const usePeriodoStore = defineStore('periodo', () => {

  const periodoActualObj_sm_vc = ref(null)
  const periodoActual_sm_vc = ref('')
  const fechaInicio_sm_vc   = ref('')
  const fechaCierre_sm_vc   = ref('')
  const periodos_sm_vc      = ref([])
  const loading_sm_vc       = ref(false)

  const periodoFormateado_sm_vc = computed(() => {
    if (!periodoActual_sm_vc.value) return 'Cargando periodo...'
    
    const base_sm_vc = periodoActual_sm_vc.value.includes('P-') 
      ? periodoActual_sm_vc.value.replace('P-', 'Periodo ')
      : periodoActual_sm_vc.value

    if (fechaInicio_sm_vc.value && fechaCierre_sm_vc.value) {
      const anio_sm_vc = fechaInicio_sm_vc.value.split('-')[0]
      const mesInicio_sm_vc = formatearMesSolo_sm_vc(fechaInicio_sm_vc.value)
      const mesCierre_sm_vc = formatearMesSolo_sm_vc(fechaCierre_sm_vc.value)
      return `${base_sm_vc} (${mesInicio_sm_vc} - ${mesCierre_sm_vc} ${anio_sm_vc})`
    }
    return base_sm_vc
  })

  const cargarPeriodos_sm_vc = async () => {
    loading_sm_vc.value = true
    try {
      const resp = await api.get('/periodos')
      periodos_sm_vc.value = resp.data || []
    } catch (err) {
      console.error('[periodoStore] Error cargando historial de periodos:', err)
    } finally {
      loading_sm_vc.value = false
    }
  }

  const cargarPeriodoActual_sm_vc = async () => {
    loading_sm_vc.value = true
    try {
      const resp_sm_vc = await api.get('/periodos/activo')
      if (resp_sm_vc.data) {
        periodoActualObj_sm_vc.value = resp_sm_vc.data
        periodoActual_sm_vc.value = resp_sm_vc.data.nombre_sm_vc

        const f_inicio = new Date(resp_sm_vc.data.fecha_inicio_sm_vc)
        const f_fin = new Date(resp_sm_vc.data.fecha_fin_sm_vc)

        fechaInicio_sm_vc.value = f_inicio.toISOString().split('T')[0]
        fechaCierre_sm_vc.value = f_fin.toISOString().split('T')[0]
      }
    } catch (err_sm_vc) {
      // Ignorar Notificaciones visuales aquí para no inundar UI si no hay ninguno activo,
      // pero loggeamos para debug
      console.warn('[periodoStore] No se encontró periodo activo o fallo en la red', err_sm_vc)
    } finally {
      loading_sm_vc.value = false
    }
  }

  // POST/PUT: Roll Forward
  const actualizarPeriodo_sm_vc = async ({ fechaInicio, fechaCierre }) => {
    if (!fechaInicio || !fechaCierre) {
      Notify.create({ type: 'warning', message: 'Debes seleccionar ambas fechas.', icon: 'warning', position: 'top-right' })
      return false
    }
    if (fechaCierre <= fechaInicio) {
      Notify.create({ type: 'negative', message: 'La fecha de cierre debe ser posterior a la de inicio.', icon: 'error_outline', position: 'top-right' })
      return false
    }

    const crearFechaLocal_sm_vc = (fechaInput_sm_vc) => {
      if (!fechaInput_sm_vc) return new Date();
      
      const fechaString_sm_vc = fechaInput_sm_vc instanceof Date 
          ? fechaInput_sm_vc.toISOString().split('T')[0] 
          : String(fechaInput_sm_vc).split('T')[0];
          
      const partes_sm_vc = fechaString_sm_vc.split('-');
      const anio_sm_vc = parseInt(partes_sm_vc[0], 10);
      const mes_sm_vc = parseInt(partes_sm_vc[1], 10) - 1; 
      const dia_sm_vc = parseInt(partes_sm_vc[2], 10);
      
      return new Date(anio_sm_vc, mes_sm_vc, dia_sm_vc, 0, 0, 0, 0);
    }

    // Normalización Absoluta de Fechas
    const inicioParseado_sm_vc = crearFechaLocal_sm_vc(fechaInicio);
    
    // 1. Barrera de Antisolapamiento
    let finParseado_sm_vc = null
    if (periodos_sm_vc.value && periodos_sm_vc.value.length > 0) {
      const periodosOrdenados_sm_vc = [...periodos_sm_vc.value].sort((a, b) => 
        crearFechaLocal_sm_vc(b.fecha_fin_sm_vc).getTime() - crearFechaLocal_sm_vc(a.fecha_fin_sm_vc).getTime()
      )
      finParseado_sm_vc = crearFechaLocal_sm_vc(periodosOrdenados_sm_vc[0].fecha_fin_sm_vc);
    }

    if (finParseado_sm_vc !== null) {
      // 4. Logs de Trazabilidad Críticos
      console.log('DEBUG FECHAS -> Inicio:', inicioParseado_sm_vc, 'Fin:', finParseado_sm_vc)

      if (inicioParseado_sm_vc.getTime() <= finParseado_sm_vc.getTime()) {
        Notify.create({ type: 'negative', message: 'Barrera de Antisolapamiento: La fecha de inicio debe ser estrictamente mayor a la fecha de fin del período anterior.', icon: 'error_outline', position: 'top-right' })
        return false
      }
    }

    // 2. Barrera Cronológica (Aviso para período planificado)
    const actualParseado_sm_vc = crearFechaLocal_sm_vc(new Date())

    if (inicioParseado_sm_vc.getTime() > actualParseado_sm_vc.getTime()) {
      Notify.create({ type: 'warning', message: 'La fecha es futura. El período se registrará como Planificado (inactivo).', icon: 'warning', position: 'top-right', timeout: 5000 })
    }

    loading_sm_vc.value = true
    try {
      const dto_sm_vc = { fecha_inicio_sm_vc: fechaInicio, fecha_cierre_sm_vc: fechaCierre }
      await putPeriodoApi_sm_vc(dto_sm_vc)
      
      await cargarPeriodoActual_sm_vc()
      await cargarPeriodos_sm_vc()

      const pasantias_sm_vc = usePasantiasStore()
      if (pasantias_sm_vc.procesarCambioPeriodo_sm_vc) {
        pasantias_sm_vc.procesarCambioPeriodo_sm_vc(periodoActual_sm_vc.value)
      }

      Notify.create({ type: 'positive', message: 'Nuevo periodo iniciado correctamente', icon: 'check_circle', position: 'top-right' })
      return true
    } catch (err_sm_vc) {
      Notify.create({
        type: 'negative',
        message: err_sm_vc.response?.data?.message || 'Error al crear un nuevo periodo.',
        position: 'top-right'
      })
      return false
    } finally {
      loading_sm_vc.value = false
    }
  }

  // PATCH: Actualización de fechas del periodo actual
  const editarFechasActuales_sm_vc = async ({ fechaInicio, fechaCierre }) => {
    if (!periodoActualObj_sm_vc.value) {
      Notify.create({ type: 'negative', message: 'No hay periodo activo para editar.', icon: 'error_outline', position: 'top-right' })
      return false
    }
    if (fechaCierre <= fechaInicio) {
      Notify.create({ type: 'negative', message: 'La fecha de cierre debe ser posterior a la de inicio.', icon: 'error_outline', position: 'top-right' })
      return false
    }

    loading_sm_vc.value = true
    try {
      const id = periodoActualObj_sm_vc.value.id_sm_vc
      const dto = {
        fecha_inicio_sm_vc: new Date(fechaInicio).toISOString(),
        fecha_fin_sm_vc: new Date(fechaCierre).toISOString()
      }
      
      await api.patch(`/periodos/${id}`, dto)
      
      await cargarPeriodoActual_sm_vc()
      await cargarPeriodos_sm_vc()

      Notify.create({ type: 'positive', message: 'Fechas actualizadas correctamente', icon: 'edit_calendar', position: 'top-right' })
      return true
    } catch (err_sm_vc) {
      Notify.create({
        type: 'negative',
        message: err_sm_vc.response?.data?.message || 'Error al actualizar las fechas.',
        position: 'top-right',
        timeout: 5000
      })
      return false
    } finally {
      loading_sm_vc.value = false
    }
  }

  const formatearMesSolo_sm_vc = (valor_sm_vc) => {
    if (!valor_sm_vc) return ''
    const [anio_sm_vc, mes_sm_vc, dia_sm_vc] = valor_sm_vc.split('-')
    const fecha_sm_vc = new Date(Number(anio_sm_vc), Number(mes_sm_vc) - 1, Number(dia_sm_vc || 1))
    const mes_str_sm_vc = fecha_sm_vc.toLocaleDateString('es-ES', { month: 'long', timeZone: 'UTC' })
    return mes_str_sm_vc.charAt(0).toUpperCase() + mes_str_sm_vc.slice(1)
  }

  return {
    periodoActualObj_sm_vc,
    periodoActual_sm_vc,
    fechaInicio_sm_vc,
    fechaCierre_sm_vc,
    periodos_sm_vc,
    loading_sm_vc,
    periodoFormateado_sm_vc,
    cargarPeriodos_sm_vc,
    cargarPeriodoActual_sm_vc,
    actualizarPeriodo_sm_vc,
    editarFechasActuales_sm_vc
  }
})