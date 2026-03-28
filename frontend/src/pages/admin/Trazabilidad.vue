<template>
  <q-page class="admin-traz-page_sm_vc">
    <q-banner v-if="!estudianteId_sm_vc" rounded class="traz-banner_sm_vc">
      Falta el parámetro de ruta <code class="traz-code_sm_vc">estudianteId</code>.
    </q-banner>
    <template v-else>
      <TrazabilidadLayout
        :estudiante-id="estudianteId_sm_vc"
        :readonly="true"
      />
    </template>
  </q-page>
</template>

<script setup>
/* Nombre multi-palabra: el archivo debe llamarse Trazabilidad.vue por convención del proyecto. */
defineOptions({ name: 'AdminTrazabilidadPage' })

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TrazabilidadLayout from 'src/components/TrazabilidadLayout.vue'

const route_sm_vc = useRoute()

const estudianteId_sm_vc = computed(() =>
  String(route_sm_vc.params.estudianteId ?? '')
)
</script>

<style scoped>
.admin-traz-page_sm_vc {
  padding: 1.75rem 2rem;
  min-height: 100vh;
  font-family: var(--sn-font-mono);
  background: var(--sn-fondo);
}
.traz-banner_sm_vc {
  background: var(--sn-fondo-panel);
  border: 1px solid var(--sn-borde);
  color: var(--sn-texto-secundario);
  font-size: 0.75rem;
}
.traz-code_sm_vc {
  color: var(--sn-primario);
  font-family: var(--sn-font-mono);
}
</style>
