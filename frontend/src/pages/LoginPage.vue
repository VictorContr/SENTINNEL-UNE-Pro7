<template>
  <div class="login-root_sm_vc">
    <!-- Fondo animado: grid táctica -->
    <canvas ref="canvas_ref_sm_vc" class="grid-canvas_sm_vc" aria-hidden="true" />

    <div class="login-split_sm_vc">
      <!-- ══════════════════════════════════════════
           PANEL IZQUIERDO: Formulario de Login
           ══════════════════════════════════════════ -->
      <section class="login-form-panel_sm_vc">
        <!-- Logotipo / Brand -->
        <div class="brand_sm_vc">
          <div class="brand-icon_sm_vc">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" :stroke="brandColor_sm_vc" stroke-width="1.5" fill="none"/>
              <polygon points="18,8 28,13 28,23 18,28 8,23 8,13" :stroke="accentColor_sm_vc" stroke-width="1" fill="none" opacity="0.5"/>
              <circle cx="18" cy="18" r="4" :fill="brandColor_sm_vc"/>
            </svg>
          </div>
          <div>
            <p class="brand-subtitle_sm_vc">SISTEMA DE TRAZABILIDAD ACADÉMICA</p>
            <h1 class="brand-name_sm_vc">SENTINNEL</h1>
          </div>
        </div>

        <div class="form-container_sm_vc">
          <div class="form-header_sm_vc">
            <h2>Acceso al Sistema</h2>
            <p>Ingresa tus credenciales institucionales para continuar.</p>
          </div>

          <!-- Demo hints -->
          <div class="demo-hints_sm_vc">
            <span class="demo-tag_sm_vc">Demo</span>
            <div class="demo-list_sm_vc">
              <span><strong>Admin:</strong> admin@une.edu.ve | admin123</span>
              <span><strong>Profesor:</strong> profesor@une.edu.ve | prof123</span>
              <span><strong>Estudiante:</strong> estudiante@une.edu.ve | est123</span>
            </div>
          </div>

          <!-- Mensaje de error -->
          <transition name="slide-down">
            <div v-if="auth.error_sm_vc" class="error-banner_sm_vc">
              <q-icon name="warning" size="18px" />
              <span>{{ auth.error_sm_vc }}</span>
            </div>
          </transition>

          <!-- Formulario -->
          <q-form @submit.prevent="handle_login_sm_vc" class="login-form_sm_vc" autocomplete="off">
            <div class="field-group_sm_vc">
              <label class="field-label_sm_vc">Correo Institucional</label>
              <q-input
                v-model="correo_sm_vc" type="email"
                placeholder="usuario@une.edu.ve" dense outlined
                autocomplete="email"
                :rules="[val => !!val || 'Campo requerido', val => /.+@.+/.test(val) || 'Correo inválido']"
                class="sntnl-input_sm_vc" :dark="isDark_sm_vc" color="teal-3" bg-color="transparent"
              >
                <template #prepend><q-icon name="alternate_email" size="18px" class="input-icon_sm_vc" /></template>
              </q-input>
            </div>

            <div class="field-group_sm_vc">
              <label class="field-label_sm_vc">Contraseña</label>
              <q-input
                v-model="clave_sm_vc"
                :type="show_pass_sm_vc ? 'text' : 'password'"
                placeholder="••••••••" dense outlined
                autocomplete="current-password"
                :rules="[val => !!val || 'Campo requerido']"
                class="sntnl-input_sm_vc" :dark="isDark_sm_vc" color="teal-3" bg-color="transparent"
              >
                <template #prepend><q-icon name="lock_outline" size="18px" class="input-icon_sm_vc" /></template>
                <template #append>
                  <q-icon
                    :name="show_pass_sm_vc ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer" size="18px"
                    style="color: var(--sn-texto-apagado)"
                    @click="show_pass_sm_vc = !show_pass_sm_vc"
                  />
                </template>
              </q-input>
            </div>

            <q-btn type="submit" :loading="auth.loading_sm_vc"
              label="INICIAR SESIÓN" unelevated class="btn-cta_sm_vc login-btn_sm_vc"
              :ripple="{ color: 'white' }"
            >
              <template #loading>
                <div class="btn-loader_sm_vc">
                  <q-spinner-dots size="20px" />
                  <span>Autenticando…</span>
                </div>
              </template>
            </q-btn>
          </q-form>

          <p class="form-footer_sm_vc">
            ¿Problemas de acceso? Contacta a tu coordinador académico.
          </p>
        </div>

        <div class="security-badge_sm_vc">
          <q-icon name="verified_user" size="14px" class="security-icon_sm_vc" />
          <span>Conexión cifrada · UNE © {{ new Date().getFullYear() }}</span>
        </div>
      </section>

      <!-- ══════════════════════════════════════════
           PANEL DERECHO: Información / Glassmorphism
           ══════════════════════════════════════════ -->
      <section class="info-panel_sm_vc" aria-label="Información del sistema">
        <div class="info-glass_sm_vc">
          <div class="hex-deco_sm_vc" aria-hidden="true">
            <svg class="hex-svg_sm_vc" viewBox="0 0 200 200" fill="none">
              <polygon points="100,10 185,55 185,145 100,190 15,145 15,55" :stroke="brandColor_sm_vc" stroke-width="0.8" fill="none" opacity="0.15"/>
              <polygon points="100,30 165,67.5 165,132.5 100,170 35,132.5 35,67.5" :stroke="brandColor_sm_vc" stroke-width="0.5" fill="none" opacity="0.1"/>
            </svg>
          </div>

          <div class="info-header_sm_vc">
            <div class="info-icon-ring_sm_vc">
              <q-icon name="track_changes" size="32px" class="info-ring-icon_sm_vc" />
            </div>
            <h2 class="info-title_sm_vc">SENTINNEL</h2>
            <p class="info-subtitle_sm_vc">Trazabilidad Académica · UNE</p>
          </div>

          <p class="info-description_sm_vc">
            Plataforma centralizada para la gestión, supervisión y trazabilidad
            completa del proceso de <strong>informes de pasantías</strong> de la universidad Nueva Esparta para la carrera de Computación.
          </p>

          <div class="flow-steps_sm_vc">
            <div v-for="(step_item_sm_vc, i) in flow_steps_sm_vc" :key="i"
              class="flow-step_sm_vc" :style="{ animationDelay: `${i * 0.15}s` }">
              <div class="step-number_sm_vc">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="step-content_sm_vc">
                <span class="step-title_sm_vc">{{ step_item_sm_vc.title }}</span>
                <span class="step-desc_sm_vc">{{ step_item_sm_vc.desc }}</span>
              </div>
              <q-icon :name="step_item_sm_vc.icon" size="18px" class="step-icon_sm_vc" />
            </div>
          </div>

          <div class="roles-grid_sm_vc">
            <div v-for="rol_item_sm_vc in system_roles_sm_vc" :key="rol_item_sm_vc.label" class="role-chip_sm_vc">
              <q-icon :name="rol_item_sm_vc.icon" size="14px" :color="rol_item_sm_vc.color" />
              <span>{{ rol_item_sm_vc.label }}</span>
            </div>
          </div>

          <div class="features-list_sm_vc">
            <div v-for="feat_sm_vc in features_sm_vc" :key="feat_sm_vc" class="feature-item_sm_vc">
              <q-icon name="check_circle_outline" size="14px" class="feature-check_sm_vc" />
              <span>{{ feat_sm_vc }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { useConfigStore } from 'src/stores/configStore'

/* ── Store & Router ── */
const auth = useAuthStore()
const configStore_sm_vc = useConfigStore()
const router_sm_vc = useRouter()
const route_sm_vc = useRoute()

/* ── Theme state ── */
const isDark_sm_vc = computed(() => configStore_sm_vc.isDark_sm_vc)

/* ── Colores reactivos para SVGs (cambian con el tema) ── */
const brandColor_sm_vc = computed(() => isDark_sm_vc.value ? '#6fffe9' : '#0d7a6f')
const accentColor_sm_vc = computed(() => isDark_sm_vc.value ? '#5bc0be' : '#0e8e82')

/* ── Form state ── */
const correo_sm_vc = ref('')
const clave_sm_vc = ref('')
const show_pass_sm_vc = ref(false)

/* ── Canvas background ── */
const canvas_ref_sm_vc = ref(null)
let anim_frame_sm_vc = null
let canvas_color_sm_vc = null // color actual del canvas, se recalcula con el tema

/* ── Función para obtener el color de acento desde el CSS ── */
function getCanvasColor_sm_vc() {
  const raw_sm_vc = getComputedStyle(document.documentElement)
    .getPropertyValue('--sn-acento')
    .trim()
  return raw_sm_vc || (isDark_sm_vc.value ? '#6fffe9' : '#0fa899')
}

/**
 * Convierte un color hex a rgba string para el canvas.
 * Necesario porque canvas 2D no soporta var() directamente.
 */
function hexToRgb_sm_vc(hex_sm_vc) {
  const result_sm_vc = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex_sm_vc)
  if (!result_sm_vc) return '111, 255, 233' // fallback
  return `${parseInt(result_sm_vc[1], 16)}, ${parseInt(result_sm_vc[2], 16)}, ${parseInt(result_sm_vc[3], 16)}`
}

