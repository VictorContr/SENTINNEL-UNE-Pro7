<!-- ══════════════════════════════════════════════════════════════════
     FAQSection.vue — Preguntas frecuentes con q-expansion-item.
     Abarca dudas sobre subida de PDFs, proceso de reprobación,
     módulo deploy y acceso por roles. Thin component, sin stores.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <section
    ref="seccion_sm_vc"
    id="faq"
    class="faq-root_sm_vc"
    aria-label="Preguntas frecuentes">

    <div class="seccion-header_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <div class="seccion-eyebrow_sm_vc">
        <span class="eyebrow-line_sm_vc" />
        <span>FAQ</span>
        <span class="eyebrow-line_sm_vc" />
      </div>
      <h2 class="seccion-titulo_sm_vc">
        Preguntas <span class="titulo-acento_sm_vc">frecuentes</span>
      </h2>
      <p class="seccion-sub_sm_vc">
        Todo lo que necesitas saber antes de iniciar tu proceso de pasantías.
      </p>
    </div>

    <div class="faq-list_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <q-expansion-item
        v-for="(faq_sm_vc, idx_sm_vc) in faqs_sm_vc"
        :key="faq_sm_vc.id_sm_vc"
        :label="faq_sm_vc.pregunta_sm_vc"
        :caption="faq_sm_vc.categoria_sm_vc"
        :icon="faq_sm_vc.icon_sm_vc"
        class="faq-item_sm_vc"
        header-class="faq-header_sm_vc"
        expand-icon-class="faq-expand-icon_sm_vc"
        :style="{ animationDelay: `${idx_sm_vc * 0.07}s` }"
        dark
        dense
        expand-separator
      >
        <div class="faq-respuesta_sm_vc">
          <p>{{ faq_sm_vc.respuesta_sm_vc }}</p>
          <div v-if="faq_sm_vc.nota_sm_vc" class="faq-nota_sm_vc">
            <q-icon name="info" size="14px" color="teal-3" />
            <span>{{ faq_sm_vc.nota_sm_vc }}</span>
          </div>
        </div>
      </q-expansion-item>
    </div>

    <!-- CTA de contacto -->
    <div class="faq-cta_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <q-icon name="support_agent" size="24px" color="teal-3" />
      <div>
        <p class="faq-cta-titulo_sm_vc">¿No encontraste tu respuesta?</p>
        <p class="faq-cta-desc_sm_vc">
          Contacta al coordinador académico de tu carrera o a la Dirección de Computación UNE.
        </p>
      </div>
      <q-btn outline no-caps label="Contactar" icon="mail" color="teal-3"
        class="faq-cta-btn_sm_vc" href="mailto:computacion@une.edu.ve" />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({ isDark_sm_vc: { type: Boolean, default: true } })

const seccion_sm_vc = ref(null)
const visible_sm_vc = ref(false)

