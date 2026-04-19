<template>
  <q-dialog
    v-model="auth.mostrarModalRenovacion_sm_vc"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="bg-sn-fondo-panel border border-sn-borde text-sn-texto-principal min-w-[300px] sm:min-w-[400px]">
      <q-card-section class="flex flex-col items-center justify-center p-6 gap-4">
        
        <div class="text-center">
          <q-icon name="warning_amber" size="3rem" :color="colorProgreso_sm_vc" class="mb-2 transition-colors duration-300" />
          <h2 class="text-lg font-bold text-sn-primario tracking-wider font-mono">¿Sigue ahí?</h2>
          <p class="text-xs text-sn-texto-terciario mt-1 font-mono">Por seguridad, su sesión expirará pronto.</p>
        </div>

        <q-circular-progress
          show-value
          font-size="1.5rem"
          :value="progreso_sm_vc"
          size="120px"
          :thickness="0.15"
          :color="colorProgreso_sm_vc"
          track-color="sn-surface-alpha"
          class="q-my-md font-mono transition-colors duration-300"
        >
          <div class="flex flex-col items-center">
            <span class="font-bold">{{ tiempoRestante_sm_vc }}s</span>
          </div>
        </q-circular-progress>
      </q-card-section>

      <q-separator color="sn-borde" />

      <q-card-actions align="center" class="bg-sn-surface-alpha p-4 gap-4">
        <q-btn
          flat
          label="Cerrar Sesión"
          color="red-4"
          class="font-mono text-xs font-bold tracking-widest"
          @click="cerrarSesion_sm_vc"
        />
        <q-btn
          outline
          label="Mantener Sesión"
          color="teal-4"
          class="font-mono text-xs font-bold tracking-widest bg-sn-surface-active"
          :loading="cargando_sm_vc"
          @click="mantenerSesion_sm_vc"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useRoute } from 'vue-router'

const auth = useAuthStore()
const route_sm_vc = useRoute()

const tiempoTotal_sm_vc = 15
const tiempoRestante_sm_vc = ref(tiempoTotal_sm_vc)
const cargando_sm_vc = ref(false)
let intervalo_sm_vc = null

const progreso_sm_vc = computed(() => {
  return (tiempoRestante_sm_vc.value / tiempoTotal_sm_vc) * 100
})

const colorProgreso_sm_vc = computed(() => {
  // Cambiar a color warning/danger en los últimos 5 segundos
  return tiempoRestante_sm_vc.value <= 5 ? 'red-5' : 'amber-5'
})

const detenerTemporizador_sm_vc = () => {
  if (intervalo_sm_vc) {
    clearInterval(intervalo_sm_vc)
    intervalo_sm_vc = null
  }
}

const iniciarTemporizador_sm_vc = () => {
  detenerTemporizador_sm_vc()
  tiempoRestante_sm_vc.value = tiempoTotal_sm_vc
  
  intervalo_sm_vc = setInterval(() => {
    if (tiempoRestante_sm_vc.value > 0) {
      tiempoRestante_sm_vc.value--
    } else {
      detenerTemporizador_sm_vc()
      cerrarSesion_sm_vc()
    }
  }, 1000)
}

watch(
  () => auth.mostrarModalRenovacion_sm_vc,
  (mostrar_sm_vc) => {
    // Solo mostrar y arrancar si estamos en una ruta protegida
    if (mostrar_sm_vc && route_sm_vc.meta.requiresAuth) {
      iniciarTemporizador_sm_vc()
    } else {
      detenerTemporizador_sm_vc()
      if (mostrar_sm_vc) {
        // Ocultar si estamos en login o públicas, y deshabilitar auto-renovación
        auth.mostrarModalRenovacion_sm_vc = false
      }
    }
  }
)

onBeforeUnmount(() => {
  detenerTemporizador_sm_vc()
})

const cerrarSesion_sm_vc = () => {
  detenerTemporizador_sm_vc()
  auth.logout_sm_vc('expirado')
}

const mantenerSesion_sm_vc = async () => {
  cargando_sm_vc.value = true
  try {
    await auth.refrescarSesion_sm_vc()
  } finally {
    cargando_sm_vc.value = false
  }
}
</script>

<style scoped>
/* Las clases de colores var (--sn-xxx) se heredan globalmente, y usamos bg-[var(...)], border-[var(...)] gracias a Tailwind v4 custom themes (o clases directas ya provistas en tailwind.css/app.vue de Sentinel si existen. Ajusté a clases que Sentinel ya utiliza). */
</style>