/* ── Static data ── */
const flow_steps_sm_vc = [
  { title: 'Registro & Asignación', desc: 'Admin carga estudiantes y asigna profesores', icon: 'group_add' },
  { title: 'Entrega de Informe', desc: 'Estudiante sube versiones de su documento', icon: 'upload_file' },
  { title: 'Revisión Docente', desc: 'Profesor evalúa y responde con correcciones', icon: 'rate_review' },
  { title: 'Aprobación por Materia', desc: 'Ciclo por Pasantías I, II y III', icon: 'verified' },
  { title: 'Deploy Final', desc: 'Registro de URL de producción y código fuente', icon: 'rocket_launch' }
]

const system_roles_sm_vc = [
  { label: 'Administrador', icon: 'admin_panel_settings', color: 'amber-4' },
  { label: 'Profesor', icon: 'school', color: 'teal-3' },
  { label: 'Estudiante', icon: 'person', color: 'light-blue-3' }
]

const features_sm_vc = [
  'Historial inmutable de documentos',
  'Control de acceso por roles',
  'Soft-delete para auditoría total',
  'Carga masiva con truncado selectivo',
  'Chat documental estructurado'
]

/* ── Login handler ── */
async function handle_login_sm_vc() {
  const ok_sm_vc = await auth.login(correo_sm_vc.value, clave_sm_vc.value)
  if (ok_sm_vc) {
    const redirect_sm_vc = route_sm_vc.query.redirect || '/notificaciones'
    router_sm_vc.push(redirect_sm_vc)
  }
}

