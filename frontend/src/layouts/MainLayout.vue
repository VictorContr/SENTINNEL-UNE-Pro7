<template>
  <q-layout view="lHh LpR lFf" class="sntnl-layout_sm_vc">

    <!-- ════════════════════════════════════════
         TOP HEADER
         ════════════════════════════════════════ -->
    <q-header class="sntnl-header_sm_vc" bordered>
      <q-toolbar class="sntnl-toolbar_sm_vc">

        <!-- Hamburger (mobile) -->
        <q-btn
          flat dense round icon="menu"
          class="text-teal-3 q-mr-sm lt-md"
          @click="drawer_open_sm_vc = !drawer_open_sm_vc"
          aria-label="Abrir menú"
        />

        <!-- Brand mobile -->
        <div class="sntnl-topbar-brand_sm_vc gt-sm">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none" class="q-mr-xs">
            <polygon points="18,2 34,10 34,26 18,34 2,26 2,10"
              stroke="#6fffe9" stroke-width="1.5" fill="none"/>
            <circle cx="18" cy="18" r="4" fill="#6fffe9"/>
          </svg>
          <span class="brand-label_sm_vc">SENTINNEL</span>
        </div>

        <!-- Breadcrumb / título de ruta actual -->
        <div class="topbar-route-label_sm_vc">
          <q-icon :name="current_route_icon_sm_vc" size="16px" color="teal-3" class="q-mr-xs" />
          <span>{{ current_route_label_sm_vc }}</span>
        </div>

        <q-space />

        <!-- Indicador de rol -->
        <div class="role-indicator_sm_vc">
          <div class="role-dot_sm_vc" :style="{ background: rol_color_sm_vc }" />
          <span>{{ auth.user?.rol_sm_vc }}</span>
        </div>

        <!-- Notificaciones Bell -->
        <q-btn flat round dense class="notif-btn_sm_vc q-ml-sm" @click="router_sm_vc.push('/notificaciones')">
          <q-icon name="notifications_none" size="20px" color="grey-5" />
          <q-badge
            v-if="notif_store_sm_vc.conteoNoLeidas > 0"
            color="red-5" floating rounded
            class="notif-badge_sm_vc"
          >
            {{ notif_store_sm_vc.conteoNoLeidas > 9 ? '9+' : notif_store_sm_vc.conteoNoLeidas }}
          </q-badge>
          <q-tooltip class="bg-dark text-caption">Notificaciones</q-tooltip>
        </q-btn>

        <!-- Avatar / User Menu -->
        <q-btn flat round dense class="q-ml-xs">
          <div class="user-avatar_sm_vc">
            <span>{{ user_initials_sm_vc }}</span>
          </div>
          <q-menu
            anchor="bottom right" self="top right"
            class="sntnl-dropdown_sm_vc"
            transition-show="jump-down" transition-hide="jump-up"
          >
            <div class="dropdown-user-info_sm_vc">
              <div class="dropdown-avatar_sm_vc">{{ user_initials_sm_vc }}</div>
              <div>
                <p class="dropdown-name_sm_vc">{{ auth.user?.nombre_sm_vc }}</p>
                <p class="dropdown-email_sm_vc">{{ auth.user?.correo_sm_vc }}</p>
                <p class="dropdown-rol_sm_vc">{{ auth.user?.rol_sm_vc }}</p>
              </div>
            </div>
            <q-separator color="blue-grey-9" />
            <q-list dense class="dropdown-list_sm_vc">
              <q-item clickable v-close-popup class="dropdown-item_sm_vc text-negative" @click="handle_logout_sm_vc">
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
      <div class="header-accent-line_sm_vc" />
    </q-header>

    <!-- ════════════════════════════════════════
         DRAWER (Navegación Lateral)
         ════════════════════════════════════════ -->
    <q-drawer
      v-model="drawer_open_sm_vc"
      :width="264" :breakpoint="960"
      show-if-above bordered
      class="sntnl-drawer_sm_vc"
    >
      <!-- Drawer Header (Logo full) -->
      <div class="drawer-brand_sm_vc">
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#6fffe9" stroke-width="1.5" fill="none"/>
          <polygon points="18,8 28,13 28,23 18,28 8,23 8,13" stroke="#5bc0be" stroke-width="0.8" fill="none" opacity="0.5"/>
          <circle cx="18" cy="18" r="4" fill="#6fffe9"/>
        </svg>
        <div>
          <p class="drawer-brand-sub_sm_vc">SISTEMA DE TRAZABILIDAD</p>
          <h2 class="drawer-brand-name_sm_vc">SENTINNEL</h2>
        </div>
      </div>

      <!-- Separador con versión -->
      <div class="drawer-version-bar_sm_vc">
        <span>v1.0.0-proto</span>
        <div class="status-dot_sm_vc" />
      </div>

      <!-- ── Menú navegación ── -->
      <q-scroll-area class="drawer-scroll_sm_vc">
        <q-list class="sntnl-nav-list_sm_vc">

          <!-- ── SECCIÓN GLOBAL (todos los roles) ── -->
          <div class="nav-section-label_sm_vc">General</div>

          <q-item
            v-for="item in global_menu_sm_vc" :key="item.name"
            clickable :active="route_sm_vc.name === item.name"
            active-class="nav-item--active_sm_vc"
            class="nav-item_sm_vc"
            @click="navigate_sm_vc(item.to)"
          >
            <q-item-section avatar><q-icon :name="item.icon" size="18px" /></q-item-section>
            <q-item-section><q-item-label class="nav-label_sm_vc">{{ item.label }}</q-item-label></q-item-section>
            <q-item-section v-if="item.name === 'notificaciones' && notif_store_sm_vc.conteoNoLeidas > 0" side>
              <q-badge color="red-5" rounded>{{ notif_store_sm_vc.conteoNoLeidas }}</q-badge>
            </q-item-section>
          </q-item>

          <!-- ── SECCIÓN ADMINISTRADOR ── -->
          <template v-if="auth.isAdmin">
            <div class="nav-section-label_sm_vc">
              <q-icon name="admin_panel_settings" size="12px" class="q-mr-xs" /> Administración
            </div>
            <q-item
              v-for="item in admin_menu_sm_vc" :key="item.name"
              clickable :active="route_sm_vc.name === item.name"
              active-class="nav-item--active_sm_vc" class="nav-item_sm_vc"
              @click="navigate_sm_vc(item.to)"
            >
              <q-item-section avatar><q-icon :name="item.icon" size="18px" /></q-item-section>
              <q-item-section>
                <q-item-label class="nav-label_sm_vc">{{ item.label }}</q-item-label>
                <q-item-label caption class="nav-caption_sm_vc">{{ item.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <!-- ── SECCIÓN PROFESOR ── -->
          <template v-if="auth.isProfesor">
            <div class="nav-section-label_sm_vc">
              <q-icon name="school" size="12px" class="q-mr-xs" /> Docencia
            </div>
            <q-item
              v-for="item in profesor_menu_sm_vc" :key="item.name"
              clickable :active="route_sm_vc.name === item.name"
              active-class="nav-item--active_sm_vc" class="nav-item_sm_vc"
              @click="navigate_sm_vc(item.to)"
            >
              <q-item-section avatar><q-icon :name="item.icon" size="18px" /></q-item-section>
              <q-item-section>
                <q-item-label class="nav-label_sm_vc">{{ item.label }}</q-item-label>
                <q-item-label caption class="nav-caption_sm_vc">{{ item.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <!-- ── SECCIÓN ESTUDIANTE ── -->
          <template v-if="auth.isEstudiante">
            <div class="nav-section-label_sm_vc">
              <q-icon name="person" size="12px" class="q-mr-xs" /> Mi Pasantía
            </div>
            <q-item
              v-for="item in estudiante_menu_sm_vc" :key="item.name"
              clickable :active="route_sm_vc.name === item.name"
              active-class="nav-item--active_sm_vc" class="nav-item_sm_vc"
              @click="navigate_sm_vc(item.to)"
            >
              <q-item-section avatar><q-icon :name="item.icon" size="18px" /></q-item-section>
              <q-item-section>
                <q-item-label class="nav-label_sm_vc">{{ item.label }}</q-item-label>
                <q-item-label caption class="nav-caption_sm_vc">{{ item.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

        </q-list>
      </q-scroll-area>

      <!-- Drawer Footer: info de sesión -->
      <div class="drawer-footer_sm_vc">
        <div class="drawer-user-chip_sm_vc">
          <div class="drawer-user-avatar_sm_vc">{{ user_initials_sm_vc }}</div>
          <div class="drawer-user-info_sm_vc">
            <span class="drawer-user-name_sm_vc">{{ auth.nombreCorto }}</span>
            <span class="drawer-user-rol_sm_vc" :style="{ color: rol_color_sm_vc }">
              {{ auth.user?.rol_sm_vc }}
            </span>
          </div>
          <q-btn flat round dense icon="logout" color="red-4" size="sm" @click="handle_logout_sm_vc">
            <q-tooltip class="bg-dark text-caption">Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-drawer>

    <!-- ════════════════════════════════════════
         PAGE CONTAINER
         ════════════════════════════════════════ -->
    <q-page-container class="sntnl-page-container_sm_vc">
      <!-- Fondo con grid sutil -->
      <div class="page-bg-grid_sm_vc" aria-hidden="true" />

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
const notif_store_sm_vc = useNotificacionesStore()
const route_sm_vc = useRoute()
const router_sm_vc = useRouter()

/* ── Drawer state ── */
const drawer_open_sm_vc = ref(true)

/* ── Navigation helper ── */
function navigate_sm_vc(to_sm_vc) {
  router_sm_vc.push(to_sm_vc)
}

/* ── Logout ── */
function handle_logout_sm_vc() {
  auth.logout()
  router_sm_vc.push('/login')
}

/* ── Computed: initials ── */
const user_initials_sm_vc = computed(() => {
  const name_sm_vc = auth.user?.nombre_sm_vc || ''
  return name_sm_vc
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
})

/* ── Computed: rol color ── */
const rol_color_sm_vc = computed(() => {
  const map_sm_vc = {
    ADMINISTRADOR: '#f0a500',
    PROFESOR: '#6fffe9',
    ESTUDIANTE: '#7ec8e3'
  }
  return map_sm_vc[auth.user?.rol_sm_vc] ?? '#5bc0be'
})

/* ── Computed: current route label & icon ── */
const route_meta_sm_vc = {
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

const current_route_label_sm_vc = computed(() => route_meta_sm_vc[route_sm_vc.name]?.label || 'Panel Principal')
const current_route_icon_sm_vc = computed(() => route_meta_sm_vc[route_sm_vc.name]?.icon || 'dashboard')

/* ══════════════════════════════════════════
   MENU DEFINITIONS
   ══════════════════════════════════════════ */

const global_menu_sm_vc = [
  { name: 'notificaciones', label: 'Notificaciones', icon: 'notifications_none', to: '/notificaciones' }
]

const admin_menu_sm_vc = [
  { name: 'admin-usuarios', label: 'Usuarios', caption: 'Gestión y control de acceso', icon: 'manage_accounts', to: '/admin/usuarios' },
  { name: 'admin-carga-masiva', label: 'Carga Masiva', caption: 'Importar datos por pasos', icon: 'upload_file', to: '/admin/carga-masiva' }
]

const profesor_menu_sm_vc = [
  { name: 'profesor-estudiantes', label: 'Mis Estudiantes', caption: 'Grid con filtros y buscador', icon: 'groups', to: '/profesor/estudiantes' }
]

const estudiante_menu_sm_vc = [
  { name: 'estudiante-trazabilidad', label: 'Mi Trazabilidad', caption: 'Progreso de las 3 materias', icon: 'track_changes', to: '/estudiante/trazabilidad' },
  { name: 'estudiante-deploy', label: 'Registrar Deploy', caption: 'URL de producción y código', icon: 'rocket_launch', to: '/estudiante/deploy' }
]
</script>

<style scoped>
/* ══════════ LAYOUT BASE ══════════ */
.sntnl-layout_sm_vc { background-color: var(--color-primario_vc); font-family: var(--font-mono_vc); }

/* ══════════ HEADER ══════════ */
.sntnl-header_sm_vc { background: rgba(11, 19, 43, 0.97) !important; border-bottom: 1px solid var(--color-borde_vc) !important; backdrop-filter: blur(12px); }
.sntnl-toolbar_sm_vc { min-height: 52px; padding: 0 1rem; }
.sntnl-topbar-brand_sm_vc { display: flex; align-items: center; gap: 0.5rem; }
.brand-label_sm_vc { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.18em; color: var(--color-cta_vc); text-shadow: 0 0 15px rgba(111, 255, 233, 0.3); }
.topbar-route-label_sm_vc { display: flex; align-items: center; font-size: 0.72rem; letter-spacing: 0.06em; color: var(--color-texto-secundario_vc); text-transform: uppercase; }
.role-indicator_sm_vc { display: flex; align-items: center; gap: 0.35rem; font-size: 0.6rem; letter-spacing: 0.12em; color: #4a6a88; text-transform: uppercase; padding: 0.2rem 0.6rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: var(--radius-pill_vc); }
.role-dot_sm_vc { width: 6px; height: 6px; border-radius: 50%; box-shadow: 0 0 6px currentColor; }
.notif-btn_sm_vc { position: relative; }
:deep(.notif-badge_sm_vc) { font-size: 0.55rem !important; min-width: 16px; height: 16px; }
.user-avatar_sm_vc { width: 30px; height: 30px; border-radius: 8px; background: rgba(111, 255, 233, 0.12); border: 1px solid var(--color-borde-activo_vc); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: var(--color-cta_vc); letter-spacing: 0.05em; }
.header-accent-line_sm_vc { height: 1px; background: linear-gradient(90deg, transparent, rgba(111, 255, 233, 0.4), transparent); }

/* ── Dropdown menu ── */
:deep(.sntnl-dropdown_sm_vc) { background: var(--color-primario-claro_vc) !important; border: 1px solid rgba(111, 255, 233, 0.1) !important; border-radius: var(--radius-lg_vc) !important; min-width: 220px; overflow: hidden; }
.dropdown-user-info_sm_vc { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1rem 0.75rem; }
.dropdown-avatar_sm_vc { width: 38px; height: 38px; border-radius: var(--radius-lg_vc); background: rgba(111, 255, 233, 0.1); border: 1px solid rgba(111, 255, 233, 0.2); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: var(--color-cta_vc); flex-shrink: 0; }
.dropdown-name_sm_vc { font-size: 0.78rem; font-weight: 600; color: var(--color-texto-primario_vc); margin: 0 0 2px; }
.dropdown-email_sm_vc { font-size: 0.65rem; color: #4a6a88; margin: 0 0 1px; }
.dropdown-rol_sm_vc { font-size: 0.55rem; letter-spacing: 0.12em; color: var(--color-cta_vc); text-transform: uppercase; margin: 0; }
:deep(.dropdown-list_sm_vc) { padding: 0.25rem 0; }
:deep(.dropdown-item_sm_vc) { min-height: 38px; padding: 0.35rem 0.75rem; }
:deep(.dropdown-item_sm_vc:hover) { background: rgba(255, 75, 110, 0.08) !important; }

/* ══════════ DRAWER ══════════ */
:deep(.sntnl-drawer_sm_vc) { background: var(--color-superficie_vc) !important; border-right: 1px solid var(--color-borde_vc) !important; }
.drawer-brand_sm_vc { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem 1rem 1rem; border-bottom: 1px solid rgba(111, 255, 233, 0.06); }
.drawer-brand-sub_sm_vc { font-size: 0.48rem; letter-spacing: 0.18em; color: var(--color-texto-muted_vc); text-transform: uppercase; margin: 0 0 1px; font-weight: 500; }
.drawer-brand-name_sm_vc { font-size: 1.1rem; font-weight: 700; letter-spacing: 0.2em; color: var(--color-cta_vc); margin: 0; text-shadow: 0 0 15px rgba(111, 255, 233, 0.25); }
.drawer-version-bar_sm_vc { display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 1rem; font-size: 0.55rem; letter-spacing: 0.1em; color: var(--color-texto-dim_vc); background: rgba(0, 0, 0, 0.15); border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
.status-dot_sm_vc { width: 5px; height: 5px; border-radius: 50%; background: var(--color-cta_vc); box-shadow: 0 0 6px var(--color-cta_vc); animation: pulse-dot_sm_vc 2s infinite; }
@keyframes pulse-dot_sm_vc { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.drawer-scroll_sm_vc { height: calc(100% - 165px); }
.sntnl-nav-list_sm_vc { padding: 0.5rem 0; }
.nav-section-label_sm_vc { display: flex; align-items: center; font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-texto-dim_vc); padding: 0.75rem 1rem 0.3rem; font-weight: 600; }
.nav-item_sm_vc { padding: 0.3rem 0.75rem; margin: 0.1rem 0.5rem; border-radius: 8px; transition: all 0.15s ease; min-height: 40px; }
.nav-item_sm_vc :deep(.q-item__section--avatar) { min-width: 36px; color: var(--color-texto-muted_vc); }
.nav-item_sm_vc:hover { background: rgba(111, 255, 233, 0.05) !important; }
.nav-item_sm_vc:hover :deep(.q-item__section--avatar) { color: var(--color-acento_vc); }
:deep(.nav-item--active_sm_vc) { background: rgba(111, 255, 233, 0.08) !important; border: 1px solid rgba(111, 255, 233, 0.12); }
:deep(.nav-item--active_sm_vc .q-item__section--avatar) { color: var(--color-cta_vc) !important; }
:deep(.nav-item--active_sm_vc .nav-label_sm_vc) { color: var(--color-cta_vc) !important; }
.nav-label_sm_vc { font-size: 0.78rem; font-weight: 500; color: var(--color-texto-secundario_vc); letter-spacing: 0.03em; transition: color 0.15s; }
.nav-caption_sm_vc { font-size: 0.62rem !important; color: var(--color-texto-dim_vc) !important; margin-top: 1px; }

/* ── Drawer Footer ── */
.drawer-footer_sm_vc { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.75rem; border-top: 1px solid rgba(111, 255, 233, 0.06); background: rgba(0, 0, 0, 0.2); }
.drawer-user-chip_sm_vc { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.6rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: var(--radius-lg_vc); }
.drawer-user-avatar_sm_vc { width: 30px; height: 30px; border-radius: 8px; background: rgba(111, 255, 233, 0.1); border: 1px solid rgba(111, 255, 233, 0.2); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: var(--color-cta_vc); flex-shrink: 0; }
.drawer-user-info_sm_vc { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.drawer-user-name_sm_vc { font-size: 0.75rem; font-weight: 600; color: var(--color-texto-primario_vc); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.drawer-user-rol_sm_vc { font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }

/* ══════════ PAGE CONTAINER ══════════ */
.sntnl-page-container_sm_vc { background-color: var(--color-primario_vc); position: relative; }
.page-bg-grid_sm_vc { position: fixed; inset: 0; background-image: linear-gradient(rgba(111, 255, 233, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(111, 255, 233, 0.015) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; z-index: 0; }

/* ══════════ PAGE TRANSITION ══════════ */
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-fade-enter-from { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
