<template>
  <q-layout view="lHh LpR lFf" class="sntnl-layout">

    <!-- ════════════════════════════════════════
         TOP HEADER
         ════════════════════════════════════════ -->
    <q-header class="sntnl-header" bordered>
      <q-toolbar class="sntnl-toolbar">

        <!-- Hamburger (mobile) -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="text-teal-3 q-mr-sm lt-md"
          @click="drawerOpen = !drawerOpen"
          aria-label="Abrir menú"
        />

        <!-- Brand mobile -->
        <div class="sntnl-topbar-brand gt-sm">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none" class="q-mr-xs">
            <polygon points="18,2 34,10 34,26 18,34 2,26 2,10"
              stroke="#6fffe9" stroke-width="1.5" fill="none"/>
            <circle cx="18" cy="18" r="4" fill="#6fffe9"/>
          </svg>
          <span class="brand-label">SENTINNEL</span>
        </div>

        <!-- Breadcrumb / título de ruta actual -->
        <div class="topbar-route-label">
          <q-icon :name="currentRouteIcon" size="16px" color="teal-3" class="q-mr-xs" />
          <span>{{ currentRouteLabel }}</span>
        </div>

        <q-space />

        <!-- Indicador de rol -->
        <div class="role-indicator">
          <div class="role-dot" :style="{ background: rolColor }" />
          <span>{{ auth.user?.rol_sm_vc }}</span>
        </div>

        <!-- Notificaciones Bell -->
        <q-btn flat round dense class="notif-btn q-ml-sm" @click="router.push('/notificaciones')">
          <q-icon name="notifications_none" size="20px" color="grey-5" />
          <q-badge
            v-if="notifStore.conteoNoLeidas > 0"
            color="red-5"
            floating
            rounded
            class="notif-badge"
          >
            {{ notifStore.conteoNoLeidas > 9 ? '9+' : notifStore.conteoNoLeidas }}
          </q-badge>
          <q-tooltip class="bg-dark text-caption">Notificaciones</q-tooltip>
        </q-btn>

        <!-- Avatar / User Menu -->
        <q-btn flat round dense class="q-ml-xs">
          <div class="user-avatar">
            <span>{{ userInitials }}</span>
          </div>
          <q-menu
            anchor="bottom right"
            self="top right"
            class="sntnl-dropdown"
            transition-show="jump-down"
            transition-hide="jump-up"
          >
            <div class="dropdown-user-info">
              <div class="dropdown-avatar">{{ userInitials }}</div>
              <div>
                <p class="dropdown-name">{{ auth.user?.nombre_sm_vc }}</p>
                <p class="dropdown-email">{{ auth.user?.correo_sm_vc }}</p>
                <p class="dropdown-rol">{{ auth.user?.rol_sm_vc }}</p>
              </div>
            </div>
            <q-separator color="blue-grey-9" />
            <q-list dense class="dropdown-list">
              <q-item
                clickable
                v-close-popup
                class="dropdown-item text-negative"
                @click="handleLogout"
              >
                <q-item-section avatar>
                  <q-icon name="logout" size="16px" color="red-4" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-red-4">Cerrar Sesión</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <!-- Línea de acento teal -->
      <div class="header-accent-line" />
    </q-header>

    <!-- ════════════════════════════════════════
         DRAWER (Navegación Lateral)
         ════════════════════════════════════════ -->
    <q-drawer
      v-model="drawerOpen"
      :width="264"
      :breakpoint="960"
      show-if-above
      bordered
      class="sntnl-drawer"
    >
      <!-- Drawer Header (Logo full) -->
      <div class="drawer-brand">
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <polygon points="18,2 34,10 34,26 18,34 2,26 2,10"
            stroke="#6fffe9" stroke-width="1.5" fill="none"/>
          <polygon points="18,8 28,13 28,23 18,28 8,23 8,13"
            stroke="#5bc0be" stroke-width="0.8" fill="none" opacity="0.5"/>
          <circle cx="18" cy="18" r="4" fill="#6fffe9"/>
        </svg>
        <div>
          <p class="drawer-brand-sub">SISTEMA DE TRAZABILIDAD</p>
          <h2 class="drawer-brand-name">SENTINNEL</h2>
        </div>
      </div>

      <!-- Separador con versión -->
      <div class="drawer-version-bar">
        <span>v1.0.0-proto</span>
        <div class="status-dot" />
      </div>

      <!-- ── Menú navegación ── -->
      <q-scroll-area class="drawer-scroll">
        <q-list class="sntnl-nav-list">

          <!-- ── SECCIÓN GLOBAL (todos los roles) ── -->
          <div class="nav-section-label">General</div>

          <q-item
            v-for="item in globalMenu"
            :key="item.name"
            clickable
            :active="route.name === item.name"
            active-class="nav-item--active"
            class="nav-item"
            @click="navigate(item.to)"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="18px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="nav-label">{{ item.label }}</q-item-label>
            </q-item-section>
            <!-- Badge de no leídas en notificaciones -->
            <q-item-section v-if="item.name === 'notificaciones' && notifStore.conteoNoLeidas > 0" side>
              <q-badge color="red-5" rounded>{{ notifStore.conteoNoLeidas }}</q-badge>
            </q-item-section>
          </q-item>

          <!-- ── SECCIÓN ADMINISTRADOR ── -->
          <template v-if="auth.isAdmin">
            <div class="nav-section-label">
              <q-icon name="admin_panel_settings" size="12px" class="q-mr-xs" />
              Administración
            </div>
            <q-item
              v-for="item in adminMenu"
              :key="item.name"
              clickable
              :active="route.name === item.name"
              active-class="nav-item--active"
              class="nav-item"
              @click="navigate(item.to)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="18px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-label">{{ item.label }}</q-item-label>
                <q-item-label caption class="nav-caption">{{ item.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <!-- ── SECCIÓN PROFESOR ── -->
          <template v-if="auth.isProfesor">
            <div class="nav-section-label">
              <q-icon name="school" size="12px" class="q-mr-xs" />
              Docencia
            </div>
            <q-item
              v-for="item in profesorMenu"
              :key="item.name"
              clickable
              :active="route.name === item.name"
              active-class="nav-item--active"
              class="nav-item"
              @click="navigate(item.to)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="18px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-label">{{ item.label }}</q-item-label>
                <q-item-label caption class="nav-caption">{{ item.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <!-- ── SECCIÓN ESTUDIANTE ── -->
          <template v-if="auth.isEstudiante">
            <div class="nav-section-label">
              <q-icon name="person" size="12px" class="q-mr-xs" />
              Mi Pasantía
            </div>
            <q-item
              v-for="item in estudianteMenu"
              :key="item.name"
              clickable
              :active="route.name === item.name"
              active-class="nav-item--active"
              class="nav-item"
              @click="navigate(item.to)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="18px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="nav-label">{{ item.label }}</q-item-label>
                <q-item-label caption class="nav-caption">{{ item.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

        </q-list>
      </q-scroll-area>

      <!-- Drawer Footer: info de sesión -->
      <div class="drawer-footer">
        <div class="drawer-user-chip">
          <div class="drawer-user-avatar">{{ userInitials }}</div>
          <div class="drawer-user-info">
            <span class="drawer-user-name">{{ auth.nombreCorto }}</span>
            <span class="drawer-user-rol" :style="{ color: rolColor }">
              {{ auth.user?.rol_sm_vc }}
            </span>
          </div>
          <q-btn
            flat
            round
            dense
            icon="logout"
            color="red-4"
            size="sm"
            @click="handleLogout"
          >
            <q-tooltip class="bg-dark text-caption">Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-drawer>

    <!-- ════════════════════════════════════════
         PAGE CONTAINER
         ════════════════════════════════════════ -->
    <q-page-container class="sntnl-page-container">
      <!-- Fondo con grid sutil -->
      <div class="page-bg-grid" aria-hidden="true" />

      <router-view v-slot="{ Component, route: currentRoute }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="currentRoute.fullPath" />
        </transition>
      </router-view>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useNotificacionesStore } from 'src/stores/notificacionesStore'

/* ── Stores & Router ── */
const auth = useAuthStore()
const notifStore = useNotificacionesStore()
const route = useRoute()
const router = useRouter()

/* ── Drawer state ── */
const drawerOpen = ref(true)

/* ── Navigation helper ── */
function navigate(to) {
  router.push(to)
}

/* ── Logout ── */
function handleLogout() {
  auth.logout()
  router.push('/login')
}

/* ── Computed: initials ── */
const userInitials = computed(() => {
  const name = auth.user?.nombre_sm_vc || ''
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
})

/* ── Computed: rol color ── */
const rolColor = computed(() => {
  const map = {
    ADMINISTRADOR: '#f0a500',
    PROFESOR: '#6fffe9',
    ESTUDIANTE: '#7ec8e3'
  }
  return map[auth.user?.rol_sm_vc] ?? '#5bc0be'
})

/* ── Computed: current route label & icon ── */
const routeMeta = {
  notificaciones: { label: 'Notificaciones', icon: 'notifications' },
  'admin-usuarios': { label: 'Gestión de Usuarios', icon: 'manage_accounts' },
  'admin-carga-masiva': { label: 'Carga Masiva', icon: 'upload' },
  'profesor-estudiantes': { label: 'Estudiantes Asignados', icon: 'groups' },
  'profesor-trazabilidad': { label: 'Trazabilidad del Estudiante', icon: 'track_changes' },
  'profesor-conversacion': { label: 'Conversación de Documentos', icon: 'forum' },
  'profesor-deploy': { label: 'Deploy del Estudiante', icon: 'rocket_launch' },
  'estudiante-trazabilidad': { label: 'Mi Trazabilidad', icon: 'track_changes' },
  'estudiante-historial': { label: 'Historial de Materia', icon: 'history' },
  'estudiante-deploy': { label: 'Registrar Deploy', icon: 'rocket_launch' }
}

const currentRouteLabel = computed(() => routeMeta[route.name]?.label || 'Panel Principal')
const currentRouteIcon = computed(() => routeMeta[route.name]?.icon || 'dashboard')

/* ══════════════════════════════════════════
   MENU DEFINITIONS
   ══════════════════════════════════════════ */

const globalMenu = [
  {
    name: 'notificaciones',
    label: 'Notificaciones',
    icon: 'notifications_none',
    to: '/notificaciones'
  }
]

const adminMenu = [
  {
    name: 'admin-usuarios',
    label: 'Usuarios',
    caption: 'Gestión y control de acceso',
    icon: 'manage_accounts',
    to: '/admin/usuarios'
  },
  {
    name: 'admin-carga-masiva',
    label: 'Carga Masiva',
    caption: 'Importar datos por pasos',
    icon: 'upload_file',
    to: '/admin/carga-masiva'
  }
]

const profesorMenu = [
  {
    name: 'profesor-estudiantes',
    label: 'Mis Estudiantes',
    caption: 'Grid con filtros y buscador',
    icon: 'groups',
    to: '/profesor/estudiantes'
  }
]

const estudianteMenu = [
  {
    name: 'estudiante-trazabilidad',
    label: 'Mi Trazabilidad',
    caption: 'Progreso de las 3 materias',
    icon: 'track_changes',
    to: '/estudiante/trazabilidad'
  },
  {
    name: 'estudiante-deploy',
    label: 'Registrar Deploy',
    caption: 'URL de producción y código',
    icon: 'rocket_launch',
    to: '/estudiante/deploy'
  }
]
</script>

<style scoped>
/* ══════════ LAYOUT BASE ══════════ */
.sntnl-layout {
  background-color: #0b132b;
  font-family: 'IBM Plex Mono', 'Fira Code', monospace;
}

/* ══════════ HEADER ══════════ */
.sntnl-header {
  background: rgba(11, 19, 43, 0.97) !important;
  border-bottom: 1px solid rgba(111, 255, 233, 0.07) !important;
  backdrop-filter: blur(12px);
}

.sntnl-toolbar {
  min-height: 52px;
  padding: 0 1rem;
}

.sntnl-topbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #6fffe9;
  text-shadow: 0 0 15px rgba(111, 255, 233, 0.3);
}

.topbar-route-label {
  display: flex;
  align-items: center;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: #5a7fa8;
  text-transform: uppercase;
}

.role-indicator {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: #4a6a88;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
}

.role-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.notif-btn { position: relative; }

:deep(.notif-badge) {
  font-size: 0.55rem !important;
  min-width: 16px;
  height: 16px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(111, 255, 233, 0.12);
  border: 1px solid rgba(111, 255, 233, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: #6fffe9;
  letter-spacing: 0.05em;
}

.header-accent-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(111, 255, 233, 0.4), transparent);
}

/* ── Dropdown menu ── */
:deep(.sntnl-dropdown) {
  background: #0d1a38 !important;
  border: 1px solid rgba(111, 255, 233, 0.1) !important;
  border-radius: 10px !important;
  min-width: 220px;
  overflow: hidden;
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1rem 0.75rem;
}

.dropdown-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(111, 255, 233, 0.1);
  border: 1px solid rgba(111, 255, 233, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #6fffe9;
  flex-shrink: 0;
}

.dropdown-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #c8dde8;
  margin: 0 0 2px;
}

.dropdown-email {
  font-size: 0.65rem;
  color: #4a6a88;
  margin: 0 0 1px;
}

.dropdown-rol {
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  color: #6fffe9;
  text-transform: uppercase;
  margin: 0;
}

:deep(.dropdown-list) { padding: 0.25rem 0; }

:deep(.dropdown-item) {
  min-height: 38px;
  padding: 0.35rem 0.75rem;
}

:deep(.dropdown-item:hover) {
  background: rgba(255, 75, 110, 0.08) !important;
}

/* ══════════ DRAWER ══════════ */
:deep(.sntnl-drawer) {
  background: #080f22 !important;
  border-right: 1px solid rgba(111, 255, 233, 0.07) !important;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem 1rem;
  border-bottom: 1px solid rgba(111, 255, 233, 0.06);
}

.drawer-brand-sub {
  font-size: 0.48rem;
  letter-spacing: 0.18em;
  color: #2e4a6a;
  text-transform: uppercase;
  margin: 0 0 1px;
  font-weight: 500;
}

.drawer-brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #6fffe9;
  margin: 0;
  text-shadow: 0 0 15px rgba(111, 255, 233, 0.25);
}

.drawer-version-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 1rem;
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  color: #1e3050;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #6fffe9;
  box-shadow: 0 0 6px #6fffe9;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.drawer-scroll {
  height: calc(100% - 165px);
}

