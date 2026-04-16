<template>
  <div class="action-panel_sm_vc">
    <div class="panel-header_sm_vc">
      <q-icon name="rate_review" size="16px" color="grey-5" />
      <span>Responder con corrección / evaluación</span>
    </div>

    <div class="action-form_sm_vc">
      <div class="bulk-actions_sm_vc">
        <q-btn outline color="grey-5" icon="checklist" label="Evaluar por Requisitos" no-caps size="sm" class="granular-btn_sm_vc" @click="mostrarModal_sm_vc = true" />
        <q-btn unelevated color="teal-3" icon="workspace_premium" label="Aprobar Toda la Materia" no-caps size="sm" class="bulk-approve-btn_sm_vc" @click="mostrarModalAprobarTodo_sm_vc = true" />
      </div>

      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">Estado de Evaluación <span class="req-mark_sm_vc">*</span></label>
        <div class="eval-options_sm_vc">
          <button v-for="opt in evalOpciones_sm_vc" :key="opt.value" class="eval-option_sm_vc" :class="{'eval-option--selected_sm_vc': form_sm_vc.estado_evaluacion_sm_vc === opt.value, 'eval-option--reprobado_sm_vc': opt.value === 'REPROBADO'}" :style="form_sm_vc.estado_evaluacion_sm_vc === opt.value ? { borderColor: opt.color, color: opt.color } : {}" @click="form_sm_vc.estado_evaluacion_sm_vc = opt.value">
            <q-icon :name="opt.icon" size="14px" />{{ opt.label }}
          </button>
        </div>
        <div v-if="form_sm_vc.estado_evaluacion_sm_vc === 'REPROBADO'" class="reprobado-notice_sm_vc">
          <q-icon name="warning_amber" size="14px" color="negative" />
          <span>Acción de <strong>Reprobar Materia</strong>: cambia el estado global sin vincular documento.</span>
        </div>
      </div>

      <div v-if="form_sm_vc.estado_evaluacion_sm_vc === 'APROBADO'" class="field-group_sm_vc">
        <label class="field-label_sm_vc">Nota del Requisito (0-20)</label>
        <q-input v-model.number="form_sm_vc.nota_sm_dec" type="number" :min="0" :max="20" :step="0.1" dense outlined color="teal-3" class="sntnl-input_sm_vc nota-input_sm_vc" />
      </div>

      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">Archivo de corrección (Opcional)</label>
        <div class="mini-upload_sm_vc" @click="fileInputProf_sm_vc?.click()">
          <q-icon name="attach_file" size="16px" color="grey-5" />
          <span>{{ form_sm_vc.archivo_nombre_sm_vc || "Seleccionar archivo .pdf" }}</span>
          <input ref="fileInputProf_sm_vc" type="file" accept=".pdf,.docx" hidden @change="handleFileProf_sm_vc" />
        </div>
      </div>

      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">Observaciones / Feedback <span class="req-mark_sm_vc">*</span></label>
        <q-input v-model="form_sm_vc.comentario_sm_vc" dense outlined color="teal-3" class="sntnl-input_sm_vc" placeholder="Describe los puntos a corregir..." type="textarea" :rows="3" autogrow />
      </div>

      <div v-if="entregaVinculada_sm_vc" class="entrega-vinculada-badge_sm_vc">
        <q-icon name="link" size="14px" color="teal-3" />
        <span>Entrega vinculada: <strong>{{ entregaVinculada_sm_vc.archivo_nombre_sm_vc }}</strong></span>
        <q-btn flat dense round icon="close" size="xs" color="grey-5" @click="entregaVinculada_sm_vc = null" />
      </div>

      <q-banner v-if="form_sm_vc.estado_evaluacion_sm_vc && form_sm_vc.estado_evaluacion_sm_vc !== 'REPROBADO' && documentosPendientesEvaluar_vc.length === 0" dense rounded class="empty-banner-evaluar_sm_vc q-mb-sm">
        <template #avatar><q-icon name="task_alt" color="teal-3" size="sm" /></template>
        Todos los documentos de esta fase han sido evaluados.
      </q-banner>

      <q-btn unelevated no-caps :label="labelBotonEnvio_sm_vc" :icon="iconBotonEnvio_sm_vc" class="send-btn_sm_vc send-btn--profesor_sm_vc" :loading="enviandoRespuesta_sm_vc" :disable="props.bloqueado_sm_vc || !form_sm_vc.estado_evaluacion_sm_vc || !form_sm_vc.comentario_sm_vc || enviandoRespuesta_sm_vc || (form_sm_vc.estado_evaluacion_sm_vc !== 'REPROBADO' && documentosPendientesEvaluar_vc.length === 0)" @click="handleClickEnvio_sm_vc" />
    </div>
  </div>

  <q-dialog v-model="mostrarModalEntregas_sm_vc" persistent>
    <q-card class="modal-card_sm_vc modal-entregas-card_sm_vc">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-subtitle1 text-teal-3 text-weight-bold" style="display: flex; align-items: center"><q-icon name="folder_open" size="sm" class="q-mr-sm" />Vincular Entrega</div>
        <q-space /><q-btn icon="close" flat round dense color="grey-5" v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-banner v-if="documentosPendientesEvaluar_vc.length === 0" dense rounded class="empty-banner-evaluar_sm_vc q-mb-sm" icon="inbox">
          <template #avatar><q-icon name="task_alt" color="teal-3" size="sm" /></template>Todos los documentos evaluados.
        </q-banner>
        <q-list v-else dark bordered separator class="rounded-borders">
          <q-item v-for="doc in documentosPendientesEvaluar_vc" :key="doc.documento_id_sm_vc" tag="label" v-ripple :class="{ 'doc-item--seleccionado_sm_vc': entregaSeleccionadaTemp_sm_vc?.documento_id_sm_vc === doc.documento_id_sm_vc }">
            <q-item-section avatar><q-radio v-model="entregaSeleccionadaTemp_sm_vc" :val="doc" color="teal-3" /></q-item-section>
            <q-item-section avatar><q-avatar size="32px" color="blue-grey-9" text-color="blue-grey-4"><q-icon name="description" size="16px" /></q-avatar></q-item-section>
            <q-item-section>
              <q-item-label style="font-size: 0.8rem; font-weight: 600;">{{ doc.archivo_nombre_sm_vc || 'Documento sin nombre' }}</q-item-label>
              <q-item-label caption class="text-grey-5" style="font-size: 0.65rem;">{{ formatDateTime_sm_vc(doc.fecha_creacion_sm_vc) }}</q-item-label>
            </q-item-section>
            <q-item-section side><q-badge color="amber-9" text-color="dark" label="ENTREGADO" style="font-size: 0.52rem;" /></q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn outline label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn unelevated label="Confirmar Vinculación" color="teal-3" no-caps icon="link" :disable="!entregaSeleccionadaTemp_sm_vc" @click="confirmarVinculacion_sm_vc" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="mostrarModal_sm_vc">
    <q-card class="modal-card_sm_vc">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-subtitle1 text-teal-3 text-weight-bold" style="display: flex; align-items: center"><q-icon name="checklist" size="sm" class="q-mr-sm" />Aprobación por Requisitos</div>
        <q-space /><q-btn icon="close" flat round dense color="grey-5" v-close-popup />
      </q-card-section>
      <q-card-section>
        <q-list dark bordered separator class="rounded-borders">
          <q-item v-for="req in requisitosOrdenados_sm_vc" :key="req.id_sm_vc" tag="label" v-ripple :class="{ 'req-item--aprobado_sm_vc': esRequisitoAprobado_sm_vc(req.id_sm_vc) }">
            <q-item-section avatar>
              <q-checkbox v-model="requisitosSeleccionados_sm_vc" :val="req.id_sm_vc" color="teal-3" :disable="esRequisitoAprobado_sm_vc(req.id_sm_vc)" />
            </q-item-section>
            <q-item-section>
              <q-item-label style="font-size: 0.8rem">{{ req.nombre_sm_vc }}</q-item-label>
              <q-item-label caption class="text-grey-5" style="font-size: 0.65rem">Orden: {{ req.posicion_sm_vc }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div v-if="esRequisitoAprobado_sm_vc(req.id_sm_vc)" class="req-aprobado-badge_sm_vc">
                <q-icon name="check_circle" size="14px" color="teal-3" /><span>Aprobado</span>
              </div>
              <div v-else class="text-grey-7" style="font-size: 0.65rem">Pendiente</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn outline label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn unelevated label="Registrar Cambios" color="teal-3" no-caps @click="emitirRequisitos_sm_vc" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="mostrarModalAprobarTodo_sm_vc" persistent>
    <q-card class="modal-card_sm_vc approve-all-card_sm_vc">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-teal-3">🏆 Aprobar Materia Completa</div>
      </q-card-section>
      <q-card-section class="q-mt-md">
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">Calificación Final (0-20) *</label>
          <q-input v-model.number="formAprobarTodo_sm_vc.nota_sm_dec" type="number" :min="0" :max="20" outlined dense color="teal-3" class="sntnl-input_sm_vc nota-global-input_sm_vc" />
        </div>
        <div class="field-group_sm_vc q-mt-md">
          <label class="field-label_sm_vc">Comentario / Acta (Opcional)</label>
          <q-input v-model="formAprobarTodo_sm_vc.comentario_sm_vc" outlined dense color="teal-3" class="sntnl-input_sm_vc" type="textarea" :rows="2" />
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn unelevated label="Aprobar Materia" color="teal-3" no-caps :disable="formAprobarTodo_sm_vc.nota_sm_dec === null" @click="ejecutarAprobarTodo_sm_vc" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { getRequisitoSeleccionado_sm_vc, useRequisitoContextoStore } from "src/stores/requisitoContextoStore";
import { subirDocumento_sm_vc } from "src/services/documentosService";
import { useChatStore_sm_vc } from "src/stores/chatStore_sm_vc";
import { usePasantiasStore } from "src/stores/pasantiasStore";

const $q = useQuasar();
const chat_sm_vc = useChatStore_sm_vc();
const contextoStore = useRequisitoContextoStore();
const pasantiasStore = usePasantiasStore();

const props = defineProps({
  requisitos: { type: Array, default: () => [] },
  requisitosAprobadosIniciales: { type: Array, default: () => [] },
  materiaId: { type: [String, Number], default: null },
  estudianteId: { type: [String, Number], default: null },
  bloqueado_sm_vc: { type: Boolean, default: false },
  mensajes: { type: Array, default: () => [] },
});

const emit = defineEmits(["responder", "guardarRequisitos"]);

const mostrarModal_sm_vc = ref(false);
const mostrarModalAprobarTodo_sm_vc = ref(false);
const mostrarModalEntregas_sm_vc = ref(false);
const fileInputProf_sm_vc = ref(null);
const enviandoRespuesta_sm_vc = ref(false);
const entregaSeleccionadaTemp_sm_vc = ref(null);
const entregaVinculada_sm_vc = ref(null);

const form_sm_vc = ref({ estado_evaluacion_sm_vc: null, nota_sm_dec: null, archivo_nombre_sm_vc: "", archivo_raw_sm_vc: null, comentario_sm_vc: "" });
const formAprobarTodo_sm_vc = ref({ nota_sm_dec: null, comentario_sm_vc: "" });
const evalOpciones_sm_vc = [
  { value: "OBSERVACIONES", label: "Observaciones", icon: "warning", color: "#f0a500" },
  { value: "APROBADO", label: "Aprobar Item", icon: "done", color: "#6fffe9" },
  { value: "REPROBADO", label: "Reprobar Materia", icon: "block", color: "#ff8fa3" },
];
const requisitosSeleccionados_sm_vc = ref([]);

/* ═══════════════════════════════════════════════════════════════════
   ✅ FIX MAGIA REACTIVA: Recarga al recibir WS
   ═══════════════════════════════════════════════════════════════════ */
watch(() => props.mensajes, async (newVal, oldVal) => {
  if (newVal.length > oldVal.length && props.estudianteId) {
    await pasantiasStore.fetch_progreso_estudiante_sm_vc(props.estudianteId);
  }
}, { deep: true });

/* ✅ Usar el contexto en tiempo real para bloquear opciones */
const esRequisitoAprobado_sm_vc = (requisitoId) => {
  return contextoStore.esRequisitoAprobado(props.estudianteId, props.materiaId, requisitoId);
};

watch(mostrarModal_sm_vc, (val_sm_vc) => {
  if (val_sm_vc) {
    const progreso = pasantiasStore.getProgresoEstudiante(props.estudianteId);
    const materiaActiva = progreso.find(m => String(m.id_sm_vc) === String(props.materiaId));
    const aprobados = materiaActiva?.progreso?.requisitos_aprobados_detalle_sm_vc || [];
    requisitosSeleccionados_sm_vc.value = aprobados.map(a => a.requisito_id_sm_vc);
  }
});

watch(() => form_sm_vc.value.estado_evaluacion_sm_vc, (nuevoEstado_sm_vc) => {
  if (nuevoEstado_sm_vc === 'REPROBADO') {
    entregaVinculada_sm_vc.value = null;
    entregaSeleccionadaTemp_sm_vc.value = null;
  }
});

const documentosPendientesEvaluar_vc = computed(() => {
  return props.mensajes.filter((nodo_sm_vc) => {
    // 🛡️ Filtro Anti-Mocks: Ignorar registros generados por Seed
    if (nodo_sm_vc.mock_sm_vc === true) return false;
    
    if (nodo_sm_vc.tipo_nodo_sm_vc !== 'DOCUMENTO') return false;
    if (nodo_sm_vc.es_sistema_sm_vc || nodo_sm_vc.remitente_rol_sm_vc === 'PROFESOR') return false;
    return nodo_sm_vc.estado_sm_vc === 'ENTREGADO';
  });
});

const requisitosOrdenados_sm_vc = computed(() => {
  return [...props.requisitos].sort((a_sm_vc, b_sm_vc) => {
    const aAprob_sm_vc = esRequisitoAprobado_sm_vc(a_sm_vc.id_sm_vc);
    const bAprob_sm_vc = esRequisitoAprobado_sm_vc(b_sm_vc.id_sm_vc);
    const aDoc_sm_vc = documentosPendientesEvaluar_vc.value.some(d => String(d.requisito_id_sm_vc) === String(a_sm_vc.id_sm_vc));
    const bDoc_sm_vc = documentosPendientesEvaluar_vc.value.some(d => String(d.requisito_id_sm_vc) === String(b_sm_vc.id_sm_vc));

    const peso = (aprobado, entregado) => aprobado ? 3 : entregado ? 1 : 2;
    const pesoA = peso(aAprob_sm_vc, aDoc_sm_vc);
    const pesoB = peso(bAprob_sm_vc, bDoc_sm_vc);

    if (pesoA !== pesoB) return pesoA - pesoB;
    return (a_sm_vc.posicion_sm_vc ?? 0) - (b_sm_vc.posicion_sm_vc ?? 0);
  });
});

const labelBotonEnvio_sm_vc = computed(() => form_sm_vc.value.estado_evaluacion_sm_vc === 'REPROBADO' ? 'Reprobar Materia' : 'Enviar Evaluación');
const iconBotonEnvio_sm_vc = computed(() => form_sm_vc.value.estado_evaluacion_sm_vc === 'REPROBADO' ? 'block' : 'send');

const handleFileProf_sm_vc = (e) => {
  const file = e.target.files[0];
  if (file) { form_sm_vc.value.archivo_raw_sm_vc = file; form_sm_vc.value.archivo_nombre_sm_vc = file.name; }
};

const handleClickEnvio_sm_vc = () => {
  if (!form_sm_vc.value.estado_evaluacion_sm_vc || !form_sm_vc.value.comentario_sm_vc) return;
  if (form_sm_vc.value.estado_evaluacion_sm_vc === 'REPROBADO') { emitirRespuesta_sm_vc(null); return; }
  if (documentosPendientesEvaluar_vc.value.length === 0) return;
  if (entregaVinculada_sm_vc.value) { emitirRespuesta_sm_vc(entregaVinculada_sm_vc.value); return; }
  entregaSeleccionadaTemp_sm_vc.value = null;
  mostrarModalEntregas_sm_vc.value = true;
};

const confirmarVinculacion_sm_vc = () => {
  if (!entregaSeleccionadaTemp_sm_vc.value) return;
  entregaVinculada_sm_vc.value = entregaSeleccionadaTemp_sm_vc.value;
  mostrarModalEntregas_sm_vc.value = false;
  emitirRespuesta_sm_vc(entregaVinculada_sm_vc.value);
};

const emitirRespuesta_sm_vc = async (entrega_sm_vc) => {
  if (!form_sm_vc.value.estado_evaluacion_sm_vc || !form_sm_vc.value.comentario_sm_vc) return;
  if (enviandoRespuesta_sm_vc.value) return;
  enviandoRespuesta_sm_vc.value = true;

  try {
    if (form_sm_vc.value.archivo_raw_sm_vc) {
      const formData_sm_vc = new FormData();
      formData_sm_vc.append("archivo_sm_vc", form_sm_vc.value.archivo_raw_sm_vc);
      formData_sm_vc.append("tipo_sm_vc", "CORRECCION_PROFESOR");

      const docRespuesta_sm_vc = await subirDocumento_sm_vc(formData_sm_vc);
      chat_sm_vc.enviarMensaje_sm_vc(`📎 Corrección adjunta: ${form_sm_vc.value.archivo_raw_sm_vc.name}`, props.estudianteId, props.materiaId, docRespuesta_sm_vc.id_sm_vc);
    }

    const esReprobacionGlobal_sm_vc = form_sm_vc.value.estado_evaluacion_sm_vc === 'REPROBADO';
    emit("responder", {
      ...form_sm_vc.value,
      archivo_correccion_sm_vc: form_sm_vc.value.archivo_raw_sm_vc,
      id_entrega_sm_vc: esReprobacionGlobal_sm_vc ? null : (entrega_sm_vc?.documento_id_sm_vc ?? null),
      es_reprobacion_global_sm_vc: esReprobacionGlobal_sm_vc,
    });

    form_sm_vc.value = { estado_evaluacion_sm_vc: null, nota_sm_dec: null, archivo_nombre_sm_vc: "", archivo_raw_sm_vc: null, comentario_sm_vc: "" };
    entregaVinculada_sm_vc.value = null;
    if (fileInputProf_sm_vc.value) fileInputProf_sm_vc.value.value = "";

    $q.notify({ type: 'positive', message: 'Evaluación enviada.', icon: 'check', position: 'top-right' });
  } finally {
    enviandoRespuesta_sm_vc.value = false;
  }
};

const emitirRequisitos_sm_vc = () => {
  emit("guardarRequisitos", { ids: [...requisitosSeleccionados_sm_vc.value] });
  mostrarModal_sm_vc.value = false;
};

const ejecutarAprobarTodo_sm_vc = () => {
  emit("guardarRequisitos", { ids: props.requisitos.map(r => r.id_sm_vc), nota_global: formAprobarTodo_sm_vc.value.nota_sm_dec, comentario: formAprobarTodo_sm_vc.value.comentario_sm_vc });
  mostrarModalAprobarTodo_sm_vc.value = false;
  formAprobarTodo_sm_vc.value = { nota_sm_dec: null, comentario_sm_vc: "" };
};

const formatDateTime_sm_vc = (iso) => iso ? new Date(iso).toLocaleString('es-VE') : '';

onMounted(() => {
  const idContexto_sm_vc = getRequisitoSeleccionado_sm_vc(props.materiaId);
  if (idContexto_sm_vc && !requisitosSeleccionados_sm_vc.value.includes(idContexto_sm_vc)) {
    requisitosSeleccionados_sm_vc.value.push(idContexto_sm_vc);
  }
});
</script>

<style scoped>
.action-panel_sm_vc { border-top: 1px solid var(--sn-borde); padding: 1.25rem; background: var(--sn-fondo-elevado); }
.panel-header_sm_vc { display: flex; align-items: center; gap: 0.4rem; font-size: 0.68rem; color: var(--sn-texto-terciario); letter-spacing: 0.06em; margin-bottom: 1rem; text-transform: uppercase; }
.action-form_sm_vc { display: flex; flex-direction: column; gap: 0.875rem; }
.bulk-actions_sm_vc { display: flex; gap: 0.5rem; justify-content: flex-end; }
.bulk-approve-btn_sm_vc { background: rgba(111, 255, 233, 0.08) !important; border: 1px solid rgba(111, 255, 233, 0.2) !important; font-weight: 700 !important; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: 0.3rem; }
.field-label_sm_vc { font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sn-texto-terciario); font-weight: 500; }
.req-mark_sm_vc { color: var(--sn-error-claro); }
:deep(.sntnl-input_sm_vc .q-field__control) { background: var(--sn-surface-alpha) !important; border: 1px solid var(--sn-borde) !important; border-radius: 6px !important; }
:deep(.sntnl-input_sm_vc .q-field__native) { color: var(--sn-texto-principal) !important; font-size: 0.78rem !important; font-family: var(--sn-font-mono) !important; }
.nota-input_sm_vc, .nota-global-input_sm_vc { max-width: 120px; }
.mini-upload_sm_vc { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--sn-surface-alpha); border: 1px dashed rgba(158, 158, 158, 0.25); border-radius: 6px; cursor: pointer; font-size: 0.72rem; color: var(--sn-texto-secundario); transition: all 0.15s; }
.mini-upload_sm_vc:hover { border-color: rgba(158, 158, 158, 0.45); }
.eval-options_sm_vc { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.eval-option_sm_vc { display: flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.75rem; background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: 6px; font-size: 0.65rem; color: var(--sn-texto-terciario); cursor: pointer; transition: all 0.15s; font-family: var(--sn-font-mono); }
.eval-option_sm_vc:hover { background: rgba(255, 255, 255, 0.05); }
.eval-option--selected_sm_vc { font-weight: 700; }
.eval-option--reprobado_sm_vc:hover { background: rgba(255, 143, 163, 0.06); border-color: rgba(255, 143, 163, 0.35); }
.reprobado-notice_sm_vc { display: flex; align-items: flex-start; gap: 0.4rem; padding: 0.5rem 0.75rem; background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; font-size: 0.65rem; color: #fca5a5; font-family: var(--sn-font-sans); margin-top: 0.25rem; }
.entrega-vinculada-badge_sm_vc { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; background: rgba(111, 255, 233, 0.06); border: 1px solid rgba(111, 255, 233, 0.2); border-radius: 6px; font-size: 0.68rem; color: var(--sn-texto-secundario); font-family: var(--sn-font-sans); }
.send-btn_sm_vc { background: var(--sn-surface-active) !important; color: var(--sn-primario) !important; border: 1px solid rgba(111, 255, 233, 0.25) !important; font-size: 0.72rem !important; font-weight: 600 !important; border-radius: 6px !important; align-self: flex-start; margin-top: 5px; }
.send-btn--profesor_sm_vc { background: rgba(158, 158, 158, 0.1) !important; color: #9e9e9e !important; border-color: rgba(158, 158, 158, 0.25) !important; }
.modal-card_sm_vc { background: var(--sn-fondo-panel) !important; border: 1px solid var(--sn-borde-hover) !important; border-radius: 12px !important; min-width: 450px; font-family: var(--sn-font-mono); }
.approve-all-card_sm_vc { max-width: 500px; }
.modal-entregas-card_sm_vc { min-width: 520px; max-width: 640px; }
.empty-banner-evaluar_sm_vc { background: rgba(111, 255, 233, 0.06) !important; border: 1px solid rgba(111, 255, 233, 0.18) !important; border-radius: 8px !important; color: var(--sn-texto-secundario) !important; font-size: 0.75rem !important; }
.doc-item--seleccionado_sm_vc { background: rgba(111, 255, 233, 0.06) !important; }
.req-item--aprobado_sm_vc { background: rgba(111, 255, 233, 0.04) !important; border-left: 2px solid rgba(111, 255, 233, 0.3) !important; }
.req-aprobado-badge_sm_vc { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: #6fffe9; font-weight: 600; }
</style>