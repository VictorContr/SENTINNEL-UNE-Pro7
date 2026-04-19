<!-- ══════════════════════════════════════════════════════════════════
     TrazabilidadPage.vue (profesor) — Vista detalle de un estudiante.
     Thin Page: ficha del estudiante, progreso secuencial en Stepper,
     panel enfocado de conversación y deploy final.

     GESTIÓN DE MEMORIA (Sprint 2):
     ─────────────────────────────
     `onUnmounted` llama a `chatStore_sm_vc.salirDeSala_sm_vc()` para
     garantizar que al navegar fuera de esta página (ej: volver a
     la lista de estudiantes) el socket sea desconectado.

     NOTA: En el modo TRAZABILIDAD el profesor solo observa, NO escribe.
     El panel de conversación embebido usa modoVista_sm_vc='TRAZABILIDAD',
     lo que activa la lógica de solo lectura en DocumentConversacion.
     Sufijos _sm_vc en todo el script.
     ══════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <!-- ── VISTA PRINCIPAL (Ficha + Stepper + Deploy) ── -->
    <div v-if="!materiaSeleccionada_sm_vc">
      <!-- Botón Volver -->
      <q-btn
        flat
        no-caps
        icon="arrow_back"
        label="Volver a Estudiantes"
        color="grey-5"
        size="sm"
        class="q-mb-lg"
        @click="router_sm_vc.push('/profesor/estudiantes')"
      />

      <!-- Ficha del estudiante -->
      <div v-if="estudiante_sm_vc" class="student-ficha_sm_vc">
        <div class="ficha-avatar_sm_vc">
          {{ iniciales_sm_vc(estudiante_sm_vc.nombre_sm_vc) }}
        </div>
        <div class="ficha-data_sm_vc">
          <h1 class="ficha-nombre_sm_vc">
            {{ estudiante_sm_vc?.nombre_sm_vc ?? 'Estudiante' }} {{ estudiante_sm_vc?.apellido_sm_vc ?? '' }}
          </h1>
          <div class="ficha-meta_sm_vc">
            <span class="meta-item_sm_vc">
              <q-icon name="badge" size="15px" />
              {{ estudiante_sm_vc.cedula_sm_vc || estudiante_sm_vc.id_sm_vc }}
            </span>
            <span v-if="estudiante_sm_vc.correo_sm_vc" class="meta-item_sm_vc">
              <q-icon name="email" size="15px" />
              {{ estudiante_sm_vc.correo_sm_vc }}
            </span>
            <span v-if="estudiante_sm_vc.rol_sm_vc" class="meta-item_sm_vc">
              <q-icon name="school" size="15px" />
              {{ estudiante_sm_vc.rol_sm_vc }}
            </span>
            <span class="meta-item_sm_vc">
              <q-icon name="calendar_month" size="15px" />
              Periodo: {{ estudiante_sm_vc.cohorte_sm_vc }}
            </span>
            <template v-if="estudiante_sm_vc.estudiante_sm_vc">
              <span v-if="estudiante_sm_vc.estudiante_sm_vc.profesor_tutor || estudiante_sm_vc.estudiante_sm_vc.profesorTutor" class="meta-item_sm_vc">
                <q-icon name="local_library" size="15px" />
                Profesor: {{ estudiante_sm_vc.estudiante_sm_vc.profesorTutor?.nombre_sm_vc || estudiante_sm_vc.estudiante_sm_vc.profesor_tutor?.nombre_sm_vc }} {{ estudiante_sm_vc.estudiante_sm_vc.profesorTutor?.apellido_sm_vc || estudiante_sm_vc.estudiante_sm_vc.profesor_tutor?.apellido_sm_vc }}
              </span>
              <span v-if="estudiante_sm_vc.estudiante_sm_vc.tutor_empresarial_sm_vc" class="meta-item_sm_vc">
                <q-icon name="supervisor_account" size="15px" />
                Tutor: {{ estudiante_sm_vc.estudiante_sm_vc.tutor_empresarial_sm_vc }}
              </span>
              <span v-if="estudiante_sm_vc.estudiante_sm_vc.empresa_sm_vc" class="meta-item_sm_vc">
                <q-icon name="business" size="15px" />
                Empresa: {{ estudiante_sm_vc.estudiante_sm_vc.empresa_sm_vc }}
              </span>
              <span v-if="estudiante_sm_vc.estudiante_sm_vc.titulo_proyecto_sm_vc" class="meta-item_sm_vc">
                <q-icon name="work" size="15px" />
                Proyecto: {{ estudiante_sm_vc.estudiante_sm_vc.titulo_proyecto_sm_vc }}
              </span>
            </template>
          </div>
        </div>
        <div class="ficha-global-estado_sm_vc">
          <div class="global-estado-label_sm_vc">Progreso Global</div>
          <q-circular-progress
            :value="progresoGlobal_sm_vc"
            size="55px"
            :thickness="0.15"
            color="teal-3"
            track-color="blue-grey-9"
            show-value
          >
            <span class="pct-label_sm_vc">{{ progresoGlobal_sm_vc }}%</span>
          </q-circular-progress>
        </div>
      </div>

      <!-- Sección trazabilidad por materia -->
      <div class="section-title_sm_vc">
        <q-icon name="track_changes" size="16px" color="teal-3" />
        <span>Trazabilidad Académica</span>
      </div>

      <!-- Stepper Vertical -->
      <q-stepper
        v-model="stepActivo_sm_vc"
        vertical
        animated
        flat
        class="stepper_sm_vc"
        active-color="teal-3"
        done-color="teal-4"
        inactive-color="blue-grey-7"
      >
        <q-step
          v-for="materia_sm_vc in materiasConFases_sm_vc"
          :key="materia_sm_vc.id_sm_vc"
          :name="materia_sm_vc.id_sm_vc"
          :title="materia_sm_vc.nombre_sm_vc"
          :caption="materia_sm_vc.captionFase_sm_vc"
          :icon="materia_sm_vc.icono_sm_vc"
          :done="materia_sm_vc.estado_aprobacion_sm_vc === 'APROBADO'"
          :disable="materia_sm_vc.bloqueada"
          :error="materia_sm_vc.estado_aprobacion_sm_vc === 'REPROBADO'"
          :active-icon="materia_sm_vc.icono_sm_vc"
          :done-icon="'check_circle'"
          :error-icon="'cancel'"
          class="step-item_sm_vc"
        >
          <MateriaProgressCard
            :materia="materia_sm_vc"
            :estudiante-id="estudianteId_sm_vc"
            :show-description="true"
            :show-requisitos="true"
            @click="seleccionarMateria_sm_vc"
          />

          <q-stepper-navigation class="step-nav_sm_vc">
            <q-btn
              v-if="!esPrimerStep_sm_vc(materia_sm_vc.id_sm_vc)"
              flat
              no-caps
              color="blue-grey-6"
              icon="arrow_upward"
              label="Anterior"
              size="sm"
              class="step-nav-btn_sm_vc q-mr-sm"
              @click="retrocederStep_sm_vc(materia_sm_vc.id_sm_vc)"
            />
            <q-btn
              v-if="!esUltimoStep_sm_vc(materia_sm_vc.id_sm_vc)"
              unelevated
              no-caps
              color="teal-3"
              text-color="dark"
              icon-right="arrow_downward"
              label="Siguiente materia"
              size="sm"
              class="step-nav-btn_sm_vc"
              :disable="
                materia_sm_vc.bloqueada ||
                proximaDesbloqueada_sm_vc(materia_sm_vc.id_sm_vc) === null
              "
              @click="avanzarStep_sm_vc(materia_sm_vc.id_sm_vc)"
            />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>

      <!-- Panel de Deploy: resumen con botón para ver el detalle completo -->
      <div class="deploy-summary-panel_sm_vc q-mt-xl">
        <div class="section-title_sm_vc q-mb-md">
          <q-icon name="rocket_launch" size="16px" color="teal-3" />
          <span>Proyecto Final de Deploy</span>
        </div>

        <!-- Deploy registrado: muestra URL + botón de detalle -->
        <div
          v-if="deployStore_sm_vc.datosDeploy_sm_vc"
          class="deploy-exists-card_sm_vc"
        >
          <div class="deploy-exists-info_sm_vc">
            <q-icon name="check_circle" color="teal-3" size="18px" />
            <div>
              <p class="deploy-exists-title_sm_vc">Deploy registrado</p>
              <a
                :href="deployStore_sm_vc.datosDeploy_sm_vc.url_produccion_sm_vc"
                target="_blank"
                class="deploy-url_sm_vc"
              >
                <q-icon name="open_in_new" size="12px" />
                {{ deployStore_sm_vc.datosDeploy_sm_vc.url_produccion_sm_vc }}
              </a>
              <!-- Registro de fecha (formatDate_sm_vc para fix de ESLint) -->
              <p class="deploy-date_sm_vc">
                Registrado el
                {{
                  formatDate_sm_vc(
                    deployStore_sm_vc.datosDeploy_sm_vc.fecha_deploy_sm_vc,
                  )
                }}
              </p>
            </div>
          </div>
          <q-btn
            unelevated
            no-caps
            color="teal-3"
            text-color="dark"
            icon-right="arrow_forward"
            label="Ver Detalle"
            size="sm"
            class="deploy-nav-btn_sm_vc"
            @click="verDeploy_sm_vc"
          />
        </div>

        <!-- Sin deploy: estado vacío informativo -->
        <div
          v-else-if="!deployStore_sm_vc.loading_sm_vc"
          class="deploy-empty-card_sm_vc"
        >
          <q-icon name="pending" color="blue-grey-7" size="20px" />
          <p>El estudiante aún no ha registrado su deploy final.</p>
        </div>

        <!-- Cargando -->
        <q-skeleton v-else type="rect" height="60px" />
      </div>
    </div>

    <!-- ── PANEL DE CONVERSACIÓN EN MODO TRAZABILIDAD ── -->
    <!--
      Se muestra cuando el profesor hace clic en "Ver Conversación" de una materia.
      modoVista_sm_vc='TRAZABILIDAD' → DocumentConversacion activará solo lectura;
      la prop `puedeEscribir_sm_vc` será false internamente porque el modo no es 'CHAT'.
      Se conecta igualmente el socket para recibir mensajes en tiempo real si los hay.
    -->
    <div v-if="materiaSeleccionada_sm_vc" class="materia-activa-panel_sm_vc">
      <div class="panel-header_sm_vc">
        <div class="panel-title_sm_vc">
          <q-icon name="edit_document" size="16px" color="teal-3" />
          <span
            >Revisando Informe —
            {{ materiaSeleccionada_sm_vc.nombre_sm_vc }}</span
          >
        </div>
        <q-btn
          flat
          no-caps
          icon="arrow_back"
          label="Volver a trazabilidad"
          color="teal-3"
          size="sm"
          @click="materiaSeleccionada_sm_vc = null"
        />
      </div>
      <div class="conv-embed_sm_vc">
        <!--
          Cambio clave (Sprint 2):
          ANTES: :es-trazabilidad_sm_vc="true" :readonly="..."
          AHORA: :modo-vista_sm_vc="'TRAZABILIDAD'"
          Esto le dice a DocumentConversacion que active el modo de solo lectura
          sin necesitar combinar dos props con lógica implícita confusa.
        -->
        <DocumentConversacion
          :materia-id="materiaSeleccionada_sm_vc.id_sm_vc"
          :estudiante-id="estudianteId_sm_vc"
          :modo-vista_sm_vc="'CHAT'"
          :estado-progreso="materiaSeleccionada_sm_vc.estado_aprobacion_sm_vc"
          @mensajeEnviado="onMensajeEnviado"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Notify } from "quasar";