/* ── Nav List ── */
.sntnl-nav-list {
  padding: 0.5rem 0;
}

.nav-section-label {
  display: flex;
  align-items: center;
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #1e3050;
  padding: 0.75rem 1rem 0.3rem;
  font-weight: 600;
}

.nav-item {
  padding: 0.3rem 0.75rem;
  margin: 0.1rem 0.5rem;
  border-radius: 8px;
  transition: all 0.15s ease;
  min-height: 40px;
}

.nav-item :deep(.q-item__section--avatar) {
  min-width: 36px;
  color: #2e4a6a;
}

.nav-item:hover {
  background: rgba(111, 255, 233, 0.05) !important;
}

.nav-item:hover :deep(.q-item__section--avatar) {
  color: #5bc0be;
}

/* Active state */
:deep(.nav-item--active) {
  background: rgba(111, 255, 233, 0.08) !important;
  border: 1px solid rgba(111, 255, 233, 0.12);
}

:deep(.nav-item--active .q-item__section--avatar) {
  color: #6fffe9 !important;
}

:deep(.nav-item--active .nav-label) {
  color: #6fffe9 !important;
}

.nav-label {
  font-size: 0.78rem;
  font-weight: 500;
  color: #5a7fa8;
  letter-spacing: 0.03em;
  transition: color 0.15s;
}

.nav-caption {
  font-size: 0.62rem !important;
  color: #1e3050 !important;
  margin-top: 1px;
}

/* ── Drawer Footer ── */
.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 0.75rem;
  border-top: 1px solid rgba(111, 255, 233, 0.06);
  background: rgba(0, 0, 0, 0.2);
}

.drawer-user-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.6rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.drawer-user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(111, 255, 233, 0.1);
  border: 1px solid rgba(111, 255, 233, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: #6fffe9;
  flex-shrink: 0;
}

.drawer-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.drawer-user-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #c8dde8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-user-rol {
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
}

/* ══════════ PAGE CONTAINER ══════════ */
.sntnl-page-container {
  background-color: #0b132b;
  position: relative;
}

.page-bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(111, 255, 233, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(111, 255, 233, 0.015) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

/* ══════════ PAGE TRANSITION ══════════ */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
