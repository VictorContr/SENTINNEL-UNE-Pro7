<template>
  <div class="doc-chat-root">

    <!-- ── Encabezado de la conversación ── -->
    <div class="chat-header">
      <div class="chat-materia-info">
        <div class="materia-icon-wrap">
          <q-icon name="book_2" size="20px" color="teal-3" />
        </div>
        <div>
          <p class="materia-nombre">{{ materia?.nombre_sm_vc }}</p>
          <p class="materia-id">{{ materia?.id_sm_vc }} · {{ mensajes.length }} documentos intercambiados</p>
        </div>
      </div>

      <div v-if="estadoProgreso" class="estado-badge-wrap">
        <div
          class="estado-badge"
          :style="{
            color: ESTADO_APROBACION[estadoProgreso]?.color,
            background: ESTADO_APROBACION[estadoProgreso]?.bg
          }"
        >
          <q-icon :name="ESTADO_APROBACION[estadoProgreso]?.icon" size="13px" />
          {{ estadoProgreso }}
        </div>
      </div>
    </div>

    <!-- ── Regla de flujo estricto ── -->
    <div class="flow-rule-bar">
      <div class="flow-step-pill">
        <q-icon name="person" size="12px" color="light-blue-4" />
        <span>Estudiante envía informe</span>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step-pill">
        <q-icon name="school" size="12px" color="amber-4" />
        <span>Profesor responde corrección</span>
      </div>
      <div class="flow-arrow">→</div>
      <div class="flow-step-pill flow-step-pill--end">
        <q-icon name="check_circle" size="12px" color="teal-3" />
        <span>Aprobación</span>
      </div>
    </div>

    <!-- ── Mensajes (timeline de tarjetas) ── -->
    <div class="messages-container" ref="messagesContainerRef">
      <div v-if="mensajes.length === 0" class="empty-chat">
        <q-icon name="chat_bubble_outline" size="36px" color="blue-grey-8" />
        <p>Aún no hay documentos en esta conversación.</p>
        <p v-if="!readonly" class="empty-hint">El estudiante debe enviar la primera versión de su informe.</p>
      </div>

      <transition-group name="msg-slide" tag="div" class="messages-list">
        <div
          v-for="(msg, index) in mensajes"
          :key="msg.id_sm_vc"
          class="msg-row"
          :class="msg.remitente_rol_sm_vc === 'ESTUDIANTE' ? 'msg-row--left' : 'msg-row--right'"
        >
          <!-- Conector de línea de tiempo -->
          <div v-if="index < mensajes.length - 1" class="timeline-connector" />

          <!-- Rol label -->
          <div class="msg-role-label">
            <div class="role-avatar" :class="`role-avatar--${msg.remitente_rol_sm_vc.toLowerCase()}`">
              <q-icon
                :name="msg.remitente_rol_sm_vc === 'ESTUDIANTE' ? 'person' : 'school'"
                size="12px"
              />
            </div>
            <span class="role-text">{{ msg.remitente_rol_sm_vc }}</span>
            <span class="msg-timestamp">{{ formatDateTime(msg.fecha_sm_vc) }}</span>
            <div v-if="msg.requisito_id_sm_vc" class="req-tag">
              <q-icon name="assignment" size="11px" />
              {{ getRequisitoNombre(msg.requisito_id_sm_vc) }}
            </div>
          </div>

          <!-- Tarjeta de archivo principal -->
          <div class="file-card" :class="`file-card--${msg.tipo_sm_vc.toLowerCase()}`">
            <!-- Ícono lateral de tipo -->
            <div class="file-type-strip" />

            <div class="file-icon-col">
              <div class="file-icon-bg">
                <q-icon
                  :name="msg.tipo_sm_vc === 'INFORME' ? 'description' : 'rate_review'"
                  size="22px"
                  :color="msg.tipo_sm_vc === 'INFORME' ? 'light-blue-4' : 'amber-4'"
                />
              </div>
            </div>

            <div class="file-body">
              <div class="file-name-row">
                <span class="file-name">{{ msg.archivo_nombre_sm_vc }}</span>
                <div class="file-version-chip">{{ msg.version_sm_vc }}</div>
              </div>

              <div class="file-meta-row">
                <span class="file-type-label" :class="`tipo-label--${msg.tipo_sm_vc.toLowerCase()}`">
                  {{ msg.tipo_sm_vc }}
                </span>
                <span class="file-size">{{ msg.tamanio_sm_vc }}</span>
              </div>

              <p v-if="msg.comentario_sm_vc" class="file-comment">
                "{{ msg.comentario_sm_vc }}"
              </p>
            </div>

            <div class="file-actions-col">
              <q-btn flat round dense icon="download" color="teal-3" size="sm">
                <q-tooltip class="bg-dark text-caption">Descargar</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="open_in_new" color="grey-6" size="sm">
                <q-tooltip class="bg-dark text-caption">Previsualizar</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Evaluación resultado (solo si es corrección con estado) -->
          <div
            v-if="msg.estado_evaluacion_sm_vc"
            class="eval-chip"
            :class="`eval-chip--${msg.estado_evaluacion_sm_vc.toLowerCase()}`"
          >
            <q-icon
              :name="{
                APROBADO: 'check_circle',
                REPROBADO: 'cancel',
                OBSERVACIONES: 'warning'
              }[msg.estado_evaluacion_sm_vc]"
              size="14px"
            />
            <span>Resultado: {{ msg.estado_evaluacion_sm_vc }}</span>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- ══════════════════════════════════════
         PANEL DE ACCIÓN (solo si no readonly)
         ══════════════════════════════════════ -->
    <div v-if="!readonly" class="action-panel">
      <div class="action-panel-header">
        <q-icon
          :name="userRol === 'ESTUDIANTE' ? 'upload_file' : 'rate_review'"
          size="16px"
          color="teal-3"
        />
        <span>{{ userRol === 'ESTUDIANTE' ? 'Enviar nueva versión del informe' : 'Responder con corrección / evaluación' }}</span>
      </div>

      <!-- ── Formulario ESTUDIANTE ── -->
      <template v-if="userRol === 'ESTUDIANTE'">
        <div class="action-form">
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Requisito / Capítulo <span class="req-mark">*</span></label>
              <q-select
                v-model="formEstudiante.requisito_id_sm_vc"
                :options="requisitosOptions"
                option-value="id_sm_vc"
                option-label="nombre_sm_vc"
                emit-value map-options
                dense outlined dark color="teal-3"
                class="sntnl-select"
                label="Seleccionar requisito"
              />
            </div>
            <div class="field-group">
              <label class="field-label">Versión</label>
              <q-input v-model="formEstudiante.version_sm_vc" dense outlined dark color="teal-3" class="sntnl-input" placeholder="ej: v1.0" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Archivo (simulado)</label>
            <div class="mini-upload" @click="triggerFileInput">
              <q-icon name="attach_file" size="16px" color="teal-3" />
              <span>{{ formEstudiante.archivo_nombre_sm_vc || 'Seleccionar archivo .pdf' }}</span>
              <input ref="fileInputRef" type="file" accept=".pdf,.docx" hidden @change="handleFileSelect" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Comentario (opcional)</label>
            <q-input v-model="formEstudiante.comentario_sm_vc" dense outlined dark color="teal-3" class="sntnl-input" placeholder="Describe los cambios realizados…" type="textarea" rows="2" autogrow />
          </div>

          <q-btn
            unelevated no-caps
            label="Enviar Informe"
            icon="send"
            class="send-btn"
            :disable="!formEstudiante.requisito_id_sm_vc || !formEstudiante.archivo_nombre_sm_vc"
            @click="emitEnviarInforme"
          />
        </div>
      </template>

      <!-- ── Formulario PROFESOR ── -->
      <template v-if="userRol === 'PROFESOR'">
        <div class="action-form">
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Estado de Evaluación <span class="req-mark">*</span></label>
              <div class="eval-options">
                <button
                  v-for="opt in evalOptions"
                  :key="opt.value"
                  class="eval-option"
                  :class="{ 'eval-option--selected': formProfesor.estado_evaluacion_sm_vc === opt.value }"
                  :style="formProfesor.estado_evaluacion_sm_vc === opt.value ? { borderColor: opt.color, color: opt.color } : {}"
                  @click="formProfesor.estado_evaluacion_sm_vc = opt.value"
                >
                  <q-icon :name="opt.icon" size="14px" />
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div v-if="formProfesor.estado_evaluacion_sm_vc === 'APROBADO'" class="field-group">
              <label class="field-label">Nota (sobre 20)</label>
              <q-input v-model.number="formProfesor.nota_sm_dec" type="number" min="0" max="20" step="0.5" dense outlined dark color="teal-3" class="sntnl-input nota-input" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Archivo de corrección (simulado)</label>
            <div class="mini-upload" @click="triggerFileInputProf">
              <q-icon name="attach_file" size="16px" color="amber-4" />
              <span>{{ formProfesor.archivo_nombre_sm_vc || 'Seleccionar archivo .pdf' }}</span>
              <input ref="fileInputProfRef" type="file" accept=".pdf,.docx" hidden @change="handleFileSelectProf" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Observaciones <span class="req-mark">*</span></label>
            <q-input
              v-model="formProfesor.comentario_sm_vc"
              dense outlined dark color="teal-3"
              class="sntnl-input"
              placeholder="Describe los puntos a corregir o los criterios de aprobación…"
              type="textarea"
              rows="3"
              autogrow
            />
          </div>

          <q-btn
            unelevated no-caps
            label="Enviar Corrección"
            icon="send"
            class="send-btn send-btn--profesor"
            :disable="!formProfesor.estado_evaluacion_sm_vc || !formProfesor.comentario_sm_vc"
            @click="emitResponderCorreccion"
          />
        </div>
      </template>
    </div>

    <!-- Readonly banner -->
    <div v-if="readonly" class="readonly-banner">
      <q-icon name="lock" size="14px" color="amber-4" />
      <span>Historial de solo lectura — Materia aprobada. No se pueden enviar nuevos documentos.</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { usePasantiasStore, ESTADO_APROBACION } from 'src/stores/pasantiasStore'
