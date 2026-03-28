<template>
  <router-view />
</template>

<script setup>
/* App.vue — SENTINNEL root component */
/* Inicialización del tema ANTES del primer render visible */
import { useConfigStore } from "src/stores/configStore";

const configStore_sm_vc = useConfigStore();
configStore_sm_vc.initTheme_sm_vc();
</script>

<style>
/* ── Google Fonts cargadas desde index.html via <link> ── */

/* ── Global resets ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background-color: var(--sn-fondo);
  color: var(--sn-texto-principal);
  font-family: var(--sn-font-mono);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  zoom: 1.25; /* Aumenta el tamaño global de las vistas y componentes en un 25% */
}

/* ── Scrollbar global ── */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--sn-borde-hover);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--sn-borde-activo);
}

/* ── Selection color ── */
::selection {
  background: var(--sn-surface-active);
  color: var(--sn-primario);
}

/* ── Quasar q-notify override ── */
.q-notification {
  background: var(--sn-fondo-panel) !important;
  border: 1px solid var(--sn-borde) !important;
  color: var(--sn-texto-principal) !important;
  font-family: var(--sn-font-mono) !important;
  font-size: 0.78rem !important;
}

/* ── Quasar q-tooltip ── */
.q-tooltip {
  font-family: var(--sn-font-mono) !important;
  font-size: 0.62rem !important;
  letter-spacing: 0.04em !important;
}

/* ── q-menu ── */
.q-menu {
  background: var(--sn-fondo-panel) !important;
}

/* ── q-item hover ── */
.q-item:hover {
  background: var(--sn-surface-hover) !important;
}

/* ── q-chip ── */
.q-chip {
  font-family: var(--sn-font-mono) !important;
  font-size: 0.65rem !important;
}

/* ── q-field label (global fix para theme) ── */
.q-field__label {
  color: var(--sn-texto-apagado) !important;
}
</style>
