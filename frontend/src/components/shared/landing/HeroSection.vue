<!-- ══════════════════════════════════════════════════════════════════
     HeroSection.vue — Sección hero de la Landing Page de SENTINNEL.
     Presenta el sistema con un encabezado impactante, subtítulo y CTA
     apuntando al login institucional. Canvas de partículas reactivo
     al tema. No accede a stores; recibe isDark_sm_vc como prop.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <section class="hero-root_sm_vc" aria-label="Presentación de SENTINNEL">
    <!-- Canvas de fondo animado (puntos hexagonales) -->
    <canvas ref="canvas_sm_vc" class="hero-canvas_sm_vc" aria-hidden="true" />

    <!-- Capas decorativas -->
    <div class="hero-grid-overlay_sm_vc" aria-hidden="true" />
    <div class="hero-glow-top_sm_vc" aria-hidden="true" />

    <div class="hero-inner_sm_vc">
      <!-- Badge institucional -->
      <div class="hero-badge_sm_vc">
        <div class="badge-dot_sm_vc" />
        <span>Universidad Nueva Esparta · Computación</span>
      </div>

      <!-- Logo SENTINNEL -->
      <div class="hero-logo-wrap_sm_vc">
        <svg width="52" height="52" viewBox="0 0 36 36" fill="none" class="hero-logo-svg_sm_vc">
          <polygon
            points="18,2 34,10 34,26 18,34 2,26 2,10"
            :stroke="accentColor_sm_vc"
            stroke-width="1.5"
            fill="none"
            class="hex-outer_sm_vc"
          />
          <polygon
            points="18,8 28,13 28,23 18,28 8,23 8,13"
            :stroke="accentColor_sm_vc"
            stroke-width="0.8"
            fill="none"
            opacity="0.5"
            class="hex-inner_sm_vc"
          />
          <circle cx="18" cy="18" r="4" :fill="accentColor_sm_vc" />
        </svg>
      </div>

      <!-- Heading principal -->
      <h1 class="hero-title_sm_vc">
        <span class="hero-title-main_sm_vc">SENTINNEL</span>
        <span class="hero-title-sub_sm_vc">Trazabilidad Académica UNE</span>
      </h1>

      <!-- Descripción -->
      <p class="hero-desc_sm_vc">
        El sistema <strong>step-by-step</strong> que digitaliza el ciclo completo de pasantías:
        desde la primera entrega de informe hasta el deploy del proyecto final.
        Sin papel, sin correos informales, con auditoría total.
      </p>

      <!-- Métricas rápidas -->
      <div class="hero-metrics_sm_vc" aria-label="Estadísticas del sistema">
        <div
          v-for="metric_sm_vc in metricas_sm_vc"
          :key="metric_sm_vc.label_sm_vc"
          class="metric-item_sm_vc">
          <span class="metric-num_sm_vc">{{ metric_sm_vc.valor_sm_vc }}</span>
          <span class="metric-label_sm_vc">{{ metric_sm_vc.label_sm_vc }}</span>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="hero-ctas_sm_vc">
        <q-btn
          unelevated no-caps
          label="Acceder al Sistema"
          icon-right="arrow_forward"
          class="cta-primary_sm_vc"
          :href="loginUrl_sm_vc"
          :ripple="{ color: isDark_sm_vc ? '#0b132b' : '#fff' }"
        />
        <q-btn
          flat no-caps
          label="Ver cómo funciona"
          icon="play_circle"
          class="cta-secondary_sm_vc"
          @click="$emit('scrollToBeneficios')"
        />
      </div>

      <!-- Roles soportados -->
      <div class="hero-roles_sm_vc" aria-label="Roles del sistema">
        <span v-for="rol_sm_vc in roles_sm_vc" :key="rol_sm_vc.label_sm_vc" class="role-chip_sm_vc">
          <q-icon :name="rol_sm_vc.icon_sm_vc" size="13px" :color="rol_sm_vc.color_sm_vc" />
          {{ rol_sm_vc.label_sm_vc }}
        </span>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="scroll-indicator_sm_vc" aria-hidden="true">
      <div class="scroll-line_sm_vc" />
      <span>scroll</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
// import { useQuasar } from 'quasar'

/* ── Props ── */
const props = defineProps({
  isDark_sm_vc: { type: Boolean, default: true }
})

defineEmits(['scrollToBeneficios'])

// const $q_sm_vc = useQuasar()

/* ── Refs del canvas ── */
const canvas_sm_vc = ref(null)
let animFrame_sm_vc = null

