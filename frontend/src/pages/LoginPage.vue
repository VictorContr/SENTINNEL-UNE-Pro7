<template>
  <div class="login-root">
    <!-- Fondo animado: grid táctica -->
    <canvas ref="canvasRef" class="grid-canvas" aria-hidden="true" />

    <div class="login-split">
      <!-- ══════════════════════════════════════════
           PANEL IZQUIERDO: Formulario de Login
           ══════════════════════════════════════════ -->
      <section class="login-form-panel">
        <!-- Logotipo / Brand -->
        <div class="brand">
          <div class="brand-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" stroke="#6fffe9" stroke-width="1.5" fill="none"/>
              <polygon points="18,8 28,13 28,23 18,28 8,23 8,13" stroke="#5bc0be" stroke-width="1" fill="none" opacity="0.5"/>
              <circle cx="18" cy="18" r="4" fill="#6fffe9"/>
            </svg>
          </div>
          <div>
            <p class="brand-subtitle">SISTEMA DE TRAZABILIDAD ACADÉMICA</p>
            <h1 class="brand-name">SENTINNEL</h1>
          </div>
        </div>

        <div class="form-container">
          <div class="form-header">
            <h2>Acceso al Sistema</h2>
            <p>Ingresa tus credenciales institucionales para continuar.</p>
          </div>

          <!-- Demo hints -->
          <div class="demo-hints">
            <span class="demo-tag">Demo</span>
            <span>admin@une.edu.ve | admin123</span>
          </div>

          <!-- Mensaje de error -->
          <transition name="slide-down">
            <div v-if="auth.error_sm_vc" class="error-banner">
              <q-icon name="warning" size="18px" />
              <span>{{ auth.error_sm_vc }}</span>
            </div>
          </transition>

          <!-- Formulario -->
          <q-form @submit.prevent="handleLogin" class="login-form" autocomplete="off">
            <!-- Campo: Correo -->
            <div class="field-group">
              <label class="field-label">Correo Institucional</label>
              <q-input
                v-model="correo_sm_vc"
                type="email"
                placeholder="usuario@une.edu.ve"
                dense
                outlined
                autocomplete="email"
                :rules="[val => !!val || 'Campo requerido', val => /.+@.+/.test(val) || 'Correo inválido']"
                class="sntnl-input"
                dark
                color="teal-3"
                bg-color="transparent"
              >
                <template #prepend>
                  <q-icon name="alternate_email" color="teal-3" size="18px" />
                </template>
              </q-input>
            </div>

            <!-- Campo: Contraseña -->
            <div class="field-group">
              <label class="field-label">Contraseña</label>
              <q-input
                v-model="clave_sm_vc"
                :type="showPass ? 'text' : 'password'"
                placeholder="••••••••"
                dense
                outlined
                autocomplete="current-password"
                :rules="[val => !!val || 'Campo requerido']"
                class="sntnl-input"
                dark
                color="teal-3"
                bg-color="transparent"
              >
                <template #prepend>
                  <q-icon name="lock_outline" color="teal-3" size="18px" />
                </template>
                <template #append>
                  <q-icon
                    :name="showPass ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    color="grey-6"
                    size="18px"
                    @click="showPass = !showPass"
                  />
                </template>
              </q-input>
            </div>

            <!-- Botón Submit -->
            <q-btn
              type="submit"
              :loading="auth.loading_sm_vc"
              label="INICIAR SESIÓN"
              unelevated
              class="login-btn"
              :ripple="{ color: '#0b132b' }"
            >
              <template #loading>
                <div class="btn-loader">
                  <q-spinner-dots color="#0b132b" size="20px" />
                  <span>Autenticando…</span>
                </div>
              </template>
            </q-btn>
          </q-form>

          <!-- Footer del formulario -->
          <p class="form-footer">
            ¿Problemas de acceso? Contacta a tu coordinador académico.
          </p>
        </div>

        <!-- Indicador de seguridad inferior -->
        <div class="security-badge">
          <q-icon name="verified_user" size="14px" color="teal-3" />
          <span>Conexión cifrada · UNE © {{ new Date().getFullYear() }}</span>
        </div>
      </section>

      <!-- ══════════════════════════════════════════
           PANEL DERECHO: Información / Glassmorphism
           ══════════════════════════════════════════ -->
      <section class="info-panel" aria-label="Información del sistema">
        <div class="info-glass">
          <!-- Decoración hexagonal -->
          <div class="hex-deco" aria-hidden="true">
            <svg class="hex-svg" viewBox="0 0 200 200" fill="none">
              <polygon points="100,10 185,55 185,145 100,190 15,145 15,55"
                stroke="#6fffe9" stroke-width="0.8" fill="none" opacity="0.15"/>
              <polygon points="100,30 165,67.5 165,132.5 100,170 35,132.5 35,67.5"
                stroke="#6fffe9" stroke-width="0.5" fill="none" opacity="0.1"/>
            </svg>
          </div>

          <!-- Header del panel info -->
          <div class="info-header">
            <div class="info-icon-ring">
              <q-icon name="track_changes" size="32px" color="teal-3" />
            </div>
            <h2 class="info-title">SENTINNEL</h2>
            <p class="info-subtitle">Trazabilidad Académica · UNE</p>
          </div>

          <p class="info-description">
            Plataforma centralizada para la gestión, supervisión y trazabilidad
            completa del proceso de <strong>informes de pasantías</strong> universitarias.
            Cada documento, cada revisión, cada aprobación queda registrada.
          </p>

          <!-- Flujo Step-by-Step -->
          <div class="flow-steps">
            <div
              v-for="(step, i) in flowSteps"
              :key="i"
              class="flow-step"
              :style="{ animationDelay: `${i * 0.15}s` }"
            >
              <div class="step-number">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="step-content">
                <span class="step-title">{{ step.title }}</span>
                <span class="step-desc">{{ step.desc }}</span>
              </div>
              <q-icon :name="step.icon" size="18px" color="teal-3" class="step-icon" />
            </div>
          </div>

          <!-- Roles del sistema -->
          <div class="roles-grid">
            <div v-for="rol in systemRoles" :key="rol.label" class="role-chip">
              <q-icon :name="rol.icon" size="14px" :color="rol.color" />
              <span>{{ rol.label }}</span>
            </div>
          </div>

          <!-- Feature highlights -->
          <div class="features-list">
            <div v-for="feat in features" :key="feat" class="feature-item">
              <q-icon name="check_circle_outline" size="14px" color="teal-3" />
              <span>{{ feat }}</span>
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
const router = useRouter()
const route = useRoute()