import { usePasantiasStore } from "src/stores/pasantiasStore";
import { useProgressBarStore } from "src/stores/progressBarStore";
import { useUsersStore } from "src/stores/usersStore";
import { useDeployStore } from "src/stores/deployStore";
import { useChatStore_sm_vc } from "src/stores/chatStore_sm_vc";
import MateriaProgressCard from "src/components/shared/MateriaProgressCard.vue";
import DocumentConversacion from "src/components/shared/DocumentConversacion.vue";
import { getDetalleEstudiante_sm_vc } from "src/services/estudiantesService";


const route_sm_vc = useRoute();
const router_sm_vc = useRouter();
const store_sm_vc = usePasantiasStore();
const progressBar_sm_vc = useProgressBarStore();
const usersStore_sm_vc = useUsersStore();
const deployStore_sm_vc = useDeployStore();

/* ── Store de Chat (WebSocket) ── */
const chatStore_sm_vc = useChatStore_sm_vc();

/* ══════════════════════════════════════════════════════════════
 *  COMPUTED PRINCIPALES
 * ══════════════════════════════════════════════════════════════ */

const estudianteId_sm_vc = computed(() => route_sm_vc.params.id_sm_vc);

const estudiante_sm_vc = computed(() => usersStore_sm_vc.usuarioActual_sm_vc);