import { useAuthStore } from 'src/stores/authStore'

/* ── Props ── */
const props = defineProps({
  materiaId: { type: String, required: true },
  estudianteId: { type: String, required: true },
  readonly: { type: Boolean, default: false },
  estadoProgreso: { type: String, default: null }
})

const emit = defineEmits(['mensajeEnviado'])

/* ── Stores ── */
const pasantiasStore = usePasantiasStore()
const auth = useAuthStore()

/* ── Derived ── */
const userRol = computed(() => auth.user?.rol_sm_vc ?? null)

const materia = computed(() =>
  pasantiasStore.getMateriaById(props.materiaId)
)

const mensajes = computed(() =>
  pasantiasStore.getConversacion(props.estudianteId, props.materiaId)
)

const requisitosOptions = computed(() =>
  materia.value?.requisitos ?? []
)

function getRequisitoNombre(id) {
  return materia.value?.requisitos.find((r) => r.id_sm_vc === id)?.nombre_sm_vc ?? id
}

/* ── Scroll to bottom on new messages ── */
const messagesContainerRef = ref(null)
watch(
  () => mensajes.value.length,
  async () => {
    await nextTick()
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
    }
  }
)

/* ── Eval options para el profesor ── */
const evalOptions = [
  { value: 'OBSERVACIONES', label: 'Observaciones', icon: 'warning',      color: '#f0a500' },
  { value: 'APROBADO',      label: 'Aprobado',      icon: 'check_circle',  color: '#6fffe9' },
  { value: 'REPROBADO',     label: 'Reprobado',     icon: 'cancel',        color: '#ff8fa3' }
]