/* ── Animated grid canvas ── */
function init_canvas_sm_vc() {
  const canvas_sm_vc = canvas_ref_sm_vc.value
  if (!canvas_sm_vc) return
  const ctx_sm_vc = canvas_sm_vc.getContext('2d')

  const resize_sm_vc = () => {
    canvas_sm_vc.width = window.innerWidth
    canvas_sm_vc.height = window.innerHeight
  }
  resize_sm_vc()
  window.addEventListener('resize', resize_sm_vc)

  const cols_sm_vc = 40
  const rows_sm_vc = 25
  const dots_sm_vc = []

  for (let i = 0; i < cols_sm_vc; i++) {
    for (let j = 0; j < rows_sm_vc; j++) {
      dots_sm_vc.push({
        x: (i / cols_sm_vc) * canvas_sm_vc.width,
        y: (j / rows_sm_vc) * canvas_sm_vc.height,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.01
      })
    }
  }

  // Obtener color inicial basado en el tema actual
  canvas_color_sm_vc = hexToRgb_sm_vc(getCanvasColor_sm_vc())

  const draw_sm_vc = () => {
    ctx_sm_vc.clearRect(0, 0, canvas_sm_vc.width, canvas_sm_vc.height)
    dots_sm_vc.forEach((d) => {
      d.pulse += d.speed
      const alpha_sm_vc = (Math.sin(d.pulse) + 1) / 2
      ctx_sm_vc.beginPath()
      ctx_sm_vc.arc(d.x, d.y, 1, 0, Math.PI * 2)
      ctx_sm_vc.fillStyle = `rgba(${canvas_color_sm_vc}, ${alpha_sm_vc * 0.12})`
      ctx_sm_vc.fill()
    })
    anim_frame_sm_vc = requestAnimationFrame(draw_sm_vc)
  }
  draw_sm_vc()
}

