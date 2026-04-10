<!-- ══════════════════════════════════════════════════════════════════
     DocumentConversacion.vue — Orquestador Polimórfico de Diálogos.
     Patrón Smart Component: Se conecta al store, resuelve el contexto
     y delega a componentes Dumb (ConvMessages, ConvFormEstudiante, ConvFormProfesor).

     ── NUEVA ARQUITECTURA (Sprint 2) ──────────────────────────────
     PROP PRINCIPAL: `modoVista_sm_vc` ('CHAT' | 'TRAZABILIDAD' | 'HISTORIAL')

     | Modo          | Descripción                      | Quién escribe        |
     | ------------- | -------------------------------- | -------------------- |
     | CHAT          | Conversación activa bidireccional | ESTUDIANTE, PROFESOR |
     | TRAZABILIDAD  | Log de revisión solo lectura     | Nadie                |
     | HISTORIAL     | Vista post-aprobación            | Nadie                |

     La prop `puedeEscribir_sm_vc` es calculada internamente según:
       - Rol del usuario autenticado
       - Modo de vista activo (modoVista_sm_vc)
       - Estado de aprobación de la materia (estadoProgreso)

     ESTRATEGIA DE RESOLUCIÓN DE IDENTIDAD (Directiva 2026-04-07):
     ─────────────────────────────────────────────────────────────
     • ESTUDIANTE → siempre usa `auth.user.id_sm_vc` (su propio historial).
     • PROFESOR / ADMIN → usa la prop `estudianteId` del padre (router param).
     • Fallback → null (muestra estado de error).
     ══════════════════════════════════════════════════════════════ -->
<template>
  <div class="doc-chat-root_sm_vc">

    <!-- ── ESTADO: Cargando ── -->
    <div v-if="conversacionStore_sm_vc.cargando_sm_vc" class="loading-state_sm_vc">
      <q-spinner-dots color="teal-3" size="36px" />
      <span class="loading-label_sm_vc">Cargando trazabilidad...</span>
    </div>

    <!-- ── ESTADO: Error de carga ── -->
    <div v-else-if="conversacionStore_sm_vc.error_sm_vc" class="error-state_sm_vc">
      <q-icon name="error_outline" size="28px" color="negative" />
      <span>{{ conversacionStore_sm_vc.error_sm_vc }}</span>
    </div>

    <!-- ── ESTADO: Sin ID resuelto (ni props ni auth) ── -->
    <div v-else-if="!idEstudianteFinal_sm_vc" class="error-state_sm_vc">
      <q-icon name="person_off" size="28px" color="blue-grey-7" />
      <span>No se pudo determinar el estudiante. Refresca la página.</span>
    </div>

    <!-- ── CONTENIDO PRINCIPAL ── -->
    <template v-else>

      <!-- ── BANNER ADMIN: Modo Supervisor (solo lectura) ── -->
      <!-- Se muestra si el usuario es ADMIN/ADMINISTRADOR en modo CHAT activo -->
      <div
        v-if="esAdmin_sm_vc && props.modoVista_sm_vc === 'CHAT'"
        class="admin-banner_sm_vc"
        role="status"
        aria-live="polite"
      >
        <q-icon name="admin_panel_settings" size="16px" color="warning" />
        <span>
          <strong>Modo Supervisor</strong> — Estás visualizando como Administrador.
          Esta conversación es de <em>solo lectura</em>.
        </span>
      </div>

      <!-- Cabecera global (siempre visible) -->
      <ConvHeader
        :materia="materia_sm_vc"
        :estado-progreso="estadoProgreso"
        :total-mensajes="mensajesOrdenados_sm_vc.length" />

      <!-- ── MENSAJES: Vista unificada de burbujas de chat ── -->
      <!-- `readonly` en ConvMessages solo controla acciones sobre los mensajes
           (no los inputs). El control de inputs está en `puedeEscribir_sm_vc`. -->
      <ConvMessages
        :mensajes="mensajesOrdenados_sm_vc"
        :requisitos="requisitos_sm_vc"
        :readonly="!puedeEscribir_sm_vc" />

      <!-- ── PANEL DE ENTRADA: Solo si el usuario puede escribir ── -->
      <template v-if="puedeEscribir_sm_vc">
        <!-- Formulario del Estudiante -->
        <ConvFormEstudiante
          v-if="userRol_sm_vc === 'ESTUDIANTE'"
          :requisitos="requisitos_sm_vc"
          :materia-id="props.materiaId"
          @enviar="handleEnviarInforme_sm_vc" />

        <!-- Formulario del Profesor (solo en modo CHAT activo) -->
        <ConvFormProfesor
          v-else-if="userRol_sm_vc === 'PROFESOR'"
          :requisitos="requisitos_sm_vc"
          :materia-id="props.materiaId"
          :requisitos-aprobados-iniciales="requisitosAprobadosIniciales_sm_vc"
          @responder="handleResponderCorreccion_sm_vc"
          @guardar-requisitos="handleGuardarRequisitos_sm_vc" />
      </template>

      <!-- ── BANNER: Materia aprobada (sin inputs por estado) ── -->
      <!-- Se muestra cuando la materia está APROBADA y el usuario podría escribir
           normalmente (para clarificar por qué los inputs no aparecen). -->
      <div
        v-else-if="estadoProgreso === 'APROBADO' && !esAdmin_sm_vc"
        class="readonly-banner_sm_vc"
      >
        <q-icon name="check_circle" size="14px" color="teal-3" />
        <span>Materia aprobada — Historial de solo lectura.</span>
      </div>

      <!-- ── BANNER: Modo Trazabilidad (profesor visualiza sin inputs) ── -->
      <div
        v-else-if="props.modoVista_sm_vc === 'TRAZABILIDAD'"
        class="readonly-banner_sm_vc"
      >
        <q-icon name="history" size="14px" color="grey-5" />
        <span>Modo Trazabilidad — Vista de auditoría. Solo lectura.</span>
      </div>

      <!-- ── BANNER: Modo Historial (post-aprobación general) ── -->
      <div
        v-else-if="props.modoVista_sm_vc === 'HISTORIAL'"
        class="readonly-banner_sm_vc"
      >
        <q-icon name="inventory_2" size="14px" color="grey-5" />
        <span>Historial archivado — Esta conversación está cerrada.</span>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'
