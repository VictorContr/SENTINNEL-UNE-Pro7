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
      <!-- Botones de Acción Masiva / Granular -->
      <div class="bulk-actions_sm_vc">
        <q-btn outline color="grey-5" icon="checklist"
          label="Evaluar por Requisitos" no-caps size="sm"
          class="granular-btn_sm_vc"
          @click="mostrarModal_sm_vc = true" />
          
        <q-btn unelevated color="teal-3" icon="workspace_premium"
          label="Aprobar Toda la Materia" no-caps size="sm"
          class="bulk-approve-btn_sm_vc"
          @click="mostrarModalAprobarTodo_sm_vc = true" />
      </div>

      <!-- Resto del formulario... -->
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

      <!-- Nota (solo si aprobado individualmente) -->
      <div v-if="form_sm_vc.estado_evaluacion_sm_vc === 'APROBADO'" class="field-group_sm_vc">
        <label class="field-label_sm_vc">Nota del Requisito (0-20)</label>
        <q-input
          v-model.number="form_sm_vc.nota_sm_dec"
          type="number" :min="0" :max="20" :step="0.1"
          dense outlined color="teal-3"
          class="sntnl-input_sm_vc nota-input_sm_vc" />
      </div>

      <!-- Archivo corrección -->
      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">Archivo de corrección (Opcional)</label>
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
          Observaciones / Feedback <span class="req-mark_sm_vc">*</span>
        </label>
        <q-input
          v-model="form_sm_vc.comentario_sm_vc"
          dense outlined color="teal-3"
          class="sntnl-input_sm_vc"
          placeholder="Describe los puntos a corregir o evalúa el trabajo..."
          type="textarea" :rows="3" autogrow />
      </div>

      <q-btn
        unelevated no-caps
        label="Enviar Evaluación" icon="send"
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
          Aprobación por Requisitos
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="grey-5" v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-sm text-caption text-grey-5">
          Marca los requisitos que deseas aprobar en este lote. Los ya aprobados aparecen pre-seleccionados.
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
                Orden: {{ req.posicion_sm_vc }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div v-if="requisitosAprobadosIniciales.includes(req.id_sm_vc)"
                class="text-teal-3" style="font-size:.65rem; display:flex; align-items:center;">
                <q-icon name="check_circle" class="q-mr-xs" size="10px" />
                Aprobado
              </div>
              <div v-else class="text-grey-7" style="font-size:.65rem">Pendiente</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn outline label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn unelevated label="Registrar Cambios" color="teal-3" no-caps
          @click="emitirRequisitos_sm_vc" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- ── Modal: Aprobar Materia Completa (Confirmación + Nota) ── -->
  <q-dialog v-model="mostrarModalAprobarTodo_sm_vc" persistent>
    <q-card class="modal-card_sm_vc approve-all-card_sm_vc">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-teal-3">🏆 Aprobar Materia Completa</div>
        <div class="text-caption text-grey-5 q-mt-xs">
          Esta acción marcará **todos** los requisitos como aprobados y cerrará la evaluación de la materia actual.
        </div>
      </q-card-section>

      <q-card-section class="q-mt-md">
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">Calificación Final (0-20) <span class="req-mark_sm_vc">*</span></label>
          <q-input
            v-model.number="formAprobarTodo_sm_vc.nota_sm_dec"
            type="number" :min="0" :max="20" :step="1"
            outlined dense color="teal-3"
            class="sntnl-input_sm_vc nota-global-input_sm_vc"
            placeholder="Ej: 18" />
        </div>

        <div class="field-group_sm_vc q-mt-md">
          <label class="field-label_sm_vc">Comentario / Acta (Opcional)</label>
          <q-input
            v-model="formAprobarTodo_sm_vc.comentario_sm_vc"
            outlined dense color="teal-3"
            class="sntnl-input_sm_vc"
            placeholder="Felicitaciones por culminar la materia satisfactoriamente..."
            type="textarea" :rows="2" />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn 
          unelevated 
          label="Aprobar Materia" 
          color="teal-3" 
          no-caps
          :disable="formAprobarTodo_sm_vc.nota_sm_dec === null || formAprobarTodo_sm_vc.nota_sm_dec < 0 || formAprobarTodo_sm_vc.nota_sm_dec > 20"
          @click="ejecutarAprobarTodo_sm_vc" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getRequisitoSeleccionado_sm_vc } from 'src/composables/useRequisitoContexto'