/* ── Watch: recalcular color del canvas cuando cambie el tema ── */
watch(isDark_sm_vc, () => {
  // Esperar un tick para que las CSS custom properties se actualicen
  requestAnimationFrame(() => {
    canvas_color_sm_vc = hexToRgb_sm_vc(getCanvasColor_sm_vc())
  })
})

onMounted(init_canvas_sm_vc)
onUnmounted(() => {
  if (anim_frame_sm_vc) cancelAnimationFrame(anim_frame_sm_vc)
})
</script>

<style scoped>
.login-root_sm_vc { min-height: 100vh; width: 100%; background-color: var(--sn-fondo); position: relative; overflow: hidden; font-family: var(--sn-font-mono); }
.grid-canvas_sm_vc { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.login-split_sm_vc { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
@media (max-width: 768px) { .login-split_sm_vc { grid-template-columns: 1fr; } .info-panel_sm_vc { display: none; } }

/* ── LEFT PANEL (Form) ── */
.login-form-panel_sm_vc { display: flex; flex-direction: column; justify-content: space-between; padding: 2.5rem 3rem; border-right: 1px solid var(--sn-borde); background: var(--sn-fondo-panel); }
.brand_sm_vc { display: flex; align-items: center; gap: 0.875rem; }
.brand-icon_sm_vc { display: flex; align-items: center; }
.brand-subtitle_sm_vc { font-size: 0.55rem; letter-spacing: 0.22em; color: var(--sn-acento-sec); text-transform: uppercase; margin: 0 0 2px; font-weight: 500; }
.brand-name_sm_vc { font-size: 1.6rem; font-weight: 700; letter-spacing: 0.18em; color: var(--sn-primario); margin: 0; }
.form-container_sm_vc { width: 100%; max-width: 400px; margin: 0 auto; }
.form-header_sm_vc h2 { font-size: 1.4rem; font-weight: 600; color: var(--sn-texto-principal); letter-spacing: 0.04em; margin-bottom: 0.35rem; }
.form-header_sm_vc p { font-size: 0.78rem; color: var(--sn-texto-secundario); margin-bottom: 1.5rem; font-family: var(--sn-font-sans); }
.demo-hints_sm_vc { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: var(--sn-acento-sec); background: var(--sn-surface-active); border: 1px solid var(--sn-borde-activo); border-radius: var(--sn-radius-sm); padding: 0.4rem 0.75rem; margin-bottom: 1.25rem; font-family: var(--sn-font-mono); }
.demo-tag_sm_vc { background: var(--sn-surface-active); color: var(--sn-primario); font-size: 0.6rem; letter-spacing: 0.1em; padding: 1px 6px; border-radius: 2px; font-weight: 700; text-transform: uppercase; align-self: flex-start; margin-top: 2px; }
.demo-list_sm_vc { display: flex; flex-direction: column; gap: 2px; }
.demo-list_sm_vc strong { color: var(--sn-primario); }
.error-banner_sm_vc { display: flex; align-items: center; gap: 0.5rem; background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); border-radius: var(--sn-radius-md); padding: 0.6rem 0.875rem; margin-bottom: 1rem; font-size: 0.78rem; color: var(--sn-error); font-family: var(--sn-font-sans); }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to { opacity: 0; transform: translateY(-4px); }
.field-group_sm_vc { margin-bottom: 1.1rem; }
.field-label_sm_vc { display: block; font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--sn-acento-sec); margin-bottom: 0.35rem; font-weight: 500; }
.input-icon_sm_vc { color: var(--sn-primario); }
.login-btn_sm_vc { width: 100%; height: 46px; margin-top: 0.5rem; }
.btn-loader_sm_vc { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; color: var(--sn-fondo); }
.form-footer_sm_vc { margin-top: 1.25rem; text-align: center; font-size: 0.7rem; color: var(--sn-texto-apagado); font-family: var(--sn-font-sans); }
.security-badge_sm_vc { display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.62rem; color: var(--sn-texto-apagado); letter-spacing: 0.08em; }
.security-icon_sm_vc { color: var(--sn-primario); }

