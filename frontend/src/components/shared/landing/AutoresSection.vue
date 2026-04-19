<!-- ══════════════════════════════════════════════════════════════════
     AutoresSection.vue — Sección de créditos del equipo de ingeniería.
     Tarjetas de contribuidor con estética terminal/git, tema dinámico
     y animación de entrada por Intersection Observer.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <section
    ref="seccion_sm_vc"
    id="autores"
    class="autores-root_sm_vc"
    :class="isDark_sm_vc ? 'autores-dark_sm_vc' : 'autores-light_sm_vc'"
    aria-label="Equipo de ingeniería SENTINNEL"
  >
    <!-- ── Encabezado ── -->
    <div class="autores-header_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <div class="seccion-eyebrow_sm_vc">
        <span class="eyebrow-line_sm_vc" />
        <span>Equipo de Ingeniería</span>
        <span class="eyebrow-line_sm_vc" />
      </div>
      <h2 class="autores-titulo_sm_vc">
        Construido por <span class="titulo-acento_sm_vc">humanos reales</span>
      </h2>
      <p class="autores-subtitulo_sm_vc">
        Dos desarrolladores. Un sistema. Cero burocracia.
      </p>
    </div>

    <!-- ── Grid de tarjetas ── -->
    <div class="autores-grid_sm_vc">
      <article
        v-for="(dev_sm_vc, idx_sm_vc) in desarrolladores_sm_vc"
        :key="dev_sm_vc.id_sm_vc"
        class="dev-card_sm_vc"
        :class="{ 'visible_sm_vc': visible_sm_vc }"
        :style="{ animationDelay: `${idx_sm_vc * 0.15}s` }"
      >
        <!-- Franja de acento superior con gradiente dinámico -->
        <div class="card-accent-strip_sm_vc" :style="{ background: dev_sm_vc.accentGradient_sm_vc }" />

        <!-- Header de terminal: simula una barra de título de IDE -->
        <div class="card-terminal-bar_sm_vc">
          <div class="terminal-dots_sm_vc">
            <span class="t-dot_sm_vc t-dot--red_sm_vc" />
            <span class="t-dot_sm_vc t-dot--yellow_sm_vc" />
            <span class="t-dot_sm_vc t-dot--green_sm_vc" />
          </div>
          <span class="terminal-filename_sm_vc">{{ dev_sm_vc.filename_sm_vc }}</span>
          <span class="terminal-branch_sm_vc">
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style="display:inline;vertical-align:middle;margin-right:3px">
              <circle cx="2" cy="2" r="1.5" stroke="currentColor" stroke-width="1"/>
              <circle cx="8" cy="10" r="1.5" stroke="currentColor" stroke-width="1"/>
              <circle cx="2" cy="10" r="1.5" stroke="currentColor" stroke-width="1"/>
              <path d="M2 3.5V8.5M2 8.5C2 9.3 2.7 10 3.5 10H8M8 8.5V3.5" stroke="currentColor" stroke-width="1" fill="none"/>
            </svg>
            main
          </span>
        </div>

        <!-- Cuerpo principal -->
        <div class="card-body_sm_vc">
          <!-- Avatar con badge de rol -->
          <div class="avatar-wrap_sm_vc">
            <div class="avatar-ring_sm_vc" :style="{ borderColor: dev_sm_vc.accentColor_sm_vc }">
              <img
                :src="dev_sm_vc.avatarUrl_sm_vc"
                :alt="`Avatar de ${dev_sm_vc.nombre_sm_vc}`"
                class="avatar-img_sm_vc"
                loading="lazy"
              />
            </div>
            <div class="avatar-status_sm_vc" :style="{ background: dev_sm_vc.accentColor_sm_vc }" />
          </div>

          <!-- Info del desarrollador -->
          <div class="dev-info_sm_vc">
            <h3 class="dev-nombre_sm_vc">{{ dev_sm_vc.nombre_sm_vc }}</h3>
            <div class="dev-rol-badge_sm_vc" :style="{ color: dev_sm_vc.accentColor_sm_vc, borderColor: dev_sm_vc.accentColor_sm_vc + '40', background: dev_sm_vc.accentColor_sm_vc + '12' }">
              <span class="rol-dot_sm_vc" :style="{ background: dev_sm_vc.accentColor_sm_vc }" />
              {{ dev_sm_vc.rol_sm_vc }}
            </div>
          </div>
        </div>

        <!-- Separador estilo code comment -->
        <div class="card-divider_sm_vc">
          <span class="divider-comment_sm_vc">Datos académicos</span>
        </div>

        <!-- Campos de datos como propiedades de objeto -->
        <div class="card-data_sm_vc">
          <div v-for="campo_sm_vc in dev_sm_vc.campos_sm_vc" :key="campo_sm_vc.key_sm_vc" class="data-row_sm_vc">
            <span class="data-key_sm_vc">{{ campo_sm_vc.key_sm_vc }}</span>
            <span class="data-colon_sm_vc">:</span>
            <span class="data-value_sm_vc" :class="campo_sm_vc.type_sm_vc === 'string' ? 'data-string_sm_vc' : 'data-number_sm_vc'">
              <template v-if="campo_sm_vc.type_sm_vc === 'string'">"{{ campo_sm_vc.value_sm_vc }}"</template>
              <template v-else>{{ campo_sm_vc.value_sm_vc }}</template>
            </span>
          </div>
        </div>

        <!-- Footer: links sociales -->
        <div class="card-footer_sm_vc">
          <a
            v-for="link_sm_vc in dev_sm_vc.links_sm_vc"
            :key="link_sm_vc.label_sm_vc"
            :href="link_sm_vc.href_sm_vc"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link_sm_vc"
            :aria-label="link_sm_vc.label_sm_vc"
          >
            <!-- GitHub icon -->
            <svg v-if="link_sm_vc.icon_sm_vc === 'github'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <!-- LinkedIn icon -->
            <svg v-if="link_sm_vc.icon_sm_vc === 'linkedin'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span>{{ link_sm_vc.label_sm_vc }}</span>
          </a>
        </div>
      </article>
    </div>

    <!-- ── Pie de sección: commit hash decorativo ── -->
    <div class="autores-commit-row_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <span class="commit-label_sm_vc">SENTINNEL</span>
      <span class="commit-sep_sm_vc">·</span>
      <span class="commit-hash_sm_vc">Universidad Nueva Esparta</span>
      <span class="commit-sep_sm_vc">·</span>
      <span class="commit-hash_sm_vc">Carrera de Computación</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useConfigStore } from 'src/stores/configStore.js'

