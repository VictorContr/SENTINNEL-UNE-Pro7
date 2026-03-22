<template>
  <div class="fullscreen flex flex-center error-root_sm_vc">
    <div class="text-center">
      <div class="error-code_sm_vc">404</div>
      <div class="error-message_sm_vc">Ruta no encontrada</div>
      <q-btn
        unelevated
        to="/"
        label="Volver al Inicio"
        no-caps
        class="error-btn_sm_vc"
      />
    </div>
  </div>
</template>

<script setup>
//
</script>

<style scoped>
.error-root_sm_vc {
  background: #0b132b;
  color: #c8dde8;
}
.error-code_sm_vc {
  font-size: 20vh;
  color: rgba(111, 255, 233, 0.1);
  font-weight: 700;
  line-height: 1;
  font-family: 'IBM Plex Mono', monospace;
}
.error-message_sm_vc {
  font-size: 1.2rem;
  color: #5a7fa8;
  margin-bottom: 2rem;
  font-family: 'IBM Plex Sans', sans-serif;
}
.error-btn_sm_vc {
  background: #6fffe9 !important;
  color: #0b132b !important;
  font-weight: 700;
  letter-spacing: 0.1em;
  border-radius: 6px;
  font-family: 'IBM Plex Mono', monospace;
}
</style>
