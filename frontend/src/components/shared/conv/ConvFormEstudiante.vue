<!-- ══════════════════════════════════════════════════════════════════
     ConvFormEstudiante.vue — Formulario de envío de informe.

     SPRINT 3: Flujo de Subida en 2 Pasos
     ─────────────────────────────────────
     1. POST /api/documentos (multipart) → obtiene documentoId
     2. chatStore_sm_vc.enviarMensaje_sm_vc(contenido, materiaId, documentoId)
        → emite por WebSocket a todos los participantes de la sala

     Este patrón garantiza que el archivo ya esté persistido en el
     servidor ANTES de que los demás participantes intenten descargarlo.

     CASO DE USO: Sin requisito seleccionado → Caso A (adjunto libre).
                  Con requisito seleccionado → Caso B (upsert de entrega).

     FEATURE (2026-04-07): Pre-selección de requisito desde localStorage.
     Si antes de navegar a esta vista se llamó a setRequisitoSeleccionado_sm_vc,
     el q-select aparecerá pre-seleccionado al montar el componente.
     Consumo único: el dato se auto-destruye tras ser leído.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="action-panel_sm_vc">
    <div class="panel-header_sm_vc">
      <q-icon name="upload_file" size="16px" color="teal-3" />
      <span>Enviar nueva versión del informe</span>
    </div>

    <div class="action-form_sm_vc">
      <div class="form-row_sm_vc">
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            Requisito / Capítulo <span class="req-mark_sm_vc">*</span>
          </label>
          <q-select
            v-model="form_sm_vc.requisito_id_sm_vc"
            :options="requisitos"
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
        :disable="!form_sm_vc.requisito_id_sm_vc || !archivo_sm_vc || enviando_sm_vc"
        @click="emitirEnvio_sm_vc"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar }      from "quasar";
import { getRequisitoSeleccionado_sm_vc } from "src/stores/requisitoContextoStore";
import { subirDocumento_sm_vc }           from "src/services/documentosService";
import { useChatStore_sm_vc }             from "src/stores/chatStore_sm_vc";
import { useAuthStore }                   from "src/stores/authStore";

const $q          = useQuasar()
const chat_sm_vc  = useChatStore_sm_vc()
const auth_sm_vc  = useAuthStore()

const props = defineProps({
  requisitos: { type: Array,             default: () => [] },
  /**
   * materiaId: clave de indexación en localStorage.
   * Necesario para recuperar el requisito pre-seleccionado correcto
   * cuando el usuario navega desde el dashboard o la tabla de progreso.
   * También se usa como materiaId_sm_vc en el payload del WebSocket.
   */
  materiaId:  { type: [String, Number],  default: null },
  /**
   * estudianteId: ID del estudiante propietario.
   * Necesario para el Caso B: UPSERT atómico de Entrega.
   * Se obtiene del JWT del usuario autenticado como fallback.
   */
  estudianteId: { type: [String, Number], default: null },
});

const emit = defineEmits(["enviado"]);

/* ── Estado local ── */
const fileInput_sm_vc = ref(null);
const archivo_sm_vc   = ref(null);
const enviando_sm_vc  = ref(false);

const form_sm_vc = ref({
  requisito_id_sm_vc:   null,
  version_sm_vc:        "v1.0",
  archivo_nombre_sm_vc: "",
  comentario_sm_vc:     "",
});

/* ── Handlers de UI ── */
const handleFileSelect_sm_vc = (e_sm_vc) => {
  const file = e_sm_vc.target.files[0];
  if (file) {
    archivo_sm_vc.value              = file;
    form_sm_vc.value.archivo_nombre_sm_vc = file.name;
  }
};

/* ══════════════════════════════════════════════════════════════
 *  FLUJO PRINCIPAL DE ENVÍO — Sprint 3
 *  Paso 1: POST multipart a /api/documentos → obtiene documentoId
 *  Paso 2: Emit por WebSocket con chatStore → notifica en tiempo real
 * ══════════════════════════════════════════════════════════════ */
