import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "./authStore";

/**
 * SENTINNEL — pasantiasStore
 * Store centralizado que gestiona:
 *   - Materias y su configuración
 *   - Requisitos (documentos solicitados por materia)
 *   - ProgresoEstudiante (estado de aprobación por materia-estudiante)
 *   - Conversaciones (historial documental por materia-estudiante)
 *   - ProyectoDeploy
 *
 * Todas las claves respetan la convención de sufijos Prisma (_sm_vc, _sm_int, etc.)
 */

/* ═══════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════ */

export const ESTADO_APROBACION = {
  PENDIENTE: { color: "#5a7fa8", bg: "rgba(90,127,168,0.1)", icon: "schedule" },
  ENTREGADO: {
    color: "#7ec8e3",
    bg: "rgba(126,200,227,0.1)",
    icon: "upload_file",
  },
  APROBADO: {
    color: "#6fffe9",
    bg: "rgba(111,255,233,0.1)",
    icon: "check_circle",
  },
  REPROBADO: { color: "#ff8fa3", bg: "rgba(255,143,163,0.1)", icon: "cancel" },
};

const MOCK_MATERIAS = [
  {
    id_sm_vc: "MAT-001",
    nombre_sm_vc: "Pasantías I",
    descripcion_sm_vc:
      "Introducción al entorno empresarial y diagnóstico organizacional.",
    orden_sm_int: 1,
    requisitos: [
      {
        id_sm_vc: "REQ-001",
        nombre_sm_vc: "Carta de Aceptación",
        obligatorio_sm_vc: true,
        orden_sm_int: 1,
      },
      {
        id_sm_vc: "REQ-002",
        nombre_sm_vc: "Capítulo I — Introducción",
        obligatorio_sm_vc: true,
        orden_sm_int: 2,
      },
      {
        id_sm_vc: "REQ-003",
        nombre_sm_vc: "Capítulo II — Marco Teórico",
        obligatorio_sm_vc: true,
        orden_sm_int: 3,
      },
      {
        id_sm_vc: "REQ-004",
        nombre_sm_vc: "Informe Final I",
        obligatorio_sm_vc: true,
        orden_sm_int: 4,
      },
    ],
  },
  {
    id_sm_vc: "MAT-002",
    nombre_sm_vc: "Pasantías II",
    descripcion_sm_vc:
      "Desarrollo del proyecto y ejecución de actividades en la empresa.",
    orden_sm_int: 2,
    requisitos: [
      {
        id_sm_vc: "REQ-005",
        nombre_sm_vc: "Capítulo III — Metodología",
        obligatorio_sm_vc: true,
        orden_sm_int: 1,
      },
      {
        id_sm_vc: "REQ-006",
        nombre_sm_vc: "Capítulo IV — Resultados",
        obligatorio_sm_vc: true,
        orden_sm_int: 2,
      },
      {
        id_sm_vc: "REQ-007",
        nombre_sm_vc: "Evaluación Empresarial",
        obligatorio_sm_vc: false,
        orden_sm_int: 3,
      },
      {
        id_sm_vc: "REQ-008",
        nombre_sm_vc: "Informe Final II",
        obligatorio_sm_vc: true,
        orden_sm_int: 4,
      },
    ],
  },
  {
    id_sm_vc: "MAT-003",
    nombre_sm_vc: "Pasantías III",
    descripcion_sm_vc:
      "Presentación, defensa y documentación del proyecto final.",
    orden_sm_int: 3,
    requisitos: [
      {
        id_sm_vc: "REQ-009",
        nombre_sm_vc: "Capítulo V — Conclusiones",
        obligatorio_sm_vc: true,
        orden_sm_int: 1,
      },
      {
        id_sm_vc: "REQ-010",
        nombre_sm_vc: "Anexos y Bibliografía",
        obligatorio_sm_vc: false,
        orden_sm_int: 2,
      },
      {
        id_sm_vc: "REQ-011",
        nombre_sm_vc: "Acta de Entrega Empresa",
        obligatorio_sm_vc: true,
        orden_sm_int: 3,
      },
      {
        id_sm_vc: "REQ-012",
        nombre_sm_vc: "Informe Final III (Tesis)",
        obligatorio_sm_vc: true,
        orden_sm_int: 4,
      },
    ],
  },
];

