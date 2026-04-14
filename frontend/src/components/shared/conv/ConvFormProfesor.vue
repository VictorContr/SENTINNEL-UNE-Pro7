<!-- ══════════════════════════════════════════════════════════════════
     ConvFormProfesor.vue — Formulario de corrección y evaluación.
     Incluye el modal de aprobación granular de requisitos.

     SPRINT 3: Flujo de Subida en 2 Pasos (Igual que ConvFormEstudiante)
     ─────────────────────────────────────────────────────────────────────
     1. POST /api/documentos (multipart) → obtiene documentoId
     2. chatStore_sm_vc.enviarMensaje_sm_vc(contenido, materiaId, documentoId, 'DOCUMENTO')
        → emite por WS a todos los clientes de la sala

     El archivo de corrección del profesor usa tipo_sm_vc='CORRECCION_PROFESOR'.
     Como el profesor adjunta correcciones (no crea Entregas), usamos
     el Caso A (adjunto flotante, sin entrega_id ni requisito_id).

     TAREA 2: Modal de Vinculación de Entregas
     ─────────────────────────────────────────────────────────────────────
     Al seleccionar "Observación" o "Aprobar Item", se dispara un modal
     que lista los mensajes DOCUMENTO del alumno que no han sido evaluados
     (!msg.evaluacion_estado_sm_vc). Solo se puede seleccionar uno a la vez.
     Al confirmar, se adjunta id_entrega_sm_vc al payload del backend.

     TAREA 3: Acción Global de Reprobar
     ─────────────────────────────────────────────────────────────────────
     "Reprobado" no vincula un documento específico: es un cambio de
     estado global del estudiante. El payload refleja este cambio
     sin id_entrega_sm_vc.

     TAREA 4: Modal de Requisitos con Estado Visual
     ─────────────────────────────────────────────────────────────────────
     Los requisitos ya aprobados aparecen pre-marcados, en verde y
     deshabilitados para evitar re-envíos accidentales.
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
        <q-btn
          outline
          color="grey-5"
          icon="checklist"
          label="Evaluar por Requisitos"
          no-caps
          size="sm"
          class="granular-btn_sm_vc"
          @click="mostrarModal_sm_vc = true"
        />

        <q-btn
          unelevated
          color="teal-3"
          icon="workspace_premium"
          label="Aprobar Toda la Materia"
          no-caps
          size="sm"
          class="bulk-approve-btn_sm_vc"
          @click="mostrarModalAprobarTodo_sm_vc = true"
        />
      </div>

      <!-- Estado de evaluación -->
      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">
          Estado de Evaluación <span class="req-mark_sm_vc">*</span>
        </label>
        <div class="eval-options_sm_vc">
          <button
            v-for="opt in evalOpciones_sm_vc"
            :key="opt.value"
            class="eval-option_sm_vc"
            :class="{
              'eval-option--selected_sm_vc':
                form_sm_vc.estado_evaluacion_sm_vc === opt.value,
              'eval-option--reprobado_sm_vc': opt.value === 'REPROBADO',
            }"
            :style="
              form_sm_vc.estado_evaluacion_sm_vc === opt.value
                ? { borderColor: opt.color, color: opt.color }
                : {}
            "
            @click="form_sm_vc.estado_evaluacion_sm_vc = opt.value"
          >
            <q-icon :name="opt.icon" size="14px" />{{ opt.label }}
          </button>
        </div>

        <!-- Aviso informativo cuando se selecciona "Reprobado" -->
        <div
          v-if="form_sm_vc.estado_evaluacion_sm_vc === 'REPROBADO'"
          class="reprobado-notice_sm_vc"
        >
          <q-icon name="warning_amber" size="14px" color="negative" />
          <span>
            Acción de <strong>Reprobar Materia</strong>: esta decisión cambia el
            estado global del estudiante sin vincular un documento específico.
          </span>
        </div>
      </div>

      <!-- Nota (solo si aprobado individualmente) -->
      <div
        v-if="form_sm_vc.estado_evaluacion_sm_vc === 'APROBADO'"
        class="field-group_sm_vc"
      >
        <label class="field-label_sm_vc">Nota del Requisito (0-20)</label>
        <q-input
          v-model.number="form_sm_vc.nota_sm_dec"
          type="number"
          :min="0"
          :max="20"
          :step="0.1"
          dense
          outlined
          color="teal-3"
          class="sntnl-input_sm_vc nota-input_sm_vc"
        />
      </div>

      <!-- Archivo de corrección (SPRINT 3: ahora puede disparar WS) -->
      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc"
          >Archivo de corrección (Opcional)</label
        >
        <div class="mini-upload_sm_vc" @click="fileInputProf_sm_vc?.click()">
          <q-icon name="attach_file" size="16px" color="grey-5" />
          <span>{{
            form_sm_vc.archivo_nombre_sm_vc || "Seleccionar archivo .pdf"
          }}</span>
          <input
            ref="fileInputProf_sm_vc"
            type="file"
            accept=".pdf,.docx"
            hidden
            @change="handleFileProf_sm_vc"
          />
        </div>
      </div>

      <!-- Observaciones -->
      <div class="field-group_sm_vc">
        <label class="field-label_sm_vc">
          Observaciones / Feedback <span class="req-mark_sm_vc">*</span>
        </label>
        <q-input
          v-model="form_sm_vc.comentario_sm_vc"
          dense
          outlined
          color="teal-3"
          class="sntnl-input_sm_vc"
          placeholder="Describe los puntos a corregir o evalúa el trabajo..."
          type="textarea"
          :rows="3"
          autogrow
        />
      </div>

      <!-- Entrega vinculada (muestra la selección previa del modal) -->
      <div
        v-if="entregaVinculada_sm_vc"
        class="entrega-vinculada-badge_sm_vc"
      >
        <q-icon name="link" size="14px" color="teal-3" />
        <span>Entrega vinculada: <strong>{{ entregaVinculada_sm_vc.archivo_nombre_sm_vc }}</strong></span>
        <q-btn
          flat dense round icon="close" size="xs" color="grey-5"
          @click="entregaVinculada_sm_vc = null"
        >
          <q-tooltip class="bg-dark text-caption">Desvincular</q-tooltip>
        </q-btn>
      </div>

      <!-- Aviso de Estado Vacío: sin documentos pendientes y el estado elegido
           requiere vincular (no es REPROBADO, que es acción global) -->
      <q-banner
        v-if="
          form_sm_vc.estado_evaluacion_sm_vc &&
          form_sm_vc.estado_evaluacion_sm_vc !== 'REPROBADO' &&
          documentosPendientesEvaluar_vc.length === 0
        "
        dense
        rounded
        class="empty-banner-evaluar_sm_vc q-mb-sm"
      >
        <template #avatar>
          <q-icon name="task_alt" color="teal-3" size="sm" />
        </template>
        Todos los documentos de esta fase han sido evaluados. No hay
        entregas pendientes para vincular.
      </q-banner>

      <q-btn
        unelevated
        no-caps
        :label="labelBotonEnvio_sm_vc"
        :icon="iconBotonEnvio_sm_vc"
        class="send-btn_sm_vc send-btn--profesor_sm_vc"
        :loading="enviandoRespuesta_sm_vc"
        :disable="
          props.bloqueado_sm_vc ||
          !form_sm_vc.estado_evaluacion_sm_vc ||
          !form_sm_vc.comentario_sm_vc ||
          enviandoRespuesta_sm_vc ||
          (
            form_sm_vc.estado_evaluacion_sm_vc !== 'REPROBADO' &&
            documentosPendientesEvaluar_vc.length === 0
          )
        "
        @click="handleClickEnvio_sm_vc"
      />
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════
       ESTADO DERIVADO: Modal de Vinculación de Entregas
       Fuente de verdad: documentosPendientesEvaluar_vc (computed)

       Un documento es "pendiente de evaluar" cuando:
         • tipo_nodo_sm_vc === 'DOCUMENTO'
         • remitente_rol_sm_vc !== 'PROFESOR' && !es_sistema_sm_vc
         • estado_sm_vc === 'ENTREGADO'  (esperando revisión académica)

       Si no hay pendientes → q-banner informativo + botón deshabilitado.
       ══════════════════════════════════════════════════════════════════ -->
  <q-dialog v-model="mostrarModalEntregas_sm_vc" persistent>
    <q-card class="modal-card_sm_vc modal-entregas-card_sm_vc">
      <q-card-section class="row items-center q-pb-none">
        <div
          class="text-subtitle1 text-teal-3 text-weight-bold"
          style="display: flex; align-items: center"
        >
          <q-icon name="folder_open" size="sm" class="q-mr-sm" />
          Vincular Entrega del Alumno
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="grey-5" v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-sm text-caption text-grey-5">
          Selecciona el documento que será evaluado con esta
          <strong style="color: var(--sn-texto-principal)">
            {{ form_sm_vc.estado_evaluacion_sm_vc === 'APROBADO' ? 'Aprobación' : 'Observación' }}
          </strong>.
          Solo aparecen documentos del estudiante en estado <code>ENTREGADO</code>.
        </div>

        <!-- ══ Estado Vacío: todos los documentos ya fueron evaluados ══ -->
        <q-banner
          v-if="documentosPendientesEvaluar_vc.length === 0"
          dense
          rounded
          class="empty-banner-evaluar_sm_vc q-mb-sm"
          icon="inbox"
        >
          <template #avatar>
            <q-icon name="task_alt" color="teal-3" size="sm" />
          </template>
          Todos los documentos de esta fase han sido evaluados.
        </q-banner>

        <!-- ── Lista reactiva: solo documentos con estado ENTREGADO ── -->
        <q-list v-else dark bordered separator class="rounded-borders">
          <q-item
            v-for="doc in documentosPendientesEvaluar_vc"
            :key="doc.documento_id_sm_vc"
            tag="label"
            v-ripple
            :class="{ 'doc-item--seleccionado_sm_vc': entregaSeleccionadaTemp_sm_vc?.documento_id_sm_vc === doc.documento_id_sm_vc }"
          >
            <!-- Radio: selección exclusiva (un documento a la vez) -->
            <q-item-section avatar>
              <q-radio
                v-model="entregaSeleccionadaTemp_sm_vc"
                :val="doc"
                color="teal-3"
              />
            </q-item-section>

            <q-item-section avatar>
              <q-avatar size="32px" color="blue-grey-9" text-color="blue-grey-4">
                <q-icon name="description" size="16px" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label style="font-size: 0.8rem; font-weight: 600;">
                {{ doc.archivo_nombre_sm_vc || 'Documento sin nombre' }}
              </q-item-label>
              <q-item-label caption class="text-grey-5" style="font-size: 0.65rem;">
                {{ formatDateTime_sm_vc(doc.fecha_creacion_sm_vc) }}
                <span v-if="doc.requisito_id_sm_vc" class="q-ml-sm">
                  · Req. #{{ doc.requisito_id_sm_vc }}
                </span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <!-- Badge refleja el estado real de la Entrega en BD -->
              <q-badge color="amber-9" text-color="dark" label="ENTREGADO" style="font-size: 0.52rem;" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn outline label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn
          unelevated
          label="Confirmar Vinculación"
          color="teal-3"
          no-caps
          icon="link"
          :disable="!entregaSeleccionadaTemp_sm_vc"
          @click="confirmarVinculacion_sm_vc"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- ── Modal: Evaluación granular de requisitos ── -->
  <q-dialog v-model="mostrarModal_sm_vc">
    <q-card class="modal-card_sm_vc">
      <q-card-section class="row items-center q-pb-none">
        <div
          class="text-subtitle1 text-teal-3 text-weight-bold"
          style="display: flex; align-items: center"
        >
          <q-icon name="checklist" size="sm" class="q-mr-sm" />
          Aprobación por Requisitos
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="grey-5" v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="q-mb-sm text-caption text-grey-5">
          Marca los requisitos que deseas aprobar en este lote.
          Los requisitos <span style="color: #6fffe9; font-weight: 700;">en verde</span>
          ya están consolidados y no se pueden modificar.
        </div>
        <q-list dark bordered separator class="rounded-borders">
          <q-item
            v-for="req in requisitos"
            :key="req.id_sm_vc"
            tag="label"
            v-ripple
            :class="{ 'req-item--aprobado_sm_vc': esRequisitoAprobado_sm_vc(req.id_sm_vc) }"
          >
            <q-item-section avatar>
              <!-- TAREA 4: Si ya está aprobado en BD → deshabilitar checkbox -->
              <q-checkbox
                v-model="requisitosSeleccionados_sm_vc"
                :val="req.id_sm_vc"
                color="teal-3"
                :disable="esRequisitoAprobado_sm_vc(req.id_sm_vc)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label style="font-size: 0.8rem">{{
                req.nombre_sm_vc
              }}</q-item-label>
              <q-item-label
                caption
                class="text-grey-5"
                style="font-size: 0.65rem"
              >
                Orden: {{ req.posicion_sm_vc }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <!-- TAREA 4: Indicador visual consolidado (check verde) -->
              <div
                v-if="esRequisitoAprobado_sm_vc(req.id_sm_vc)"
                class="req-aprobado-badge_sm_vc"
              >
                <q-icon name="check_circle" size="14px" color="teal-3" />
                <span>Aprobado</span>
                <q-badge color="teal-9" label="CONSOLIDADO" style="font-size: 0.48rem; margin-left: 4px;" />
              </div>
              <div v-else class="text-grey-7" style="font-size: 0.65rem">
                Pendiente
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn outline label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn
          unelevated
          label="Registrar Cambios"
          color="teal-3"
          no-caps
          @click="emitirRequisitos_sm_vc"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- ── Modal: Aprobar Materia Completa (Confirmación + Nota) ── -->
  <q-dialog v-model="mostrarModalAprobarTodo_sm_vc" persistent>
    <q-card class="modal-card_sm_vc approve-all-card_sm_vc">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-teal-3">🏆 Aprobar Materia Completa</div>
        <div class="text-caption text-grey-5 q-mt-xs">
          Esta acción marcará **todos** los requisitos como aprobados y cerrará
          la evaluación de la materia actual.
        </div>
      </q-card-section>

      <q-card-section class="q-mt-md">
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc"
            >Calificación Final (0-20)
            <span class="req-mark_sm_vc">*</span></label
          >
          <q-input
            v-model.number="formAprobarTodo_sm_vc.nota_sm_dec"
            type="number"
            :min="0"
            :max="20"
            :step="1"
            outlined
            dense
            color="teal-3"
            class="sntnl-input_sm_vc nota-global-input_sm_vc"
            placeholder="Ej: 18"
          />
        </div>

        <div class="field-group_sm_vc q-mt-md">
          <label class="field-label_sm_vc">Comentario / Acta (Opcional)</label>
          <q-input
            v-model="formAprobarTodo_sm_vc.comentario_sm_vc"
            outlined
            dense
            color="teal-3"
            class="sntnl-input_sm_vc"
            placeholder="Felicitaciones por culminar la materia satisfactoriamente..."
            type="textarea"
            :rows="2"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="Cancelar" color="grey-5" v-close-popup no-caps />
        <q-btn
          unelevated
          label="Aprobar Materia"
          color="teal-3"
          no-caps
          :disable="
            formAprobarTodo_sm_vc.nota_sm_dec === null ||
            formAprobarTodo_sm_vc.nota_sm_dec < 0 ||
            formAprobarTodo_sm_vc.nota_sm_dec > 20
          "
          @click="ejecutarAprobarTodo_sm_vc"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { getRequisitoSeleccionado_sm_vc } from "src/stores/requisitoContextoStore";
import { subirDocumento_sm_vc } from "src/services/documentosService";
import { useChatStore_sm_vc } from "src/stores/chatStore_sm_vc";

const $q = useQuasar();
const chat_sm_vc = useChatStore_sm_vc();

const props = defineProps({
  requisitos: { type: Array, default: () => [] },
  requisitosAprobadosIniciales: { type: Array, default: () => [] },
  /**
   * materiaId: clave de indexación en localStorage y payload WS.
   */
  materiaId: { type: [String, Number], default: null },
  /**
   * estudianteId: ID del estudiante propietario de la conversación.
   * Requerido para enviar notificaciones WebSocket correctamente.
   */
  estudianteId: { type: [String, Number], default: null },
  /**
   * bloqueado_sm_vc: true cuando el WebSocket está desconectado.
   * Bloquea los inputs temporalmente hasta que se restablezca la conexión.
   */
  bloqueado_sm_vc: { type: Boolean, default: false },
  /**
   * TAREA 2: mensajes — Lista completa de mensajes de la conversación.
   * Se filtran los DOCUMENTO del alumno sin evaluación para el modal
   * de vinculación de entregas.
   */
  mensajes: { type: Array, default: () => [] },
});

const emit = defineEmits(["responder", "guardarRequisitos"]);

/* ── Estado local ── */
const mostrarModal_sm_vc = ref(false);
const mostrarModalAprobarTodo_sm_vc = ref(false);
const mostrarModalEntregas_sm_vc = ref(false);
const fileInputProf_sm_vc = ref(null);
const enviandoRespuesta_sm_vc = ref(false);

// Entrega seleccionada en el modal de vinculación (temporal, antes de confirmar)
const entregaSeleccionadaTemp_sm_vc = ref(null);
// Entrega confirmada que se adjuntará al payload
const entregaVinculada_sm_vc = ref(null);

const form_sm_vc = ref({
  estado_evaluacion_sm_vc: null,
  nota_sm_dec: null,
  archivo_nombre_sm_vc: "",
  archivo_raw_sm_vc: null,
  comentario_sm_vc: "",
});

const formAprobarTodo_sm_vc = ref({
  nota_sm_dec: null,
  comentario_sm_vc: "",
});

const evalOpciones_sm_vc = [
  {
    value: "OBSERVACIONES",
    label: "Observaciones",
    icon: "warning",
    color: "#f0a500",
  },
  { value: "APROBADO", label: "Aprobar Item", icon: "done", color: "#6fffe9" },
  { value: "REPROBADO", label: "Reprobar Materia", icon: "block", color: "#ff8fa3" },
];

const requisitosSeleccionados_sm_vc = ref([]);

/* ── Sincronización de requisitos seleccionados al abrir el modal granular ── */
watch(mostrarModal_sm_vc, (val_sm_vc) => {
  if (val_sm_vc) {
    requisitosSeleccionados_sm_vc.value = [
      ...props.requisitosAprobadosIniciales,
    ];
  }
});

/* ── Al cambiar el estado, limpiar la entrega vinculada si se selecciona REPROBADO ── */
watch(() => form_sm_vc.value.estado_evaluacion_sm_vc, (nuevoEstado_sm_vc) => {
  if (nuevoEstado_sm_vc === 'REPROBADO') {
    // TAREA 3: Reprobar no vincula documentos — limpiar selección previa
    entregaVinculada_sm_vc.value = null;
    entregaSeleccionadaTemp_sm_vc.value = null;
  }
});

/* ═══════════════════════════════════════════════════════════════════
   ESTADO DERIVADO — documentosPendientesEvaluar_vc

   Fuente de verdad: props.mensajes (timeline de la materia activa).
   Un documento está "pendiente de evaluar" cuando cumple las 3 reglas:

     R1. tipo_nodo_sm_vc === 'DOCUMENTO'
         → Solo nodos de documento (no texto, no sistema)

     R2. !es_sistema_sm_vc && remitente_rol_sm_vc !== 'PROFESOR'
         → Excluye correcciones del profesor y mensajes automáticos

     R3. estado_sm_vc === 'ENTREGADO'
         → El estado proviene de Entrega.estado_sm_vc (EstadoAprobacion).
           'ENTREGADO' = el estudiante subió pero el profesor aún no evaluó.
           'APROBADO' o 'REPROBADO' = ya existe una Evaluacion en BD → excluir.
           'PENDIENTE' = nunca fue entregado → excluir.

   Resultado: arreglo reactivo que se actualiza automáticamente cada vez
   que el store/prop mensajes cambia (ej: al recibir un nuevo WS event).
   ═══════════════════════════════════════════════════════════════════ */
const documentosPendientesEvaluar_vc = computed(() => {
  return props.mensajes.filter((nodo_sm_vc) => {
    // R1: Solo nodos de tipo DOCUMENTO
    const esNodoDocumento_sm_vc = nodo_sm_vc.tipo_nodo_sm_vc === 'DOCUMENTO';
    if (!esNodoDocumento_sm_vc) return false;

    // R2: Excluir correcciones del profesor y mensajes de sistema
    const esEntregaEstudiante_sm_vc =
      !nodo_sm_vc.es_sistema_sm_vc &&
      nodo_sm_vc.remitente_rol_sm_vc !== 'PROFESOR';
    if (!esEntregaEstudiante_sm_vc) return false;

    // R3: Solo documentos en estado ENTREGADO (esperando revisión académica)
    // APROBADO y REPROBADO ya tienen Evaluacion en BD → no mostrar
    const pendienteDeEvaluar_sm_vc = nodo_sm_vc.estado_sm_vc === 'ENTREGADO';
    return pendienteDeEvaluar_sm_vc;
  });
});

/* ── Computed: label e icono del botón de envío dinámico ── */
const labelBotonEnvio_sm_vc = computed(() => {
  if (form_sm_vc.value.estado_evaluacion_sm_vc === 'REPROBADO') {
    return 'Reprobar Materia';
  }
  return 'Enviar Evaluación';
});

const iconBotonEnvio_sm_vc = computed(() => {
  if (form_sm_vc.value.estado_evaluacion_sm_vc === 'REPROBADO') {
    return 'block';
  }
  return 'send';
});

/* ── TAREA 4: Helper para verificar si un requisito ya está aprobado ── */
const esRequisitoAprobado_sm_vc = (requisitoId_sm_vc) => {
  return props.requisitosAprobadosIniciales.some(
    (id_sm_vc) => String(id_sm_vc) === String(requisitoId_sm_vc)
  );
};

/* ── Handler de selección de archivo ── */
const handleFileProf_sm_vc = (e_sm_vc) => {
  const file = e_sm_vc.target.files[0];
  if (file) {
    form_sm_vc.value.archivo_raw_sm_vc = file;
    form_sm_vc.value.archivo_nombre_sm_vc = file.name;
  }
};

/* ═══════════════════════════════════════════════════════════════════
   ESTADO DERIVADO — handleClickEnvio_sm_vc

   Árbol de decisión de acción al presionar "Enviar Evaluación":

     REPROBADO  → emitirRespuesta_sm_vc(null)  [acción global, sin vínculo]
     APROBADO/
     OBSERV.    → verificar si hay docs pendientes ANTES de abrir modal.
                  Si documentosPendientesEvaluar_vc.length === 0 → abort
                  (el botón ya estará disabled, esta es una segunda capa de protección)
   ═══════════════════════════════════════════════════════════════════ */
const handleClickEnvio_sm_vc = () => {
  if (!form_sm_vc.value.estado_evaluacion_sm_vc || !form_sm_vc.value.comentario_sm_vc) return;

  const estado_sm_vc = form_sm_vc.value.estado_evaluacion_sm_vc;

  if (estado_sm_vc === 'REPROBADO') {
    // Acción Global: reprobar materia no requiere vincular documento
    emitirRespuesta_sm_vc(null);
    return;
  }

  // OBSERVACIONES o APROBADO → requieren vincular una entrega del estudiante
  // Guard: prevenir apertura de modal vacío (segunda capa de protección)
  if (documentosPendientesEvaluar_vc.value.length === 0) return;

  // Si ya hay una entrega vinculada confirmada, enviar directamente
  if (entregaVinculada_sm_vc.value) {
    emitirRespuesta_sm_vc(entregaVinculada_sm_vc.value);
    return;
  }

  // Sin entrega vinculada → abrir modal de selección de documentos
  entregaSeleccionadaTemp_sm_vc.value = null;
  mostrarModalEntregas_sm_vc.value = true;
};

/* ── Confirmar vinculación desde el modal ── */
const confirmarVinculacion_sm_vc = () => {
  if (!entregaSeleccionadaTemp_sm_vc.value) return;

  // Guardar la entrega seleccionada como vinculada
  entregaVinculada_sm_vc.value = entregaSeleccionadaTemp_sm_vc.value;
  mostrarModalEntregas_sm_vc.value = false;

  // Proceder inmediatamente con el envío
  emitirRespuesta_sm_vc(entregaVinculada_sm_vc.value);
};

/* ═══════════════════════════════════════════════════════════════
 *  FLUJO PRINCIPAL DE ENVÍO — Sprint 3 + Tareas 2 y 3
 *
 *  @param {Object|null} entrega_sm_vc — Objeto de entrega vinculada
 *    (null si es Reprobado global).
 *
 *  Acción combinada en un solo clic:
 *    A) Si hay archivo adjunto → POST + notificación WS con tipo DOCUMENTO
 *    B) Siempre → emite evento 'responder' al orquestador (DocumentConversacion)
 *       para que este llame a pasantiasStore.responderCorreccion()
 *
 *  El payload siempre incluye:
 *    - id_entrega_sm_vc: ID de la entrega vinculada (null para REPROBADO)
 *    - es_reprobacion_global_sm_vc: true si es REPROBADO (acción global)
 * ══════════════════════════════════════════════════════════════ */
const emitirRespuesta_sm_vc = async (entrega_sm_vc) => {
  if (
    !form_sm_vc.value.estado_evaluacion_sm_vc ||
    !form_sm_vc.value.comentario_sm_vc
  )
    return;
  if (enviandoRespuesta_sm_vc.value) return; // Guard anti-doble clic

  enviandoRespuesta_sm_vc.value = true;

  try {
    // ── PASO 1+2: Subir archivo si existe y notificar por WS ─────
    // Caso A: El profesor no crea una Entrega, sube un adjunto flotante.
    // El backend acepta tipo CORRECCION_PROFESOR sin entrega_id.
    if (form_sm_vc.value.archivo_raw_sm_vc) {
      const formData_sm_vc = new FormData();
      formData_sm_vc.append(
        "archivo_sm_vc",
        form_sm_vc.value.archivo_raw_sm_vc,
      );
      formData_sm_vc.append("tipo_sm_vc", "CORRECCION_PROFESOR");
      // Sin entrega_id_sm_vc ni requisito_id: adjunto flotante (Caso A)

      const docRespuesta_sm_vc = await subirDocumento_sm_vc(formData_sm_vc);

      // Notificación WS del documento al estudiante
      const contenidoDoc_sm_vc = `📎 Corrección adjunta: ${form_sm_vc.value.archivo_raw_sm_vc.name}`;

      // Incluir estudianteId_sm_vc — requerido por el backend para registrar el mensaje
      chat_sm_vc.enviarMensaje_sm_vc(
        contenidoDoc_sm_vc,
        props.estudianteId, // ID del estudiante (requerido por backend)
        props.materiaId,
        docRespuesta_sm_vc.id_sm_vc, // documentoId del archivo de corrección
      );
    }

    // ── SECCIÓN B: Emitir evento de evaluación al orquestador ─────
    // DocumentConversacion escucha este evento y llama a
    // pasantiasStore.responderCorreccion() con el payload completo.
    //
    // TAREA 2 y 3: Se adjunta id_entrega_sm_vc y el flag de reprobación global.
    const esReprobacionGlobal_sm_vc =
      form_sm_vc.value.estado_evaluacion_sm_vc === 'REPROBADO';

    emit("responder", {
      ...form_sm_vc.value,
      archivo_correccion_sm_vc: form_sm_vc.value.archivo_raw_sm_vc,
      // Contrato de datos con el backend:
      // documento_id_sm_vc es el ID numérico real (INTEGER) del registro Documento en BD.
      // El campo id_sm_vc del nodo usa el formato 'doc-NN' (solo para evitar colisiones
      // en el v-for del frontend). El backend requiere el INT → usamos documento_id_sm_vc.
      id_entrega_sm_vc: esReprobacionGlobal_sm_vc
        ? null
        : (entrega_sm_vc?.documento_id_sm_vc ?? null),
      // Flag para que el backend diferencie la acción global
      es_reprobacion_global_sm_vc: esReprobacionGlobal_sm_vc,
    });

    // ── Limpiar formulario ────────────────────────────────────────
    form_sm_vc.value = {
      estado_evaluacion_sm_vc: null,
      nota_sm_dec: null,
      archivo_nombre_sm_vc: "",
      archivo_raw_sm_vc: null,
      comentario_sm_vc: "",
    };
    entregaVinculada_sm_vc.value = null;
    entregaSeleccionadaTemp_sm_vc.value = null;
    if (fileInputProf_sm_vc.value) fileInputProf_sm_vc.value.value = "";

    $q.notify({
      type: 'positive',
      message: esReprobacionGlobal_sm_vc
        ? 'Acción de Reprobar Materia registrada correctamente.'
        : 'Evaluación enviada correctamente.',
      icon: esReprobacionGlobal_sm_vc ? 'block' : 'how_to_reg',
      position: 'top-right',
      timeout: 3000,
    });
  } catch (err_sm_vc) {
    const msg_sm_vc =
      err_sm_vc?.response?.data?.message ||
      "Error al subir el archivo de corrección.";

    $q.notify({
      type: "negative",
      message: msg_sm_vc,
      icon: "error_outline",
      position: "top",
      timeout: 5000,
    });
  } finally {
    enviandoRespuesta_sm_vc.value = false;
  }
};

/* ── Helpers de formato (para el modal de entregas) ── */
const formatDateTime_sm_vc = (iso_sm_vc) => {
  if (!iso_sm_vc) return '';
  return new Date(iso_sm_vc).toLocaleString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/* ── Handlers de modales ── */
const emitirRequisitos_sm_vc = () => {
  emit("guardarRequisitos", {
    ids: [...requisitosSeleccionados_sm_vc.value],
  });
  mostrarModal_sm_vc.value = false;
};

const ejecutarAprobarTodo_sm_vc = () => {
  const todosIds_sm_vc = props.requisitos.map((r) => r.id_sm_vc);
  emit("guardarRequisitos", {
    ids: todosIds_sm_vc,
    nota_global: formAprobarTodo_sm_vc.value.nota_sm_dec,
    comentario: formAprobarTodo_sm_vc.value.comentario_sm_vc,
  });
  mostrarModalAprobarTodo_sm_vc.value = false;
  formAprobarTodo_sm_vc.value = { nota_sm_dec: null, comentario_sm_vc: "" };
};

/* ══════════════════════════════════════════════════════════════
 *  FEATURE: Pre-selección en el modal granular desde localStorage.
 * ══════════════════════════════════════════════════════════════ */
onMounted(() => {
  const idContexto_sm_vc = getRequisitoSeleccionado_sm_vc(props.materiaId);
  if (idContexto_sm_vc === null) return;

  const idStr_sm_vc = String(idContexto_sm_vc);
  const existe_sm_vc = props.requisitos.some(
    (r_sm_vc) => String(r_sm_vc.id_sm_vc) === idStr_sm_vc,
  );
  if (!existe_sm_vc) return;

  const requisito_sm_vc = props.requisitos.find(
    (r_sm_vc) => String(r_sm_vc.id_sm_vc) === idStr_sm_vc,
  );
  const idOriginal_sm_vc = requisito_sm_vc?.id_sm_vc ?? idContexto_sm_vc;

  if (!requisitosSeleccionados_sm_vc.value.includes(idOriginal_sm_vc)) {
    requisitosSeleccionados_sm_vc.value = [
      ...requisitosSeleccionados_sm_vc.value,
      idOriginal_sm_vc,
    ];
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
  color: var(--sn-texto-terciario);
  letter-spacing: 0.06em;
  margin-bottom: 1rem;
  text-transform: uppercase;
}
.action-form_sm_vc {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.bulk-actions_sm_vc {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.bulk-approve-btn_sm_vc {
  background: rgba(111, 255, 233, 0.08) !important;
  border: 1px solid rgba(111, 255, 233, 0.2) !important;
  font-weight: 700 !important;
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
:deep(.sntnl-input_sm_vc .q-field__control) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important;
  border-radius: 6px !important;
}
:deep(.sntnl-input_sm_vc .q-field__native) {
  color: var(--sn-texto-principal) !important;
  font-size: 0.78rem !important;
  font-family: var(--sn-font-mono) !important;
}
.nota-input_sm_vc,
.nota-global-input_sm_vc {
  max-width: 120px;
}
.mini-upload_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--sn-surface-alpha);
  border: 1px dashed rgba(158, 158, 158, 0.25);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.72rem;
  color: var(--sn-texto-secundario);
  transition: all 0.15s;
}
.mini-upload_sm_vc:hover {
  border-color: rgba(158, 158, 158, 0.45);
}
.eval-options_sm_vc {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.eval-option_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.75rem;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: 6px;
  font-size: 0.65rem;
  color: var(--sn-texto-terciario);
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--sn-font-mono);
}
.eval-option_sm_vc:hover {
  background: rgba(255, 255, 255, 0.05);
}
.eval-option--selected_sm_vc {
  font-weight: 700;
}
/* Estilo adicional para el botón de Reprobar (feedback de peligro) */
.eval-option--reprobado_sm_vc:hover {
  background: rgba(255, 143, 163, 0.06);
  border-color: rgba(255, 143, 163, 0.35);
}

/* Aviso informativo de reprobación global */
.reprobado-notice_sm_vc {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  font-size: 0.65rem;
  color: #fca5a5;
  font-family: var(--sn-font-sans);
  line-height: 1.5;
  margin-top: 0.25rem;
}
.reprobado-notice_sm_vc strong {
  color: #ff8fa3;
}

/* Badge de entrega ya vinculada */
.entrega-vinculada-badge_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: rgba(111, 255, 233, 0.06);
  border: 1px solid rgba(111, 255, 233, 0.2);
  border-radius: 6px;
  font-size: 0.68rem;
  color: var(--sn-texto-secundario);
  font-family: var(--sn-font-sans);
}
.entrega-vinculada-badge_sm_vc strong {
  color: #6fffe9;
}

.send-btn_sm_vc {
  background: var(--sn-surface-active) !important;
  color: var(--sn-primario) !important;
  border: 1px solid rgba(111, 255, 233, 0.25) !important;
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  border-radius: 6px !important;
  align-self: flex-start;
  margin-top: 5px;
}
.send-btn--profesor_sm_vc {
  background: rgba(158, 158, 158, 0.1) !important;
  color: #9e9e9e !important;
  border-color: rgba(158, 158, 158, 0.25) !important;
}

/* ── Modales ── */
.modal-card_sm_vc {
  background: var(--sn-fondo-panel) !important;
  border: 1px solid var(--sn-borde-hover) !important;
  border-radius: 12px !important;
  min-width: 450px;
  font-family: var(--sn-font-mono);
}
.approve-all-card_sm_vc {
  max-width: 500px;
}

/* Modal de entregas */
.modal-entregas-card_sm_vc {
  min-width: 520px;
  max-width: 640px;
}

/* -- Estado vacio: q-banner de Estado Derivado --
   Usado en el panel principal (cuando estado !== REPROBADO y no hay pendientes)
   y dentro del modal de vinculacion de entregas si no hay documentos ENTREGADO. */
.empty-banner-evaluar_sm_vc {
  background: rgba(111, 255, 233, 0.06) !important;
  border: 1px solid rgba(111, 255, 233, 0.18) !important;
  border-radius: 8px !important;
  color: var(--sn-texto-secundario) !important;
  font-size: 0.75rem !important;
}

/* Item seleccionado del modal de entregas */
.doc-item--seleccionado_sm_vc {
  background: rgba(111, 255, 233, 0.06) !important;
}

/* Estilos del modal de requisitos (estado consolidado) */
/* Item de requisito ya aprobado: fondo verde muy sutil */
.req-item--aprobado_sm_vc {
  background: rgba(111, 255, 233, 0.04) !important;
  border-left: 2px solid rgba(111, 255, 233, 0.3) !important;
}

/* Badge de Aprobado + Consolidado */
.req-aprobado-badge_sm_vc {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: #6fffe9;
  font-weight: 600;
}
</style>