const progresoEstudiante_sm_vc = computed(() =>
  store_sm_vc.getProgresoEstudiante(estudianteId_sm_vc.value),
);

const progresoGlobal_sm_vc = computed(() => {
  const items_sm_vc = progresoEstudiante_sm_vc.value;
  if (!items_sm_vc.length) return 0;
  const suma_sm_vc = items_sm_vc.reduce(
    (acc_sm_vc, m_sm_vc) => acc_sm_vc + (m_sm_vc.progreso_decimal || 0),
    0,
  );
  return Math.round((suma_sm_vc / items_sm_vc.length) * 100);
});

/* ── Estado local del Stepper ── */
const stepActivo_sm_vc = ref(null);
const materiaSeleccionada_sm_vc = ref(null);

const materiasConFases_sm_vc = computed(() =>
  progressBar_sm_vc.enriquecerMateriasTrazabilidad_sm_vc(
    progresoEstudiante_sm_vc.value,
  ),
);

/* ══════════════════════════════════════════════════════════════
 *  CICLO DE VIDA
 * ══════════════════════════════════════════════════════════════ */

onMounted(async () => {
  if (estudianteId_sm_vc.value) {
    // 1. Resolver la identidad del usuario a partir del ID de Estudiante (Secuencial)
    try {
      const detalle_sm_vc = await getDetalleEstudiante_sm_vc(estudianteId_sm_vc.value);
      if (detalle_sm_vc && detalle_sm_vc.usuario) {
        // Mapeamos el objeto para que tanto esta página como TrazabilidadLayout sean compatibles.
        // Hacemos que tenga cohorte_sm_vc y agrupamos la data bajo estudiante_sm_vc.
        usersStore_sm_vc.usuarioActual_sm_vc = {
          ...detalle_sm_vc.usuario,
          cohorte_sm_vc: detalle_sm_vc.materia_activa?.periodo_sm_vc || "N/A",
          estudiante_sm_vc: detalle_sm_vc
        };
      }
    } catch (error) {
      console.error("[TrazabilidadPage] Error resolviendo identidad del estudiante:", error);
      Notify.create({ type: "negative", message: "Error al cargar los datos del estudiante." });
    }

    // 2. Cargas que sí dependen del ID Estudiante (se dispara después de tener la identidad ok)
    await Promise.all([
      store_sm_vc.fetch_progreso_estudiante_sm_vc(estudianteId_sm_vc.value),
      deployStore_sm_vc.verificarEstadoDeploy_sm_vc(
        Number(estudianteId_sm_vc.value),
      ),
    ]);
  }

  // Establecer conexión WebSocket en modo observador (modo TRAZABILIDAD)
  // El profesor se conecta para poder recibir actualizaciones en tiempo real,
  // pero no enviará mensajes (el modo TRAZABILIDAD lo bloqueará en el UI).
  if (estudianteId_sm_vc.value) {
    chatStore_sm_vc.conectar_sm_vc();
  }
});

