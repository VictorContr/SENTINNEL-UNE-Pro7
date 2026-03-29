<!-- ══════════════════════════════════════════════════════════════════
     LandingPage.vue — Vista orquestadora de la Landing Page.
     CORRECCIÓN: reemplaza window.scrollY/addEventListener con la
     directiva v-scroll de Quasar. Secciones apuntadas por template
     refs — elimina document.getElementById().
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <!-- v-scroll de Quasar captura el scroll sin acceder a window -->
  <q-layout
    v-scroll="alDesplazar_sm_vc"
    view="hHh lpR fFf"
    class="landing-layout_sm_vc">
    <q-page-container>
      <q-page class="landing-page_sm_vc">

        <!-- Navbar flotante -->
        <header
          class="landing-navbar_sm_vc"
          :class="{ 'navbar-scrolled_sm_vc': desplazado_sm_vc }">
          <div class="navbar-inner_sm_vc">
            <div class="navbar-brand_sm_vc">
              <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                <polygon points="18,2 34,10 34,26 18,34 2,26 2,10"
                  :stroke="isDark_sm_vc ? '#6fffe9' : '#0d7a6f'"
                  stroke-width="1.5" fill="none" />
                <circle cx="18" cy="18" r="4" :fill="isDark_sm_vc ? '#6fffe9' : '#0d7a6f'" />
              </svg>
              <span class="navbar-nombre_sm_vc">SENTINNEL</span>
            </div>

            <nav class="navbar-links_sm_vc gt-sm" aria-label="Navegación de la landing">
              <a
                v-for="enlace_sm_vc in navLinks_sm_vc"
                :key="enlace_sm_vc.href_sm_vc"
                :href="enlace_sm_vc.href_sm_vc"
                class="navbar-link_sm_vc"
                @click.prevent="scrollASeccion_sm_vc(enlace_sm_vc.href_sm_vc)">
                {{ enlace_sm_vc.label_sm_vc }}
              </a>
            </nav>

            <div class="navbar-actions_sm_vc">
              <q-btn
                flat round dense
                :icon="isDark_sm_vc ? 'light_mode' : 'dark_mode'"
                :color="isDark_sm_vc ? 'teal-3' : 'teal-8'"
                class="theme-btn_sm_vc"
                @click="configStore_sm_vc.toggleTheme_sm_vc()"
                aria-label="Cambiar tema">
                <q-tooltip class="bg-dark text-caption">
                  {{ isDark_sm_vc ? 'Modo Claro' : 'Modo Oscuro' }}
                </q-tooltip>
              </q-btn>

              <q-btn
                unelevated no-caps
                label="Acceder" icon="login" size="sm"
                class="navbar-cta_sm_vc"
                @click="router_sm_vc.push('/login')" />
            </div>
          </div>
        </header>

        <!-- ═══════════════════════════════
             SECCIONES — refs en lugar de id queries
             ═══════════════════════════════ -->
        <div ref="refHero_sm_vc" id="hero">
          <HeroSection
            :is-dark_sm_vc="isDark_sm_vc"
            @scroll-to-beneficios="scrollASeccion_sm_vc('#beneficios')" />
        </div>

        <div ref="refBeneficios_sm_vc" id="beneficios">
          <BeneficiosSection :is-dark_sm_vc="isDark_sm_vc" />
        </div>

        <div ref="refDemo_sm_vc" id="demo">
          <MockUpVisual :is-dark_sm_vc="isDark_sm_vc" />
        </div>

        <div ref="refTestimonios_sm_vc" id="testimonios">
          <TestimoniosSection :is-dark_sm_vc="isDark_sm_vc" />
        </div>

        <div ref="refFaq_sm_vc" id="faq">
          <FAQSection :is-dark_sm_vc="isDark_sm_vc" />
        </div>

        <FooterSection
          :is-dark_sm_vc="isDark_sm_vc"
          @toggle-theme="configStore_sm_vc.toggleTheme_sm_vc()"
          @scroll-to="scrollASeccion_sm_vc" />

        <!-- Botón scroll al inicio — usa el ref del hero en lugar de window.scrollTo -->
        <transition name="fade-up">
          <q-btn
            v-if="desplazado_sm_vc"
            round unelevated
            icon="keyboard_arrow_up"
            class="scroll-top-btn_sm_vc"
            color="teal-3" text-color="dark"
            aria-label="Volver al inicio"
            @click="scrollASeccion_sm_vc('#hero')" />
        </transition>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useConfigStore } from 'src/stores/configStore.js'
import { useRouter } from 'vue-router'

