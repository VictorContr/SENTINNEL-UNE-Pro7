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
              <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#6fffe9" stroke-width="1.5" fill="none"/>
              <polygon points="18,8 28,13 28,23 18,28 8,23 8,13" stroke="#5bc0be" stroke-width="1" fill="none" opacity="0.5"/>
              <circle cx="18" cy="18" r="4" fill="#6fffe9"/>
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
                class="sntnl-input_sm_vc" dark color="teal-3" bg-color="transparent"
              >
                <template #prepend><q-icon name="alternate_email" color="teal-3" size="18px" /></template>
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
                class="sntnl-input_sm_vc" dark color="teal-3" bg-color="transparent"
              >
                <template #prepend><q-icon name="lock_outline" color="teal-3" size="18px" /></template>
                <template #append>
                  <q-icon
                    :name="show_pass_sm_vc ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer" color="grey-6" size="18px"
                    @click="show_pass_sm_vc = !show_pass_sm_vc"
                  />
                </template>
              </q-input>
            </div>

            <q-btn type="submit" :loading="auth.loading_sm_vc"
              label="INICIAR SESIÓN" unelevated class="btn-cta_sm_vc login-btn_sm_vc"
              :ripple="{ color: '#0b132b' }"
            >
              <template #loading>
                <div class="btn-loader_sm_vc">
                  <q-spinner-dots color="#0b132b" size="20px" />
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
          <q-icon name="verified_user" size="14px" color="teal-3" />
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
              <polygon points="100,10 185,55 185,145 100,190 15,145 15,55" stroke="#6fffe9" stroke-width="0.8" fill="none" opacity="0.15"/>
              <polygon points="100,30 165,67.5 165,132.5 100,170 35,132.5 35,67.5" stroke="#6fffe9" stroke-width="0.5" fill="none" opacity="0.1"/>
            </svg>
          </div>

          <div class="info-header_sm_vc">
            <div class="info-icon-ring_sm_vc">
              <q-icon name="track_changes" size="32px" color="teal-3" />
            </div>
            <h2 class="info-title_sm_vc">SENTINNEL</h2>
            <p class="info-subtitle_sm_vc">Trazabilidad Académica · UNE</p>
          </div>

          <p class="info-description_sm_vc">
            Plataforma centralizada para la gestión, supervisión y trazabilidad
            completa del proceso de <strong>informes de pasantías</strong> universitarias.
          </p>

          <div class="flow-steps_sm_vc">
            <div v-for="(step_item_sm_vc, i) in flow_steps_sm_vc" :key="i"
              class="flow-step_sm_vc" :style="{ animationDelay: `${i * 0.15}s` }">
              <div class="step-number_sm_vc">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="step-content_sm_vc">
                <span class="step-title_sm_vc">{{ step_item_sm_vc.title }}</span>
                <span class="step-desc_sm_vc">{{ step_item_sm_vc.desc }}</span>
              </div>
              <q-icon :name="step_item_sm_vc.icon" size="18px" color="teal-3" class="step-icon_sm_vc" />
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
              <q-icon name="check_circle_outline" size="14px" color="teal-3" />
              <span>{{ feat_sm_vc }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'

/* ── Store & Router ── */
const auth = useAuthStore()
const router_sm_vc = useRouter()
const route_sm_vc = useRoute()

/* ── Form state ── */
const correo_sm_vc = ref('')
const clave_sm_vc = ref('')
const show_pass_sm_vc = ref(false)

/* ── Canvas background ── */
const canvas_ref_sm_vc = ref(null)
let anim_frame_sm_vc = null

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

  const draw_sm_vc = () => {
    ctx_sm_vc.clearRect(0, 0, canvas_sm_vc.width, canvas_sm_vc.height)
    dots_sm_vc.forEach((d) => {
      d.pulse += d.speed
      const alpha_sm_vc = (Math.sin(d.pulse) + 1) / 2
      ctx_sm_vc.beginPath()
      ctx_sm_vc.arc(d.x, d.y, 1, 0, Math.PI * 2)
      ctx_sm_vc.fillStyle = `rgba(111, 255, 233, ${alpha_sm_vc * 0.12})`
      ctx_sm_vc.fill()
    })
    anim_frame_sm_vc = requestAnimationFrame(draw_sm_vc)
  }
  draw_sm_vc()
}

onMounted(init_canvas_sm_vc)
onUnmounted(() => {
  if (anim_frame_sm_vc) cancelAnimationFrame(anim_frame_sm_vc)
})
</script>