/* Progreso por (estudiante × materia) */
const MOCK_PROGRESO = [
  /* Luis Ramírez – USR-003 */
  {
    id_sm_vc: "PRG-001",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-001",
    estado_aprobacion_sm_vc: "APROBADO",
    nota_sm_dec: 18.5,
    fecha_aprobacion_sm_vc: "2024-03-15T10:00:00Z",
    intentos_sm_int: 2,
  },
  {
    id_sm_vc: "PRG-002",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-002",
    estado_aprobacion_sm_vc: "ENTREGADO",
    nota_sm_dec: null,
    fecha_aprobacion_sm_vc: null,
    intentos_sm_int: 1,
  },
  {
    id_sm_vc: "PRG-003",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-003",
    estado_aprobacion_sm_vc: "PENDIENTE",
    nota_sm_dec: null,
    fecha_aprobacion_sm_vc: null,
    intentos_sm_int: 0,
  },
  /* María González – USR-010 */
  {
    id_sm_vc: "PRG-004",
    estudiante_id_sm_vc: "USR-010",
    materia_id_sm_vc: "MAT-001",
    estado_aprobacion_sm_vc: "ENTREGADO",
    nota_sm_dec: null,
    fecha_aprobacion_sm_vc: null,
    intentos_sm_int: 1,
  },
  {
    id_sm_vc: "PRG-005",
    estudiante_id_sm_vc: "USR-010",
    materia_id_sm_vc: "MAT-002",
    estado_aprobacion_sm_vc: "PENDIENTE",
    nota_sm_dec: null,
    fecha_aprobacion_sm_vc: null,
    intentos_sm_int: 0,
  },
  {
    id_sm_vc: "PRG-006",
    estudiante_id_sm_vc: "USR-010",
    materia_id_sm_vc: "MAT-003",
    estado_aprobacion_sm_vc: "PENDIENTE",
    nota_sm_dec: null,
    fecha_aprobacion_sm_vc: null,
    intentos_sm_int: 0,
  },
  /* Carlos Pérez – USR-011 */
  {
    id_sm_vc: "PRG-007",
    estudiante_id_sm_vc: "USR-011",
    materia_id_sm_vc: "MAT-001",
    estado_aprobacion_sm_vc: "APROBADO",
    nota_sm_dec: 20,
    fecha_aprobacion_sm_vc: "2023-12-01T10:00:00Z",
    intentos_sm_int: 1,
  },
  {
    id_sm_vc: "PRG-008",
    estudiante_id_sm_vc: "USR-011",
    materia_id_sm_vc: "MAT-002",
    estado_aprobacion_sm_vc: "APROBADO",
    nota_sm_dec: 19,
    fecha_aprobacion_sm_vc: "2024-01-20T10:00:00Z",
    intentos_sm_int: 1,
  },
  {
    id_sm_vc: "PRG-009",
    estudiante_id_sm_vc: "USR-011",
    materia_id_sm_vc: "MAT-003",
    estado_aprobacion_sm_vc: "APROBADO",
    nota_sm_dec: 17,
    fecha_aprobacion_sm_vc: "2024-03-05T10:00:00Z",
    intentos_sm_int: 1,
  },
];

