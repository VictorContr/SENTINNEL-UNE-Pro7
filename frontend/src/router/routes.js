/**
 * SENTINNEL – Router
 * Rutas protegidas por meta-tags de rol.
 * roles: [] vacío = cualquier usuario autenticado puede acceder.
 */
const routes = [
  /* ────────────────── PÚBLICA ────────────────── */
  {
    path: "/login",
    name: "login",
    component: () => import("src/pages/LoginPage.vue"),
    meta: { requiresAuth: false },
  },

  /* ────────────────── ROOT (Landing) ────────────────── */
  {
    path: "/",
    name: "landing",
    component: () => import("src/pages/LandingPage.vue"),
    meta: { requiresAuth: false },
  },

  /* ────────────────── PRIVADAS ────────────────── */
  {
    path: "/_protegido",
    component: () => import("src/layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      /* ── GLOBAL (todos los roles) ── */
      {
        path: "/notificaciones",
        name: "notificaciones",
        component: () => import("src/pages/NotificacionesPage.vue"),
        meta: { requiresAuth: true, roles: [] },
      },

      /* ── ADMIN ── */
      {
        path: "/admin/usuarios",
        name: "admin-usuarios",
        component: () => import("src/pages/admin/UsuariosPage.vue"),
        meta: { requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "/admin/carga-masiva",
        name: "admin-carga-masiva",
        component: () => import("src/pages/admin/CargaMasivaPage.vue"),
        meta: { requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "/admin/cambio-periodo",
        name: "admin-cambio-periodo",
        component: () => import("src/pages/admin/CambioPeriodoPage.vue"),
        meta: { requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "/admin/trazabilidad/:estudianteId",
        name: "admin-trazabilidad",
        component: () => import("src/pages/admin/TrazabilidadPage.vue"),
        meta: { requiresAuth: true, roles: ["ADMIN"] },
      },
      {
        path: "/admin/trazabilidad/:estudianteId/deploy",
        name: "admin-deploy",
        component: () => import("src/pages/admin/DeployPage.vue"),
        meta: { requiresAuth: true, roles: ["ADMIN"] },
      },

      /* ── PROFESOR ── */
      {
        path: "/profesor/estudiantes",
        name: "profesor-estudiantes",
        component: () => import("src/pages/profesor/EstudiantesPage.vue"),
        meta: { requiresAuth: true, roles: ["PROFESOR"] },
      },
      {
        path: "/profesor/estudiantes/:id_sm_vc/trazabilidad",
        name: "profesor-trazabilidad",
        component: () => import("src/pages/profesor/TrazabilidadPage.vue"),
        meta: { requiresAuth: true, roles: ["PROFESOR"] },
      },
      {
        path: "/profesor/estudiantes/:id_sm_vc/materia/:materia_id/conversacion",
        name: "profesor-conversacion",
        component: () => import("src/pages/profesor/ConversacionPage.vue"),
        meta: { requiresAuth: true, roles: ["PROFESOR"] },
      },
      {
        path: "/profesor/estudiantes/:id_sm_vc/deploy",
        name: "profesor-deploy",
        component: () => import("src/pages/profesor/DeployPage.vue"),
        meta: { requiresAuth: true, roles: ["PROFESOR"] },
      },

      /* ── ESTUDIANTE ── */
      {
        path: "/estudiante/trazabilidad",
        name: "estudiante-trazabilidad",
        component: () => import("src/pages/estudiante/TrazabilidadPage.vue"),
        meta: { requiresAuth: true, roles: ["ESTUDIANTE"] },
      },
      {
        path: "/estudiante/materia/:materia_id/historial",
        name: "estudiante-historial",
        component: () => import("src/pages/estudiante/HistorialPage.vue"),
        meta: { requiresAuth: true, roles: ["ESTUDIANTE"] },
      },
      {
        path: "/estudiante/deploy",
        name: "estudiante-deploy",
        component: () => import("src/pages/estudiante/DeployPage.vue"),
        meta: { requiresAuth: true, roles: ["ESTUDIANTE"] },
      },
    ],
  },

  /* ── 404 catch-all ── */
  {
    path: "/:catchAll(.*)*",
    component: () => import("src/pages/ErrorNotFound.vue"),
  },
];

export default routes;
