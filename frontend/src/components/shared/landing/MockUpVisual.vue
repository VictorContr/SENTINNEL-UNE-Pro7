<!-- ══════════════════════════════════════════════════════════════════
     MockupVisual.vue — Representación visual del dashboard SENTINNEL.
     Muestra un mockup SVG/HTML del sistema: stepper de materias,
     tarjeta de conversación documental y barra de progreso global.
     Thin component, sin acceso a stores ni Axios.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <section
    ref="seccion_sm_vc"
    id="demo"
    class="mockup-root_sm_vc"
    aria-label="Vista previa del sistema SENTINNEL">

    <!-- Header -->
    <div class="seccion-header_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <div class="seccion-eyebrow_sm_vc">
        <span class="eyebrow-line_sm_vc" />
        <span>Vista Previa</span>
        <span class="eyebrow-line_sm_vc" />
      </div>
      <h2 class="seccion-titulo_sm_vc">
        El sistema, <span class="titulo-acento_sm_vc">en acción</span>
      </h2>
    </div>

    <!-- Wrapper del mockup -->
    <div class="mockup-frame_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <!-- Barra de título del navegador simulada -->
      <div class="browser-bar_sm_vc">
        <div class="browser-dots_sm_vc">
          <span /><span /><span />
        </div>
        <div class="browser-url_sm_vc">
          <q-icon name="lock" size="11px" color="teal-3" />
          sentinnel.une.edu.ve/#/estudiante/trazabilidad
        </div>
      </div>

      <!-- Contenido del dashboard simulado -->
      <div class="dashboard-sim_sm_vc">
        <!-- Sidebar mini -->
        <aside class="sidebar-mini_sm_vc">
          <div class="sidebar-brand_sm_vc">
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#6fffe9" stroke-width="1.5" fill="none"/>
              <circle cx="18" cy="18" r="4" fill="#6fffe9"/>
            </svg>
          </div>
          <nav class="sidebar-nav_sm_vc">
            <div v-for="item_sm_vc in navItems_sm_vc" :key="item_sm_vc.icon_sm_vc"
              class="sidebar-item_sm_vc" :class="{ 'sidebar-item--active_sm_vc': item_sm_vc.active_sm_vc }">
              <q-icon :name="item_sm_vc.icon_sm_vc" size="16px" />
            </div>
          </nav>
        </aside>

        <!-- Contenido principal del mockup -->
        <main class="main-content_sm_vc">
          <!-- Encabezado de página -->
          <div class="page-head_sm_vc">
            <div>
              <p class="page-label_sm_vc">Mi Trazabilidad</p>
              <p class="page-meta_sm_vc">Cohorte P-165 · Prof. Torres</p>
            </div>
            <div class="progress-global_sm_vc">
              <span class="prog-pct_sm_vc">67%</span>
              <q-linear-progress :value=".67" color="teal-3" track-color="blue-grey-9" rounded size="5px" style="width:120px" />
            </div>
          </div>

          <!-- Grid de materias -->
          <div class="materias-demo_sm_vc">
            <div
              v-for="mat_sm_vc in materiasDemo_sm_vc"
              :key="mat_sm_vc.id_sm_vc"
              class="mat-card_sm_vc"
              :class="`mat-card--${mat_sm_vc.estado_sm_vc}_sm_vc`">
              <!-- Acento top -->
              <div class="mat-acento_sm_vc" />
              <div class="mat-header_sm_vc">
                <div>
                  <p class="mat-nombre_sm_vc">{{ mat_sm_vc.nombre_sm_vc }}</p>
                  <p class="mat-id_sm_vc">{{ mat_sm_vc.id_sm_vc }}</p>
                </div>
                <div class="mat-estado-pill_sm_vc" :style="{ color: mat_sm_vc.color_sm_vc, borderColor: mat_sm_vc.color_sm_vc + '40', background: mat_sm_vc.color_sm_vc + '18' }">
                  <q-icon :name="mat_sm_vc.icon_sm_vc" size="10px" />
                  {{ mat_sm_vc.estado_sm_vc }}
                </div>
              </div>
              <q-linear-progress :value="mat_sm_vc.progreso_sm_vc" :color="mat_sm_vc.colorQ_sm_vc" track-color="blue-grey-10" rounded size="3px" class="q-mt-xs q-mb-xs" />
              <p class="mat-reqs_sm_vc">{{ mat_sm_vc.reqs_sm_vc }}/{{ mat_sm_vc.totalReqs_sm_vc }} requisitos</p>
            </div>
          </div>

          <!-- Mini conversación documental -->
          <div class="conv-preview_sm_vc">
            <div class="conv-header_sm_vc">
              <q-icon name="forum" size="13px" color="teal-3" />
              <span>Conversación Documental — Pasantías II</span>
            </div>
            <div class="conv-mensajes_sm_vc">
              <div v-for="msg_sm_vc in mensajesDemo_sm_vc" :key="msg_sm_vc.id_sm_vc"
                class="msg-item_sm_vc" :class="{ 'msg-item--right_sm_vc': msg_sm_vc.sent_sm_vc }">
                <div class="msg-bubble_sm_vc" :class="{ 'msg-bubble--sent_sm_vc': msg_sm_vc.sent_sm_vc }">
                  <div class="msg-tipo_sm_vc">{{ msg_sm_vc.tipo_sm_vc }}</div>
                  <div class="msg-archivo_sm_vc">
                    <q-icon :name="msg_sm_vc.sent_sm_vc ? 'description' : 'rate_review'" size="12px" />
                    {{ msg_sm_vc.archivo_sm_vc }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Caption del mockup -->
    <p class="mockup-caption_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      Vista real del panel de trazabilidad — Rol: Estudiante · Modo Demo
    </p>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({ isDark_sm_vc: { type: Boolean, default: true } })

const seccion_sm_vc = ref(null)
const visible_sm_vc = ref(false)

const navItems_sm_vc = [
  { icon_sm_vc: 'notifications_none', active_sm_vc: false },
  { icon_sm_vc: 'track_changes',      active_sm_vc: true },
  { icon_sm_vc: 'rocket_launch',      active_sm_vc: false }
]

const materiasDemo_sm_vc = [
  { id_sm_vc: 'MAT-001', nombre_sm_vc: 'Pasantías I',   estado_sm_vc: 'APROBADO',  progreso_sm_vc: 1,   reqs_sm_vc: 4, totalReqs_sm_vc: 4, color_sm_vc: '#6fffe9', colorQ_sm_vc: 'teal-4',        icon_sm_vc: 'check_circle' },
  { id_sm_vc: 'MAT-002', nombre_sm_vc: 'Pasantías II',  estado_sm_vc: 'ENTREGADO', progreso_sm_vc: .5,  reqs_sm_vc: 2, totalReqs_sm_vc: 4, color_sm_vc: '#7ec8e3', colorQ_sm_vc: 'light-blue-5',  icon_sm_vc: 'upload_file' },
  { id_sm_vc: 'MAT-003', nombre_sm_vc: 'Pasantías III', estado_sm_vc: 'PENDIENTE', progreso_sm_vc: 0,   reqs_sm_vc: 0, totalReqs_sm_vc: 4, color_sm_vc: '#5a7fa8', colorQ_sm_vc: 'blue-grey-6',   icon_sm_vc: 'schedule' }
]

const mensajesDemo_sm_vc = [
  { id_sm_vc: 1, sent_sm_vc: true,  tipo_sm_vc: 'INFORME',    archivo_sm_vc: 'Cap3_Metodologia_v1.pdf' },
  { id_sm_vc: 2, sent_sm_vc: false, tipo_sm_vc: 'CORRECCIÓN', archivo_sm_vc: 'Obs_Cap3_v1.pdf' },
  { id_sm_vc: 3, sent_sm_vc: true,  tipo_sm_vc: 'INFORME',    archivo_sm_vc: 'Cap4_Resultados_v1.pdf' }
]

let observer_sm_vc = null
onMounted(() => {
  observer_sm_vc = new IntersectionObserver(
    ([e_sm_vc]) => { if (e_sm_vc.isIntersecting) visible_sm_vc.value = true },
    { threshold: 0.1 }
  )
  if (seccion_sm_vc.value) observer_sm_vc.observe(seccion_sm_vc.value)
})
onUnmounted(() => observer_sm_vc?.disconnect())
</script>

<style scoped>
.mockup-root_sm_vc {
  padding: 6rem 2rem;
  background: var(--sn-fondo);
  border-top: 1px solid var(--sn-borde);
}
.seccion-header_sm_vc {
  text-align: center; max-width: 600px; margin: 0 auto 3rem;
  opacity: 0; transform: translateY(20px); transition: all .7s ease;
}
.seccion-header_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
.seccion-eyebrow_sm_vc {
  display: flex; align-items: center; gap: .75rem; justify-content: center;
  font-size: .62rem; letter-spacing: .2em; text-transform: uppercase;
  color: var(--sn-primario); font-family: var(--sn-font-mono); margin-bottom: 1rem;
}
.eyebrow-line_sm_vc { flex: 1; max-width: 60px; height: 1px; background: var(--sn-borde-activo); }
.seccion-titulo_sm_vc {
  font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 700;
  color: var(--sn-texto-principal); font-family: var(--sn-font-mono);
  letter-spacing: .04em; margin: 0;
}
.titulo-acento_sm_vc { color: var(--sn-primario); }

/* ── Frame del mockup ── */
.mockup-frame_sm_vc {
  max-width: 900px; margin: 0 auto;
  border: 1px solid var(--sn-borde-hover);
  border-radius: 14px; overflow: hidden;
  box-shadow: var(--sn-shadow-lg);
  opacity: 0; transform: translateY(28px); transition: all .9s .1s ease;
}
.mockup-frame_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }

