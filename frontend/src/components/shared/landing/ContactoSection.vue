<!-- ══════════════════════════════════════════════════════════════════
     ContactoSection.vue — Sección del formulario de contacto.
     Permite al visitante enviar su nombre, correo y asunto para
     solicitar información sobre la demo de SENTINNEL.
     Usa contactoStore.js → contactoService.js → POST /api/mailer/contacto
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <section
    id="contacto"
    class="contacto-section_sm_vc"
    :class="{ 'contacto-dark_sm_vc': isDark_sm_vc }"
  >
    <div class="contacto-inner_sm_vc">

      <!-- ── Encabezado ── -->
      <div class="contacto-header_sm_vc">
        <span class="contacto-badge_sm_vc">Solicitar Demo</span>
        <h2 class="contacto-titulo_sm_vc">
          ¿Listo para transformar tu gestión<br />
          de pasantías?
        </h2>
        <p class="contacto-subtitulo_sm_vc">
          Déjanos tus datos y te enviamos toda la información para comenzar.
        </p>
      </div>

      <!-- ── Card del formulario ── -->
      <div class="contacto-card_sm_vc">

        <!-- Estado de éxito: reemplaza el formulario tras el envío -->
        <transition name="fade-scale">
          <div v-if="store_sm_vc.exito_sm_vc" class="contacto-exito_sm_vc">
            <q-icon name="check_circle" size="3rem" color="teal-5" />
            <h3 class="exito-titulo_sm_vc">¡Mensaje enviado!</h3>
            <p class="exito-texto_sm_vc">
              Nos pondremos en contacto contigo pronto a través de
              <strong>{{ form_sm_vc.correo_sm_vc }}</strong>.
            </p>
            <q-btn
              unelevated no-caps
              label="Enviar otro mensaje"
              icon="refresh"
              class="exito-btn_sm_vc"
              @click="reiniciar_sm_vc"
            />
          </div>
        </transition>

        <!-- Formulario visible antes del éxito -->
        <transition name="fade-scale">
          <q-form
            v-if="!store_sm_vc.exito_sm_vc"
            class="contacto-form_sm_vc"
            @submit.prevent="onSubmit_sm_vc"
          >
            <!-- Campo: Nombre -->
            <div class="form-grupo_sm_vc">
              <label class="form-label_sm_vc" for="contacto-nombre">
                <q-icon name="person" size="xs" /> Nombre completo
              </label>
              <q-input
                id="contacto-nombre"
                v-model="form_sm_vc.nombre_sm_vc"
                filled dense
                placeholder="Ej. María González"
                :rules="[val => !!val || 'El nombre es requerido.']"
                class="form-input_sm_vc"
                bg-color="transparent"
                :dark="isDark_sm_vc"
                lazy-rules
              />
            </div>

            <!-- Campo: Correo -->
            <div class="form-grupo_sm_vc">
              <label class="form-label_sm_vc" for="contacto-correo">
                <q-icon name="email" size="xs" /> Correo electrónico
              </label>
              <q-input
                id="contacto-correo"
                v-model="form_sm_vc.correo_sm_vc"
                filled dense
                type="email"
                placeholder="tu-correo@gmail.com"
                :rules="[
                  val => !!val || 'El correo es requerido.',
                  val => /.+@.+\..+/.test(val) || 'Ingresa un correo válido.'
                ]"
                class="form-input_sm_vc"
                bg-color="transparent"
                :dark="isDark_sm_vc"
                lazy-rules
              />
            </div>

            <!-- Campo: Asunto -->
            <div class="form-grupo_sm_vc">
              <label class="form-label_sm_vc" for="contacto-asunto">
                <q-icon name="subject" size="xs" /> Asunto / Motivo
              </label>
              <q-input
                id="contacto-asunto"
                v-model="form_sm_vc.asunto_sm_vc"
                filled dense
                placeholder="Quiero conocer más sobre la demo para mi cohorte"
                :rules="[val => !!val || 'El asunto es requerido.']"
                class="form-input_sm_vc"
                bg-color="transparent"
                :dark="isDark_sm_vc"
                lazy-rules
              />
            </div>

            <!-- CTA de envío -->
            <q-btn
              unelevated no-caps
              type="submit"
              label="Solicitar información"
              icon-right="send"
              :loading="store_sm_vc.enviando_sm_vc"
              :disable="store_sm_vc.enviando_sm_vc"
              class="contacto-submit_sm_vc"
            >
              <template #loading>
                <q-spinner-gears color="white" size="1.2em" class="q-mr-sm" />
                Enviando...
              </template>
            </q-btn>

            <!-- Aviso de privacidad mínimo -->
            <p class="form-privacidad_sm_vc">
              <q-icon name="lock" size="xs" />
              Tus datos no serán compartidos con terceros.
            </p>
          </q-form>
        </transition>

      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import { useContactoStore } from 'src/stores/contactoStore.js'