<style scoped>
.login-root_sm_vc { min-height: 100vh; width: 100%; background-color: var(--color-primario_vc); position: relative; overflow: hidden; font-family: var(--font-mono_vc); }
.grid-canvas_sm_vc { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.login-split_sm_vc { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
@media (max-width: 768px) { .login-split_sm_vc { grid-template-columns: 1fr; } .info-panel_sm_vc { display: none; } }
.login-form-panel_sm_vc { display: flex; flex-direction: column; justify-content: space-between; padding: 2.5rem 3rem; border-right: 1px solid rgba(111, 255, 233, 0.08); background: linear-gradient(160deg, rgba(11, 19, 43, 0.98), rgba(14, 22, 50, 0.95)); }
.brand_sm_vc { display: flex; align-items: center; gap: 0.875rem; }
.brand-icon_sm_vc { display: flex; align-items: center; }
.brand-subtitle_sm_vc { font-size: 0.55rem; letter-spacing: 0.22em; color: var(--color-acento_vc); text-transform: uppercase; margin: 0 0 2px; font-weight: 500; }
.brand-name_sm_vc { font-size: 1.6rem; font-weight: 700; letter-spacing: 0.18em; color: var(--color-cta_vc); margin: 0; text-shadow: 0 0 20px rgba(111, 255, 233, 0.35); }
.form-container_sm_vc { width: 100%; max-width: 400px; margin: 0 auto; }
.form-header_sm_vc h2 { font-size: 1.4rem; font-weight: 600; color: #e8f4f8; letter-spacing: 0.04em; margin-bottom: 0.35rem; }
.form-header_sm_vc p { font-size: 0.78rem; color: var(--color-texto-secundario_vc); margin-bottom: 1.5rem; font-family: var(--font-sans_vc); }
.demo-hints_sm_vc { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; color: var(--color-acento_vc); background: rgba(91, 192, 190, 0.06); border: 1px solid rgba(91, 192, 190, 0.15); border-radius: var(--radius-sm_vc); padding: 0.4rem 0.75rem; margin-bottom: 1.25rem; font-family: var(--font-mono_vc); }
.demo-tag_sm_vc { background: rgba(111, 255, 233, 0.15); color: var(--color-cta_vc); font-size: 0.6rem; letter-spacing: 0.1em; padding: 1px 6px; border-radius: 2px; font-weight: 700; text-transform: uppercase; align-self: flex-start; margin-top: 2px; }
.demo-list_sm_vc { display: flex; flex-direction: column; gap: 2px; }
.demo-list_sm_vc strong { color: var(--color-cta_vc); }
.error-banner_sm_vc { display: flex; align-items: center; gap: 0.5rem; background: rgba(255, 75, 110, 0.1); border: 1px solid rgba(255, 75, 110, 0.3); border-radius: var(--radius-md_vc); padding: 0.6rem 0.875rem; margin-bottom: 1rem; font-size: 0.78rem; color: var(--color-error-claro_vc); font-family: var(--font-sans_vc); }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to { opacity: 0; transform: translateY(-4px); }
.field-group_sm_vc { margin-bottom: 1.1rem; }
.field-label_sm_vc { display: block; font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-acento_vc); margin-bottom: 0.35rem; font-weight: 500; }
.login-btn_sm_vc { width: 100%; height: 46px; margin-top: 0.5rem; }
.btn-loader_sm_vc { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; color: var(--color-primario_vc); }
.form-footer_sm_vc { margin-top: 1.25rem; text-align: center; font-size: 0.7rem; color: var(--color-texto-muted_vc); font-family: var(--font-sans_vc); }
.security-badge_sm_vc { display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.62rem; color: var(--color-texto-muted_vc); letter-spacing: 0.08em; }

/* ── RIGHT PANEL ── */
.info-panel_sm_vc { position: relative; display: flex; align-items: center; justify-content: center; padding: 3rem 2.5rem; background: linear-gradient(135deg, rgba(11, 19, 43, 0.3) 0%, rgba(91, 192, 190, 0.04) 100%), radial-gradient(ellipse at 70% 30%, rgba(111, 255, 233, 0.05) 0%, transparent 60%); overflow: hidden; }
.info-glass_sm_vc { position: relative; width: 100%; max-width: 440px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(111, 255, 233, 0.1); border-radius: 16px; padding: 2.5rem; backdrop-filter: blur(20px); box-shadow: 0 0 0 1px rgba(111, 255, 233, 0.05), 0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(111, 255, 233, 0.08); }
.hex-deco_sm_vc { position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; pointer-events: none; opacity: 0.6; }
.hex-svg_sm_vc { width: 100%; height: 100%; }
.info-header_sm_vc { display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; margin-bottom: 1.25rem; }
.info-icon-ring_sm_vc { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--color-borde-activo_vc); border-radius: 12px; background: rgba(111, 255, 233, 0.06); margin-bottom: 0.75rem; }
.info-title_sm_vc { font-size: 1.75rem; font-weight: 700; letter-spacing: 0.15em; color: var(--color-cta_vc); margin: 0; text-shadow: 0 0 30px rgba(111, 255, 233, 0.25); }
.info-subtitle_sm_vc { font-size: 0.65rem; letter-spacing: 0.2em; color: var(--color-acento_vc); text-transform: uppercase; margin: 0; font-weight: 500; }
.info-description_sm_vc { font-size: 0.82rem; line-height: 1.7; color: #7aa0b8; margin-bottom: 1.75rem; font-family: var(--font-sans_vc); }
.info-description_sm_vc strong { color: #b0d8e8; font-weight: 600; }
.flow-steps_sm_vc { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
.flow-step_sm_vc { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.875rem; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(111, 255, 233, 0.06); border-radius: 8px; animation: fadeSlideIn_sm_vc 0.5s ease forwards; opacity: 0; transition: background 0.2s, border-color 0.2s; }
.flow-step_sm_vc:hover { background: rgba(111, 255, 233, 0.04); border-color: var(--color-borde-hover_vc); }
@keyframes fadeSlideIn_sm_vc { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
.step-number_sm_vc { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; color: var(--color-cta_vc); min-width: 22px; }
.step-content_sm_vc { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.step-title_sm_vc { font-size: 0.78rem; font-weight: 600; color: var(--color-texto-primario_vc); letter-spacing: 0.02em; }
.step-desc_sm_vc { font-size: 0.65rem; color: #4a6a88; font-family: var(--font-sans_vc); }
.step-icon_sm_vc { opacity: 0.6; }
.roles-grid_sm_vc { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.role-chip_sm_vc { display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.7rem; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-pill_vc); font-size: 0.65rem; color: #8baec4; letter-spacing: 0.05em; }
.features-list_sm_vc { display: flex; flex-direction: column; gap: 0.4rem; }
.feature-item_sm_vc { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: #4a6a88; font-family: var(--font-sans_vc); }
.feature-item_sm_vc:hover { color: var(--color-cta_vc); }
</style>