/* ── Barra de navegador ── */
.browser-bar_sm_vc {
  display: flex; align-items: center; gap: 1rem;
  padding: .6rem 1rem;
  background: var(--sn-fondo-panel);
  border-bottom: 1px solid var(--sn-borde);
}
.browser-dots_sm_vc { display: flex; gap: 5px; }
.browser-dots_sm_vc span {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--sn-borde-hover);
}
.browser-dots_sm_vc span:first-child { background: #ff5f57; }
.browser-dots_sm_vc span:nth-child(2) { background: #febc2e; }
.browser-dots_sm_vc span:nth-child(3) { background: #28c840; }
.browser-url_sm_vc {
  display: flex; align-items: center; gap: .4rem;
  font-size: .62rem; color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono);
  background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde);
  border-radius: 4px; padding: .2rem .6rem; flex: 1; max-width: 400px;
}

/* ── Dashboard simulado ── */
.dashboard-sim_sm_vc {
  display: flex; min-height: 380px;
  background: var(--sn-fondo);
}
.sidebar-mini_sm_vc {
  width: 48px; background: var(--sn-fondo-elevado);
  border-right: 1px solid var(--sn-borde);
  display: flex; flex-direction: column; align-items: center;
  padding: .75rem 0; gap: 1rem;
}
.sidebar-brand_sm_vc { margin-bottom: .5rem; }
.sidebar-nav_sm_vc { display: flex; flex-direction: column; gap: .5rem; }
.sidebar-item_sm_vc {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--sn-texto-dim); cursor: default;
}
.sidebar-item--active_sm_vc {
  background: var(--sn-surface-active);
  color: var(--sn-primario);
}

