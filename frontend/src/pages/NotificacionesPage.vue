<template>
  <q-page class="sntnl-page">

    <!-- ── Header de sección ── -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-title-row">
          <q-icon name="notifications_active" size="22px" color="teal-3" class="q-mr-sm" />
          <h1 class="page-title">Centro de Notificaciones</h1>
        </div>
        <p class="page-subtitle">
          Mostrando alertas para
          <span class="highlight">{{ auth.user?.nombre_sm_vc }}</span>
          — receptor: <span class="code-tag">{{ auth.user?.id_sm_vc }}</span>
        </p>
      </div>

      <div class="page-header-right">
        <!-- Filtros de tipo -->
        <div class="filter-chips">
          <button
            v-for="tipo in tipoFiltros"
            :key="tipo.value"
            class="filter-chip"
            :class="{ 'filter-chip--active': store.filtroTipo_sm_vc === tipo.value }"
            :style="store.filtroTipo_sm_vc === tipo.value ? { borderColor: tipo.color, color: tipo.color } : {}"
            @click="store.setFiltroTipo(tipo.value)"
          >
            <q-icon :name="tipo.icon" size="12px" />
            {{ tipo.label }}
            <span v-if="tipo.count > 0" class="chip-count">{{ tipo.count }}</span>
          </button>
        </div>

        <!-- Acción marcar todas leídas -->
        <q-btn
          v-if="store.conteoNoLeidas > 0"
          flat
          dense
          no-caps
          label="Marcar todas como leídas"
          icon="done_all"
          color="teal-3"
          size="sm"
          class="mark-all-btn"
          @click="store.marcarTodasLeidas()"
        />
      </div>
    </div>

    <!-- ── Contador ── -->
    <div class="stats-row">
      <div class="stat-chip">
        <span class="stat-num">{{ store.misNotificaciones.length }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-chip stat-chip--unread">
        <span class="stat-num">{{ store.conteoNoLeidas }}</span>
        <span class="stat-label">Sin Leer</span>
      </div>
    </div>

    <!-- ── Lista de notificaciones ── -->
    <div class="notif-container">
      <transition-group name="notif-list" tag="div" class="notif-list">
        <div
          v-for="notif in store.notificacionesFiltradas"
          :key="notif.id_sm_vc"
          class="notif-card"
          :class="{ 'notif-card--unread': !notif.leida_sm_vc }"
          :style="{ '--tipo-color': store.getTipoMeta(notif.tipo_sm_vc).color }"
          @click="store.marcarLeida(notif.id_sm_vc)"
        >
          <!-- Barra lateral de tipo -->
          <div class="notif-type-bar" />

          <!-- Ícono de tipo -->
          <div class="notif-icon-wrap">
            <q-icon
              :name="store.getTipoMeta(notif.tipo_sm_vc).icon"
              size="20px"
              :style="{ color: store.getTipoMeta(notif.tipo_sm_vc).color }"
            />
          </div>

          <!-- Contenido -->
          <div class="notif-content">
            <div class="notif-header">
              <div class="notif-tipo-tag" :style="{ color: store.getTipoMeta(notif.tipo_sm_vc).color }">
                {{ notif.tipo_sm_vc }}
              </div>
              <span v-if="!notif.leida_sm_vc" class="unread-dot" />
              <span class="notif-time">{{ formatTime(notif.fecha_sm_vc) }}</span>
            </div>
            <h3 class="notif-title">{{ notif.titulo_sm_vc }}</h3>
            <p class="notif-body">{{ notif.cuerpo_sm_vc }}</p>
            <div v-if="notif.materia_id_sm_vc" class="notif-meta">
              <q-icon name="book_outline" size="12px" />
              <span>Materia: {{ notif.materia_id_sm_vc }}</span>
            </div>
          </div>

          <!-- Acción leer -->
          <div v-if="!notif.leida_sm_vc" class="notif-action">
            <q-btn flat dense round icon="check" size="xs" color="teal-3">
              <q-tooltip class="bg-dark text-caption">Marcar como leída</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="store.notificacionesFiltradas.length === 0" key="empty" class="empty-state">
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

const auth = useAuthStore()
const store = useNotificacionesStore()

/* ── Filtro chips con conteos ── */
const tipoFiltros = computed(() => [
  {
    value: null,
    label: 'Todas',
    icon: 'format_list_bulleted',
    color: '#7aa0b8',
    count: store.misNotificaciones.length
  },
  {
    value: 'URGENTE',
    label: 'Urgentes',
    icon: 'error',
    color: '#ff4b6e',
    count: store.misNotificaciones.filter((n) => n.tipo_sm_vc === 'URGENTE').length
  },
  {
    value: 'IMPORTANTE',
    label: 'Importantes',
    icon: 'warning',
    color: '#f0a500',
    count: store.misNotificaciones.filter((n) => n.tipo_sm_vc === 'IMPORTANTE').length
  },
  {
    value: 'INFORMATIVA',
    label: 'Informativas',
    icon: 'info',
    color: '#6fffe9',
    count: store.misNotificaciones.filter((n) => n.tipo_sm_vc === 'INFORMATIVA').length
  }
])

/* ── Format relative time ── */
function formatTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Justo ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  return `Hace ${Math.floor(hrs / 24)}d`
}
</script>

