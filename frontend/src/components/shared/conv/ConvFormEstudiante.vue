<template>
  <div class="action-panel_sm_vc">
    <div class="panel-header_sm_vc">
      <q-icon name="upload_file" size="16px" color="teal-3" />
      <span>Enviar nueva versión del informe</span>
    </div>

    <div class="action-form_sm_vc">
      <q-banner
        v-if="requisitosDisponibles_vc.length === 0"
        dense
        rounded
        class="empty-banner-requis_sm_vc"
      >
        <template #avatar>
          <q-icon name="check_circle" color="teal-3" size="sm" />
        </template>
        No hay requisitos pendientes por entregar en esta fase.
        Los que fueron <strong>Aprobados</strong> o están
        <strong>pendientes de revisión</strong> no requieren nueva entrega.
      </q-banner>

      <template v-else>
        <div class="form-row_sm_vc">
          <div class="field-group_sm_vc">
            <label class="field-label_sm_vc">
              Requisito / Capítulo <span class="req-mark_sm_vc">*</span>
            </label>
            <q-select
              v-model="form_sm_vc.requisito_id_sm_vc"
              :options="requisitosDisponibles_vc"
              option-value="id_sm_vc"
              option-label="nombre_sm_vc"
              emit-value
              map-options
              dense
              outlined
              color="teal-3"
              class="sntnl-select_sm_vc"
              behavior="menu"
              label="Seleccionar requisito"
            />
          </div>

          <div class="field-group_sm_vc">
            <label class="field-label_sm_vc">Versión</label>
            <q-input
              v-model="form_sm_vc.version_sm_vc"
              dense
              outlined
              color="teal-3"
              class="sntnl-input_sm_vc"
              placeholder="ej: v1.0"
            />
          </div>
        </div>

        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc"
            >Documento PDF <span class="req-mark_sm_vc">*</span></label
          >
          <div class="mini-upload_sm_vc" @click="fileInput_sm_vc?.click()">
            <q-icon name="attach_file" size="16px" color="teal-3" />
            <span>{{
              form_sm_vc.archivo_nombre_sm_vc || "Seleccionar archivo .pdf"
            }}</span>
            <input
              ref="fileInput_sm_vc"
              type="file"
              accept=".pdf"
              hidden
              @change="handleFileSelect_sm_vc"
            />
          </div>
        </div>

        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">Comentario (opcional)</label>
          <q-input
            v-model="form_sm_vc.comentario_sm_vc"
            dense
            outlined
            color="teal-3"
            class="sntnl-input_sm_vc"
            placeholder="Describe los cambios realizados…"
            type="textarea"
            :rows="2"
            autogrow
          />
        </div>

        <q-btn
          unelevated
          no-caps
          label="Enviar Informe"
          icon="send"
          class="send-btn_sm_vc"
          :loading="enviando_sm_vc"
          :disable="
            props.bloqueado_sm_vc ||
            !form_sm_vc.requisito_id_sm_vc ||
            !archivo_sm_vc ||
            enviando_sm_vc
          "
          @click="enviarDatos_sm_vc"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { getRequisitoSeleccionado_sm_vc, useRequisitoContextoStore } from "src/stores/requisitoContextoStore";
import { usePasantiasStore } from "src/stores/pasantiasStore";

const props = defineProps({
  requisitos: { type: Array, default: () => [] },
  requisitosAprobadosIniciales: { type: Array, default: () => [] }, // Ya no lo usamos para el disable, usamos Pinia
  mensajes: { type: Array, default: () => [] },
  materiaId: { type: [String, Number], default: null },
  estudianteId: { type: [String, Number], default: null },
  bloqueado_sm_vc: { type: Boolean, default: false },
});

const emit = defineEmits(["enviar"]);

const contextoStore = useRequisitoContextoStore();
const pasantiasStore = usePasantiasStore();

const fileInput_sm_vc = ref(null);
const archivo_sm_vc = ref(null);
const enviando_sm_vc = ref(false);

const form_sm_vc = ref({
  requisito_id_sm_vc: null,
  version_sm_vc: "v1.0",
  archivo_nombre_sm_vc: "",
  comentario_sm_vc: "",
});

const handleFileSelect_sm_vc = (e_sm_vc) => {
  const file = e_sm_vc.target.files[0];
  if (file) {
    archivo_sm_vc.value = file;
    form_sm_vc.value.archivo_nombre_sm_vc = file.name;
  }
};

/* ═══════════════════════════════════════════════════════════════════
   ✅ FIX MAGIA REACTIVA: El "Despertador" del WebSocket.
   Si llega un mensaje nuevo al chat, actualizamos silenciosamente el progreso.
   ═══════════════════════════════════════════════════════════════════ */