const faqs_sm_vc = [
  {
    id_sm_vc: 'faq-01',
    icon_sm_vc: 'upload_file',
    categoria_sm_vc: 'Documentos',
    pregunta_sm_vc: '¿Qué formatos de archivo acepta el sistema?',
    respuesta_sm_vc: 'SENTINNEL acepta exclusivamente archivos PDF para los informes de pasantías y documentación técnica. El módulo de Deploy acepta archivos ZIP para el código fuente. El límite de tamaño por archivo es de 10 MB.',
    nota_sm_vc: 'Asegúrate de que tu PDF esté firmado digitalmente si así lo requiere tu tutor.'
  },
  {
    id_sm_vc: 'faq-02',
    icon_sm_vc: 'cancel',
    categoria_sm_vc: 'Proceso Académico',
    pregunta_sm_vc: '¿Qué ocurre si soy reprobado en una materia?',
    respuesta_sm_vc: 'Si al cierre del periodo académico no has completado el 100% de los requisitos, el sistema te marca como REPROBADO automáticamente. Deberás cursar esa materia nuevamente en el siguiente periodo. El historial de tus entregas previas se conserva íntegramente para auditoría.',
    nota_sm_vc: null
  },
  {
    id_sm_vc: 'faq-03',
    icon_sm_vc: 'linear_scale',
    categoria_sm_vc: 'Flujo del Sistema',
    pregunta_sm_vc: '¿Puedo entregar en Seminario de Grado sin haber aprobado Investigación y Desarrollo?',
    respuesta_sm_vc: 'No. El sistema bloquea el acceso a cada materia hasta que la anterior esté en estado APROBADO. Este control es automático e irreversible para garantizar la integridad del proceso.',
    nota_sm_vc: null
  },
  {
    id_sm_vc: 'faq-04',
    icon_sm_vc: 'rocket_launch',
    categoria_sm_vc: 'Módulo Deploy',
    pregunta_sm_vc: '¿Cuándo se habilita el módulo de Deploy?',
    respuesta_sm_vc: 'El módulo de Deploy se desbloquea únicamente cuando las cuatro materias (Investigación, Seminario, TG I y TG II) están en estado APROBADO. Allí deberás registrar la URL de tu aplicación en producción, subir el archivo ZIP con el código fuente y adjuntar la documentación técnica en PDF.',
    nota_sm_vc: 'Puedes actualizar tu deploy si cometiste algún error, siempre que el periodo esté activo.'
  },
  {
    id_sm_vc: 'faq-05',
    icon_sm_vc: 'rate_review',
    categoria_sm_vc: 'Evaluación',
    pregunta_sm_vc: '¿El profesor puede aprobar sólo parte de mi informe?',
    respuesta_sm_vc: 'Sí. El sistema cuenta con evaluación granular de requisitos. Tu tutor puede aprobar capítulos individualmente sin necesitar que todo el informe esté completo. Esto le permite darte retroalimentación quirúrgica por sección y registrar el avance de forma incremental.',
    nota_sm_vc: null
  },
  {
    id_sm_vc: 'faq-06',
    icon_sm_vc: 'admin_panel_settings',
    categoria_sm_vc: 'Acceso y Roles',
    pregunta_sm_vc: '¿Cómo obtengo mis credenciales de acceso?',
    respuesta_sm_vc: 'El Administrador del sistema realiza una carga masiva al inicio de cada cohorte. Recibirás tus credenciales (correo institucional + contraseña temporal) directamente del departamento de Computación. Debes cambiar tu contraseña en el primer inicio de sesión.',
    nota_sm_vc: 'Si tienes problemas de acceso, contacta a tu coordinador antes de iniciar el proceso.'
  }
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
.faq-root_sm_vc {
  padding: 6rem 2rem;
  background: var(--sn-fondo-elevado);
  border-top: 1px solid var(--sn-borde);
  border-bottom: 1px solid var(--sn-borde);
}
.seccion-header_sm_vc {
  text-align: center; max-width: 600px; margin: 0 auto 3.5rem;
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
  letter-spacing: .04em; line-height: 1.2; margin: 0 0 .75rem;
}
.titulo-acento_sm_vc { color: var(--sn-primario); }
.seccion-sub_sm_vc {
  font-size: .85rem; color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans); margin: 0;
}

/* ── Lista FAQ ── */
.faq-list_sm_vc {
  max-width: 800px; margin: 0 auto 3rem;
  display: flex; flex-direction: column; gap: .5rem;
  opacity: 0; transform: translateY(20px); transition: all .8s .1s ease;
}
.faq-list_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
:deep(.faq-item_sm_vc) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important;
  border-radius: 10px !important;
  overflow: hidden;
  transition: border-color .15s;
}
:deep(.faq-item_sm_vc:hover) { border-color: var(--sn-borde-hover) !important; }
:deep(.faq-item_sm_vc .q-expansion-item__container) { background: transparent !important; }
:deep(.faq-header_sm_vc) {
  padding: 1rem 1.25rem !important;
  font-family: var(--sn-font-mono) !important;
  font-size: .85rem !important;
  color: var(--sn-texto-principal) !important;
}
:deep(.faq-header_sm_vc .q-item__label--caption) {
  font-size: .6rem !important; color: var(--sn-primario) !important;
  letter-spacing: .1em !important; text-transform: uppercase !important;
}
:deep(.faq-expand-icon_sm_vc) { color: var(--sn-texto-apagado) !important; }
.faq-respuesta_sm_vc {
  padding: 0 1.25rem 1.25rem;
  font-size: .8rem; color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans); line-height: 1.75;
}
.faq-respuesta_sm_vc p { margin: 0 0 .75rem; }
.faq-nota_sm_vc {
  display: flex; align-items: flex-start; gap: .4rem;
  font-size: .72rem; color: var(--sn-acento-sec);
  background: var(--sn-surface-active);
  border: 1px solid var(--sn-borde-activo);
  border-radius: 6px; padding: .5rem .75rem; margin-top: .5rem;
}

/* ── CTA de contacto ── */
.faq-cta_sm_vc {
  display: flex; align-items: center; gap: 1.25rem;
  max-width: 800px; margin: 0 auto;
  padding: 1.5rem 1.75rem;
  background: rgba(111,255,233,.04);
  border: 1px solid rgba(111,255,233,.12);
  border-radius: 12px; flex-wrap: wrap;
  opacity: 0; transform: translateY(16px); transition: all .7s .3s ease;
}
.faq-cta_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
.faq-cta-titulo_sm_vc {
  font-size: .88rem; font-weight: 600; color: var(--sn-texto-principal);
  font-family: var(--sn-font-mono); margin: 0 0 2px;
}
.faq-cta-desc_sm_vc {
  font-size: .75rem; color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans); margin: 0;
}
.faq-cta-btn_sm_vc { margin-left: auto; }
</style>