/* ── Form state ── */
const correo_sm_vc = ref('')
const clave_sm_vc = ref('')
const showPass = ref(false)

/* ── Canvas background ── */
const canvasRef = ref(null)
let animFrame = null

/* ── Static data ── */
const flowSteps = [
  { title: 'Registro & Asignación', desc: 'Admin carga estudiantes y asigna profesores', icon: 'group_add' },
  { title: 'Entrega de Informe', desc: 'Estudiante sube versiones de su documento', icon: 'upload_file' },
  { title: 'Revisión Docente', desc: 'Profesor evalúa y responde con correcciones', icon: 'rate_review' },
  { title: 'Aprobación por Materia', desc: 'Ciclo por Pasantías I, II y III', icon: 'verified' },
  { title: 'Deploy Final', desc: 'Registro de URL de producción y código fuente', icon: 'rocket_launch' }
]

const systemRoles = [
  { label: 'Administrador', icon: 'admin_panel_settings', color: 'amber-4' },
  { label: 'Profesor', icon: 'school', color: 'teal-3' },
  { label: 'Estudiante', icon: 'person', color: 'light-blue-3' }
]

const features = [
  'Historial inmutable de documentos',
  'Control de acceso por roles',
  'Soft-delete para auditoría total',
  'Carga masiva con truncado selectivo',
  'Chat documental estructurado'
]