import HeroSection        from 'src/components/shared/landing/HeroSection.vue'
import BeneficiosSection  from 'src/components/shared/landing/BeneficiosSection.vue'
import MockUpVisual       from 'src/components/shared/landing/MockUpVisual.vue'
import TestimoniosSection from 'src/components/shared/landing/TestimoniosSection.vue'
import FAQSection         from 'src/components/shared/landing/FAQSection.vue'
import FooterSection      from 'src/components/shared/landing/FooterSection.vue'
import { useLandingStore } from 'src/stores/landingStore.js'

const router_sm_vc      = useRouter()
const configStore_sm_vc = useConfigStore()
const landingStore_sm_vc = useLandingStore()
const navLinks_sm_vc    = landingStore_sm_vc.navLinks_sm_vc
const isDark_sm_vc      = computed(() => configStore_sm_vc.isDark_sm_vc)

/* ── Refs de secciones — sustituyen a document.getElementById ── */
const refHero_sm_vc        = ref(null)
const refBeneficios_sm_vc  = ref(null)
const refDemo_sm_vc        = ref(null)
const refTestimonios_sm_vc = ref(null)
const refFaq_sm_vc         = ref(null)

/* Mapa de hash → ref del elemento */
const mapaRefs_sm_vc = computed(() => ({
  hero:        refHero_sm_vc,
  beneficios:  refBeneficios_sm_vc,
  demo:        refDemo_sm_vc,
  testimonios: refTestimonios_sm_vc,
  faq:         refFaq_sm_vc
}))

/* Estado de scroll para el navbar y botón de inicio */
const desplazado_sm_vc = ref(false)

/* Handler de la directiva v-scroll de Quasar — recibe posición en px */
const alDesplazar_sm_vc = (posicion_sm_vc) => {
  desplazado_sm_vc.value = posicion_sm_vc > 80
}

/* Scroll suave a sección por hash — usa element.scrollIntoView (permitido) */
const scrollASeccion_sm_vc = (href_sm_vc) => {
  const id_sm_vc  = href_sm_vc.replace('#', '')
  const ref_sm_vc = mapaRefs_sm_vc.value[id_sm_vc]
  if (ref_sm_vc?.value) {
    ref_sm_vc.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

</script>

<style scoped>
/* ── Layout base ── */
.landing-layout_sm_vc {
  background: var(--sn-fondo);
  font-family: var(--sn-font-mono);
}
.landing-page_sm_vc {
  padding: 0 !important;
  min-height: 100vh;
}

/* ── Navbar flotante ── */
.landing-navbar_sm_vc {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  transition: all .3s ease;
  padding: .875rem 2rem;
}
.navbar-scrolled_sm_vc {
  background: var(--sn-glass-bg);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--sn-borde);
  box-shadow: var(--sn-shadow-md);
  padding: .6rem 2rem;
}
.navbar-inner_sm_vc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  margin: 0 auto;
  gap: 1.5rem;
}
.navbar-brand_sm_vc {
  display: flex; align-items: center; gap: .6rem;
}
.navbar-nombre_sm_vc {
  font-size: .85rem;
  font-weight: 700;
  letter-spacing: .16em;
  color: var(--sn-primario);
}
.navbar-links_sm_vc {
  display: flex; gap: .5rem;
}
.navbar-link_sm_vc {
  font-size: .72rem;
  color: var(--sn-texto-terciario);
  text-decoration: none;
  padding: .3rem .75rem;
  border-radius: var(--sn-radius-sm);
  letter-spacing: .06em;
  transition: all .15s;
}
.navbar-link_sm_vc:hover {
  color: var(--sn-texto-principal);
  background: var(--sn-surface-alpha);
}
.navbar-actions_sm_vc {
  display: flex; align-items: center; gap: .5rem;
}
.theme-btn_sm_vc { transition: color .2s; }
.navbar-cta_sm_vc {
  background: var(--sn-primario) !important;
  color: var(--sn-fondo) !important;
  font-size: .72rem !important;
  font-weight: 700 !important;
  letter-spacing: .08em !important;
  border-radius: var(--sn-radius-md) !important;
  padding: .35rem .875rem !important;
}

/* ── Botón scroll to top ── */
.scroll-top-btn_sm_vc {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 99;
  box-shadow: var(--sn-shadow-md);
}

/* ── Transición del botón scroll top ── */
.fade-up-enter-active,
.fade-up-leave-active { transition: all .3s ease; }
.fade-up-enter-from   { opacity: 0; transform: translateY(12px); }
.fade-up-leave-to     { opacity: 0; transform: translateY(12px); }
</style>