// Assets
import victorImg_sm_vc from 'src/assets/Victor Contreras.jpg'

const configStore_sm_vc = useConfigStore()
const isDark_sm_vc = computed(() => configStore_sm_vc.isDark_sm_vc)

const seccion_sm_vc = ref(null)
const visible_sm_vc = ref(false)

const accentDark1_sm_vc = '#6fffe9'
const accentDark2_sm_vc = '#7ec8e3'
const accentLight1_sm_vc = '#0d7a6f'
const accentLight2_sm_vc = '#0284c7'

const desarrolladores_sm_vc = computed(() => {
  const bgHex_sm_vc = isDark_sm_vc.value ? '0b132b' : 'f0fffe'
  const color2_sm_vc = isDark_sm_vc.value ? '7ec8e3' : '0284c7'

  return [
    {
      id_sm_vc: 'victor',
      nombre_sm_vc: 'Víctor Contreras',
      rol_sm_vc: 'Desarrollador Frontend',
      filename_sm_vc: 'victor.contreras.ts',
      accentColor_sm_vc: isDark_sm_vc.value ? accentDark1_sm_vc : accentLight1_sm_vc,
      accentGradient_sm_vc: isDark_sm_vc.value
        ? 'linear-gradient(90deg, #6fffe9, #5bc0be)'
        : 'linear-gradient(90deg, #0d7a6f, #0fa899)',
      avatarUrl_sm_vc: victorImg_sm_vc,
      campos_sm_vc: [
        { key_sm_vc: 'matricula', value_sm_vc: '30.520.132', type_sm_vc: 'number' },
        { key_sm_vc: 'universidad', value_sm_vc: 'UNE', type_sm_vc: 'string' },
        { key_sm_vc: 'stack', value_sm_vc: 'Vue · Quasar · SCSS', type_sm_vc: 'string' },
      ],
      links_sm_vc: [
        { label_sm_vc: 'GitHub', href_sm_vc: 'https://github.com/VictorContreras', icon_sm_vc: 'github' },
        { label_sm_vc: 'LinkedIn', href_sm_vc: '#', icon_sm_vc: 'linkedin' },
      ],
    },
    {
      id_sm_vc: 'santiago',
      nombre_sm_vc: 'Santiago',
      rol_sm_vc: 'Desarrollador Backend',
      filename_sm_vc: 'santiago.dev.ts',
      accentColor_sm_vc: isDark_sm_vc.value ? accentDark2_sm_vc : accentLight2_sm_vc,
      accentGradient_sm_vc: isDark_sm_vc.value
        ? 'linear-gradient(90deg, #7ec8e3, #4a9fbf)'
        : 'linear-gradient(90deg, #0284c7, #0ea5e9)',
      avatarUrl_sm_vc: `https://ui-avatars.com/api/?name=Santiago&background=${bgHex_sm_vc}&color=${color2_sm_vc}&bold=true&size=128&length=1&font-size=0.5`,
      campos_sm_vc: [
        { key_sm_vc: 'matricula', value_sm_vc: '30.407.730', type_sm_vc: 'string' },
        { key_sm_vc: 'universidad', value_sm_vc: 'UNE', type_sm_vc: 'string' },
        { key_sm_vc: 'stack', value_sm_vc: 'Vue · NestJS · Prisma', type_sm_vc: 'string' },
      ],
      links_sm_vc: [
        { label_sm_vc: 'GitHub', href_sm_vc: '#', icon_sm_vc: 'github' },
        { label_sm_vc: 'LinkedIn', href_sm_vc: '#', icon_sm_vc: 'linkedin' },
      ],
    },
  ]
})

