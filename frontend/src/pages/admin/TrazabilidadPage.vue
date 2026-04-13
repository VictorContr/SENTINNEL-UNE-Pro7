<template>
  <q-page class="admin-traz-page_sm_vc">
    <q-banner v-if="!estudianteId_sm_vc" rounded class="traz-banner_sm_vc">
      Falta el parámetro de ruta <code class="traz-code_sm_vc">estudianteId</code>.
    </q-banner>
    <template v-else>
      <div class="traz-nav-header_sm_vc">
        <q-btn
          flat
          no-caps
          icon="arrow_back"
          label="Volver a Usuarios"
          color="teal-3"
          size="sm"
          class="traz-back-btn_sm_vc"
          @click="irAUsuarios_sm_vc"
        />
      </div>

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
import { useRoute, useRouter } from 'vue-router'
import TrazabilidadLayout from 'src/layouts/TrazabilidadLayout.vue'

const route_sm_vc = useRoute()
const router_sm_vc = useRouter()

const estudianteId_sm_vc = computed(() =>
  String(route_sm_vc.params.estudianteId ?? '')
)

const irAUsuarios_sm_vc = () => {
  router_sm_vc.push({ name: 'admin-usuarios' })
}
</script>

<style scoped>
.admin-traz-page_sm_vc {
  padding: 1.75rem 2rem;
  min-height: 100vh;
  font-family: var(--sn-font-mono);
  background: var(--sn-fondo);
}
.traz-nav-header_sm_vc {
  margin-bottom: 1.5rem;
}
.traz-back-btn_sm_vc {
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 8px;
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