/* Mensajes del chat documental por (estudiante × materia) */
const MOCK_CONVERSACIONES = [
  /* USR-003 × MAT-001 (historial completo aprobado) */
  {
    id_sm_vc: "MSG-001",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-001",
    remitente_id_sm_vc: "USR-003",
    remitente_rol_sm_vc: "ESTUDIANTE",
    tipo_sm_vc: "INFORME",
    version_sm_vc: "v1.0",
    archivo_nombre_sm_vc: "InformeI_Luis_v1.pdf",
    tamanio_sm_vc: "2.3 MB",
    comentario_sm_vc: "Primera entrega del Informe Completo.",
    estado_evaluacion_sm_vc: null,
    fecha_sm_vc: "2024-01-10T09:00:00Z",
    requisito_id_sm_vc: "REQ-004",
  },
  {
    id_sm_vc: "MSG-002",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-001",
    remitente_id_sm_vc: "USR-002",
    remitente_rol_sm_vc: "PROFESOR",
    tipo_sm_vc: "CORRECCION",
    version_sm_vc: "C1",
    archivo_nombre_sm_vc: "Correc_InformeI_v1.pdf",
    tamanio_sm_vc: "0.8 MB",
    comentario_sm_vc:
      "Revisar la sección de justificación del problema. Marco teórico incompleto.",
    estado_evaluacion_sm_vc: "OBSERVACIONES",
    fecha_sm_vc: "2024-01-15T14:30:00Z",
    requisito_id_sm_vc: null,
  },
  {
    id_sm_vc: "MSG-003",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-001",
    remitente_id_sm_vc: "USR-003",
    remitente_rol_sm_vc: "ESTUDIANTE",
    tipo_sm_vc: "INFORME",
    version_sm_vc: "v2.0",
    archivo_nombre_sm_vc: "InformeI_Luis_v2.pdf",
    tamanio_sm_vc: "2.7 MB",
    comentario_sm_vc:
      "Correcciones aplicadas. Amplié la sección 1.3 y completé el marco teórico.",
    estado_evaluacion_sm_vc: null,
    fecha_sm_vc: "2024-02-01T10:00:00Z",
    requisito_id_sm_vc: "REQ-004",
  },
  {
    id_sm_vc: "MSG-004",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-001",
    remitente_id_sm_vc: "USR-002",
    remitente_rol_sm_vc: "PROFESOR",
    tipo_sm_vc: "CORRECCION",
    version_sm_vc: "C2",
    archivo_nombre_sm_vc: "Evaluacion_Final_InformeI.pdf",
    tamanio_sm_vc: "0.5 MB",
    comentario_sm_vc:
      "Excelente corrección. Informe aprobado con nota 18.5/20.",
    estado_evaluacion_sm_vc: "APROBADO",
    fecha_sm_vc: "2024-03-15T11:00:00Z",
    requisito_id_sm_vc: null,
  },
  /* USR-003 × MAT-002 (activa, en curso) */
  {
    id_sm_vc: "MSG-005",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-002",
    remitente_id_sm_vc: "USR-003",
    remitente_rol_sm_vc: "ESTUDIANTE",
    tipo_sm_vc: "INFORME",
    version_sm_vc: "v1.0",
    archivo_nombre_sm_vc: "Cap3_Metodologia_v1.pdf",
    tamanio_sm_vc: "1.9 MB",
    comentario_sm_vc: "Entrego Capítulo 3 - Metodología.",
    estado_evaluacion_sm_vc: null,
    fecha_sm_vc: "2024-04-02T08:00:00Z",
    requisito_id_sm_vc: "REQ-005",
  },
  {
    id_sm_vc: "MSG-006",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-002",
    remitente_id_sm_vc: "USR-002",
    remitente_rol_sm_vc: "PROFESOR",
    tipo_sm_vc: "CORRECCION",
    version_sm_vc: "C1",
    archivo_nombre_sm_vc: "Obs_Cap3_v1.pdf",
    tamanio_sm_vc: "0.6 MB",
    comentario_sm_vc:
      "La metodología está bien estructurada. Añade el cronograma de actividades.",
    estado_evaluacion_sm_vc: "OBSERVACIONES",
    fecha_sm_vc: "2024-04-08T16:00:00Z",
    requisito_id_sm_vc: null,
  },
  {
    id_sm_vc: "MSG-007",
    estudiante_id_sm_vc: "USR-003",
    materia_id_sm_vc: "MAT-002",
    remitente_id_sm_vc: "USR-003",
    remitente_rol_sm_vc: "ESTUDIANTE",
    tipo_sm_vc: "INFORME",
    version_sm_vc: "v1.0",
    archivo_nombre_sm_vc: "Cap4_Resultados_v1.pdf",
    tamanio_sm_vc: "3.1 MB",
    comentario_sm_vc: "Entrego Capítulo 4 con resultados y gráficas.",
    estado_evaluacion_sm_vc: null,
    fecha_sm_vc: "2024-04-20T09:30:00Z",
    requisito_id_sm_vc: "REQ-006",
  },
];