/* ── Form: Estudiante ── */
const fileInputRef = ref(null)
const formEstudiante = ref({
  requisito_id_sm_vc: null,
  version_sm_vc: 'v1.0',
  archivo_nombre_sm_vc: '',
  comentario_sm_vc: ''
})

function triggerFileInput() { fileInputRef.value?.click() }
function handleFileSelect(e) {
  formEstudiante.value.archivo_nombre_sm_vc = e.target.files[0]?.name ?? ''
}

function emitEnviarInforme() {
  const msg = pasantiasStore.enviarInforme({
    materia_id_sm_vc: props.materiaId,
    ...formEstudiante.value
  })
  emit('mensajeEnviado', msg)
  formEstudiante.value = { requisito_id_sm_vc: null, version_sm_vc: 'v1.0', archivo_nombre_sm_vc: '', comentario_sm_vc: '' }
}

/* ── Form: Profesor ── */
const fileInputProfRef = ref(null)
const formProfesor = ref({
  estado_evaluacion_sm_vc: null,
  nota_sm_dec: null,
  archivo_nombre_sm_vc: '',
  comentario_sm_vc: ''
})

function triggerFileInputProf() { fileInputProfRef.value?.click() }
function handleFileSelectProf(e) {
  formProfesor.value.archivo_nombre_sm_vc = e.target.files[0]?.name ?? ''
}