import { useConversacionStore_sm_vc } from 'src/stores/conversacionStore'

/* Componentes Atómicos */
import ConvHeader from './conv/ConvHeader.vue'
import ConvMessages from './conv/ConvMessages.vue'
import ConvFormEstudiante from './conv/ConvFormEstudiante.vue'
import ConvFormProfesor from './conv/ConvFormProfesor.vue'

/* ══════════════════════════════════════════════════════════════
 *  PROPS
 * ══════════════════════════════════════════════════════════════ */
const props = defineProps({
  /**
   * ID de la materia para filtrar el historial y resolver requisitos.
   * null = sin filtro de materia (historial global).
   */
  materiaId: { type: [String, Number], default: null },

  /**
   * ID del estudiante cuyo historial se va a cargar.
   * Solo es relevante para PROFESOR / ADMIN (el estudiante usa su propio ID del auth).
   */
  estudianteId: { type: [String, Number], default: null },

  /**
   * Estado de aprobación de la materia. Usado para determinar si el panel
   * de inputs debe mostrarse (e.g. 'APROBADO' → bloquea escritura).
   */
  estadoProgreso: { type: String, default: null },

  /**
   * NUEVO PROP CENTRAL (reemplaza `esTrazabilidad_sm_vc` + `readonly`).
   *
   * 'CHAT'        → Conversación activa. Inputs visibles según rol.
   * 'TRAZABILIDAD'→ Revisión de historia. Solo lectura para todos.
   * 'HISTORIAL'   → Vista archivada post-aprobación. Solo lectura.
   *
   * @required
   */
  modoVista_sm_vc: {
    type: String,
    default: 'CHAT',
    validator: (valor_sm_vc) => ['CHAT', 'TRAZABILIDAD', 'HISTORIAL'].includes(valor_sm_vc),
  },
})

const emit = defineEmits(['mensajeEnviado'])

/* ══════════════════════════════════════════════════════════════
 *  STORES
 * ══════════════════════════════════════════════════════════════ */
const pasantiasStore_sm_vc    = usePasantiasStore()
const auth_sm_vc              = useAuthStore()
const conversacionStore_sm_vc = useConversacionStore_sm_vc()

/* ══════════════════════════════════════════════════════════════
 *  COMPUTED: Identidad del usuario
 * ══════════════════════════════════════════════════════════════ */

/** Rol del usuario autenticado (normalizado a uppercase). */
const userRol_sm_vc = computed(() => auth_sm_vc.user_sm_vc?.rol_sm_vc ?? null)

/** true si el usuario es Administrador (cualquier variante del rol). */
const esAdmin_sm_vc = computed(() =>
  userRol_sm_vc.value === 'ADMIN' || userRol_sm_vc.value === 'ADMINISTRADOR'
)

/**
 * RESOLUCIÓN INFALIBLE DEL ID DEL ESTUDIANTE (Directiva 2026-04-07)
 * ─────────────────────────────────────────────────────────────────
 * Prioridad:
 *   1. ESTUDIANTE → ID del auth store (evita race conditions con props asíncronas).
 *   2. PROFESOR / ADMIN → prop `estudianteId` del padre (route params).
 *   3. Fallback → null (el template muestra el estado de error vacío).
 */