/* ── Props ── */
defineProps({
  // Recibe el estado del tema del orquestador LandingPage.vue
  'isDark_sm_vc': {
    type: Boolean,
    default: false,
  },
})

/* ── Store ── */
const store_sm_vc = useContactoStore()

/* ── Modelo del formulario ── */
const form_sm_vc = reactive({
  nombre_sm_vc: '',
  correo_sm_vc: '',
  asunto_sm_vc: '',
})

/* ── Envío del formulario ── */
const onSubmit_sm_vc = async () => {
  await store_sm_vc.enviarFormulario_sm_vc({ ...form_sm_vc })
}

/* ── Reiniciar para nuevo envío ── */
const reiniciar_sm_vc = () => {
  form_sm_vc.nombre_sm_vc = ''
  form_sm_vc.correo_sm_vc = ''
  form_sm_vc.asunto_sm_vc = ''
  store_sm_vc.resetear_sm_vc()
}
</script>

<style scoped>
/* ── Sección wrapper ── */
.contacto-section_sm_vc {
  padding: 6rem 1.5rem;
  background: var(--sn-fondo);
  position: relative;
  overflow: hidden;
}

/* Decoración de fondo sutil */
.contacto-section_sm_vc::before {
  content: '';
  position: absolute;
  top: -120px;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(13, 122, 111, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.contacto-inner_sm_vc {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

/* ── Header ── */
.contacto-header_sm_vc {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
}
.contacto-badge_sm_vc {
  display: inline-block;
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--sn-primario);
  border: 1px solid var(--sn-primario);
  padding: .25rem .75rem;
  border-radius: 999px;
}
.contacto-titulo_sm_vc {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  color: var(--sn-texto-principal);
  line-height: 1.25;
  margin: 0;
}
.contacto-subtitulo_sm_vc {
  font-size: .9rem;
  color: var(--sn-texto-terciario);
  margin: 0;
}

/* ── Card ── */
.contacto-card_sm_vc {
  width: 100%;
  background: var(--sn-surface);
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-radius-lg, 16px);
  padding: 2.5rem;
  box-shadow: var(--sn-shadow-md);
  backdrop-filter: blur(8px);
  position: relative;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Formulario ── */
.contacto-form_sm_vc {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grupo_sm_vc {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}
.form-label_sm_vc {
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .08em;
  color: var(--sn-texto-secundario);
  display: flex;
  align-items: center;
  gap: .3rem;
}

/* Override estilos de q-input para usar el sistema de diseño */
.form-input_sm_vc :deep(.q-field__control) {
  background: var(--sn-glass-bg) !important;
  border: 1px solid var(--sn-borde);
  border-radius: var(--sn-radius-sm, 6px) !important;
  transition: border-color .2s;
}
.form-input_sm_vc :deep(.q-field--focused .q-field__control) {
  border-color: var(--sn-primario) !important;
  box-shadow: 0 0 0 2px rgba(13, 122, 111, 0.15);
}
.form-input_sm_vc :deep(.q-field__native),
.form-input_sm_vc :deep(.q-field__input) {
  color: var(--sn-texto-principal) !important;
  font-size: .85rem !important;
}

/* ── Botón de envío ── */
.contacto-submit_sm_vc {
  background: var(--sn-primario) !important;
  color: var(--sn-fondo) !important;
  font-weight: 700 !important;
  font-size: .85rem !important;
  letter-spacing: .06em !important;
  border-radius: var(--sn-radius-md, 8px) !important;
  padding: .75rem 1.5rem !important;
  width: 100%;
  margin-top: .5rem;
  transition: opacity .2s, transform .15s;
}
.contacto-submit_sm_vc:hover:not(:disabled) {
  opacity: .88;
  transform: translateY(-1px);
}

.form-privacidad_sm_vc {
  font-size: .65rem;
  color: var(--sn-texto-terciario);
  text-align: center;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .3rem;
}

/* ── Estado de éxito ── */
.contacto-exito_sm_vc {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 1rem 0;
}
.exito-titulo_sm_vc {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--sn-primario);
  margin: 0;
}
.exito-texto_sm_vc {
  font-size: .875rem;
  color: var(--sn-texto-secundario);
  margin: 0;
  max-width: 340px;
}
.exito-btn_sm_vc {
  background: transparent !important;
  color: var(--sn-primario) !important;
  border: 1px solid var(--sn-primario) !important;
  font-size: .78rem !important;
  border-radius: var(--sn-radius-sm, 6px) !important;
  padding: .5rem 1.25rem !important;
  margin-top: .5rem;
}

/* ── Transiciones ── */
.fade-scale-enter-active,
.fade-scale-leave-active { transition: all .3s ease; }
.fade-scale-enter-from,
.fade-scale-leave-to     { opacity: 0; transform: scale(.96); }

/* ── Modo oscuro: ajustes mínimos por CSS vars ── */
.contacto-dark_sm_vc .contacto-card_sm_vc {
  background: var(--sn-surface);
}
</style>