/* ── Quasar input overrides para LoginPage ── */
:deep(.sntnl-input_sm_vc .q-field__control) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important;
  border-radius: var(--sn-radius-md) !important;
}
:deep(.sntnl-input_sm_vc .q-field__control:hover) {
  border-color: var(--sn-borde-hover) !important;
}
:deep(.sntnl-input_sm_vc .q-field--focused .q-field__control) {
  border-color: var(--sn-borde-activo) !important;
  box-shadow: 0 0 0 3px var(--sn-surface-active) !important;
}
:deep(.sntnl-input_sm_vc .q-field__native) {
  color: var(--sn-texto-principal) !important;
}
:deep(.sntnl-input_sm_vc .q-field__native::placeholder) {
  color: var(--sn-texto-apagado) !important;
}

/* ── RIGHT PANEL ── */
.info-panel_sm_vc { position: relative; display: flex; align-items: center; justify-content: center; padding: 3rem 2.5rem; background: var(--sn-fondo-elevado); overflow: hidden; }
.info-glass_sm_vc { position: relative; width: 100%; max-width: 440px; background: var(--sn-glass-bg); border: 1px solid var(--sn-glass-border); border-radius: 16px; padding: 2.5rem; backdrop-filter: blur(20px); box-shadow: var(--sn-shadow-lg); }
.hex-deco_sm_vc { position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; pointer-events: none; opacity: 0.6; }
.hex-svg_sm_vc { width: 100%; height: 100%; }
.info-header_sm_vc { display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; margin-bottom: 1.25rem; }
.info-icon-ring_sm_vc { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--sn-borde-activo); border-radius: 12px; background: var(--sn-surface-active); margin-bottom: 0.75rem; }
.info-ring-icon_sm_vc { color: var(--sn-primario); }
.info-title_sm_vc { font-size: 1.75rem; font-weight: 700; letter-spacing: 0.15em; color: var(--sn-primario); margin: 0; }
.info-subtitle_sm_vc { font-size: 0.65rem; letter-spacing: 0.2em; color: var(--sn-acento-sec); text-transform: uppercase; margin: 0; font-weight: 500; }
.info-description_sm_vc { font-size: 0.82rem; line-height: 1.7; color: var(--sn-texto-secundario); margin-bottom: 1.75rem; font-family: var(--sn-font-sans); }
.info-description_sm_vc strong { color: var(--sn-texto-principal); font-weight: 600; }
.flow-steps_sm_vc { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
.flow-step_sm_vc { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.875rem; background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: 8px; animation: fadeSlideIn_sm_vc 0.5s ease forwards; opacity: 0; transition: background 0.2s, border-color 0.2s; }
.flow-step_sm_vc:hover { background: var(--sn-surface-hover); border-color: var(--sn-borde-hover); }
@keyframes fadeSlideIn_sm_vc { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
.step-number_sm_vc { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; color: var(--sn-primario); min-width: 22px; }
.step-content_sm_vc { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.step-title_sm_vc { font-size: 0.78rem; font-weight: 600; color: var(--sn-texto-principal); letter-spacing: 0.02em; }
.step-desc_sm_vc { font-size: 0.65rem; color: var(--sn-texto-secundario); font-family: var(--sn-font-sans); }
.step-icon_sm_vc { opacity: 0.6; color: var(--sn-primario); }
.roles-grid_sm_vc { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.role-chip_sm_vc { display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.7rem; background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: var(--sn-radius-pill); font-size: 0.65rem; color: var(--sn-texto-secundario); letter-spacing: 0.05em; }
.features-list_sm_vc { display: flex; flex-direction: column; gap: 0.4rem; }
.feature-item_sm_vc { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: var(--sn-texto-secundario); font-family: var(--sn-font-sans); }
.feature-check_sm_vc { color: var(--sn-primario); }
.feature-item_sm_vc:hover { color: var(--sn-primario); }
</style>