let observer_sm_vc = null
onMounted(() => {
  observer_sm_vc = new IntersectionObserver(
    ([entry_sm_vc]) => { if (entry_sm_vc.isIntersecting) visible_sm_vc.value = true },
    { threshold: 0.12 }
  )
  if (seccion_sm_vc.value) observer_sm_vc.observe(seccion_sm_vc.value)
})
onUnmounted(() => observer_sm_vc?.disconnect())
</script>

<style scoped>
/* ── Root ── */
.autores-root_sm_vc {
  padding: 6rem 2rem;
  border-top: 1px solid var(--sn-borde);
  font-family: var(--sn-font-mono);
  transition: background 0.3s ease;
}
.autores-dark_sm_vc  { background: var(--sn-fondo-elevado); }
.autores-light_sm_vc { background: var(--sn-fondo); }

/* ── Header ── */
.autores-header_sm_vc {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 4rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all .7s ease;
}
.autores-header_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }

.seccion-eyebrow_sm_vc {
  display: flex; align-items: center; gap: .75rem; justify-content: center;
  font-size: .62rem; letter-spacing: .2em; text-transform: uppercase;
  color: var(--sn-primario); margin-bottom: 1rem;
}
.eyebrow-line_sm_vc {
  flex: 1; max-width: 60px; height: 1px;
  background: var(--sn-borde-activo);
}
.autores-titulo_sm_vc {
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  color: var(--sn-texto-principal);
  letter-spacing: .04em;
  line-height: 1.2;
  margin: 0 0 .875rem;
}
.titulo-acento_sm_vc { color: var(--sn-primario); }
.autores-subtitulo_sm_vc {
  font-size: .85rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans);
  margin: 0;
  letter-spacing: .04em;
}

/* ── Grid ── */
.autores-grid_sm_vc {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 860px;
  margin: 0 auto 2.5rem;
}

/* ── Tarjeta ── */
.dev-card_sm_vc {
  border: 1px solid var(--sn-borde);
  border-radius: 14px;
  overflow: hidden;
  background: var(--sn-fondo-panel);
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .6s ease, transform .6s ease, border-color .2s ease, box-shadow .2s ease;
}
.dev-card_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
.dev-card_sm_vc:hover {
  border-color: var(--sn-borde-hover);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  transform: translateY(-4px) !important;
}

/* Franja de acento superior */
.card-accent-strip_sm_vc {
  height: 3px;
  width: 100%;
}