/* ── Color del acento reactivo al tema ── */
const accentColor_sm_vc = computed(() =>
  props.isDark_sm_vc ? '#6fffe9' : '#0d7a6f'
)

/* ── URL de login (hash router) ── */
const loginUrl_sm_vc = computed(() => '#/login')

/* ── Métricas de impacto ── */
const metricas_sm_vc = [
  { valor_sm_vc: '3',   label_sm_vc: 'Materias Secuenciales' },
  { valor_sm_vc: '100%', label_sm_vc: 'Trazabilidad Digital' },
  { valor_sm_vc: '0',   label_sm_vc: 'Papel Requerido' },
  { valor_sm_vc: '∞',   label_sm_vc: 'Historial Inmutable' }
]

/* ── Roles del sistema ── */
const roles_sm_vc = [
  { label_sm_vc: 'Administrador', icon_sm_vc: 'admin_panel_settings', color_sm_vc: 'amber-4' },
  { label_sm_vc: 'Profesor',      icon_sm_vc: 'school',               color_sm_vc: 'teal-3' },
  { label_sm_vc: 'Estudiante',    icon_sm_vc: 'person',               color_sm_vc: 'light-blue-3' }
]

/* ── Canvas animado de partículas ── */
const initCanvas_sm_vc = () => {
  const el_sm_vc = canvas_sm_vc.value
  if (!el_sm_vc) return
  const ctx_sm_vc = el_sm_vc.getContext('2d')

  const resize_sm_vc = () => {
    el_sm_vc.width  = el_sm_vc.offsetWidth
    el_sm_vc.height = el_sm_vc.offsetHeight
  }
  resize_sm_vc()

  const COLS_sm_vc = 30
  const ROWS_sm_vc = 18
  const puntos_sm_vc = []

  for (let c = 0; c < COLS_sm_vc; c++) {
    for (let r = 0; r < ROWS_sm_vc; r++) {
      puntos_sm_vc.push({
        x: (c / (COLS_sm_vc - 1)) * el_sm_vc.width,
        y: (r / (ROWS_sm_vc - 1)) * el_sm_vc.height,
        fase: Math.random() * Math.PI * 2,
        vel: 0.008 + Math.random() * 0.012
      })
    }
  }

  const dibujar_sm_vc = () => {
    ctx_sm_vc.clearRect(0, 0, el_sm_vc.width, el_sm_vc.height)
    const rgb_sm_vc = props.isDark_sm_vc ? '111,255,233' : '13,122,111'
    puntos_sm_vc.forEach((p_sm_vc) => {
      p_sm_vc.fase += p_sm_vc.vel
      const a_sm_vc = ((Math.sin(p_sm_vc.fase) + 1) / 2) * (props.isDark_sm_vc ? 0.1 : 0.07)
      ctx_sm_vc.beginPath()
      ctx_sm_vc.arc(p_sm_vc.x, p_sm_vc.y, 1.2, 0, Math.PI * 2)
      ctx_sm_vc.fillStyle = `rgba(${rgb_sm_vc},${a_sm_vc})`
      ctx_sm_vc.fill()
    })
    animFrame_sm_vc = requestAnimationFrame(dibujar_sm_vc)
  }
  dibujar_sm_vc()

  window.addEventListener('resize', resize_sm_vc)
  return () => window.removeEventListener('resize', resize_sm_vc)
}

onMounted(initCanvas_sm_vc)
onUnmounted(() => { if (animFrame_sm_vc) cancelAnimationFrame(animFrame_sm_vc) })
</script>

<style scoped>
/* ── Root ── */
.hero-root_sm_vc {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--sn-fondo);
  padding: 5rem 2rem 4rem;
}

/* ── Canvas ── */
.hero-canvas_sm_vc {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ── Overlays decorativos ── */
.hero-grid-overlay_sm_vc {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--sn-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--sn-grid-line) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}
.hero-glow-top_sm_vc {
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 400px;
  background: radial-gradient(ellipse, var(--sn-surface-active) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* ── Inner ── */
.hero-inner_sm_vc {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 840px;
  gap: 1.5rem;
}

/* ── Badge ── */
.hero-badge_sm_vc {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .3rem .9rem;
  background: var(--sn-surface-active);
  border: 1px solid var(--sn-borde-activo);
  border-radius: var(--sn-radius-pill);
  font-size: .65rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--sn-primario);
  font-family: var(--sn-font-mono);
  animation: fadeDown_sm_vc .6s ease forwards;
}
.badge-dot_sm_vc {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sn-primario);
  box-shadow: 0 0 8px var(--sn-primario);
  animation: pulso_sm_vc 2s infinite;
}