watch(() => props.mensajes, async (newVal, oldVal) => {
  if (newVal.length > oldVal.length && props.estudianteId) {
    await pasantiasStore.fetch_progreso_estudiante_sm_vc(props.estudianteId);
  }
}, { deep: true });

/* ═══════════════════════════════════════════════════════════════════
   ✅ FIX: Requisitos accionables 100% en tiempo real.
   ═══════════════════════════════════════════════════════════════════ */
const requisitosDisponibles_vc = computed(() => {
  return contextoStore.getRequisitosDisponiblesEstudiante(props.estudianteId, props.materiaId);
});

const enviarDatos_sm_vc = async () => {
  if (!archivo_sm_vc.value || !form_sm_vc.value.requisito_id_sm_vc) return;
  if (enviando_sm_vc.value) return;

  enviando_sm_vc.value = true;

  try {
    await emit("enviar", {
      mensaje_sm_vc: form_sm_vc.value.comentario_sm_vc?.trim() || "",
      archivo_sm_vc: archivo_sm_vc.value,
      archivo_nombre_sm_vc: form_sm_vc.value.archivo_nombre_sm_vc,
      requisito_id_sm_vc: form_sm_vc.value.requisito_id_sm_vc,
      version_sm_vc: form_sm_vc.value.version_sm_vc,
    });
    resetForm_sm_vc();
  } finally {
    enviando_sm_vc.value = false;
  }
};

const resetForm_sm_vc = () => {
  form_sm_vc.value = {
    requisito_id_sm_vc: null,
    version_sm_vc: "v1.0",
    archivo_nombre_sm_vc: "",
    comentario_sm_vc: "",
  };
  archivo_sm_vc.value = null;
  if (fileInput_sm_vc.value) fileInput_sm_vc.value.value = "";
};

onMounted(() => {
  const idContexto_sm_vc = getRequisitoSeleccionado_sm_vc(props.materiaId);
  if (idContexto_sm_vc === null) return;

  const idStr_sm_vc = String(idContexto_sm_vc);
  const requisito_sm_vc = requisitosDisponibles_vc.value.find(
    (r_sm_vc) => String(r_sm_vc.id_sm_vc) === idStr_sm_vc,
  );
  if (requisito_sm_vc) {
    form_sm_vc.value.requisito_id_sm_vc = requisito_sm_vc.id_sm_vc;
  }
});
</script>

<style scoped>
.action-panel_sm_vc { border-top: 1px solid var(--sn-borde); padding: 1.25rem; background: var(--sn-fondo-elevado); }
.panel-header_sm_vc { display: flex; align-items: center; gap: 0.4rem; font-size: 0.68rem; color: var(--sn-acento-sec); letter-spacing: 0.06em; margin-bottom: 1rem; text-transform: uppercase; }
.action-form_sm_vc { display: flex; flex-direction: column; gap: 0.875rem; }
.form-row_sm_vc { display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; align-items: flex-end; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: 0.3rem; }
.field-label_sm_vc { font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sn-texto-terciario); font-weight: 500; }
.req-mark_sm_vc { color: var(--sn-error-claro); }
:deep(.sntnl-select_sm_vc .q-field__control), :deep(.sntnl-input_sm_vc .q-field__control) { background: var(--sn-surface-alpha) !important; border: 1px solid var(--sn-borde) !important; border-radius: 6px !important; }
:deep(.sntnl-select_sm_vc .q-field__native), :deep(.sntnl-input_sm_vc .q-field__native) { color: var(--sn-texto-principal) !important; font-size: 0.78rem !important; font-family: var(--sn-font-mono) !important; }
.mini-upload_sm_vc { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--sn-surface-alpha); border: 1px dashed rgba(111, 255, 233, 0.18); border-radius: 6px; cursor: pointer; font-size: 0.72rem; color: var(--sn-texto-secundario); transition: all 0.15s; }
.mini-upload_sm_vc:hover { border-color: rgba(111, 255, 233, 0.4); color: var(--sn-primario); }
.send-btn_sm_vc { background: var(--sn-surface-active) !important; color: var(--sn-primario) !important; border: 1px solid rgba(111, 255, 233, 0.25) !important; font-size: 0.72rem !important; font-weight: 600 !important; border-radius: 6px !important; align-self: flex-start; }
.empty-banner-requis_sm_vc { background: rgba(111, 255, 233, 0.06) !important; border: 1px solid rgba(111, 255, 233, 0.18) !important; border-radius: 8px !important; color: var(--sn-texto-secundario) !important; font-size: 0.75rem !important; }
</style>
