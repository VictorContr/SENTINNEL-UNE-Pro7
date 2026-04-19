<!-- ══════════════════════════════════════════════════════════════════
     ConversacionPage.vue (profesor) — Vista de conversación directa.
     Thin Page: delega todo el UI y la lógica al orquestador
     `DocumentConversacion` con modoVista_sm_vc='CHAT'.

     GESTIÓN DE MEMORIA (Sprint 2):
     ─────────────────────────────
     `onUnmounted` llama a `chatStore_sm_vc.salirDeSala_sm_vc()` para
     garantizar que al navegar fuera de esta página el socket sea
     desconectado y no queden listeners huérfanos en memoria.

     CICLO DE VIDA:
       1. onMounted  → cargar materias + progreso del estudiante en paralelo.
       2. Render     → DocumentConversacion con modo CHAT activo.
       3. onUnmounted→ salirDeSala_sm_vc() libera el socket WebSocket.
     ══════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page">
    <q-btn
      flat no-caps
      icon="arrow_back"
      label="Volver a Trazabilidad"
      color="grey-5"
      size="sm"
      class="q-mb-md back-btn"
      @click="router.push(`/profesor/estudiantes/${route.params.id_sm_vc}/trazabilidad`)"
    />

    <div class="page-header">
      <div class="page-title-row">
        <q-icon name="forum" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title">Conversación de Documentos</h1>
      </div>
      <p class="page-subtitle">
        Estudiante: <span class="code-tag">{{ route.params.id_sm_vc }}</span>
        · Materia: <span class="code-tag">{{ materiaId }}</span>
      </p>
    </div>

    <!-- Estado de carga mientras se inicializa el contexto académico -->
    <div v-if="cargandoContexto_sm_vc" class="loading-contexto_sm_vc">
      <q-spinner-dots color="teal-3" size="34px" />
      <span>Cargando contexto académico...</span>
    </div>

    <!-- Conversación: solo se monta cuando las materias y el progreso están disponibles -->
    <div v-else class="conv-card">
      <!--
        MODO CHAT: El profesor puede enviar correcciones y aprobar requisitos.
        puedeEscribir_sm_vc se calculará internamente en DocumentConversacion
        basado en: rol=PROFESOR + modoVista='CHAT' + estadoProgreso≠'APROBADO'.
      -->
      <DocumentConversacion
        :materia-id="materiaId"
        :estudiante-id="estudianteId"
        :modo-vista_sm_vc="'CHAT'"
        :estado-progreso="estadoActual"
        @mensajeEnviado="onMensajeEnviado"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import { useChatStore_sm_vc } from 'src/stores/chatStore_sm_vc'
import DocumentConversacion from 'src/components/shared/DocumentConversacion.vue'

const route  = useRoute()
const router = useRouter()
const $q     = useQuasar()
const store  = usePasantiasStore()

/* ── Store de Chat (WebSocket) ── */
const chatStore_sm_vc = useChatStore_sm_vc()

/* ── IDs resueltos desde los params del router ──
 * El profesor navega a: /profesor/estudiantes/:id_sm_vc/materia/:materia_id/conversacion
 */
const estudianteId = computed(() => route.params.id_sm_vc)
const materiaId    = computed(() => route.params.materia_id)

/* ── Estado de carga del contexto académico ──
 * Permanece true hasta que onMounted garantice que materias y progreso
 * están en el store, evitando la condición de carrera en DocumentConversacion.
 */
const cargandoContexto_sm_vc = ref(true)

/* ══════════════════════════════════════════════════════════════
 *  CICLO DE VIDA
 * ══════════════════════════════════════════════════════════════ */

/**
 * Carga del contexto mínimo necesario para que DocumentConversacion
 * pueda resolver la materia por ID y el historial por (estudianteId, materiaId).
 * Se ejecutan en paralelo para minimizar el tiempo de espera.
 *
 * Después de garantizar el contexto, se establece la conexión WebSocket
 * y se une a la sala de conversación correspondiente.
 */
onMounted(async () => {
  if (estudianteId.value) {
    await Promise.all([
      // Garantiza que el catálogo de materias esté disponible (getMateriaById safe)
      store.ensure_materias_cargadas_sm_vc(),
      // Carga el progreso del estudiante (estado de aprobación, requisitos)
      store.fetch_progreso_estudiante_sm_vc(estudianteId.value),
    ])
  }

  cargandoContexto_sm_vc.value = false

  // Establecer conexión WebSocket y unirse a la sala DESPUÉS de que el contexto esté listo
  // Solo conectamos si tenemos los datos necesarios para identificar la sala
  if (estudianteId.value) {
    chatStore_sm_vc.conectar_sm_vc()
    chatStore_sm_vc.unirASala_sm_vc(estudianteId.value, materiaId.value)
  }
})

/**
 * Al desmontar esta página (navegar a otra ruta), se abandona la sala de chat
 * para no recibir mensajes ajenos, pero se MANTIENE el socket vivo a nivel
 * de aplicación para seguir recibiendo notificaciones globales.
 */
onUnmounted(() => {
  chatStore_sm_vc.salirDeSalaActual_sm_vc()
})

/* ══════════════════════════════════════════════════════════════
 *  COMPUTED
 * ══════════════════════════════════════════════════════════════ */

/**
 * Estado actual de aprobación de la materia para este estudiante.
 * SAFE: Si no se encuentra, devuelve 'PENDIENTE' (no bloquea el UI).
 */
const estadoActual = computed(() => {
  const prog_sm_vc = store.progreso_sm_vc.find(
    (p_sm_vc) =>
      String(p_sm_vc.estudiante_id_sm_vc) === String(estudianteId.value) &&
      String(p_sm_vc.materia_id_sm_vc)    === String(materiaId.value)
  )
  return prog_sm_vc?.estado_aprobacion_sm_vc ?? 'PENDIENTE'
})

/* ══════════════════════════════════════════════════════════════
 *  HANDLERS
 * ══════════════════════════════════════════════════════════════ */

function onMensajeEnviado() {
  $q.notify({
    type: 'positive',
    message: 'Corrección enviada.',
    icon: 'check_circle',
    position: 'top-right',
    timeout: 2500,
  })
}
</script>

<style scoped>
.sntnl-page { padding: 1.75rem 2rem; position: relative; z-index: 1; }
.back-btn { font-size: 0.72rem !important; }
.page-header { margin-bottom: 1.25rem; }
.page-title-row { display: flex; align-items: center; margin-bottom: 0.25rem; }
.page-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--sn-texto-principal);
  letter-spacing: 0.06em;
  margin: 0;
  font-family: var(--sn-font-mono);
}
.page-subtitle { font-size: 0.72rem; color: var(--sn-texto-terciario); margin: 0; }
.code-tag {
  background: var(--sn-surface-alpha);
  color: var(--sn-acento-sec);
  padding: 1px 5px;
  border-radius: var(--sn-radius-sm);
  font-size: 0.68rem;
  font-family: var(--sn-font-mono);
}
.conv-card {
  background: var(--sn-fondo-panel);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-radius-xl);
  max-width: 780px;
}

/* ── Estado de carga del contexto académico ── */
.loading-contexto_sm_vc {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 1.5rem;
  font-size: 0.8rem;
  color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono);
}
</style>