const props = defineProps({
  requisitos: { type: Array, default: () => [] },
  requisitosAprobadosIniciales: { type: Array, default: () => [] },
  /**
   * materiaId: clave de indexación en el localStorage.
   */
  materiaId: { type: [String, Number], default: null }
})

const emit = defineEmits(['responder', 'guardarRequisitos'])

const mostrarModal_sm_vc = ref(false)
const mostrarModalAprobarTodo_sm_vc = ref(false)
const fileInputProf_sm_vc = ref(null)

const form_sm_vc = ref({
  estado_evaluacion_sm_vc: null,
  nota_sm_dec: null,
  archivo_nombre_sm_vc: '',
  comentario_sm_vc: ''
})

const formAprobarTodo_sm_vc = ref({
  nota_sm_dec: null,
  comentario_sm_vc: ''
})

const evalOpciones_sm_vc = [
  { value: 'OBSERVACIONES', label: 'Observaciones', icon: 'warning', color: '#f0a500' },
  { value: 'APROBADO', label: 'Aprobar Item', icon: 'done', color: '#6fffe9' },
  { value: 'REPROBADO', label: 'Reprobado', icon: 'cancel', color: '#ff8fa3' }
]

const requisitosSeleccionados_sm_vc = ref([])

// Sincronización de requisitos seleccionados al abrir el modal granular
watch(mostrarModal_sm_vc, (val_sm_vc) => {
  if (val_sm_vc) {
    requisitosSeleccionados_sm_vc.value = [...props.requisitosAprobadosIniciales]
  }
})

const handleFileProf_sm_vc = (e_sm_vc) => {
  const file = e_sm_vc.target.files[0]
  if (file) {
    form_sm_vc.value.archivo_raw_sm_vc = file
    form_sm_vc.value.archivo_nombre_sm_vc = file.name
  }
}

const emitirRespuesta_sm_vc = () => {
  emit('responder', { 
    ...form_sm_vc.value,
    archivo_correccion_sm_vc: form_sm_vc.value.archivo_raw_sm_vc
  })
  
  form_sm_vc.value = {
    estado_evaluacion_sm_vc: null,
    nota_sm_dec: null,
    archivo_nombre_sm_vc: '',
    archivo_raw_sm_vc: null,
    comentario_sm_vc: ''
  }
}

const emitirRequisitos_sm_vc = () => {
  emit('guardarRequisitos', {
    ids: [...requisitosSeleccionados_sm_vc.value]
  })
  mostrarModal_sm_vc.value = false
}

const ejecutarAprobarTodo_sm_vc = () => {
  const todosIds_sm_vc = props.requisitos.map(r => r.id_sm_vc)
  emit('guardarRequisitos', {
    ids: todosIds_sm_vc,
    nota_global: formAprobarTodo_sm_vc.value.nota_sm_dec,
    comentario: formAprobarTodo_sm_vc.value.comentario_sm_vc
  })
  mostrarModalAprobarTodo_sm_vc.value = false
  formAprobarTodo_sm_vc.value = { nota_sm_dec: null, comentario_sm_vc: '' }
}

onMounted(() => {
  const idContexto_sm_vc = getRequisitoSeleccionado_sm_vc(props.materiaId)
  if (idContexto_sm_vc === null) return

  const idStr_sm_vc = String(idContexto_sm_vc)
  const existe_sm_vc = props.requisitos.some(
    (r_sm_vc) => String(r_sm_vc.id_sm_vc) === idStr_sm_vc
  )
  if (!existe_sm_vc) return

  const requisito_sm_vc = props.requisitos.find(
    (r_sm_vc) => String(r_sm_vc.id_sm_vc) === idStr_sm_vc
  )
  const idOriginal_sm_vc = requisito_sm_vc?.id_sm_vc ?? idContexto_sm_vc

  if (!requisitosSeleccionados_sm_vc.value.includes(idOriginal_sm_vc)) {
    requisitosSeleccionados_sm_vc.value = [...requisitosSeleccionados_sm_vc.value, idOriginal_sm_vc]
  }
})
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

.bulk-actions_sm_vc {
  display: flex; gap: .5rem; justify-content: flex-end;
}
.bulk-approve-btn_sm_vc {
  background: rgba(111, 255, 233, 0.08) !important;
  border: 1px solid rgba(111, 255, 233, 0.2) !important;
  font-weight: 700 !important;
}

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
.nota-input_sm_vc, .nota-global-input_sm_vc { max-width: 120px; }
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
  margin-top: 5px;
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
.approve-all-card_sm_vc {
  max-width: 500px;
}
</style>