const emitirEnvio_sm_vc = async () => {
  if (!archivo_sm_vc.value || !form_sm_vc.value.requisito_id_sm_vc) return;
  if (enviando_sm_vc.value) return; // Guard anti-doble clic

  enviando_sm_vc.value = true;

  try {
    // ── PASO 1: Subir el archivo al servidor ──────────────────────
    // Construimos el FormData para el POST multipart.
    // El backend usará el campo 'archivo_sm_vc' como FileInterceptor.
    const formData_sm_vc = new FormData();
    formData_sm_vc.append("archivo_sm_vc", archivo_sm_vc.value);
    formData_sm_vc.append("tipo_sm_vc",    "ENTREGABLE_ESTUDIANTE");

    // CASO B: Vinculado a un requisito específico → el backend hará UPSERT
    // Enviamos requisito_id + estudiante_id para la transacción atómica.
    const estudianteIdResuelto_sm_vc =
      props.estudianteId ?? auth_sm_vc.user?.id_sm_vc;

    if (form_sm_vc.value.requisito_id_sm_vc && estudianteIdResuelto_sm_vc) {
      formData_sm_vc.append("requisito_id_sm_vc",  String(form_sm_vc.value.requisito_id_sm_vc));
      formData_sm_vc.append("estudiante_id_sm_vc", String(estudianteIdResuelto_sm_vc));
    }

    const docRespuesta_sm_vc = await subirDocumento_sm_vc(formData_sm_vc);

    // ── PASO 2: Notificar por WebSocket a la sala ─────────────────
    // El contenido del mensaje WS es el nombre del archivo.
    // El documentoId permite al receptor descargarlo sin polling.
    const contenido_sm_vc =
      form_sm_vc.value.comentario_sm_vc?.trim() ||
      `📄 ${archivo_sm_vc.value.name} (${form_sm_vc.value.version_sm_vc})`;

    chat_sm_vc.enviarMensaje_sm_vc(
      contenido_sm_vc,
      props.materiaId,
      docRespuesta_sm_vc.id_sm_vc,   // documentoId del Paso 1
      "DOCUMENTO",                    // tipo_sm_vc discriminador
    );

    $q.notify({
      type:     "positive",
      message:  "Informe enviado correctamente.",
      icon:     "check_circle",
      position: "top-right",
      timeout:  2500,
    });

    // Emitir evento al padre (DocumentConversacion) para posibles side-effects
    emit("enviado", { documentoId: docRespuesta_sm_vc.id_sm_vc });

    // ── Limpiar formulario ────────────────────────────────────────
    resetForm_sm_vc();
  } catch (err_sm_vc) {
    const msg_sm_vc =
      err_sm_vc?.response?.data?.message ||
      "Error al enviar el informe. Verifica el archivo e inténtalo nuevamente.";

    $q.notify({
      type:     "negative",
      message:  msg_sm_vc,
      icon:     "error_outline",
      position: "top",
      timeout:  5000,
    });
  } finally {
    enviando_sm_vc.value = false;
  }
};

/* ── Limpieza del formulario tras envío exitoso ── */
const resetForm_sm_vc = () => {
  form_sm_vc.value = {
    requisito_id_sm_vc:   null,
    version_sm_vc:        "v1.0",
    archivo_nombre_sm_vc: "",
    comentario_sm_vc:     "",
  };
  archivo_sm_vc.value    = null;
  // Resetear el input file (sin esto, no se puede subir el mismo archivo dos veces)
  if (fileInput_sm_vc.value) fileInput_sm_vc.value.value = "";
};

/* ══════════════════════════════════════════════════════════════
 *  FEATURE: Pre-selección desde contexto persistido en localStorage.
 *
 * Al montar el componente, leemos el ID del requisito que el usuario
 * tenía la intención de subir (guardado antes de navegar aquí).
 * getRequisitoSeleccionado_sm_vc hace consumo único: borra el dato
 * después de leerlo para no contaminar sesiones futuras.
 * ══════════════════════════════════════════════════════════════ */
onMounted(() => {
  const idContexto_sm_vc = getRequisitoSeleccionado_sm_vc(props.materiaId);
  if (idContexto_sm_vc === null) return;

  const idStr_sm_vc    = String(idContexto_sm_vc);
  const requisito_sm_vc = props.requisitos.find(
    (r_sm_vc) => String(r_sm_vc.id_sm_vc) === idStr_sm_vc,
  );
  if (requisito_sm_vc) {
    form_sm_vc.value.requisito_id_sm_vc = requisito_sm_vc.id_sm_vc;
  }
});
</script>

<style scoped>
.action-panel_sm_vc {
  border-top: 1px solid var(--sn-borde);
  padding: 1.25rem;
  background: var(--sn-fondo-elevado);
}
.panel-header_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.68rem;
  color: var(--sn-acento-sec);
  letter-spacing: 0.06em;
  margin-bottom: 1rem;
  text-transform: uppercase;
}
.action-form_sm_vc {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}
.form-row_sm_vc {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: flex-end;
}
.field-group_sm_vc {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.field-label_sm_vc {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sn-texto-terciario);
  font-weight: 500;
}
.req-mark_sm_vc {
  color: var(--sn-error-claro);
}
:deep(.sntnl-select_sm_vc .q-field__control),
:deep(.sntnl-input_sm_vc .q-field__control) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important;
  border-radius: 6px !important;
}
:deep(.sntnl-select_sm_vc .q-field__native),
:deep(.sntnl-input_sm_vc .q-field__native) {
  color: var(--sn-texto-principal) !important;
  font-size: 0.78rem !important;
  font-family: var(--sn-font-mono) !important;
}
.mini-upload_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--sn-surface-alpha);
  border: 1px dashed rgba(111, 255, 233, 0.18);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.72rem;
  color: var(--sn-texto-secundario);
  transition: all 0.15s;
}
.mini-upload_sm_vc:hover {
  border-color: rgba(111, 255, 233, 0.4);
  color: var(--sn-primario);
}
.send-btn_sm_vc {
  background: var(--sn-surface-active) !important;
  color: var(--sn-primario) !important;
  border: 1px solid rgba(111, 255, 233, 0.25) !important;
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
  align-self: flex-start;
}
</style>