/* ── Logo SVG ── */
.hero-logo-wrap_sm_vc {
  animation: fadeDown_sm_vc .7s .1s ease both;
}
.hero-logo-svg_sm_vc {
  filter: drop-shadow(0 0 16px var(--sn-surface-active));
}
.hex-outer_sm_vc {
  animation: rotar_sm_vc 20s linear infinite;
  transform-origin: 18px 18px;
}
.hex-inner_sm_vc {
  animation: rotar_sm_vc 14s linear infinite reverse;
  transform-origin: 18px 18px;
}

/* ── Título ── */
.hero-title_sm_vc {
  display: flex;
  flex-direction: column;
  gap: .35rem;
  margin: 0;
  animation: fadeDown_sm_vc .8s .15s ease both;
}
.hero-title-main_sm_vc {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 700;
  letter-spacing: .2em;
  color: var(--sn-primario);
  font-family: var(--sn-font-mono);
  text-shadow: 0 0 40px var(--sn-surface-active);
  line-height: 1;
}
.hero-title-sub_sm_vc {
  font-size: clamp(.75rem, 2vw, 1rem);
  letter-spacing: .25em;
  color: var(--sn-texto-terciario);
  text-transform: uppercase;
  font-family: var(--sn-font-mono);
}

/* ── Descripción ── */
.hero-desc_sm_vc {
  font-size: clamp(.9rem, 2vw, 1.05rem);
  color: var(--sn-texto-secundario);
  line-height: 1.8;
  max-width: 580px;
  margin: 0;
  font-family: var(--sn-font-sans);
  animation: fadeDown_sm_vc .9s .2s ease both;
}
.hero-desc_sm_vc strong { color: var(--sn-primario); font-weight: 600; }

/* ── Métricas ── */
.hero-metrics_sm_vc {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeDown_sm_vc 1s .3s ease both;
}
.metric-item_sm_vc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .2rem;
}
.metric-num_sm_vc {
  font-size: 2rem;
  font-weight: 700;
  color: var(--sn-primario);
  font-family: var(--sn-font-mono);
  letter-spacing: .04em;
}
.metric-label_sm_vc {
  font-size: .6rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono);
}

/* ── CTAs ── */
.hero-ctas_sm_vc {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeDown_sm_vc 1s .35s ease both;
}
.cta-primary_sm_vc {
  background: var(--sn-primario) !important;
  color: var(--sn-fondo) !important;
  font-size: .82rem !important;
  font-weight: 700 !important;
  letter-spacing: .1em !important;
  padding: .75rem 2rem !important;
  border-radius: var(--sn-radius-md) !important;
  box-shadow: var(--sn-cta-glow);
  font-family: var(--sn-font-mono) !important;
  transition: all .2s ease !important;
}
.cta-primary_sm_vc:hover {
  transform: translateY(-2px);
  box-shadow: var(--sn-cta-glow-hover) !important;
}
.cta-secondary_sm_vc {
  color: var(--sn-texto-terciario) !important;
  font-size: .8rem !important;
  font-family: var(--sn-font-mono) !important;
  border: 1px solid var(--sn-borde) !important;
  border-radius: var(--sn-radius-md) !important;
  padding: .75rem 1.5rem !important;
  transition: all .2s ease !important;
}
.cta-secondary_sm_vc:hover {
  border-color: var(--sn-borde-hover) !important;
  color: var(--sn-texto-secundario) !important;
}

/* ── Roles ── */
.hero-roles_sm_vc {
  display: flex;
  gap: .6rem;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeDown_sm_vc 1.1s .4s ease both;
}
.role-chip_sm_vc {
  display: flex;
  align-items: center;
  gap: .35rem;
  padding: .3rem .8rem;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-radius-pill);
  font-size: .65rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-mono);
  letter-spacing: .06em;
}

/* ── Scroll indicator ── */
.scroll-indicator_sm_vc {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .4rem;
  font-size: .55rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono);
  z-index: 1;
  animation: aparecer_sm_vc 1.5s 1s ease both;
}
.scroll-line_sm_vc {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, var(--sn-primario), transparent);
  animation: scrollLinea_sm_vc 2s ease-in-out infinite;
}

/* ── Keyframes ── */
@keyframes fadeDown_sm_vc {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulso_sm_vc {
  0%, 100% { opacity: 1; }
  50%       { opacity: .3; }
}
@keyframes rotar_sm_vc {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes scrollLinea_sm_vc {
  0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
  50%  { opacity: 1; transform: scaleY(1); transform-origin: top; }
  100% { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
}
@keyframes aparecer_sm_vc {
  from { opacity: 0; } to { opacity: 1; }
}
</style>