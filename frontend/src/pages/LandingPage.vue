<!-- ══════════════════════════════════════════════════════════════════
     LandingPage.vue — Vista orquestadora de la Landing Page SENTINNEL.
     Thin Page: importa y coordina las secciones, maneja el scroll
     suave entre anclas y propaga el estado de tema a los hijos.
     El único acceso a stores es configStore para el tema.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-layout view="hHh lpR fFf" class="landing-layout_sm_vc">
    <q-page-container>
      <q-page class="landing-page_sm_vc">

        <!-- ── Barra de navegación flotante ── -->
        <header class="landing-navbar_sm_vc" :class="{ 'navbar-scrolled_sm_vc': scrolled_sm_vc }">
          <div class="navbar-inner_sm_vc">
            <!-- Logo -->
            <div class="navbar-brand_sm_vc">
              <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                <polygon
                  points="18,2 34,10 34,26 18,34 2,26 2,10"
                  :stroke="isDark_sm_vc ? '#6fffe9' : '#0d7a6f'"
                  stroke-width="1.5" fill="none" />
                <circle cx="18" cy="18" r="4" :fill="isDark_sm_vc ? '#6fffe9' : '#0d7a6f'" />
              </svg>
              <span class="navbar-nombre_sm_vc">SENTINNEL</span>
            </div>

            <!-- Nav links (desktop) -->
            <nav class="navbar-links_sm_vc gt-sm" aria-label="Navegación de la landing">
              <a
                v-for="link_sm_vc in navAnlas_sm_vc"
                :key="link_sm_vc.href_sm_vc"
                :href="link_sm_vc.href_sm_vc"
                class="navbar-link_sm_vc"
                @click.prevent="scrollA_sm_vc(link_sm_vc.href_sm_vc)">
                {{ link_sm_vc.label_sm_vc }}
              </a>
            </nav>

            <!-- Controles derecha -->
            <div class="navbar-actions_sm_vc">
              <!-- Toggle de tema -->
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

              <!-- CTA de acceso -->
              <q-btn
                unelevated no-caps
                label="Acceder"
                icon="login"
                size="sm"
                class="navbar-cta_sm_vc"
                @click="router_sm_vc.push('/login')"
              />
            </div>
          </div>
        </header>

        <!-- ══════════════════════
             SECCIONES DE CONTENIDO
             ══════════════════════ -->

        <!-- 1. Hero -->
        <div id="hero">
          <HeroSection
            :is-dark_sm_vc="isDark_sm_vc"
            @scroll-to-beneficios="scrollA_sm_vc('#beneficios')" />
        </div>

        <!-- 2. Beneficios -->
        <BeneficiosSection :is-dark_sm_vc="isDark_sm_vc" />

        <!-- 3. Mockup visual del dashboard -->
        <MockUpVisual :is-dark_sm_vc="isDark_sm_vc" />

        <!-- 4. Testimonios (usa store + servicio Axios) -->
        <TestimoniosSection :is-dark_sm_vc="isDark_sm_vc" />

        <!-- 5. FAQ -->
        <FAQSection :is-dark_sm_vc="isDark_sm_vc" />

        <!-- 6. Footer -->
        <FooterSection
          :is-dark_sm_vc="isDark_sm_vc"
          @toggle-theme="configStore_sm_vc.toggleTheme_sm_vc()" />

        <!-- Botón de scroll to top -->
        <transition name="fade-up">
          <q-btn
            v-if="scrolled_sm_vc"
            round unelevated
            icon="keyboard_arrow_up"
            class="scroll-top-btn_sm_vc"
            color="teal-3"
            text-color="dark"
            aria-label="Volver al inicio"
            @click="scrollA_sm_vc('#hero')" />
        </transition>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useConfigStore } from 'src/stores/configStore.js'
import { useRouter } from 'vue-router'

/* ── Sub-componentes de sección ── */
import HeroSection       from 'src/components/shared/landing/HeroSection.vue'
import BeneficiosSection from 'src/components/shared/landing/BeneficiosSection.vue'
import MockUpVisual      from 'src/components/shared/landing/MockUpVisual.vue'
import TestimoniosSection from 'src/components/shared/landing/TestimoniosSection.vue'
import FAQSection        from 'src/components/shared/landing/FAQSection.vue'
import FooterSection     from 'src/components/shared/landing/FooterSection.vue'

/* ── Enrutador ── */
const router_sm_vc = useRouter()

/* ── Config Store (tema light/dark) ── */
const configStore_sm_vc = useConfigStore()
const isDark_sm_vc = computed(() => configStore_sm_vc.isDark_sm_vc)

/* ── Estado de scroll para navbar y botón top ── */
const scrolled_sm_vc = ref(false)

const onScroll_sm_vc = () => {
  scrolled_sm_vc.value = window.scrollY > 80
}

/* ── Scroll suave a un ancla ── */
const scrollA_sm_vc = (href_sm_vc) => {
  const id_sm_vc = href_sm_vc.replace('#', '')
  const el_sm_vc = document.getElementById(id_sm_vc)
  if (el_sm_vc) {
    el_sm_vc.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/* ── Links de navegación ── */
const navAnlas_sm_vc = [
  { label_sm_vc: 'Beneficios',  href_sm_vc: '#beneficios' },
  { label_sm_vc: 'Demo',        href_sm_vc: '#demo' },
  { label_sm_vc: 'Testimonios', href_sm_vc: '#testimonios' },
  { label_sm_vc: 'FAQ',         href_sm_vc: '#faq' }
]

/* ── Lifecycle ── */
onMounted(() => {
  window.addEventListener('scroll', onScroll_sm_vc, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll_sm_vc)
})
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