<style scoped>
.sntnl-page {
  padding: 1.75rem 2rem;
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.page-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.25rem;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #c8dde8;
  letter-spacing: 0.06em;
  margin: 0;
  font-family: 'IBM Plex Mono', monospace;
}

.page-subtitle {
  font-size: 0.72rem;
  color: #3a5a78;
  margin: 0;
  font-family: 'IBM Plex Sans', sans-serif;
}

.highlight { color: #6fffe9; font-weight: 600; }
.code-tag {
  background: rgba(111, 255, 233, 0.08);
  color: #5bc0be;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.68rem;
  font-family: 'IBM Plex Mono', monospace;
}

/* ── Header Right ── */
.page-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  font-size: 0.65rem;
  color: #3a5a78;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.05em;
}

.filter-chip:hover {
  background: rgba(111, 255, 233, 0.05);
  color: #7aa0b8;
}

.filter-chip--active {
  background: rgba(111, 255, 233, 0.05) !important;
}

.chip-count {
  background: rgba(255, 255, 255, 0.08);
  padding: 0 4px;
  border-radius: 8px;
  font-size: 0.6rem;
}

.mark-all-btn { font-size: 0.65rem !important; }

/* ── Stats ── */
.stats-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.875rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.stat-chip--unread { border-color: rgba(255, 75, 110, 0.2); }

.stat-num {
  font-size: 1rem;
  font-weight: 700;
  color: #6fffe9;
  font-family: 'IBM Plex Mono', monospace;
}

.stat-chip--unread .stat-num { color: #ff8fa3; }

.stat-label {
  font-size: 0.65rem;
  color: #3a5a78;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ── Notif List ── */
.notif-container { max-width: 820px; }

.notif-list { display: flex; flex-direction: column; gap: 0.6rem; }

/* ── Notif Card ── */
.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1rem 1rem 0;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  overflow: hidden;
  position: relative;
}

.notif-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(111, 255, 233, 0.1);
}

.notif-card--unread {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(var(--tipo-color, 111, 255, 233), 0.15);
}

/* Barra lateral de color */
.notif-type-bar {
  width: 3px;
  align-self: stretch;
  min-height: 100%;
  background: var(--tipo-color);
  opacity: 0.7;
  flex-shrink: 0;
  border-radius: 0 2px 2px 0;
  margin-left: 0;
}

.notif-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
}

.notif-content { flex: 1; min-width: 0; }

.notif-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.notif-tipo-tag {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-family: 'IBM Plex Mono', monospace;
}

.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff4b6e;
  box-shadow: 0 0 6px #ff4b6e;
  flex-shrink: 0;
}

.notif-time {
  font-size: 0.62rem;
  color: #2e4a6a;
  margin-left: auto;
  font-family: 'IBM Plex Mono', monospace;
}

.notif-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #b0cfe0;
  margin: 0 0 0.3rem;
  letter-spacing: 0.02em;
}

.notif-card--unread .notif-title { color: #d8eaf5; }

.notif-body {
  font-size: 0.72rem;
  color: #3a5a78;
  line-height: 1.6;
  margin: 0 0 0.4rem;
  font-family: 'IBM Plex Sans', sans-serif;
}

.notif-meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6rem;
  color: #1e3050;
  font-family: 'IBM Plex Mono', monospace;
}

.notif-action { flex-shrink: 0; }

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  color: #2e4a6a;
  font-size: 0.8rem;
  font-family: 'IBM Plex Sans', sans-serif;
}

/* ── Transitions ── */
.notif-list-enter-active,
.notif-list-leave-active { transition: all 0.25s ease; }
.notif-list-enter-from { opacity: 0; transform: translateX(-10px); }
.notif-list-leave-to { opacity: 0; transform: translateX(10px); }
</style>
