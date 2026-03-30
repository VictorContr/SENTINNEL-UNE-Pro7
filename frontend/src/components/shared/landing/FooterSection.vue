<!-- ══════════════════════════════════════════════════════════════════
     FooterSection.vue — Pie de página de la Landing SENTINNEL.
     Incluye info de contacto UNE, logo del sistema, navegación por
     anclas y créditos del equipo de desarrollo. Sin stores ni Axios.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <footer class="footer-root_sm_vc" aria-label="Pie de página SENTINNEL">
    <!-- Línea decorativa superior -->
    <div class="footer-topline_sm_vc" />

    <div class="footer-grid_sm_vc">
      <!-- Columna de marca -->
      <div class="footer-brand-col_sm_vc">
        <div class="footer-logo_sm_vc">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#6fffe9" stroke-width="1.5" fill="none"/>
            <polygon points="18,8 28,13 28,23 18,28 8,23 8,13" stroke="#5bc0be" stroke-width=".8" fill="none" opacity=".5"/>
            <circle cx="18" cy="18" r="4" fill="#6fffe9"/>
          </svg>
          <div>
            <p class="logo-sub_sm_vc">SGTIP-UNE</p>
            <h3 class="logo-nombre_sm_vc">SENTINNEL</h3>
          </div>
        </div>
        <p class="brand-desc_sm_vc">
          Sistema de Gestión y Trazabilidad de Informes de Pasantías de la
          Universidad Nueva Esparta — Carrera de Computación.
        </p>
        <!-- Toggle de tema integrado en footer -->
        <div class="footer-theme-toggle_sm_vc">
          <q-toggle
            :model-value="isDark_sm_vc"
            @update:model-value="toggleTheme_sm_vc"
            :icon="isDark_sm_vc ? 'nights_stay' : 'wb_sunny'"
            color="teal"
            dense
            :label="isDark_sm_vc ? 'Modo Oscuro' : 'Modo Claro'"
          />
        </div>
      </div>

      <!-- Columna de navegación -->
      <div class="footer-nav-col_sm_vc">
        <h4 class="footer-col-titulo_sm_vc">Navegación</h4>
        <nav class="footer-links_sm_vc">
          <a v-for="link_sm_vc in navLinks_sm_vc" :key="link_sm_vc.href_sm_vc"
            :href="link_sm_vc.href_sm_vc" class="footer-link_sm_vc">
            <q-icon :name="link_sm_vc.icon_sm_vc" size="13px" />
            {{ link_sm_vc.label_sm_vc }}
          </a>
        </nav>
      </div>

      <!-- Columna de contacto UNE -->
      <div class="footer-contacto-col_sm_vc">
        <h4 class="footer-col-titulo_sm_vc">Contacto Institucional</h4>
        <div class="contacto-items_sm_vc">
          <div v-for="item_sm_vc in contactoItems_sm_vc" :key="item_sm_vc.label_sm_vc"
            class="contacto-item_sm_vc">
            <q-icon :name="item_sm_vc.icon_sm_vc" size="14px" color="teal-3" />
            <div>
              <p class="contacto-label_sm_vc">{{ item_sm_vc.label_sm_vc }}</p>
              <a v-if="item_sm_vc.href_sm_vc" :href="item_sm_vc.href_sm_vc"
                class="contacto-valor_sm_vc">{{ item_sm_vc.valor_sm_vc }}</a>
              <p v-else class="contacto-valor_sm_vc">{{ item_sm_vc.valor_sm_vc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer inferior: créditos -->
    <div class="footer-bottom_sm_vc">
      <div class="footer-sep_sm_vc" />
      <div class="footer-credits_sm_vc">
        <p class="credits-copy_sm_vc">
          © {{ anioActual_sm_vc }} SENTINNEL · Universidad Nueva Esparta · Todos los derechos reservados
        </p>
        <div class="credits-tech_sm_vc">
          <span>Vue 3</span>
          <span class="cred-dot_sm_vc" />
          <span>Quasar v2</span>
          <span class="cred-dot_sm_vc" />
          <span>Tailwind v4</span>
          <span class="cred-dot_sm_vc" />
          <span>Pinia</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from 'src/stores/configStore'

const configStore_sm_vc = useConfigStore()
const { isDark_sm_vc } = storeToRefs(configStore_sm_vc)
const { toggleTheme_sm_vc } = configStore_sm_vc

const anioActual_sm_vc = computed(() => new Date().getFullYear())

const navLinks_sm_vc = [
  { label_sm_vc: 'Inicio',        href_sm_vc: '#hero',         icon_sm_vc: 'home' },
  { label_sm_vc: 'Beneficios',    href_sm_vc: '#beneficios',   icon_sm_vc: 'star' },
  { label_sm_vc: 'Vista Previa',  href_sm_vc: '#demo',         icon_sm_vc: 'preview' },
  { label_sm_vc: 'Testimonios',   href_sm_vc: '#testimonios',  icon_sm_vc: 'chat_bubble' },
  { label_sm_vc: 'Preguntas',     href_sm_vc: '#faq',          icon_sm_vc: 'help' },
  { label_sm_vc: 'Acceder',       href_sm_vc: '#/login',       icon_sm_vc: 'login' }
]

const contactoItems_sm_vc = [
  { icon_sm_vc: 'school',    label_sm_vc: 'Institución',  valor_sm_vc: 'Universidad Nueva Esparta',   href_sm_vc: null },
  { icon_sm_vc: 'location_on', label_sm_vc: 'Ubicación',  valor_sm_vc: 'Los Naranjos, Caracas, Venezuela', href_sm_vc: null },
  { icon_sm_vc: 'mail',      label_sm_vc: 'Correo',       valor_sm_vc: 'computacion@une.edu.ve',      href_sm_vc: 'mailto:computacion@une.edu.ve' },
  { icon_sm_vc: 'web',       label_sm_vc: 'Web Institucional', valor_sm_vc: 'www.une.edu.ve',        href_sm_vc: 'https://www.une.edu.ve' }
]
</script>

<style scoped>
.footer-root_sm_vc {
  background: var(--sn-fondo-elevado);
  border-top: 1px solid var(--sn-borde);
  padding: 0 2rem 2rem;
  font-family: var(--sn-font-mono);
}
.footer-topline_sm_vc {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--sn-borde-activo), transparent);
  margin-bottom: 3rem;
}

