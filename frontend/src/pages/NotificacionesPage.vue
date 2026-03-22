<!-- ══════════════════════════════════════════════════════════════════
     NotificacionesPage.vue — Centro de alertas del usuario activo.
     Thin Page: formateador de tiempo extraído a helper, chips de
     filtro declarativos. Toda la lógica de estado vive en el store.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">

    <!-- Header -->
    <div class="page-header_sm_vc">
      <div class="page-header-left_sm_vc">
        <div class="page-title-row_sm_vc">
          <q-icon name="notifications_active" size="22px" color="teal-3" class="q-mr-sm" />
          <h1 class="page-title_sm_vc">Centro de Notificaciones</h1>
        </div>
        <p class="page-subtitle_sm_vc">
          Alertas para
          <span class="highlight_sm_vc">{{ auth_sm_vc.user?.nombre_sm_vc }}</span>
          — ID: <span class="code-tag_sm_vc">{{ auth_sm_vc.user?.id_sm_vc }}</span>
        </p>
      </div>

      <div class="page-header-right_sm_vc">
        <!-- Filtros de tipo -->
        <div class="filter-chips_sm_vc">
          <button
            v-for="filtro in tipoFiltros_sm_vc"
            :key="filtro.value ?? 'todos'"
            class="filter-chip_sm_vc"
            :class="{ 'filter-chip--active_sm_vc': store_sm_vc.filtroTipo_sm_vc === filtro.value }"
            :style="store_sm_vc.filtroTipo_sm_vc === filtro.value
              ? { borderColor: filtro.color, color: filtro.color } : {}"
            @click="store_sm_vc.setFiltroTipo(filtro.value)">
            <q-icon :name="filtro.icon" size="12px" />
            {{ filtro.label }}
            <span v-if="filtro.count > 0" class="chip-count_sm_vc">
              {{ filtro.count }}
            </span>
          </button>
        </div>

        <q-btn
          v-if="store_sm_vc.conteoNoLeidas > 0"
          flat dense no-caps label="Marcar todas como leídas"
          icon="done_all" color="teal-3" size="sm"
          @click="store_sm_vc.marcarTodasLeidas()" />
      </div>
    </div>

    <!-- Contadores -->
    <div class="stats-row_sm_vc">
      <div class="stat-chip_sm_vc">
        <span class="stat-num_sm_vc">{{ store_sm_vc.misNotificaciones.length }}</span>
        <span class="stat-label_sm_vc">Total</span>
      </div>
      <div class="stat-chip_sm_vc stat-chip--unread_sm_vc">
        <span class="stat-num_sm_vc stat-num--unread_sm_vc">
          {{ store_sm_vc.conteoNoLeidas }}
        </span>
        <span class="stat-label_sm_vc">Sin Leer</span>
      </div>
    </div>

    <!-- Lista de notificaciones -->
    <div class="notif-container_sm_vc">
      <transition-group name="notif-list" tag="div" class="notif-list_sm_vc">

        <div
          v-for="notif in store_sm_vc.notificacionesFiltradas"
          :key="notif.id_sm_vc"
          class="notif-card_sm_vc"
          :class="{ 'notif-card--unread_sm_vc': !notif.leida_sm_vc }"
          :style="{ '--tipo-color': store_sm_vc.getTipoMeta(notif.tipo_sm_vc).color }"
          @click="store_sm_vc.marcarLeida(notif.id_sm_vc)">

          <div class="notif-type-bar_sm_vc" />

          <div class="notif-icon-wrap_sm_vc">
            <q-icon
              :name="store_sm_vc.getTipoMeta(notif.tipo_sm_vc).icon"
              size="20px"
              :style="{ color: store_sm_vc.getTipoMeta(notif.tipo_sm_vc).color }" />
          </div>

          <div class="notif-content_sm_vc">
            <div class="notif-header_sm_vc">
              <div
                class="notif-tipo-tag_sm_vc"
                :style="{ color: store_sm_vc.getTipoMeta(notif.tipo_sm_vc).color }">
                {{ notif.tipo_sm_vc }}
              </div>
              <span v-if="!notif.leida_sm_vc" class="unread-dot_sm_vc" />
              <span class="notif-time_sm_vc">
                {{ formatTiempo_sm_vc(notif.fecha_sm_vc) }}
              </span>
            </div>
            <h3 class="notif-title_sm_vc">{{ notif.titulo_sm_vc }}</h3>
            <p class="notif-body_sm_vc">{{ notif.cuerpo_sm_vc }}</p>
            <div v-if="notif.materia_id_sm_vc" class="notif-meta_sm_vc">
              <q-icon name="book_outline" size="12px" />
              <span>Materia: {{ notif.materia_id_sm_vc }}</span>
            </div>
          </div>

          <div v-if="!notif.leida_sm_vc" class="notif-action_sm_vc">
            <q-btn flat dense round icon="check" size="xs" color="teal-3">
              <q-tooltip class="bg-dark text-caption">Marcar como leída</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div v-if="store_sm_vc.notificacionesFiltradas.length === 0" key="empty"
          class="empty-state_sm_vc">
          <q-icon name="notifications_off" size="48px" color="blue-grey-8" />
          <p>No hay notificaciones para este filtro.</p>
        </div>

      </transition-group>
    </div>

  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useNotificacionesStore } from 'src/stores/notificacionesStore'

