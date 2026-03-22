<template>
  <div class="q-pa-md">
    <!-- Tarjeta principal con glassmorphism -->
    <div class="bg-tarjeta_vc backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
      
      <!-- Header de la tarjeta -->
      <div class="text-center mb-6">
        <h2 class="text-texto-claro_vc text-xl font-bold mb-2">
          Configuración del Periodo Académico
        </h2>
        <p class="text-texto-secundario_vc text-sm">
          Gestiona el periodo académico global del sistema
        </p>
      </div>

      <!-- Estado actual del periodo -->
      <div class="bg-fondo-secundario_vc rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-texto-secundario_vc text-xs uppercase tracking-wider mb-1">
              Periodo Actual
            </p>
            <p class="text-texto-claro_vc text-2xl font-bold">
              {{ periodoStore.periodoFormateado_vc() }}
            </p>
          </div>
          <div class="text-acento_vc">
            <q-icon name="calendar_today" size="32px" />
          </div>
        </div>
      </div>

      <!-- Formulario de actualización -->
      <q-form @submit="handleSubmit" class="space-y-4">
        <q-input
          v-model="nuevoPeriodo"
          label="Nuevo Periodo Académico"
          placeholder="Ej: P-166"
          outlined
          dark
          color="acento_vc"
          :loading="periodoStore.loading_vc"
          :rules="[
            val => !!val || 'El periodo es obligatorio',
            val => val.length >= 4 || 'Mínimo 4 caracteres',
            val => /^P-\d+$/.test(val) || 'Formato inválido (ej: P-166)'
          ]"
          hint="Formato: P-XXX (donde XXX es el número del periodo)"
        >
          <template v-slot:prepend>
            <q-icon name="edit" color="acento_vc" />
          </template>
        </q-input>

        <!-- Botón de actualización -->
        <q-btn
          type="submit"
          :loading="periodoStore.loading_vc"
          :disable="!nuevoPeriodo || periodoStore.loading_vc"
          class="full-width"
          size="md"
          :style="{ backgroundColor: 'var(--color-cta_vc)' }"
          text-color="white"
        >
          <q-icon name="update" class="q-mr-sm" />
          Actualizar Periodo
        </q-btn>
      </q-form>

      <!-- Información adicional -->
      <div class="mt-6 p-4 bg-fondo-terciario_vc rounded-lg">
        <div class="flex items-start space-x-3">
          <q-icon name="info" color="acento_vc" size="20px" class="mt-0.5" />
          <div>
            <p class="text-texto-secundario_vc text-xs mb-1">
              Importante
            </p>
            <p class="text-texto-apagado_vc text-xs leading-relaxed">
              El cambio de periodo académico afecta a toda la plataforma. 
              Asegúrate de tener el valor correcto antes de confirmar.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePeriodoStore } from 'src/stores/periodoStore';

// Store de periodo académico
const periodoStore = usePeriodoStore();

// Estado local del formulario
const nuevoPeriodo = ref('');

/**
 * Maneja el envío del formulario para actualizar el periodo
 * @param {Event} event - Evento de submit del formulario
 */
const handleSubmit = async (event) => {
  event.preventDefault();
  
  const exito = await periodoStore.actualizarPeriodo_vc(nuevoPeriodo.value);
  
  if (exito) {
    // Limpia el formulario después de una actualización exitosa
    nuevoPeriodo.value = '';
  }
};

/**
 * Carga el periodo actual al montar el componente
 */
onMounted(async () => {
  await periodoStore.cargarPeriodoActual_vc();
});
</script>

<style scoped>
/* Estilos específicos para el dark mode exclusivo */
.bg-tarjeta_vc {
  background-color: var(--sn-fondo-panel);
  border: 1px solid var(--sn-borde-activo);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.bg-fondo-secundario_vc {
  background-color: var(--sn-fondo-elevado);
  border: 1px solid var(--sn-borde);
}

.bg-fondo-terciario_vc {
  background-color: rgba(111, 255, 233, 0.05);
  border: 1px solid rgba(111, 255, 233, 0.1);
}

.text-texto-claro_vc {
  color: var(--sn-texto-principal);
}

.text-texto-secundario_vc {
  color: var(--sn-texto-secundario);
}

.text-texto-apagado_vc {
  color: var(--sn-texto-apagado);
}

.text-acento_vc {
  color: var(--sn-primario);
}

/* Animaciones sutiles */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

.q-field--outlined .q-field__control {
  border-radius: 8px;
}

.q-btn {
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.q-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(111, 255, 233, 0.3);
}
</style>