const idEstudianteFinal_sm_vc = computed(() => {
  const rol_sm_vc = userRol_sm_vc.value

  if (rol_sm_vc === 'ESTUDIANTE') {
    // Estudiante: siempre su propio ID, sin importar la prop
    return auth_sm_vc.user_sm_vc?.id_sm_vc ?? null
  }

  if (rol_sm_vc === 'PROFESOR' || rol_sm_vc === 'ADMINISTRADOR' || rol_sm_vc === 'ADMIN') {
    // Profesor / Admin: la prop es la fuente de verdad (inyectada por la vista padre)
    return props.estudianteId ?? null
  }

  // Fallback contextual desconocido
  return props.estudianteId ?? auth_sm_vc.user_sm_vc?.id_sm_vc ?? null
})

/* ══════════════════════════════════════════════════════════════
 *  COMPUTED: Control de Escritura
 * ══════════════════════════════════════════════════════════════ */

/**
 * Determina si el usuario actual puede escribir en esta conversación.
 *
 * Reglas por rol:
 *   - ESTUDIANTE: puede escribir si el modo es CHAT y la materia NO está APROBADA.
 *   - PROFESOR:   puede escribir SOLO en modo CHAT y materia NO aprobada.
 *   - ADMIN:      nunca puede escribir (es observador). Banner visual indica esto.
 *
 * Esta computed reemplaza la antigua combinación de props `readonly` + `esTrazabilidad_sm_vc`.
 */
const puedeEscribir_sm_vc = computed(() => {
  const rol_sm_vc = userRol_sm_vc.value
  const esModoChat_sm_vc = props.modoVista_sm_vc === 'CHAT'
  const estaAprobada_sm_vc = props.estadoProgreso === 'APROBADO'

  // Administrador: siempre solo lectura, sin excepciones
  if (esAdmin_sm_vc.value) return false

  // Estudiante: puede escribir si está en modo CHAT y la materia no está aprobada
  if (rol_sm_vc === 'ESTUDIANTE') {
    return esModoChat_sm_vc && !estaAprobada_sm_vc
  }

  // Profesor: puede escribir SOLO en modo CHAT y materia no aprobada
  if (rol_sm_vc === 'PROFESOR') {
    return esModoChat_sm_vc && !estaAprobada_sm_vc
  }

  // Cualquier otro rol desconocido → sin permisos de escritura
  return false
})

/* ══════════════════════════════════════════════════════════════
 *  CARGA DE DATOS
 * ══════════════════════════════════════════════════════════════ */

/** Dispara la carga del historial cuando el ID y la materia están disponibles. */
const cargarDatos_sm_vc = () => {
  const id_sm_vc = idEstudianteFinal_sm_vc.value
  if (!id_sm_vc) return

  // Segmenta el historial por materia si se proporciona el ID.
  // Si materiaId es null → el backend devuelve el historial global completo.
  conversacionStore_sm_vc.obtenerConversacion_sm_vc(
    id_sm_vc,
    props.materiaId ?? null,
  )
}

onMounted(cargarDatos_sm_vc)

/** Recargar si el ID del estudiante cambia (profesor navega entre perfiles). */
watch(idEstudianteFinal_sm_vc, (nuevoId_sm_vc, viejoId_sm_vc) => {
  if (nuevoId_sm_vc && nuevoId_sm_vc !== viejoId_sm_vc) {
    conversacionStore_sm_vc.limpiarConversaciones_sm_vc()
    cargarDatos_sm_vc()
  }
})

/** Recargar si la materia cambia (profesor abre otra materia del mismo estudiante). */
watch(() => props.materiaId, (nuevaMateria_sm_vc, viejaMateria_sm_vc) => {
  if (String(nuevaMateria_sm_vc) !== String(viejaMateria_sm_vc)) {
    conversacionStore_sm_vc.limpiarConversaciones_sm_vc()
    cargarDatos_sm_vc()
  }
})

/* ══════════════════════════════════════════════════════════════
 *  COMPUTED: Datos derivados para los componentes hijos
 * ══════════════════════════════════════════════════════════════ */

/** Mensajes ordenados cronológicamente (el más antiguo primero). Frontend Safety Sort. */
const mensajesOrdenados_sm_vc = computed(() => {
  const lista_sm_vc = conversacionStore_sm_vc.conversaciones_sm_vc || []
  return [...lista_sm_vc].sort((a_sm_vc, b_sm_vc) => {
    const ta_sm_vc = new Date(a_sm_vc.fecha_creacion_sm_vc).getTime()
    const tb_sm_vc = new Date(b_sm_vc.fecha_creacion_sm_vc).getTime()
    return ta_sm_vc - tb_sm_vc
  })
})