const auth_sm_vc = useAuthStore()
const store_sm_vc = useNotificacionesStore()

/* ── Helper de tiempo relativo (extraído fuera del template) ── */
const formatTiempo_sm_vc = (iso_sm_vc) => {
  const diff_sm_vc = Date.now() - new Date(iso_sm_vc).getTime()
  const mins_sm_vc = Math.floor(diff_sm_vc / 60000)
  if (mins_sm_vc < 1) return 'Justo ahora'
  if (mins_sm_vc < 60) return `Hace ${mins_sm_vc} min`
  const hrs_sm_vc = Math.floor(mins_sm_vc / 60)
  if (hrs_sm_vc < 24) return `Hace ${hrs_sm_vc}h`
  return `Hace ${Math.floor(hrs_sm_vc / 24)}d`
}

/* ── Chips de filtro con conteos reactivos ── */
const tipoFiltros_sm_vc = computed(() => [
  {
    value: null,
    label: 'Todas',
    icon: 'format_list_bulleted',
    color: '#7aa0b8',
    count: store_sm_vc.misNotificaciones.length
  },
  {
    value: 'URGENTE',
    label: 'Urgentes',
    icon: 'error',
    color: '#ff4b6e',
    count: store_sm_vc.misNotificaciones.filter((n) => n.tipo_sm_vc === 'URGENTE').length
  },
  {
    value: 'IMPORTANTE',
    label: 'Importantes',
    icon: 'warning',
    color: '#f0a500',
    count: store_sm_vc.misNotificaciones.filter((n) => n.tipo_sm_vc === 'IMPORTANTE').length
  },
  {
    value: 'INFORMATIVA',
    label: 'Informativas',
    icon: 'info',
    color: '#6fffe9',
    count: store_sm_vc.misNotificaciones.filter((n) => n.tipo_sm_vc === 'INFORMATIVA').length
  }
])
</script>

<style scoped>
.page-header_sm_vc { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; }
.page-header-left_sm_vc {}
.page-header-right_sm_vc { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.filter-chips_sm_vc { display: flex; gap: .4rem; flex-wrap: wrap; }
.chip-count_sm_vc { background: rgba(255,255,255,.08); padding: 0 4px; border-radius: 8px; font-size: .6rem; }
.stats-row_sm_vc { display: flex; gap: .75rem; margin-bottom: 1.25rem; }
.stat-chip_sm_vc { display: flex; align-items: center; gap: .4rem; padding: .35rem .875rem; background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: 8px; }
.stat-chip--unread_sm_vc { border-color: rgba(255,75,110,.2); }
.stat-num_sm_vc { font-size: 1rem; font-weight: 700; color: var(--sn-primario); font-family: var(--sn-font-mono); }
.stat-num--unread_sm_vc { color: var(--sn-error-claro); }
.stat-label_sm_vc { font-size: .65rem; color: var(--sn-texto-terciario); text-transform: uppercase; letter-spacing: .1em; }
.notif-container_sm_vc { max-width: 820px; }
.notif-list_sm_vc { display: flex; flex-direction: column; gap: .6rem; }
.notif-card_sm_vc { display: flex; align-items: flex-start; gap: .875rem; padding: 1rem 1rem 1rem 0; background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: var(--sn-radius-lg); cursor: pointer; transition: all .15s ease; overflow: hidden; }
.notif-card_sm_vc:hover { border-color: rgba(111,255,233,.1); }
.notif-card--unread_sm_vc { background: var(--sn-surface-alpha); }
.notif-type-bar_sm_vc { width: 3px; align-self: stretch; background: var(--tipo-color); opacity: .7; flex-shrink: 0; border-radius: 0 2px 2px 0; }
.notif-icon-wrap_sm_vc { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: var(--sn-surface-alpha); flex-shrink: 0; }
.notif-content_sm_vc { flex: 1; min-width: 0; }
.notif-header_sm_vc { display: flex; align-items: center; gap: .5rem; margin-bottom: .3rem; }
.notif-tipo-tag_sm_vc { font-size: .55rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; font-family: var(--sn-font-mono); }
.unread-dot_sm_vc { width: 6px; height: 6px; border-radius: 50%; background: var(--sn-error); box-shadow: 0 0 6px var(--sn-error); flex-shrink: 0; }
.notif-time_sm_vc { font-size: .62rem; color: var(--sn-texto-apagado); margin-left: auto; font-family: var(--sn-font-mono); }
.notif-title_sm_vc { font-size: .82rem; font-weight: 600; color: var(--sn-texto-principal); margin: 0 0 .3rem; letter-spacing: .02em; }
.notif-body_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); line-height: 1.6; margin: 0 0 .4rem; font-family: var(--sn-font-sans); }
.notif-meta_sm_vc { display: flex; align-items: center; gap: .3rem; font-size: .6rem; color: var(--sn-texto-dim); }
.notif-action_sm_vc { flex-shrink: 0; }
.notif-list-enter-active, .notif-list-leave-active { transition: all .25s ease; }
.notif-list-enter-from { opacity: 0; transform: translateX(-10px); }
.notif-list-leave-to { opacity: 0; transform: translateX(10px); }
</style>