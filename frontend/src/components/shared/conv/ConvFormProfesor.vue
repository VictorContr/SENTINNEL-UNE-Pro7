<!-- ══════════════════════════════════════════════════════════════════
     ConvFormProfesor.vue — Formulario de corrección y evaluación.
     Incluye el modal de aprobación granular de requisitos. Emite
     'responder' y 'guardarRequisitos'; no toca el store directamente.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="action-panel_sm_vc">
    <div class="panel-header_sm_vc">
      <q-icon name="rate_review" size="16px" color="grey-5" />
      <span>Responder con corrección / evaluación</span>
    </div>

    <div class="action-form_sm_vc">
      <!-- Botón evaluación granular -->
      <div style="display:flex; justify-content:flex-end;">
        <q-btn outline color="teal-3" icon="checklist"
          label="Evaluar por Requisitos" no-caps size="sm"
          @click="mostrarModal_sm_vc = true" />
      </div>

      <!-- Estado de evaluación -->
      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">
          Estado de Evaluación <span class="req-mark_sm_vc">*</span>
        </label>
        <div class="eval-options_sm_vc">
          <button
            v-for="opt in evalOpciones_sm_vc" :key="opt.value"
            class="eval-option_sm_vc"
            :class="{ 'eval-option--selected_sm_vc': form_sm_vc.estado_evaluacion_sm_vc === opt.value }"
            :style="form_sm_vc.estado_evaluacion_sm_vc === opt.value
              ? { borderColor: opt.color, color: opt.color } : {}"
            @click="form_sm_vc.estado_evaluacion_sm_vc = opt.value">
            <q-icon :name="opt.icon" size="14px" />{{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Nota (solo si aprobado) -->
      <div v-if="form_sm_vc.estado_evaluacion_sm_vc === 'APROBADO'" class="field-group_sm_vc">
        <label class="field-label_sm_vc">Nota (sobre 20)</label>
        <q-input
          v-model.number="form_sm_vc.nota_sm_dec"
          type="number" :min="0" :max="20" :step="0.5"
          dense outlined color="teal-3"
          class="sntnl-input_sm_vc nota-input_sm_vc" />
      </div>

      <!-- Archivo corrección -->
      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">Archivo de corrección (simulado)</label>
        <div class="mini-upload_sm_vc" @click="fileInputProf_sm_vc?.click()">
          <q-icon name="attach_file" size="16px" color="grey-5" />
          <span>{{ form_sm_vc.archivo_nombre_sm_vc || 'Seleccionar archivo .pdf' }}</span>
          <input ref="fileInputProf_sm_vc" type="file" accept=".pdf,.docx" hidden
            @change="handleFileProf_sm_vc" />
        </div>
      </div>

      <!-- Observaciones -->
      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">
          Observaciones <span class="req-mark_sm_vc">*</span>
        </label>
        <q-input
          v-model="form_sm_vc.comentario_sm_vc"
          dense outlined color="teal-3"
          class="sntnl-input_sm_vc"
          placeholder="Describe los puntos a corregir…"
          type="textarea" :rows="3" autogrow />
      </div>

      <q-btn
        unelevated no-caps
        label="Enviar Corrección" icon="send"
        class="send-btn_sm_vc send-btn--profesor_sm_vc"
        :disable="!form_sm_vc.estado_evaluacion_sm_vc || !form_sm_vc.comentario_sm_vc"
        @click="emitirRespuesta_sm_vc" />
    </div>
  </div>

  <!-- ── Modal: Evaluación granular de requisitos ── -->
  <q-dialog v-model="mostrarModal_sm_vc">
    <q-card class="modal-card_sm_vc">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-subtitle1 text-teal-3 text-weight-bold"
          style="display:flex; align-items:center;">
          <q-icon name="checklist" size="sm" class="q-mr-sm" />
          Evaluar Requisitos (por partes)
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="grey-5" v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-sm text-caption text-grey-5">
          Activa los requisitos que ya cumplen los criterios de evaluación.
        </div>
        <q-list dark bordered separator class="rounded-borders">
          <q-item v-for="req in requisitos" :key="req.id_sm_vc" tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox
                v-model="requisitosSeleccionados_sm_vc"
                :val="req.id_sm_vc" color="teal-3" />
            </q-item-section>
            <q-item-section>
              <q-item-label style="font-size:.8rem">{{ req.nombre_sm_vc }}</q-item-label>
              <q-item-label caption class="text-grey-5" style="font-size:.65rem">
                ID: {{ req.id_sm_vc }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div v-if="requisitosSeleccionados_sm_vc.includes(req.id_sm_vc)"
                class="text-teal-3" style="font-size:.65rem; display:flex; align-items:center;">
                <q-icon name="event_available" class="q-mr-xs" size="10px" />
                Hoy
              </div>
              <div v-else class="text-grey-7" style="font-size:.65rem">Pendiente</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn outline label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn unelevated label="Guardar Evaluaciones" color="teal-3" no-caps
          @click="emitirRequisitos_sm_vc" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  requisitos: { type: Array, default: () => [] },
  requisitosAprobadosIniciales: { type: Array, default: () => [] }
})

const emit = defineEmits(['responder', 'guardarRequisitos'])

const mostrarModal_sm_vc = ref(false)
const fileInputProf_sm_vc = ref(null)

const form_sm_vc = ref({
  estado_evaluacion_sm_vc: null,
  nota_sm_dec: null,
  archivo_nombre_sm_vc: '',
  comentario_sm_vc: ''
})

const evalOpciones_sm_vc = [
  { value: 'OBSERVACIONES', label: 'Observaciones', icon: 'warning', color: '#f0a500' },
  { value: 'APROBADO', label: 'Aprobar Materia', icon: 'done_all', color: '#6fffe9' },
  { value: 'REPROBADO', label: 'Reprobado', icon: 'cancel', color: '#ff8fa3' }
]

const requisitosSeleccionados_sm_vc = ref([])

watch(mostrarModal_sm_vc, (val_sm_vc) => {
  if (val_sm_vc) {
    requisitosSeleccionados_sm_vc.value = [...props.requisitosAprobadosIniciales]
  }
})

const handleFileProf_sm_vc = (e_sm_vc) => {
  form_sm_vc.value.archivo_nombre_sm_vc = e_sm_vc.target.files[0]?.name ?? ''
}

const emitirRespuesta_sm_vc = () => {
  emit('responder', { ...form_sm_vc.value })
  form_sm_vc.value = {
    estado_evaluacion_sm_vc: null,
    nota_sm_dec: null,
    archivo_nombre_sm_vc: '',
    comentario_sm_vc: ''
  }
}

const emitirRequisitos_sm_vc = () => {
  emit('guardarRequisitos', [...requisitosSeleccionados_sm_vc.value])
  mostrarModal_sm_vc.value = false
}
</script>

<style scoped>
.action-panel_sm_vc {
  border-top: 1px solid var(--sn-borde);
  padding: 1.25rem;
  background: var(--sn-fondo-elevado);
}
.panel-header_sm_vc {
  display: flex; align-items: center; gap: .4rem;
  font-size: .68rem; color: var(--sn-texto-terciario);
  letter-spacing: .06em; margin-bottom: 1rem; text-transform: uppercase;
}
.action-form_sm_vc { display: flex; flex-direction: column; gap: .875rem; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: .3rem; }
.field-label_sm_vc {
  font-size: .6rem; letter-spacing: .12em; text-transform: uppercase;
  color: var(--sn-texto-terciario); font-weight: 500;
}
.req-mark_sm_vc { color: var(--sn-error-claro); }
:deep(.sntnl-input_sm_vc .q-field__control) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important; border-radius: 6px !important;
}
:deep(.sntnl-input_sm_vc .q-field__native) {
  color: var(--sn-texto-principal) !important;
  font-size: .78rem !important; font-family: var(--sn-font-mono) !important;
}
.nota-input_sm_vc { max-width: 100px; }
.mini-upload_sm_vc {
  display: flex; align-items: center; gap: .5rem; padding: .5rem .75rem;
  background: var(--sn-surface-alpha);
  border: 1px dashed rgba(158,158,158,.25); border-radius: 6px;
  cursor: pointer; font-size: .72rem; color: var(--sn-texto-secundario); transition: all .15s;
}
.mini-upload_sm_vc:hover { border-color: rgba(158,158,158,.45); }
.eval-options_sm_vc { display: flex; gap: .5rem; flex-wrap: wrap; }
.eval-option_sm_vc {
  display: flex; align-items: center; gap: .3rem;
  padding: .3rem .75rem;
  background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde);
  border-radius: 6px; font-size: .65rem; color: var(--sn-texto-terciario);
  cursor: pointer; transition: all .15s; font-family: var(--sn-font-mono);
}
.eval-option_sm_vc:hover { background: rgba(255,255,255,.05); }
.eval-option--selected_sm_vc { font-weight: 700; }
.send-btn_sm_vc {
  background: var(--sn-surface-active) !important;
  color: var(--sn-primario) !important;
  border: 1px solid rgba(111,255,233,.25) !important;
  font-size: .72rem !important; font-weight: 600 !important;
  border-radius: 6px !important; align-self: flex-start;
}
.send-btn--profesor_sm_vc {
  background: rgba(158,158,158,.1) !important;
  color: #9e9e9e !important; border-color: rgba(158,158,158,.25) !important;
}
.modal-card_sm_vc {
  background: var(--sn-fondo-panel) !important;
  border: 1px solid var(--sn-borde-hover) !important;
  border-radius: 12px !important; min-width: 450px;
  font-family: var(--sn-font-mono);
}
</style>