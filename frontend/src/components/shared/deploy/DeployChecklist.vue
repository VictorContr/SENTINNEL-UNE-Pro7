<!-- ══════════════════════════════════════════════════════════════════
     DeployChecklist.vue — Lista de verificación pre-envío (preflight).
     Recibe un array de checks { label, ok } y expone si todos pasan.
     Componente puramente presentacional; sin acceso a stores.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div class="checklist_sm_vc">
    <div class="checklist-title_sm_vc">
      <q-icon name="checklist" size="14px" color="teal-3" />
      Pre-vuelo
    </div>
    <div
      v-for="check in checks"
      :key="check.label"
      class="check-item_sm_vc"
      :class="{ 'check-item--ok_sm_vc': check.ok }"
    >
      <q-icon
        :name="check.ok ? 'check_circle' : 'radio_button_unchecked'"
        size="13px"
        :color="check.ok ? 'teal-4' : 'blue-grey-8'" />
      <span>{{ check.label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  checks: { type: Array, default: () => [] }
})
</script>

<style scoped>
.checklist_sm_vc {
  background: rgba(0,0,0,.2);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 8px;
  padding: .875rem 1rem;
  display: flex; flex-direction: column; gap: .5rem;
}
.checklist-title_sm_vc {
  display: flex; align-items: center; gap: .35rem;
  font-size: .6rem; letter-spacing: .12em;
  text-transform: uppercase; color: var(--sn-texto-terciario);
  margin-bottom: .25rem; font-family: var(--sn-font-mono);
}
.check-item_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  font-size: .68rem; color: var(--sn-texto-apagado);
  transition: color 0.2s; font-family: var(--sn-font-mono);
}
.check-item--ok_sm_vc { color: var(--sn-acento-sec); }
</style>