/* ── Contenido principal ── */
.main-content_sm_vc { flex: 1; padding: 1rem; display: flex; flex-direction: column; gap: .875rem; overflow: hidden; }
.page-head_sm_vc {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: .75rem; border-bottom: 1px solid var(--sn-borde);
}
.page-label_sm_vc {
  font-size: .78rem; font-weight: 600; color: var(--sn-texto-principal);
  font-family: var(--sn-font-mono); margin: 0 0 2px;
}
.page-meta_sm_vc {
  font-size: .6rem; color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono); margin: 0;
}
.progress-global_sm_vc {
  display: flex; align-items: center; gap: .6rem;
}
.prog-pct_sm_vc {
  font-size: .75rem; font-weight: 700; color: var(--sn-primario);
  font-family: var(--sn-font-mono);
}

/* ── Materias demo ── */
.materias-demo_sm_vc {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem;
}
.mat-card_sm_vc {
  background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde);
  border-radius: 8px; padding: .75rem; overflow: hidden; position: relative;
}
.mat-acento_sm_vc { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
.mat-card--APROBADO_sm_vc  .mat-acento_sm_vc { background: #6fffe9; }
.mat-card--ENTREGADO_sm_vc .mat-acento_sm_vc { background: #7ec8e3; }
.mat-card--PENDIENTE_sm_vc .mat-acento_sm_vc { background: rgba(90,127,168,.5); }
.mat-header_sm_vc {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: .25rem; margin-bottom: .5rem;
}
.mat-nombre_sm_vc { font-size: .7rem; font-weight: 600; color: var(--sn-texto-principal); font-family: var(--sn-font-mono); margin: 0 0 1px; }
.mat-id_sm_vc { font-size: .55rem; color: var(--sn-texto-dim); font-family: var(--sn-font-mono); margin: 0; }
.mat-estado-pill_sm_vc {
  font-size: .5rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; padding: 1px 5px; border-radius: 3px;
  border: 1px solid transparent; display: flex; align-items: center; gap: 2px;
  white-space: nowrap; flex-shrink: 0;
}
.mat-reqs_sm_vc { font-size: .58rem; color: var(--sn-texto-apagado); font-family: var(--sn-font-mono); margin: 0; }

/* ── Conversación preview ── */
.conv-preview_sm_vc {
  background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde);
  border-radius: 8px; overflow: hidden;
}
.conv-header_sm_vc {
  display: flex; align-items: center; gap: .4rem;
  padding: .5rem .75rem; border-bottom: 1px solid var(--sn-borde);
  font-size: .62rem; color: var(--sn-acento-sec);
  font-family: var(--sn-font-mono); letter-spacing: .05em;
  background: var(--sn-fondo-elevado);
}
.conv-mensajes_sm_vc {
  padding: .5rem .75rem; display: flex; flex-direction: column; gap: .35rem;
}
.msg-item_sm_vc { display: flex; }
.msg-item--right_sm_vc { justify-content: flex-end; }
.msg-bubble_sm_vc {
  max-width: 60%;
  background: var(--sn-fondo-panel);
  border: 1px solid var(--sn-borde);
  border-radius: 6px; padding: .3rem .5rem;
}
.msg-bubble--sent_sm_vc {
  background: rgba(111,255,233,.05);
  border-color: rgba(111,255,233,.15);
}
.msg-tipo_sm_vc {
  font-size: .5rem; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--sn-texto-dim); margin-bottom: 2px;
}
.msg-bubble--sent_sm_vc .msg-tipo_sm_vc { color: var(--sn-acento-sec); }
.msg-archivo_sm_vc {
  display: flex; align-items: center; gap: .25rem;
  font-size: .62rem; color: var(--sn-texto-secundario); font-family: var(--sn-font-mono);
}

/* ── Caption ── */
.mockup-caption_sm_vc {
  text-align: center; max-width: 900px; margin: 1rem auto 0;
  font-size: .68rem; color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono); letter-spacing: .08em;
  opacity: 0; transition: opacity .7s .5s ease;
}
.mockup-caption_sm_vc.visible_sm_vc { opacity: 1; }
</style>