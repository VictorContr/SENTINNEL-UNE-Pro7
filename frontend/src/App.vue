<template>
  <router-view />
</template>

<script setup>
/* App.vue — SENTINNEL root component */
</script>

<style>
/* ── Google Fonts: IBM Plex Mono + IBM Plex Sans ── */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

/* ── Global resets ── */
*, *::before, *::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background-color: #0b132b;
  color: #c8dde8;
  font-family: 'IBM Plex Mono', 'Fira Code', 'Courier New', monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Scrollbar global ── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(111, 255, 233, 0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(111, 255, 233, 0.2); }

/* ── Quasar overrides: Selection color ── */
::selection {
  background: rgba(111, 255, 233, 0.2);
  color: #6fffe9;
}

/* ── Quasar dark mode q-notify override ── */
.q-notification {
  background: #0d1a38 !important;
  border: 1px solid rgba(111, 255, 233, 0.15) !important;
  color: #c8dde8 !important;
  font-family: 'IBM Plex Mono', monospace !important;
  font-size: 0.78rem !important;
}

/* ── Quasar q-tooltip ── */
.q-tooltip {
  font-family: 'IBM Plex Mono', monospace !important;
  font-size: 0.62rem !important;
  letter-spacing: 0.04em !important;
}

/* ── q-menu dark ── */
.q-menu {
  background: #0d1a38 !important;
}

/* ── q-item hover in dark menus ── */
.q-item:hover {
  background: rgba(111, 255, 233, 0.04) !important;
}

/* ── q-chip ── */
.q-chip {
  font-family: 'IBM Plex Mono', monospace !important;
  font-size: 0.65rem !important;
}
</style>