/**
 * Al desmontar esta página (profesor sale de la ficha del estudiante),
 * se abandona la sala de chat de la materia que estuviese observando,
 * pero se MANTIENE el socket vivo para asegurar la recepción
 * de notificaciones globales.
 */
onUnmounted(() => {
  chatStore_sm_vc.salirDeSalaActual_sm_vc();
});

// Inicialización reactiva segura del step activo en el stepper
watchEffect(() => {
  if (stepActivo_sm_vc.value) return;
  const lista_sm_vc = materiasConFases_sm_vc.value;
  if (!lista_sm_vc.length) return;
  const primera_sm_vc =
    lista_sm_vc.find((m_sm_vc) => !m_sm_vc.bloqueada) ?? lista_sm_vc[0];
  stepActivo_sm_vc.value = primera_sm_vc.id_sm_vc;
});

/* ══════════════════════════════════════════════════════════════
 *  WATCH: Sala de chat reactiva según materia seleccionada
 * ══════════════════════════════════════════════════════════════ */

/**
 * Cuando el profesor selecciona una materia para ver la conversación,
 * se une a esa sala específica para recibir cualquier actualización en tiempo real.
 * Cuando cierra el panel (materiaSeleccionada = null), emite el leave.
 */
import { watch } from "vue";

watch(materiaSeleccionada_sm_vc, (nuevaMateria_sm_vc) => {
  if (nuevaMateria_sm_vc && estudianteId_sm_vc.value) {
    // Unirse a la sala de esta materia específica para recibir actualizaciones WS
    chatStore_sm_vc.unirASala_sm_vc(
      estudianteId_sm_vc.value,
      nuevaMateria_sm_vc.id_sm_vc,
    );
  }
});