/** Objeto completo de la materia activa (para el ConvHeader). */
const materia_sm_vc = computed(() =>
  props.materiaId
    ? pasantiasStore_sm_vc.getMateriaById(props.materiaId)
    : null
)

/** Requisitos de la materia activa (para los formularios de acción). */
const requisitos_sm_vc = computed(() =>
  materia_sm_vc.value?.requisitos ?? []
)

/**
 * IDs de los requisitos ya aprobados para este estudiante en esta materia.
 * Permite pre-marcar el formulario del profesor con los requisitos previamente aprobados.
 */
const requisitosAprobadosIniciales_sm_vc = computed(() => {
  if (!props.materiaId || !idEstudianteFinal_sm_vc.value) return []

  const prog_sm_vc = pasantiasStore_sm_vc.progreso_sm_vc.find(
    (p_sm_vc) =>
      String(p_sm_vc.estudiante_id_sm_vc) === String(idEstudianteFinal_sm_vc.value) &&
      String(p_sm_vc.materia_id_sm_vc)    === String(props.materiaId)
  )
  return (prog_sm_vc?.requisitos_aprobados_detalle_sm_vc ?? [])
    .map((d_sm_vc) => d_sm_vc.requisito_id_sm_vc)
})

/* ══════════════════════════════════════════════════════════════
 *  HANDLERS — Delegan la lógica al store de pasantías
 * ══════════════════════════════════════════════════════════════ */

const handleEnviarInforme_sm_vc = (payload_sm_vc) => {
  const msg_sm_vc = pasantiasStore_sm_vc.enviarInforme({
    materia_id_sm_vc: props.materiaId,
    ...payload_sm_vc
  })
  emit('mensajeEnviado', msg_sm_vc)
}

const handleResponderCorreccion_sm_vc = (payload_sm_vc) => {
  const msg_sm_vc = pasantiasStore_sm_vc.responderCorreccion({
    estudiante_id_sm_vc: idEstudianteFinal_sm_vc.value,
    materia_id_sm_vc: props.materiaId,
    ...payload_sm_vc
  })
  emit('mensajeEnviado', msg_sm_vc)
}

const handleGuardarRequisitos_sm_vc = (payload_sm_vc) => {
  const msg_sm_vc = pasantiasStore_sm_vc.aprobarRequisitosGranular({
    estudiante_id_sm_vc: idEstudianteFinal_sm_vc.value,
    materia_id_sm_vc: props.materiaId,
    requisitos_seleccionados_ids: payload_sm_vc.ids,
    nota_global_sm_dec: payload_sm_vc.nota_global,
    comentario_sm_vc: payload_sm_vc.comentario
  })
  if (msg_sm_vc) emit('mensajeEnviado', msg_sm_vc)
}
</script>

<style scoped>
/* ── Contenedor raíz ── */
.doc-chat-root_sm_vc {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: var(--sn-font-mono);
  width: 100%;
}

/* ── Estado de carga ── */
.loading-state_sm_vc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
  padding: 3rem 1.5rem;
}
.loading-label_sm_vc {
  font-size: .7rem;
  color: var(--sn-texto-apagado);
  letter-spacing: .08em;
  text-transform: uppercase;
  font-family: var(--sn-font-mono);
}

/* ── Estado de error (incluye "sin ID") ── */
.error-state_sm_vc {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1.25rem 1.5rem;
  background: rgba(220,38,38,.06);
  border: 1px solid rgba(220,38,38,.2);
  border-radius: 10px;
  margin: 1rem;
  font-size: .78rem;
  color: var(--q-negative);
}

/* ── Banner Administrador: Modo Supervisor ── */
.admin-banner_sm_vc {
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .65rem 1.25rem;
  background: rgba(255, 180, 0, .07);
  border-bottom: 1px solid rgba(255, 180, 0, .2);
  font-size: .7rem;
  color: #e8a000;
  font-family: var(--sn-font-sans);
  letter-spacing: .02em;
}
.admin-banner_sm_vc strong { font-weight: 700; }
.admin-banner_sm_vc em { font-style: normal; color: #ffd166; }

/* ── Banner de solo lectura (TRAZABILIDAD / HISTORIAL / APROBADO) ── */
.readonly-banner_sm_vc {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1.25rem;
  background: rgba(158,158,158,.04);
  border-top: 1px solid rgba(158,158,158,.12);
  font-size: .68rem;
  color: #616161;
  font-family: var(--sn-font-sans);
}
</style>