/* ProyectoDeploy */
const MOCK_DEPLOY = [
  {
    id_sm_vc: "DEP-001",
    estudiante_id_sm_vc: "USR-011",
    url_produccion_sm_vc: "https://carlos-perez-pasantia.netlify.app",
    archivo_codigo_id_sm_vc: "proyecto_final_cperez.zip",
    documentacion_tecnica_id_sm_vc: "documentacion_tecnica_cperez.pdf",
    fecha_registro_sm_vc: "2024-03-10T12:00:00Z",
  },
];

/* Metadata enriquecida de estudiantes (reemplaza los mocks duplicados de EstudiantesPage) */
const MOCK_ESTUDIANTES_DATA_sm_vc = [
  {
    id_sm_vc: "USR-003",
    cohorte_sm_vc: "P-165",
    profesor_id_sm_vc: "USR-002",
    empresa_sm_vc: "TechVe C.A.",
  },
  {
    id_sm_vc: "USR-010",
    cohorte_sm_vc: "P-165",
    profesor_id_sm_vc: "USR-002",
    empresa_sm_vc: "DataSoft",
  },
  {
    id_sm_vc: "USR-011",
    cohorte_sm_vc: "P-164",
    profesor_id_sm_vc: "USR-002",
    empresa_sm_vc: "InnoTech",
  },
];

/* ═══════════════════════════════════════════════════════
   STORE
   ═══════════════════════════════════════════════════════ */