function emitResponderCorreccion() {
  const msg = pasantiasStore.responderCorreccion({
    estudiante_id_sm_vc: props.estudianteId,
    materia_id_sm_vc: props.materiaId,
    ...formProfesor.value
  })
  emit('mensajeEnviado', msg)
  formProfesor.value = { estado_evaluacion_sm_vc: null, nota_sm_dec: null, archivo_nombre_sm_vc: '', comentario_sm_vc: '' }
}

/* ── Utils ── */
function formatDateTime(iso) {
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
/* ── Root ── */
.doc-chat-root {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: 'IBM Plex Mono', monospace;
}

/* ── Chat Header ── */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(111, 255, 233, 0.08);
  gap: 1rem;
  flex-wrap: wrap;
}

.chat-materia-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.materia-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(111, 255, 233, 0.08);
  border: 1px solid rgba(111, 255, 233, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.materia-nombre {
  font-size: 0.85rem;
  font-weight: 600;
  color: #c8dde8;
  margin: 0 0 2px;
  letter-spacing: 0.03em;
}

.materia-id {
  font-size: 0.6rem;
  color: #2e4a6a;
  margin: 0;
  letter-spacing: 0.06em;
}

.estado-badge-wrap { flex-shrink: 0; }

.estado-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid currentColor;
}

/* ── Flow rule bar ── */
.flow-rule-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  flex-wrap: wrap;
}

.flow-step-pill {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  color: #3a5a78;
  background: rgba(255, 255, 255, 0.03);
  padding: 2px 8px;
  border-radius: 4px;
}

.flow-step-pill--end { color: #5bc0be; }

.flow-arrow {
  font-size: 0.65rem;
  color: #1e3050;
}

/* ── Messages Container ── */
.messages-container {
  padding: 1.25rem;
  max-height: 420px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(111, 255, 233, 0.1) transparent;
}

.messages-container::-webkit-scrollbar { width: 4px; }
.messages-container::-webkit-scrollbar-thumb { background: rgba(111, 255, 233, 0.12); border-radius: 2px; }

.messages-list { display: flex; flex-direction: column; gap: 1.25rem; }

/* Empty chat */
.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem;
  text-align: center;
}