/* ── Grid ── */
.footer-grid_sm_vc {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 3rem; max-width: 1100px; margin: 0 auto 2.5rem;
}
@media (max-width: 768px) { .footer-grid_sm_vc { grid-template-columns: 1fr; gap: 2rem; } }

/* ── Columna de marca ── */
.footer-logo_sm_vc { display: flex; align-items: center; gap: .875rem; margin-bottom: 1rem; }
.logo-sub_sm_vc { font-size: .5rem; letter-spacing: .18em; color: var(--sn-acento-sec); text-transform: uppercase; margin: 0 0 1px; font-weight: 500; }
.logo-nombre_sm_vc { font-size: 1.4rem; font-weight: 700; letter-spacing: .18em; color: var(--sn-primario); margin: 0; }
.brand-desc_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); font-family: var(--sn-font-sans); line-height: 1.7; margin: 0 0 1.25rem; }
.footer-theme-toggle_sm_vc :deep(.q-toggle__label) { font-size: .68rem !important; color: var(--sn-texto-apagado) !important; }

/* ── Columnas generales ── */
.footer-col-titulo_sm_vc {
  font-size: .65rem; letter-spacing: .16em; text-transform: uppercase;
  color: var(--sn-texto-terciario); font-weight: 600; margin: 0 0 1rem;
}

/* ── Navegación ── */
.footer-links_sm_vc { display: flex; flex-direction: column; gap: .5rem; }
.footer-link_sm_vc {
  display: flex; align-items: center; gap: .4rem;
  font-size: .75rem; color: var(--sn-texto-apagado);
  text-decoration: none; transition: color .15s;
}
.footer-link_sm_vc:hover { color: var(--sn-primario); }

/* ── Contacto ── */
.contacto-items_sm_vc { display: flex; flex-direction: column; gap: .875rem; }
.contacto-item_sm_vc { display: flex; align-items: flex-start; gap: .6rem; }
.contacto-label_sm_vc { font-size: .58rem; letter-spacing: .12em; text-transform: uppercase; color: var(--sn-texto-dim); margin: 0 0 1px; }
.contacto-valor_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; text-decoration: none; font-family: var(--sn-font-sans); }
a.contacto-valor_sm_vc:hover { color: var(--sn-primario); }

/* ── Footer bottom ── */
.footer-bottom_sm_vc { max-width: 1100px; margin: 0 auto; }
.footer-sep_sm_vc { height: 1px; background: var(--sn-borde); margin-bottom: 1.25rem; }
.footer-credits_sm_vc { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .75rem; }
.credits-copy_sm_vc { font-size: .65rem; color: var(--sn-texto-apagado); margin: 0; }
.credits-tech_sm_vc { display: flex; align-items: center; gap: .5rem; }
.credits-tech_sm_vc span { font-size: .62rem; color: var(--sn-texto-dim); }
.cred-dot_sm_vc { width: 3px; height: 3px; border-radius: 50%; background: var(--sn-texto-dim); display: inline-block; }
</style>