/* ── Login handler ── */
async function handleLogin() {
  const ok = await auth.login(correo_sm_vc.value, clave_sm_vc.value)
  if (ok) {
    const redirect = route.query.redirect || '/notificaciones'
    router.push(redirect)
  }
}

/* ── Animated grid canvas ── */
function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const cols = 40
  const rows = 25
  const dots = []

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      dots.push({
        x: (i / cols) * canvas.width,
        y: (j / rows) * canvas.height,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.01
      })
    }
  }

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    dots.forEach((d) => {
      d.pulse += d.speed
      const alpha = (Math.sin(d.pulse) + 1) / 2
      ctx.beginPath()
      ctx.arc(d.x, d.y, 1, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(111, 255, 233, ${alpha * 0.12})`
      ctx.fill()
    })
    animFrame = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(initCanvas)
onUnmounted(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<style scoped>
/* ── Reset & Root ── */
.login-root {
  min-height: 100vh;
  width: 100%;
  background-color: #0b132b;
  position: relative;
  overflow: hidden;
  font-family: 'IBM Plex Mono', 'Fira Code', 'Courier New', monospace;
}

.grid-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* ── Split Layout ── */
.login-split {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .login-split {
    grid-template-columns: 1fr;
  }
  .info-panel {
    display: none;
  }
}

/* ── LEFT PANEL ── */
.login-form-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.5rem 3rem;
  border-right: 1px solid rgba(111, 255, 233, 0.08);
  background: linear-gradient(160deg, rgba(11, 19, 43, 0.98), rgba(14, 22, 50, 0.95));
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.brand-icon {
  display: flex;
  align-items: center;
}

.brand-subtitle {
  font-size: 0.55rem;
  letter-spacing: 0.22em;
  color: #5bc0be;
  text-transform: uppercase;
  margin: 0 0 2px;
  font-weight: 500;
}

.brand-name {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #6fffe9;
  margin: 0;
  text-shadow: 0 0 20px rgba(111, 255, 233, 0.35);
}

/* Form Container */
.form-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-header h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: #e8f4f8;
  letter-spacing: 0.04em;
  margin-bottom: 0.35rem;
}

.form-header p {
  font-size: 0.78rem;
  color: #5a7fa8;
  margin-bottom: 1.5rem;
  font-family: 'IBM Plex Sans', sans-serif;
}

/* Demo hints */
.demo-hints {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: #5bc0be;
  background: rgba(91, 192, 190, 0.06);
  border: 1px solid rgba(91, 192, 190, 0.15);
  border-radius: 4px;
  padding: 0.4rem 0.75rem;
  margin-bottom: 1.25rem;
  font-family: 'IBM Plex Mono', monospace;
}

.demo-tag {
  background: rgba(111, 255, 233, 0.15);
  color: #6fffe9;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  padding: 1px 6px;
  border-radius: 2px;
  font-weight: 700;
  text-transform: uppercase;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 75, 110, 0.1);
  border: 1px solid rgba(255, 75, 110, 0.3);
  border-radius: 6px;
  padding: 0.6rem 0.875rem;
  margin-bottom: 1rem;
  font-size: 0.78rem;
  color: #ff8fa3;
  font-family: 'IBM Plex Sans', sans-serif;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Field Groups */
.field-group {
  margin-bottom: 1.1rem;
}

.field-label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5bc0be;
  margin-bottom: 0.35rem;
  font-weight: 500;
}

/* Override Quasar input for dark theme */
:deep(.sntnl-input .q-field__control) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(91, 192, 190, 0.2) !important;
  border-radius: 6px !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

:deep(.sntnl-input .q-field__control:hover) {
  border-color: rgba(111, 255, 233, 0.4) !important;
}

:deep(.sntnl-input.q-field--focused .q-field__control) {
  border-color: rgba(111, 255, 233, 0.7) !important;
  box-shadow: 0 0 0 3px rgba(111, 255, 233, 0.08) !important;
}

:deep(.sntnl-input .q-field__native),
:deep(.sntnl-input .q-field__input) {
  color: #c8dde8 !important;
  font-size: 0.875rem !important;
  font-family: 'IBM Plex Mono', monospace !important;
}

:deep(.sntnl-input .q-field__native::placeholder) {
  color: #2e4a6a !important;
}

:deep(.sntnl-input .q-field__bottom) {
  font-size: 0.7rem !important;
  padding-top: 4px !important;
}

/* Login Button */
.login-btn {
  width: 100%;
  height: 46px;
  background: #6fffe9 !important;
  color: #0b132b !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.2em !important;
  border-radius: 6px !important;
  margin-top: 0.5rem;
  transition: all 0.2s ease !important;
  box-shadow: 0 0 20px rgba(111, 255, 233, 0.2);
  font-family: 'IBM Plex Mono', monospace !important;
}

.login-btn:hover {
  background: #a0fff0 !important;
  box-shadow: 0 0 30px rgba(111, 255, 233, 0.35) !important;
  transform: translateY(-1px);
}

.btn-loader {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #0b132b;
}

.form-footer {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.7rem;
  color: #2e4a6a;
  font-family: 'IBM Plex Sans', sans-serif;
}

/* Security Badge */
.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.62rem;
  color: #2e4a6a;
  letter-spacing: 0.08em;
}

/* ── RIGHT PANEL ── */
.info-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
  background:
    linear-gradient(135deg, rgba(11, 19, 43, 0.3) 0%, rgba(91, 192, 190, 0.04) 100%),
    radial-gradient(ellipse at 70% 30%, rgba(111, 255, 233, 0.05) 0%, transparent 60%),
    radial-gradient(ellipse at 30% 70%, rgba(91, 192, 190, 0.04) 0%, transparent 60%);
  overflow: hidden;
}

.info-glass {
  position: relative;
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(111, 255, 233, 0.1);
  border-radius: 16px;
  padding: 2.5rem;
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 0 1px rgba(111, 255, 233, 0.05),
    0 25px 50px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(111, 255, 233, 0.08);
}

/* Hex decoration */
.hex-deco {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  pointer-events: none;
  opacity: 0.6;
}

.hex-svg { width: 100%; height: 100%; }

/* Info Header */
.info-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.info-icon-ring {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(111, 255, 233, 0.25);
  border-radius: 12px;
  background: rgba(111, 255, 233, 0.06);
  margin-bottom: 0.75rem;
}

.info-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #6fffe9;
  margin: 0;
  text-shadow: 0 0 30px rgba(111, 255, 233, 0.25);
}

.info-subtitle {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: #5bc0be;
  text-transform: uppercase;
  margin: 0;
  font-weight: 500;
}

.info-description {
  font-size: 0.82rem;
  line-height: 1.7;
  color: #7aa0b8;
  margin-bottom: 1.75rem;
  font-family: 'IBM Plex Sans', sans-serif;
}

.info-description strong {
  color: #b0d8e8;
  font-weight: 600;
}

/* Flow Steps */
.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.875rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(111, 255, 233, 0.06);
  border-radius: 8px;
  animation: fadeSlideIn 0.5s ease forwards;
  opacity: 0;
  transition: background 0.2s, border-color 0.2s;
}

.flow-step:hover {
  background: rgba(111, 255, 233, 0.04);
  border-color: rgba(111, 255, 233, 0.15);
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}

.step-number {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6fffe9;
  min-width: 22px;
  font-family: 'IBM Plex Mono', monospace;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.step-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #c8dde8;
  letter-spacing: 0.02em;
}

.step-desc {
  font-size: 0.65rem;
  color: #4a6a88;
  font-family: 'IBM Plex Sans', sans-serif;
}

.step-icon { opacity: 0.6; }

/* Roles Grid */
.roles-grid {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.role-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  font-size: 0.65rem;
  color: #8baec4;
  letter-spacing: 0.05em;
}

/* Features List */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: #4a6a88;
  font-family: 'IBM Plex Sans', sans-serif;
}

.feature-item:hover { color: #6fffe9; }
</style>
