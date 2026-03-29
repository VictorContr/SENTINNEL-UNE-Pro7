<template>
  <q-layout view="lHh LpR lFf" class="sntnl-layout_sm_vc">
    <!-- ════════════════════ HEADER ════════════════════ -->
    <q-header class="sntnl-header_sm_vc" bordered>
      <q-toolbar class="sntnl-toolbar_sm_vc">
        <!-- Hamburger mobile -->
        <q-btn
          flat dense round icon="menu"
          class="hamburger-btn_sm_vc q-mr-sm lt-md"
          @click="drawerAbierto_sm_vc = !drawerAbierto_sm_vc"
          aria-label="Abrir menú" />

        <!-- Brand desktop -->
        <div class="sntnl-topbar-brand_sm_vc gt-sm">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none" class="q-mr-xs">
            <polygon
              points="18,2 34,10 34,26 18,34 2,26 2,10"
              :stroke="isDark_sm_vc ? '#6fffe9' : '#0d7a6f'"
              stroke-width="1.5" fill="none" />
            <circle cx="18" cy="18" r="4" :fill="isDark_sm_vc ? '#6fffe9' : '#0d7a6f'" />
          </svg>
          <span class="brand-label_sm_vc">SENTINNEL</span>
        </div>

        <!-- Label de ruta actual -->
        <div class="topbar-route-label_sm_vc">
          <q-icon :name="iconoRutaActual_sm_vc" size="16px" class="q-mr-xs route-icon_sm_vc" />
          <span>{{ labelRutaActual_sm_vc }}</span>
        </div>

        <q-space />

        <!-- Indicador de rol -->
        <div class="role-indicator_sm_vc">
          <div class="role-dot_sm_vc" :style="{ background: colorRol_sm_vc }" />
          <span>{{ auth_sm_vc.user_sm_vc?.rol_sm_vc }}</span>
        </div>

        <!-- Toggle de tema — usa configStore, nunca window.localStorage -->
        <q-btn
          flat round dense
          :icon="isDark_sm_vc ? 'light_mode' : 'dark_mode'"
          class="theme-toggle-btn_sm_vc q-ml-sm"
          @click="configStore_sm_vc.toggleTheme_sm_vc()"
          aria-label="Cambiar tema">
          <q-tooltip class="text-caption">
            {{ isDark_sm_vc ? 'Modo claro' : 'Modo oscuro' }}
          </q-tooltip>
        </q-btn>

        <!-- Bell de notificaciones — router_sm_vc.push evita window.location -->
        <q-btn flat round dense class="notif-btn_sm_vc q-ml-sm"
          @click="router_sm_vc.push('/notificaciones')">
          <q-icon name="notifications_none" size="20px" class="notif-icon_sm_vc" />
          <q-badge
            v-if="notifStore_sm_vc.conteoNoLeidas > 0"
            color="red-5" floating rounded class="notif-badge_sm_vc">
            {{ notifStore_sm_vc.conteoNoLeidas > 9 ? '9+' : notifStore_sm_vc.conteoNoLeidas }}
          </q-badge>
          <q-tooltip class="text-caption">Notificaciones</q-tooltip>
        </q-btn>

        <!-- Avatar / menú de usuario -->
        <q-btn flat round dense class="q-ml-xs">
          <div class="user-avatar_sm_vc">
            <span>{{ inicialesUsuario_sm_vc }}</span>
          </div>
          <q-menu anchor="bottom right" self="top right"
            class="sntnl-dropdown_sm_vc"
            transition-show="jump-down" transition-hide="jump-up">
            <div class="dropdown-user-info_sm_vc">
              <div class="dropdown-avatar_sm_vc">{{ inicialesUsuario_sm_vc }}</div>
              <div>
                <p class="dropdown-name_sm_vc">{{ auth_sm_vc.user_sm_vc?.nombre_sm_vc }}</p>
                <p class="dropdown-email_sm_vc">{{ auth_sm_vc.user_sm_vc?.correo_sm_vc }}</p>
                <p class="dropdown-rol_sm_vc">{{ auth_sm_vc.user_sm_vc?.rol_sm_vc }}</p>
              </div>
            </div>
            <q-separator class="dropdown-sep_sm_vc" />
            <q-list dense class="dropdown-list_sm_vc">
              <q-item clickable v-close-popup class="dropdown-item_sm_vc"
                @click="cerrarSesion_sm_vc">
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
      <div class="header-accent-line_sm_vc" />
    </q-header>

    <!-- ════════════════════ DRAWER ════════════════════ -->
    <q-drawer
      v-model="drawerAbierto_sm_vc"
      :width="264" :breakpoint="960"
      show-if-above bordered
      class="sntnl-drawer_sm_vc">

      <div class="drawer-brand_sm_vc">
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <polygon points="18,2 34,10 34,26 18,34 2,26 2,10"
            :stroke="isDark_sm_vc ? '#6fffe9' : '#0d7a6f'" stroke-width="1.5" fill="none" />
          <polygon points="18,8 28,13 28,23 18,28 8,23 8,13"
            :stroke="isDark_sm_vc ? '#5bc0be' : '#0e8e82'" stroke-width="0.8" fill="none" opacity="0.5" />
          <circle cx="18" cy="18" r="4" :fill="isDark_sm_vc ? '#6fffe9' : '#0d7a6f'" />
        </svg>
        <div>
          <p class="drawer-brand-sub_sm_vc">SISTEMA DE TRAZABILIDAD</p>
          <h2 class="drawer-brand-name_sm_vc">SENTINNEL</h2>
        </div>
      </div>

      <div class="drawer-version-bar_sm_vc">
        <span>v1.0.0-proto</span>
        <div class="status-dot_sm_vc" />
      </div>

      <q-scroll-area class="drawer-scroll_sm_vc">
        <q-list class="sntnl-nav-list_sm_vc">
          <div class="nav-section-label_sm_vc">General</div>

          <q-item
            v-for="item_sm_vc in menuGlobal_sm_vc"
            :key="item_sm_vc.name"
            clickable
            :active="route_sm_vc.name === item_sm_vc.name"
            active-class="nav-item--active_sm_vc"
            class="nav-item_sm_vc"
            @click="navegar_sm_vc(item_sm_vc.to)">
            <q-item-section avatar>
              <q-icon :name="item_sm_vc.icon" size="18px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="nav-label_sm_vc">{{ item_sm_vc.label }}</q-item-label>
            </q-item-section>
            <q-item-section
              v-if="item_sm_vc.name === 'notificaciones' && notifStore_sm_vc.conteoNoLeidas > 0"
              side>
              <q-badge color="red-5" rounded>{{ notifStore_sm_vc.conteoNoLeidas }}</q-badge>
            </q-item-section>
          </q-item>

          <!-- Sección Administrador -->
          <template v-if="auth_sm_vc.isAdmin_sm_vc">
            <div class="nav-section-label_sm_vc">
              <q-icon name="admin_panel_settings" size="12px" class="q-mr-xs" />
              Administración
            </div>
            <q-item
              v-for="item_sm_vc in menuAdmin_sm_vc"
              :key="item_sm_vc.name"
              clickable
              :active="route_sm_vc.name === item_sm_vc.name"
              active-class="nav-item--active_sm_vc"
              class="nav-item_sm_vc"
              @click="navegar_sm_vc(item_sm_vc.to)">
              <q-item-section avatar><q-icon :name="item_sm_vc.icon" size="18px" /></q-item-section>
              <q-item-section>
                <q-item-label class="nav-label_sm_vc">{{ item_sm_vc.label }}</q-item-label>
                <q-item-label caption class="nav-caption_sm_vc">{{ item_sm_vc.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <!-- Sección Profesor -->
          <template v-if="auth_sm_vc.isProfesor_sm_vc">
            <div class="nav-section-label_sm_vc">
              <q-icon name="school" size="12px" class="q-mr-xs" /> Docencia
            </div>
            <q-item
              v-for="item_sm_vc in menuProfesor_sm_vc"
              :key="item_sm_vc.name"
              clickable
              :active="route_sm_vc.name === item_sm_vc.name"
              active-class="nav-item--active_sm_vc"
              class="nav-item_sm_vc"
              @click="navegar_sm_vc(item_sm_vc.to)">
              <q-item-section avatar><q-icon :name="item_sm_vc.icon" size="18px" /></q-item-section>
              <q-item-section>
                <q-item-label class="nav-label_sm_vc">{{ item_sm_vc.label }}</q-item-label>
                <q-item-label caption class="nav-caption_sm_vc">{{ item_sm_vc.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <!-- Sección Estudiante -->
          <template v-if="auth_sm_vc.isEstudiante_sm_vc">
            <div class="nav-section-label_sm_vc">
              <q-icon name="person" size="12px" class="q-mr-xs" /> Mi Pasantía
            </div>
            <q-item
              v-for="item_sm_vc in menuEstudiante_sm_vc"
              :key="item_sm_vc.name"
              clickable
              :active="route_sm_vc.name === item_sm_vc.name"
              active-class="nav-item--active_sm_vc"
              class="nav-item_sm_vc"
              @click="navegar_sm_vc(item_sm_vc.to)">
              <q-item-section avatar><q-icon :name="item_sm_vc.icon" size="18px" /></q-item-section>
              <q-item-section>
                <q-item-label class="nav-label_sm_vc">{{ item_sm_vc.label }}</q-item-label>
                <q-item-label caption class="nav-caption_sm_vc">{{ item_sm_vc.caption }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>

      <!-- Footer del drawer -->
      <div class="drawer-footer_sm_vc">
        <div class="drawer-user-chip_sm_vc">
          <div class="drawer-user-avatar_sm_vc">{{ inicialesUsuario_sm_vc }}</div>
          <div class="drawer-user-info_sm_vc">
            <span class="drawer-user-name_sm_vc">{{ auth_sm_vc.nombreCorto_sm_vc }}</span>
            <span class="drawer-user-rol_sm_vc" :style="{ color: colorRol_sm_vc }">
              {{ auth_sm_vc.user_sm_vc?.rol_sm_vc }}
            </span>
          </div>
          <q-btn flat round dense icon="logout" color="red-4" size="sm"
            @click="cerrarSesion_sm_vc">
            <q-tooltip class="text-caption">Cerrar sesión</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-drawer>

    <!-- ════════════════════ PAGE CONTAINER ════════════════════ -->
    <q-page-container class="sntnl-page-container_sm_vc">
      <div class="page-bg-grid_sm_vc" aria-hidden="true" />
      <router-view v-slot="{ Component, route: rutaActual_sm_vc }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="rutaActual_sm_vc.fullPath" />
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
import { useConfigStore } from 'src/stores/configStore'

/* ── Stores y router ── */
const auth_sm_vc       = useAuthStore()
const notifStore_sm_vc = useNotificacionesStore()
const configStore_sm_vc = useConfigStore()
const route_sm_vc      = useRoute()
const router_sm_vc     = useRouter()

/* Tema reactivo desde configStore */
const isDark_sm_vc = computed(() => configStore_sm_vc.isDark_sm_vc)

const drawerAbierto_sm_vc = ref(true)

/* Navegar vía router — nunca window.location */
const navegar_sm_vc = (destino_sm_vc) => router_sm_vc.push(destino_sm_vc)

/* Cerrar sesión y redirigir al login */
const cerrarSesion_sm_vc = () => {
  auth_sm_vc.logout_sm_vc()
  router_sm_vc.push('/login')
}

/* Iniciales del usuario autenticado para el avatar */
const inicialesUsuario_sm_vc = computed(() => {
  const nombre_sm_vc = auth_sm_vc.user_sm_vc?.nombre_sm_vc || ''
  return nombre_sm_vc
    .split(' ')
    .slice(0, 2)
    .map((w_sm_vc) => w_sm_vc[0])
    .join('')
    .toUpperCase()
})

/* Color del punto indicador según rol */
const colorRol_sm_vc = computed(() => {
  const mapa_sm_vc = {
    ADMINISTRADOR: 'var(--sn-admin)',
    PROFESOR:      'var(--sn-profesor)',
    ESTUDIANTE:    'var(--sn-estudiante)'
  }
  return mapa_sm_vc[auth_sm_vc.user_sm_vc?.rol_sm_vc] ?? 'var(--sn-acento-sec)'
})

/* Metadatos de rutas para el breadcrumb del header */
const metaRutas_sm_vc = {
  notificaciones:         { label: 'Notificaciones',             icon: 'notifications' },
  'admin-usuarios':       { label: 'Gestión de Usuarios',        icon: 'manage_accounts' },
  'admin-carga-masiva':   { label: 'Carga Masiva',               icon: 'upload' },
  'admin-cambio-periodo': { label: 'Cambio de Periodo',          icon: 'calendar_today' },
  'profesor-estudiantes': { label: 'Estudiantes Asignados',      icon: 'groups' },
  'profesor-trazabilidad':{ label: 'Trazabilidad del Estudiante',icon: 'track_changes' },
  'profesor-conversacion':{ label: 'Conversación de Documentos', icon: 'forum' },
  'profesor-deploy':      { label: 'Deploy del Estudiante',      icon: 'rocket_launch' },
  'estudiante-trazabilidad':{ label: 'Mi Trazabilidad',          icon: 'track_changes' },
  'estudiante-historial': { label: 'Historial de Materia',       icon: 'history' },
  'estudiante-deploy':    { label: 'Registrar Deploy',           icon: 'rocket_launch' }
}

const labelRutaActual_sm_vc = computed(
  () => metaRutas_sm_vc[route_sm_vc.name]?.label || 'Panel Principal'
)
const iconoRutaActual_sm_vc = computed(
  () => metaRutas_sm_vc[route_sm_vc.name]?.icon || 'dashboard'
)

/* ── Definición de menús por rol ── */
const menuGlobal_sm_vc = [
  { name: 'notificaciones', label: 'Notificaciones', icon: 'notifications_none', to: '/notificaciones' }
]

const menuAdmin_sm_vc = [
  { name: 'admin-usuarios',       label: 'Usuarios',          caption: 'Gestión y control de acceso', icon: 'manage_accounts', to: '/admin/usuarios' },
  { name: 'admin-carga-masiva',   label: 'Carga Masiva',      caption: 'Importar datos por pasos',    icon: 'upload_file',     to: '/admin/carga-masiva' },
  { name: 'admin-cambio-periodo', label: 'Periodo Académico', caption: 'Gestión del periodo global',  icon: 'calendar_today',  to: '/admin/cambio-periodo' }
]

const menuProfesor_sm_vc = [
  { name: 'profesor-estudiantes', label: 'Mis Estudiantes', caption: 'Grid con filtros y buscador', icon: 'groups', to: '/profesor/estudiantes' }
]

const menuEstudiante_sm_vc = [
  { name: 'estudiante-trazabilidad', label: 'Mi Trazabilidad', caption: 'Progreso de las 3 materias', icon: 'track_changes',  to: '/estudiante/trazabilidad' },
  { name: 'estudiante-deploy',       label: 'Registrar Deploy', caption: 'URL de producción y código', icon: 'rocket_launch',  to: '/estudiante/deploy' }
]
</script>

<style scoped>
.sntnl-layout_sm_vc { background-color: var(--sn-fondo); font-family: var(--sn-font-mono); }
.sntnl-header_sm_vc { background: var(--sn-fondo-panel) !important; border-bottom: 1px solid var(--sn-borde) !important; backdrop-filter: blur(12px); }
.sntnl-toolbar_sm_vc { min-height: 52px; padding: 0 1rem; }
.sntnl-topbar-brand_sm_vc { display: flex; align-items: center; gap: 0.5rem; }
.brand-label_sm_vc { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.18em; color: var(--sn-primario); }
.topbar-route-label_sm_vc { display: flex; align-items: center; font-size: 0.72rem; letter-spacing: 0.06em; color: var(--sn-texto-terciario); text-transform: uppercase; }
.route-icon_sm_vc { color: var(--sn-primario); }
.hamburger-btn_sm_vc { color: var(--sn-primario); }
.role-indicator_sm_vc { display: flex; align-items: center; gap: 0.35rem; font-size: 0.6rem; letter-spacing: 0.12em; color: var(--sn-texto-terciario); text-transform: uppercase; padding: 0.2rem 0.6rem; background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: var(--sn-radius-pill); }
.role-dot_sm_vc { width: 6px; height: 6px; border-radius: 50%; box-shadow: 0 0 6px currentColor; }
.notif-btn_sm_vc { position: relative; }
.notif-icon_sm_vc { color: var(--sn-texto-apagado); }
:deep(.notif-badge_sm_vc) { font-size: 0.55rem !important; min-width: 16px; height: 16px; }
.user-avatar_sm_vc { width: 30px; height: 30px; border-radius: 8px; background: var(--sn-surface-active); border: 1px solid var(--sn-borde-activo); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: var(--sn-primario); letter-spacing: 0.05em; }
.header-accent-line_sm_vc { height: 1px; background: linear-gradient(90deg, transparent, var(--sn-borde-activo), transparent); }
.theme-toggle-btn_sm_vc { color: var(--sn-texto-secundario); }
.theme-toggle-btn_sm_vc:hover { color: var(--sn-primario); }
:deep(.sntnl-dropdown_sm_vc) { background: var(--sn-fondo-panel) !important; border: 1px solid var(--sn-borde) !important; border-radius: var(--sn-radius-lg) !important; min-width: 220px; overflow: hidden; }
.dropdown-user-info_sm_vc { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1rem 0.75rem; }
.dropdown-avatar_sm_vc { width: 38px; height: 38px; border-radius: var(--sn-radius-lg); background: var(--sn-surface-active); border: 1px solid var(--sn-borde-activo); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: var(--sn-primario); flex-shrink: 0; }
.dropdown-name_sm_vc { font-size: 0.78rem; font-weight: 600; color: var(--sn-texto-principal); margin: 0 0 2px; }
.dropdown-email_sm_vc { font-size: 0.65rem; color: var(--sn-texto-terciario); margin: 0 0 1px; }
.dropdown-rol_sm_vc { font-size: 0.55rem; letter-spacing: 0.12em; color: var(--sn-primario); text-transform: uppercase; margin: 0; }
.dropdown-sep_sm_vc { background: var(--sn-borde) !important; }
:deep(.dropdown-list_sm_vc) { padding: 0.25rem 0; }
:deep(.dropdown-item_sm_vc) { min-height: 38px; padding: 0.35rem 0.75rem; }
:deep(.dropdown-item_sm_vc:hover) { background: rgba(255, 75, 110, 0.08) !important; }
:deep(.sntnl-drawer_sm_vc) { background: var(--sn-fondo-elevado) !important; border-right: 1px solid var(--sn-borde) !important; }
.drawer-brand_sm_vc { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem 1rem 1rem; border-bottom: 1px solid var(--sn-borde); }
.drawer-brand-sub_sm_vc { font-size: 0.48rem; letter-spacing: 0.18em; color: var(--sn-texto-dim); text-transform: uppercase; margin: 0 0 1px; font-weight: 500; }
.drawer-brand-name_sm_vc { font-size: 1.1rem; font-weight: 700; letter-spacing: 0.2em; color: var(--sn-primario); margin: 0; }
.drawer-version-bar_sm_vc { display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 1rem; font-size: 0.55rem; letter-spacing: 0.1em; color: var(--sn-texto-apagado); background: var(--sn-surface-alpha); border-bottom: 1px solid var(--sn-borde); }
.status-dot_sm_vc { width: 5px; height: 5px; border-radius: 50%; background: var(--sn-exito); box-shadow: 0 0 6px var(--sn-exito); animation: pulsoDot_sm_vc 2s infinite; }
@keyframes pulsoDot_sm_vc { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.drawer-scroll_sm_vc { height: calc(100% - 165px); }
.sntnl-nav-list_sm_vc { padding: 0.5rem 0; }
.nav-section-label_sm_vc { display: flex; align-items: center; font-size: 0.55rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--sn-texto-apagado); padding: 0.75rem 1rem 0.3rem; font-weight: 600; }
.nav-item_sm_vc { padding: 0.3rem 0.75rem; margin: 0.1rem 0.5rem; border-radius: 8px; transition: all 0.15s ease; min-height: 40px; }
.nav-item_sm_vc :deep(.q-item__section--avatar) { min-width: 36px; color: var(--sn-texto-dim); }
.nav-item_sm_vc:hover { background: var(--sn-surface-hover) !important; }
.nav-item_sm_vc:hover :deep(.q-item__section--avatar) { color: var(--sn-acento-sec); }
:deep(.nav-item--active_sm_vc) { background: var(--sn-surface-active) !important; border: 1px solid var(--sn-borde-activo); }
:deep(.nav-item--active_sm_vc .q-item__section--avatar) { color: var(--sn-primario) !important; }
:deep(.nav-item--active_sm_vc .nav-label_sm_vc) { color: var(--sn-primario) !important; }
.nav-label_sm_vc { font-size: 0.78rem; font-weight: 500; color: var(--sn-texto-terciario); letter-spacing: 0.03em; transition: color 0.15s; }
.nav-caption_sm_vc { font-size: 0.62rem !important; color: var(--sn-texto-apagado) !important; margin-top: 1px; }
.drawer-footer_sm_vc { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.75rem; border-top: 1px solid var(--sn-borde); background: var(--sn-surface-alpha); }
.drawer-user-chip_sm_vc { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.6rem; background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: var(--sn-radius-lg); }
.drawer-user-avatar_sm_vc { width: 30px; height: 30px; border-radius: 8px; background: var(--sn-surface-active); border: 1px solid var(--sn-borde-activo); display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: var(--sn-primario); flex-shrink: 0; }
.drawer-user-info_sm_vc { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.drawer-user-name_sm_vc { font-size: 0.75rem; font-weight: 600; color: var(--sn-texto-principal); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.drawer-user-rol_sm_vc { font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
.sntnl-page-container_sm_vc { background-color: var(--sn-fondo); position: relative; }
.page-bg-grid_sm_vc { position: fixed; inset: 0; background-image: linear-gradient(var(--sn-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--sn-grid-line) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; z-index: 0; }
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-fade-enter-from { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>