.empty-chat p { font-size: 0.75rem; color: #2e4a6a; margin: 0; font-family: 'IBM Plex Sans', sans-serif; }
.empty-hint { color: #1e3050 !important; font-size: 0.68rem !important; }

/* ── Message Row ── */
.msg-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
}

.msg-row--left  { align-items: flex-start; }
.msg-row--right { align-items: flex-end; }

/* Timeline connector */
.timeline-connector {
  position: absolute;
  left: 12px;
  top: 100%;
  width: 1px;
  height: 1.25rem;
  background: linear-gradient(to bottom, rgba(111, 255, 233, 0.15), transparent);
}
.msg-row--right .timeline-connector { left: auto; right: 12px; }

/* Role label */
.msg-role-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.role-avatar {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-avatar--estudiante { background: rgba(126, 200, 227, 0.15); color: #7ec8e3; }
.role-avatar--profesor   { background: rgba(240, 165, 0, 0.12);   color: #f0a500; }

.role-text {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3a5a78;
}

.msg-timestamp {
  font-size: 0.55rem;
  color: #1e3050;
  margin-left: 0.25rem;
}

.req-tag {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.55rem;
  color: #5bc0be;
  background: rgba(91, 192, 190, 0.08);
  padding: 1px 6px;
  border-radius: 3px;
}

/* ── File Card ── */
.file-card {
  display: flex;
  align-items: flex-start;
  gap: 0;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(111, 255, 233, 0.07);
  border-radius: 10px;
  overflow: hidden;
  min-width: 280px;
  max-width: 460px;
  transition: border-color 0.15s;
}

.file-card:hover { border-color: rgba(111, 255, 233, 0.15); }

.file-card--informe   { border-color: rgba(126, 200, 227, 0.1); }
.file-card--correccion { border-color: rgba(240, 165, 0, 0.1); }

.file-type-strip {
  width: 3px;
  align-self: stretch;
  flex-shrink: 0;
}

.file-card--informe   .file-type-strip { background: #7ec8e3; }
.file-card--correccion .file-type-strip { background: #f0a500; }

.file-icon-col {
  padding: 0.875rem 0.75rem 0.875rem 0.875rem;
  flex-shrink: 0;
}

.file-icon-bg {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-card--informe   .file-icon-bg { background: rgba(126, 200, 227, 0.1); }
.file-card--correccion .file-icon-bg { background: rgba(240, 165, 0, 0.08); }

.file-body { flex: 1; padding: 0.875rem 0; }

.file-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.file-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #c8dde8;
  word-break: break-word;
}

.file-version-chip {
  font-size: 0.55rem;
  font-weight: 700;
  color: #3a5a78;
  background: rgba(255, 255, 255, 0.05);
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.file-meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 6px;
}

.file-type-label {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tipo-label--informe   { color: #7ec8e3; }
.tipo-label--correccion { color: #f0a500; }

.file-size { font-size: 0.6rem; color: #2e4a6a; }

.file-comment {
  font-size: 0.68rem;
  color: #5a7fa8;
  line-height: 1.5;
  margin: 0;
  font-family: 'IBM Plex Sans', sans-serif;
  font-style: italic;
}

.file-actions-col {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.5rem 0.5rem 0;
  gap: 2px;
}

/* ── Eval chip ── */
.eval-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 4px;
  align-self: flex-end;
}

.msg-row--left .eval-chip { align-self: flex-start; }

.eval-chip--aprobado     { background: rgba(111, 255, 233, 0.1); color: #6fffe9; }
.eval-chip--reprobado    { background: rgba(255, 143, 163, 0.1); color: #ff8fa3; }
.eval-chip--observaciones { background: rgba(240, 165, 0, 0.1);  color: #f0a500; }

/* ── Transitions ── */
.msg-slide-enter-active { transition: all 0.25s ease; }
.msg-slide-enter-from   { opacity: 0; transform: translateY(10px); }

/* ══════════════════════════════════════
   ACTION PANEL
   ══════════════════════════════════════ */
.action-panel {
  border-top: 1px solid rgba(111, 255, 233, 0.08);
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.15);
}

.action-panel-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  color: #5bc0be;
  letter-spacing: 0.06em;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.action-form { display: flex; flex-direction: column; gap: 0.875rem; }

.form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: flex-end;
}

.field-group { display: flex; flex-direction: column; gap: 0.3rem; }

.field-label {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3a5a78;
  font-weight: 500;
}

.req-mark { color: #ff8fa3; }

:deep(.sntnl-select .q-field__control),
:deep(.sntnl-input .q-field__control) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(91, 192, 190, 0.18) !important;
  border-radius: 6px !important;
  transition: border-color 0.15s;
}

:deep(.sntnl-select .q-field__control:hover),
:deep(.sntnl-input .q-field__control:hover) {
  border-color: rgba(111, 255, 233, 0.35) !important;
}

:deep(.sntnl-select .q-field__native),
:deep(.sntnl-input .q-field__native) {
  color: #c8dde8 !important;
  font-size: 0.78rem !important;
  font-family: 'IBM Plex Mono', monospace !important;
}

.nota-input { max-width: 100px; }

/* Mini upload */
.mini-upload {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(111, 255, 233, 0.18);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.72rem;
  color: #4a6a88;
  transition: all 0.15s;
}

.mini-upload:hover {
  border-color: rgba(111, 255, 233, 0.4);
  color: #6fffe9;
}

/* Eval options grid */
.eval-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.eval-option {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 0.65rem;
  color: #3a5a78;
  cursor: pointer;
  transition: all 0.15s;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.05em;
}

.eval-option:hover { background: rgba(255, 255, 255, 0.05); }
.eval-option--selected { font-weight: 700; }

/* Send buttons */
.send-btn {
  background: rgba(111, 255, 233, 0.12) !important;
  color: #6fffe9 !important;
  border: 1px solid rgba(111, 255, 233, 0.25) !important;
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
  letter-spacing: 0.05em !important;
  align-self: flex-start;
}

.send-btn--profesor {
  background: rgba(240, 165, 0, 0.1) !important;
  color: #f0a500 !important;
  border-color: rgba(240, 165, 0, 0.25) !important;
}

/* Readonly banner */
.readonly-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(240, 165, 0, 0.04);
  border-top: 1px solid rgba(240, 165, 0, 0.12);
  font-size: 0.68rem;
  color: #7a5a1a;
  font-family: 'IBM Plex Sans', sans-serif;
}
</style>