/* ══════════════════════════════════════════════════════════════
 *  HELPERS: Navegación del Stepper
 * ══════════════════════════════════════════════════════════════ */

const esUltimoStep_sm_vc = (id_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value;
  return lista_sm_vc[lista_sm_vc.length - 1]?.id_sm_vc === id_sm_vc;
};

const esPrimerStep_sm_vc = (id_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value;
  return lista_sm_vc[0]?.id_sm_vc === id_sm_vc;
};

const retrocederStep_sm_vc = (idActual_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value;
  const idx_sm_vc = lista_sm_vc.findIndex(
    (m_sm_vc) => m_sm_vc.id_sm_vc === idActual_sm_vc,
  );
  if (idx_sm_vc > 0) {
    stepActivo_sm_vc.value = lista_sm_vc[idx_sm_vc - 1].id_sm_vc;
  }
};

const proximaDesbloqueada_sm_vc = (idActual_sm_vc) => {
  const lista_sm_vc = materiasConFases_sm_vc.value;
  const idx_sm_vc = lista_sm_vc.findIndex(
    (m_sm_vc) => m_sm_vc.id_sm_vc === idActual_sm_vc,
  );
  const proxima_sm_vc = lista_sm_vc[idx_sm_vc + 1];
  return proxima_sm_vc && !proxima_sm_vc.bloqueada
    ? proxima_sm_vc.id_sm_vc
    : null;
};

const avanzarStep_sm_vc = (idActual_sm_vc) => {
  const proxima_sm_vc = proximaDesbloqueada_sm_vc(idActual_sm_vc);
  if (proxima_sm_vc) stepActivo_sm_vc.value = proxima_sm_vc;
};

/* ── Handlers ── */
const seleccionarMateria_sm_vc = (materia_sm_vc) => {
  materiaSeleccionada_sm_vc.value = materia_sm_vc;
};

// Navegar al DeployPage dedicado del profesor
const verDeploy_sm_vc = () => {
  router_sm_vc.push(`/profesor/estudiantes/${estudianteId_sm_vc.value}/deploy`);
};

// Feedback al enviar corrección
const onMensajeEnviado = () => {
  Notify.create({ type: "positive", message: "Corrección enviada" });
};

/* ── Utils ── */
const iniciales_sm_vc = (nombre_sm_vc) =>
  (nombre_sm_vc ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w_sm_vc) => w_sm_vc[0])
    .join("")
    .toUpperCase();

