<template>
  <section 
    id="autores" 
    class="q-py-xl transition-colors duration-300"
    :class="isDark_sm_vc ? 'bg-[#0b132b] text-white' : 'bg-slate-50 text-slate-900'"
  >
    <div class="q-container mx-auto px-4 max-w-5xl">
      
      <div class="text-center max-w-2xl mx-auto q-mb-xl" data-aos="fade-up">
        <h2 class="text-h3 font-bold q-mb-sm font-serif">Equipo de Ingeniería</h2>
        <p class="text-subtitle1 opacity-80">Los arquitectos y desarrolladores detrás del centinela académico.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        <q-card 
          v-for="(dev, index) in desarrolladores_vc" 
          :key="index"
          class="relative overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-2"
          :flat="isDark_sm_vc"
          :bordered="isDark_sm_vc"
          :class="isDark_sm_vc ? 'bg-[#0E1A30] border-teal-500/20' : 'bg-white shadow-xl'"
        >
          <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-blue-500 z-10"></div>
          
          <q-card-section class="flex flex-col items-center q-pt-xl q-pb-lg text-center">
            
            <q-avatar 
              size="130px" 
              class="q-mb-md shadow-6 border-4"
              :class="isDark_sm_vc ? 'border-teal-400' : 'border-teal-600'"
            >
              <img :src="dev.img" :alt="dev.nombre" class="object-cover" />
            </q-avatar>
            
            <h3 
              class="text-h5 font-bold q-mb-xs"
              :class="isDark_sm_vc ? 'text-white' : 'text-teal-900'"
            >
              {{ dev.nombre }}
            </h3>
            
            <p class="font-medium uppercase tracking-wider text-sm q-mb-md" :class="isDark_sm_vc ? 'text-teal-400' : 'text-teal-600'">
              {{ dev.rol }}
            </p>
            
            <div class="flex items-center gap-2 opacity-80 q-mb-lg">
              <q-icon name="badge" size="sm" :color="isDark_sm_vc ? 'teal-300' : 'teal-700'" />
              <span class="font-mono font-bold tracking-widest text-sm">
                C.I.: <span :class="{ 'italic opacity-70': dev.isPlaceholder }">{{ dev.id }}</span>
              </span>
            </div>
            
            <div class="flex gap-4">
              <q-btn 
                flat 
                round 
                type="a" 
                :href="dev.github" 
                target="_blank"
                :color="isDark_sm_vc ? 'grey-4' : 'grey-8'"
                class="hover:text-teal-400 transition-colors"
                aria-label="Perfil de GitHub"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </q-btn>
              
              <q-btn 
                flat 
                round 
                type="a" 
                :href="dev.linkedin" 
                target="_blank"
                :color="isDark_sm_vc ? 'grey-4' : 'grey-8'"
                class="hover:text-teal-400 transition-colors"
                aria-label="Perfil de LinkedIn"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useConfigStore } from 'src/stores/configStore.js'

// 1. Estado del tema global (Pinia)
const configStore_vc = useConfigStore()
const isDark_sm_vc = computed(() => configStore_vc.isDark_sm_vc)

// 2. Data de los desarrolladores reactiva al tema (Pinia + Tailwind v4)
// Implementamos DRY iterando sobre este vector
const desarrolladores_vc = computed(() => [
  {
    id: 'V-30.520.132',
    nombre: 'Víctor Contreras',
    rol: 'Desarrollador Frontend',
    img: `https://ui-avatars.com/api/?name=Victor+Contreras&background=${isDark_sm_vc.value ? '0b132b' : '0d7a6f'}&color=${isDark_sm_vc.value ? '6fffe9' : 'ffffff'}&bold=true&length=2`,
    github: 'https://github.com/VictorContreras', // Todo: Actualizar
    linkedin: '#',
    isPlaceholder: false
  },
  {
    id: '[CÉDULA_SANTIAGO_AQUÍ]',
    nombre: 'Santiago',
    rol: 'Desarrollador Frontend',
    img: `https://ui-avatars.com/api/?name=Santiago&background=${isDark_sm_vc.value ? '0b132b' : '0d7a6f'}&color=${isDark_sm_vc.value ? '6fffe9' : 'ffffff'}&bold=true&length=1`,
    github: '#',
    linkedin: '#',
    isPlaceholder: true
  }
])
</script>

<style scoped>
/* No utilizamos scoped styles adicionales, se gobierna directamente por utilidades Tailwind y variables nativas */
</style>