export const usePasantiasStore = defineStore("pasantias", () => {
  const auth = useAuthStore();

  /* ── State ── */
  const materias_sm = ref([...MOCK_MATERIAS]);
  const progreso_sm = ref([...MOCK_PROGRESO]);
  const conversaciones_sm = ref([...MOCK_CONVERSACIONES]);
  const deploys_sm = ref([...MOCK_DEPLOY]);
  const loading_sm_vc = ref(false);

  /* ══════════════════════════════
     GETTERS — MATERIAS
     ══════════════════════════════ */
  const getMaterias = computed(() => materias_sm.value);

  function getMateriaById(id_sm_vc) {
    return materias_sm.value.find((m) => m.id_sm_vc === id_sm_vc) ?? null;
  }

  /* ══════════════════════════════
     GETTERS — PROGRESO
     ══════════════════════════════ */

  /** Progreso completo de un estudiante (array de 3 objetos enriquecidos) */
  function getProgresoEstudiante(estudiante_id_sm_vc) {
    return materias_sm.value.map((materia) => {
      const prog = progreso_sm.value.find(
        (p) =>
          p.estudiante_id_sm_vc === estudiante_id_sm_vc &&
          p.materia_id_sm_vc === materia.id_sm_vc,
      );
      const estado = prog?.estado_aprobacion_sm_vc ?? "PENDIENTE";
      const conversacion = getConversacion(
        estudiante_id_sm_vc,
        materia.id_sm_vc,
      );
      // Progreso estricto basado en aprobaciones granulares del profesor
      const detalles_aprobados = prog?.requisitos_aprobados_detalle_sm ?? [];
      const reqAprobados = detalles_aprobados.length;

      return {
        ...materia,
        progreso: prog ?? null,
        estado_aprobacion_sm_vc: estado,
        meta_estado: ESTADO_APROBACION[estado],
        nota_sm_dec: prog?.nota_sm_dec ?? null,
        fecha_aprobacion_sm_vc: prog?.fecha_aprobacion_sm_vc ?? null,
        intentos_sm_int: prog?.intentos_sm_int ?? 0,
        requisitos_aprobados_sm_int: reqAprobados,
        total_requisitos_sm_int: materia.requisitos.length,
        progreso_decimal:
          estado === "APROBADO"
            ? 1
            : materia.requisitos.length > 0
            ? reqAprobados / materia.requisitos.length
            : 0,
        conversacion_count_sm_int: conversacion.length,
        bloqueada: (() => {
          const ordenActual = materia.orden_sm_int;
          if (ordenActual === 1) return false;
          const anterior = materias_sm.value.find(
            (m) => m.orden_sm_int === ordenActual - 1,
          );
          const progAnterior = progreso_sm.value.find(
            (p) =>
              p.estudiante_id_sm_vc === estudiante_id_sm_vc &&
              p.materia_id_sm_vc === anterior?.id_sm_vc,
          );
          return progAnterior?.estado_aprobacion_sm_vc !== "APROBADO";
        })(),
      };
    });
  }

  /** Progreso del estudiante actualmente logueado */
  const miProgreso = computed(() => {
    if (!auth.user || auth.user.rol_sm_vc !== "ESTUDIANTE") return [];
    return getProgresoEstudiante(auth.user.id_sm_vc);
  });

  const todasAprobadas = computed(
    () =>
      miProgreso.value.length > 0 &&
      miProgreso.value.every((m) => m.estado_aprobacion_sm_vc === "APROBADO"),
  );

  /* ══════════════════════════════
     GETTERS — CONVERSACIÓN
     ══════════════════════════════ */
  function getConversacion(estudiante_id_sm_vc, materia_id_sm_vc) {
    return conversaciones_sm.value
      .filter(
        (m) =>
          m.estudiante_id_sm_vc === estudiante_id_sm_vc &&
          m.materia_id_sm_vc === materia_id_sm_vc,
      )
      .sort((a, b) => new Date(a.fecha_sm_vc) - new Date(b.fecha_sm_vc));
  }

  /* ══════════════════════════════
     GETTERS — DEPLOY
     ══════════════════════════════ */
  function getDeployEstudiante(estudiante_id_sm_vc) {
    return (
      deploys_sm.value.find(
        (d) => d.estudiante_id_sm_vc === estudiante_id_sm_vc,
      ) ?? null
    );
  }

  const miDeploy = computed(() => {
    if (!auth.user) return null;
    return getDeployEstudiante(auth.user.id_sm_vc);
  });

  /* ══════════════════════════════
     GETTERS — ESTUDIANTES (para profesor)
     ══════════════════════════════ */
  function getEstudiantesDelProfesor(profesor_id_sm_vc) {
    const enriched_sm_vc = MOCK_ESTUDIANTES_DATA_sm_vc.filter(
      (e) => e.profesor_id_sm_vc === profesor_id_sm_vc,
    )
      .map((e) => {
        const user_sm_vc = auth.MOCK_USERS.find(
          (u) => u.id_sm_vc === e.id_sm_vc,
        );
        if (!user_sm_vc) return null;
        const prog_sm_vc = getProgresoEstudiante(e.id_sm_vc);
        const estado_actual_sm_vc =
          prog_sm_vc.find((m) => m.estado_aprobacion_sm_vc !== "APROBADO")
            ?.estado_aprobacion_sm_vc ||
          (prog_sm_vc.every((m) => m.estado_aprobacion_sm_vc === "APROBADO")
            ? "APROBADO"
            : "PENDIENTE");
        return {
          ...user_sm_vc,
          cohorte_sm_vc: e.cohorte_sm_vc,
          empresa_sm_vc: e.empresa_sm_vc,
          estado_actual_sm_vc,
          materias_sm_vc: prog_sm_vc.map((m) => ({
            nombre: m.nombre_sm_vc,
            estado: m.estado_aprobacion_sm_vc,
            progreso: m.progreso_decimal,
            materia_id: m.id_sm_vc,
          })),
        };
      })
      .filter(Boolean);
    return enriched_sm_vc;
  }

  /* ══════════════════════════════
     ACTIONS
     ══════════════════════════════ */

  /** Estudiante envía una nueva versión del informe */
  function enviarInforme({
    materia_id_sm_vc,
    archivo_nombre_sm_vc,
    version_sm_vc,
    comentario_sm_vc,
    requisito_id_sm_vc,
  }) {
    if (!auth.user) return;
    const nuevo = {
      id_sm_vc: `MSG-${Date.now()}`,
      estudiante_id_sm_vc: auth.user.id_sm_vc,
      materia_id_sm_vc,
      remitente_id_sm_vc: auth.user.id_sm_vc,
      remitente_rol_sm_vc: "ESTUDIANTE",
      tipo_sm_vc: "INFORME",
      version_sm_vc,
      archivo_nombre_sm_vc,
      tamanio_sm_vc: "— MB",
      comentario_sm_vc,
      estado_evaluacion_sm_vc: null,
      fecha_sm_vc: new Date().toISOString(),
      requisito_id_sm_vc,
    };
    conversaciones_sm.value.push(nuevo);
    /* Actualizar progreso a ENTREGADO si era PENDIENTE */
    const idx = progreso_sm.value.findIndex(
      (p) =>
        p.estudiante_id_sm_vc === auth.user.id_sm_vc &&
        p.materia_id_sm_vc === materia_id_sm_vc,
    );
    if (
      idx !== -1 &&
      progreso_sm.value[idx].estado_aprobacion_sm_vc === "PENDIENTE"
    ) {
      progreso_sm.value[idx].estado_aprobacion_sm_vc = "ENTREGADO";
      progreso_sm.value[idx].intentos_sm_int++;
    }
    return nuevo;
  }

  /** Profesor responde con corrección/evaluación */
  function responderCorreccion({
    estudiante_id_sm_vc,
    materia_id_sm_vc,
    archivo_nombre_sm_vc,
    comentario_sm_vc,
    estado_evaluacion_sm_vc,
    nota_sm_dec,
  }) {
    if (!auth.user || auth.user.rol_sm_vc !== "PROFESOR") return;
    const nuevo = {
      id_sm_vc: `MSG-${Date.now()}`,
      estudiante_id_sm_vc,
      materia_id_sm_vc,
      remitente_id_sm_vc: auth.user.id_sm_vc,
      remitente_rol_sm_vc: "PROFESOR",
      tipo_sm_vc: "CORRECCION",
      version_sm_vc: `C${Date.now()}`,
      archivo_nombre_sm_vc,
      tamanio_sm_vc: "—",
      comentario_sm_vc,
      estado_evaluacion_sm_vc,
      fecha_sm_vc: new Date().toISOString(),
      requisito_id_sm_vc: null,
    };
    conversaciones_sm.value.push(nuevo);

    /* Si el profesor aprueba, actualizar el progreso */
    if (estado_evaluacion_sm_vc === "APROBADO") {
      const idx = progreso_sm.value.findIndex(
        (p) =>
          p.estudiante_id_sm_vc === estudiante_id_sm_vc &&
          p.materia_id_sm_vc === materia_id_sm_vc,
      );
      if (idx !== -1) {
        progreso_sm.value[idx].estado_aprobacion_sm_vc = "APROBADO";
        progreso_sm.value[idx].nota_sm_dec = nota_sm_dec ?? null;
        progreso_sm.value[idx].fecha_aprobacion_sm_vc =
          new Date().toISOString();
      }
    } else if (estado_evaluacion_sm_vc === "REPROBADO") {
      const idx = progreso_sm.value.findIndex(
        (p) =>
          p.estudiante_id_sm_vc === estudiante_id_sm_vc &&
          p.materia_id_sm_vc === materia_id_sm_vc,
      );
      if (idx !== -1) {
        progreso_sm.value[idx].estado_aprobacion_sm_vc = "REPROBADO";
      }
    }
    return nuevo;
  }

  /** Aprobar granularmente requisitos específicos */
  function aprobarRequisitosGranular({
    estudiante_id_sm_vc,
    materia_id_sm_vc,
    requisitos_seleccionados_ids,
  }) {
    if (!auth.user || auth.user.rol_sm_vc !== "PROFESOR") return;

    const idx = progreso_sm.value.findIndex(
      (p) =>
        p.estudiante_id_sm_vc === estudiante_id_sm_vc &&
        p.materia_id_sm_vc === materia_id_sm_vc,
    );

    if (idx !== -1) {
      const p = progreso_sm.value[idx];
      if (!p.requisitos_aprobados_detalle_sm) {
        p.requisitos_aprobados_detalle_sm = [];
      }
      
      const prev_aprobados = [...p.requisitos_aprobados_detalle_sm];
      const nuevos_aprobados = [];
      const current_date = new Date().toISOString();

      for (const req_id of requisitos_seleccionados_ids) {
        const existe = prev_aprobados.find(r => r.requisito_id_sm_vc === req_id);
        if (existe) {
          nuevos_aprobados.push(existe);
        } else {
          nuevos_aprobados.push({
            requisito_id_sm_vc: req_id,
            fecha_aprobacion_sm_vc: current_date
          });
        }
      }
      
      progreso_sm.value[idx].requisitos_aprobados_detalle_sm = nuevos_aprobados;
      
      const msg = {
        id_sm_vc: `MSG-${Date.now()}`,
        estudiante_id_sm_vc,
        materia_id_sm_vc,
        remitente_id_sm_vc: auth.user.id_sm_vc,
        remitente_rol_sm_vc: "PROFESOR",
        tipo_sm_vc: "CORRECCION",
        version_sm_vc: `R-${Date.now().toString().slice(-4)}`,
        archivo_nombre_sm_vc: "Hoja de Requisitos Evaluados",
        tamanio_sm_vc: "—",
        comentario_sm_vc: `El profesor actualizó la aprobación a un total de ${nuevos_aprobados.length} requisitos físicos validados.`,
        estado_evaluacion_sm_vc: "EVALUACION_PARCIAL",
        fecha_sm_vc: current_date,
        requisito_id_sm_vc: null,
      };
      conversaciones_sm.value.push(msg);
      return msg;
    }
  }

  /** Registrar deploy final del estudiante */
  function registrarDeploy({
    url_produccion_sm_vc,
    archivo_codigo_nombre,
    documentacion_nombre,
  }) {
    if (!auth.user) return;
    const existente = deploys_sm.value.findIndex(
      (d) => d.estudiante_id_sm_vc === auth.user.id_sm_vc,
    );
    const registro = {
      id_sm_vc: `DEP-${Date.now()}`,
      estudiante_id_sm_vc: auth.user.id_sm_vc,
      url_produccion_sm_vc,
      archivo_codigo_id_sm_vc: archivo_codigo_nombre,
      documentacion_tecnica_id_sm_vc: documentacion_nombre,
      fecha_registro_sm_vc: new Date().toISOString(),
    };
    if (existente !== -1) {
      deploys_sm.value[existente] = registro;
    } else {
      deploys_sm.value.push(registro);
    }
    return registro;
  }

  /* ══════════════════════════════
     UTILS
     ══════════════════════════════ */
  function calcularPorcentaje(materia_enriquecida) {
    const m = materia_enriquecida;
    if (m.estado_aprobacion_sm_vc === "APROBADO") return 100;
    if (m.estado_aprobacion_sm_vc === "REPROBADO") return 0;
    if (m.total_requisitos_sm_int === 0) return 0;
    return Math.round(
      (m.requisitos_aprobados_sm_int / m.total_requisitos_sm_int) * 100,
    );
  }

  return {
    materias_sm,
    progreso_sm,
    conversaciones_sm,
    deploys_sm,
    loading_sm_vc,
    /* getters */
    getMaterias,
    getMateriaById,
    getProgresoEstudiante,
    miProgreso,
    todasAprobadas,
    getConversacion,
    getDeployEstudiante,
    miDeploy,
    getEstudiantesDelProfesor,
    /* actions */
    enviarInforme,
    responderCorreccion,
    aprobarRequisitosGranular,
    registrarDeploy,
    /* utils */
    calcularPorcentaje,
    ESTADO_APROBACION,
  };
});