const formatDate_sm_vc = (iso_sm_vc) =>
  new Date(iso_sm_vc).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
</script>

<style scoped>
/* ── Layout principal ── */
.sntnl-page_sm_vc {
  padding: 1.75rem 2rem;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  font-family: var(--sn-font-mono);
}

/* ── Ficha del estudiante ── */
.student-ficha_sm_vc {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(111, 255, 233, 0.1);
  border-radius: 14px;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.ficha-avatar_sm_vc {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  background: rgba(111, 255, 233, 0.1);
  border: 1px solid rgba(111, 255, 233, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: var(--sn-primario);
  flex-shrink: 0;
}
.ficha-data_sm_vc {
  flex: 1;
}
.ficha-nombre_sm_vc {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--sn-texto-principal);
  margin: 0 0 0.4rem;
  letter-spacing: 0.04em;
}
.ficha-meta_sm_vc {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.meta-item_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.65rem;
  color: var(--sn-texto-terciario);
}

.ficha-global-estado_sm_vc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}
.global-estado-label_sm_vc {
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--sn-texto-apagado);
}
.pct-label_sm_vc {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--sn-primario);
}

/* ── Stepper ── */
.section-title_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--sn-acento-sec);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.stepper_sm_vc {
  background: transparent !important;
  border: 1px solid var(--sn-borde);
  border-radius: 14px;
  margin-bottom: 1.75rem;
  max-width: 860px;
}
:deep(.q-stepper__tab) {
  font-family: var(--sn-font-mono);
}
:deep(.q-stepper__title) {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sn-texto-principal);
  letter-spacing: 0.04em;
}
:deep(.q-stepper__caption) {
  font-size: 0.6rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans);
  margin-top: 2px;
}
:deep(.q-stepper__line) {
  border-color: var(--sn-borde) !important;
}
:deep(.q-stepper__step-inner) {
  background: transparent;
}
:deep(.q-step--disabled .q-stepper__title),
:deep(.q-step--disabled .q-stepper__caption) {
  opacity: 0.4;
}

.step-item_sm_vc {
  border-bottom: 1px solid var(--sn-borde);
}
.step-item_sm_vc:last-child {
  border-bottom: none;
}

.step-nav_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.875rem;
}
.step-nav-btn_sm_vc {
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
}

/* ── Panel Deploy (Resumen para Profesor) ── */
.deploy-summary-panel_sm_vc {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(111, 255, 233, 0.08);
  border-radius: 12px;
  max-width: 860px;
}
.deploy-exists-card_sm_vc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  background: rgba(111, 255, 233, 0.04);
  border: 1px solid rgba(111, 255, 233, 0.15);
  border-radius: 10px;
}
.deploy-exists-info_sm_vc {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.deploy-exists-title_sm_vc {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--sn-primario);
  margin: 0 0 3px;
}
.deploy-url_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--sn-acento-sec);
  text-decoration: none;
  word-break: break-all;
}
.deploy-url_sm_vc:hover {
  text-decoration: underline;
}
.deploy-date_sm_vc {
  font-size: 0.6rem;
  color: var(--sn-texto-apagado);
  margin: 4px 0 0;
  letter-spacing: 0.02em;
}
.deploy-nav-btn_sm_vc {
  font-size: 0.7rem !important;
  border-radius: 6px !important;
}
.deploy-empty-card_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  color: var(--sn-texto-apagado);
  font-size: 0.78rem;
}
.deploy-empty-card_sm_vc p {
  margin: 0;
}

/* ── Panel de conversación activa ── */
.materia-activa-panel_sm_vc {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(111, 255, 233, 0.12);
  border-radius: 14px;
  overflow: hidden;
  max-width: 860px;
}
.panel-header_sm_vc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid rgba(111, 255, 233, 0.08);
  background: rgba(0, 0, 0, 0.2);
}
.panel-title_sm_vc {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: var(--sn-acento-sec);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.conv-embed_sm_vc {
  /* sin padding, DocumentConversacion maneja su propio layout */
}
</style>