/* Barra de terminal */
.card-terminal-bar_sm_vc {
  display: flex;
  align-items: center;
  gap: .625rem;
  padding: .5rem .875rem;
  background: var(--sn-fondo-elevado);
  border-bottom: 1px solid var(--sn-borde);
}
.terminal-dots_sm_vc {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}
.t-dot_sm_vc {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.t-dot--red_sm_vc    { background: #ff5f57; }
.t-dot--yellow_sm_vc { background: #febc2e; }
.t-dot--green_sm_vc  { background: #28c840; }
.terminal-filename_sm_vc {
  flex: 1;
  font-size: .65rem;
  color: var(--sn-texto-apagado);
  letter-spacing: .06em;
  text-align: center;
}
.terminal-branch_sm_vc {
  font-size: .6rem;
  color: var(--sn-primario);
  letter-spacing: .05em;
  display: flex;
  align-items: center;
  gap: 3px;
  opacity: .8;
}

/* Cuerpo */
.card-body_sm_vc {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 1.5rem .875rem;
}
.avatar-wrap_sm_vc {
  position: relative;
  flex-shrink: 0;
}
.avatar-ring_sm_vc {
  width: 68px;
  height: 68px;
  border-radius: 14px;
  border: 2px solid transparent;
  padding: 2px;
  background: var(--sn-fondo-panel);
  transition: border-color .2s;
}
.avatar-img_sm_vc {
  width: 100%;
  height: 100%;
  border-radius: 11px;
  object-fit: cover;
  display: block;
}
.avatar-status_sm_vc {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid var(--sn-fondo-panel);
}
.dev-info_sm_vc {
  flex: 1;
  min-width: 0;
}
.dev-nombre_sm_vc {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--sn-texto-principal);
  letter-spacing: .04em;
  margin: 0 0 .5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dev-rol-badge_sm_vc {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  font-size: .62rem;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid transparent;
}
.rol-dot_sm_vc {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: rol-pulse_sm_vc 2s ease-in-out infinite;
}
@keyframes rol-pulse_sm_vc {
  0%, 100% { opacity: 1; }
  50%       { opacity: .35; }
}

/* Separador con comentario */
.card-divider_sm_vc {
  margin: 0 1.5rem;
  padding: .5rem 0;
  border-top: 1px solid var(--sn-borde);
}
.divider-comment_sm_vc {
  font-size: .62rem;
  color: var(--sn-texto-apagado);
  letter-spacing: .04em;
  opacity: .6;
  font-style: italic;
}

/* Datos como propiedades */
.card-data_sm_vc {
  padding: .25rem 1.5rem .875rem;
  display: flex;
  flex-direction: column;
  gap: .35rem;
}
.data-row_sm_vc {
  display: flex;
  align-items: baseline;
  gap: .3rem;
  font-size: .72rem;
}
.data-key_sm_vc {
  color: var(--sn-texto-terciario);
  min-width: 88px;
  flex-shrink: 0;
}
.data-colon_sm_vc {
  color: var(--sn-texto-apagado);
}
.data-string_sm_vc {
  color: var(--sn-advertencia);
}
.data-number_sm_vc {
  color: var(--sn-acento-sec);
}

/* Footer de links */
.card-footer_sm_vc {
  display: flex;
  gap: .5rem;
  padding: .875rem 1.5rem 1.25rem;
  border-top: 1px solid var(--sn-borde);
}
.social-link_sm_vc {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  font-size: .65rem;
  color: var(--sn-texto-apagado);
  text-decoration: none;
  padding: .35rem .75rem;
  border-radius: 6px;
  border: 1px solid var(--sn-borde);
  background: var(--sn-surface-alpha);
  letter-spacing: .06em;
  transition: all .15s ease;
}
.social-link_sm_vc:hover {
  color: var(--sn-primario);
  border-color: var(--sn-borde-activo);
  background: var(--sn-surface-active);
}

/* ── Pie de sección (commit row) ── */
.autores-commit-row_sm_vc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .6rem;
  flex-wrap: wrap;
  opacity: 0;
  transition: opacity .8s .4s ease;
}
.autores-commit-row_sm_vc.visible_sm_vc { opacity: 1; }
.commit-label_sm_vc {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--sn-primario);
}
.commit-sep_sm_vc {
  color: var(--sn-borde-activo);
  font-size: .65rem;
}
.commit-hash_sm_vc {
  font-size: .62rem;
  color: var(--sn-texto-apagado);
  letter-spacing: .08em;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .autores-grid_sm_vc { grid-template-columns: 1fr; }
  .card-body_sm_vc { flex-direction: column; align-items: flex-start; }
}
</style>