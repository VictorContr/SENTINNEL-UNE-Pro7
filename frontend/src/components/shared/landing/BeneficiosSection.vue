<!-- ══════════════════════════════════════════════════════════════════
     BeneficiosSection.vue — Sección de beneficios clave de SENTINNEL.
     Presenta los 4 pilares del sistema: cero papel, step-by-step,
     módulo deploy y validación granular. Usa cards con iconografía
     Quasar y anima la entrada con Intersection Observer nativo.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <section
    ref="seccion_sm_vc"
    id="beneficios"
    class="beneficios-root_sm_vc"
    aria-label="Beneficios de SENTINNEL">

    <!-- Encabezado de sección -->
    <div class="seccion-header_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <div class="seccion-eyebrow_sm_vc">
        <span class="eyebrow-line_sm_vc" />
        <span>Por qué SENTINNEL</span>
        <span class="eyebrow-line_sm_vc" />
      </div>
      <h2 class="seccion-titulo_sm_vc">
        Un sistema diseñado para<br />
        <span class="titulo-acento_sm_vc">eliminar la burocracia</span>
      </h2>
      <p class="seccion-subtitulo_sm_vc">
        Cuatro pilares tecnológicos que transforman el proceso de pasantías
        en la carrera de Computación de la UNE.
      </p>
    </div>

    <!-- Grid de beneficios -->
    <div class="beneficios-grid_sm_vc">
      <div
        v-for="(ben_sm_vc, idx_sm_vc) in beneficios_sm_vc"
        :key="ben_sm_vc.id_sm_vc"
        class="ben-card_sm_vc"
        :class="{ 'visible_sm_vc': visible_sm_vc }"
        :style="{ animationDelay: `${idx_sm_vc * 0.1}s` }"
      >
        <!-- Número de orden -->
        <div class="ben-orden_sm_vc">{{ String(idx_sm_vc + 1).padStart(2, '0') }}</div>

        <!-- Ícono -->
        <div class="ben-icon-wrap_sm_vc" :style="{ '--color-acento': ben_sm_vc.color_sm_vc }">
          <q-icon :name="ben_sm_vc.icon_sm_vc" size="28px" :style="{ color: ben_sm_vc.color_sm_vc }" />
        </div>

        <!-- Contenido -->
        <h3 class="ben-titulo_sm_vc">{{ ben_sm_vc.titulo_sm_vc }}</h3>
        <p class="ben-cuerpo_sm_vc">{{ ben_sm_vc.cuerpo_sm_vc }}</p>

        <!-- Tags de característica -->
        <div class="ben-tags_sm_vc">
          <span v-for="tag_sm_vc in ben_sm_vc.tags_sm_vc" :key="tag_sm_vc" class="ben-tag_sm_vc">
            {{ tag_sm_vc }}
          </span>
        </div>
      </div>
    </div>

    <!-- Banner de flujo Step-by-Step -->
    <div class="flujo-banner_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <div class="flujo-titulo_sm_vc">
        <q-icon name="route" size="16px" color="teal-3" />
        Flujo secuencial garantizado
      </div>
      <div class="flujo-pasos_sm_vc">
        <div
          v-for="(paso_sm_vc, i_sm_vc) in pasos_sm_vc"
          :key="paso_sm_vc.id_sm_vc"
          class="flujo-paso_sm_vc">
          <div class="paso-num_sm_vc">{{ String(i_sm_vc + 1).padStart(2, '0') }}</div>
          <div class="paso-texto_sm_vc">
            <span class="paso-titulo_sm_vc">{{ paso_sm_vc.titulo_sm_vc }}</span>
            <span class="paso-desc_sm_vc">{{ paso_sm_vc.desc_sm_vc }}</span>
          </div>
          <q-icon :name="paso_sm_vc.icon_sm_vc" size="18px" class="paso-icon_sm_vc" />
          <!-- Conector -->
          <div v-if="i_sm_vc < pasos_sm_vc.length - 1" class="paso-conector_sm_vc">
            <q-icon name="arrow_forward" size="14px" color="blue-grey-6" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({ isDark_sm_vc: { type: Boolean, default: true } })

const seccion_sm_vc = ref(null)
const visible_sm_vc = ref(false)

/* ── Datos de beneficios ── */
const beneficios_sm_vc = [
  {
    id_sm_vc: 'ben-01',
    icon_sm_vc: 'description',
    color_sm_vc: '#6fffe9',
    titulo_sm_vc: 'Cero Papel, Cero Correos',
    cuerpo_sm_vc: 'Toda la comunicación documental ocurre dentro de la plataforma. Los PDFs se cargan, validan y versionan digitalmente, con historial inmutable.',
    tags_sm_vc: ['PDF Digital', 'Versionado', 'Historial']
  },
  {
    id_sm_vc: 'ben-02',
    icon_sm_vc: 'linear_scale',
    color_sm_vc: '#7ec8e3',
    titulo_sm_vc: 'Flujo Step-by-Step Bloqueante',
    cuerpo_sm_vc: 'Un estudiante solo puede avanzar a Seminario de Grado si aprueba Investigación y Desarrollo. El sistema bloquea el acceso hasta cumplir los requisitos.',
    tags_sm_vc: ['4 Materias', 'Desbloqueo Secuencial', 'Control Docente']
  },
  {
    id_sm_vc: 'ben-03',
    icon_sm_vc: 'rocket_launch',
    color_sm_vc: '#f0a500',
    titulo_sm_vc: 'Módulo de Deploy Final',
    cuerpo_sm_vc: 'Una vez aprobadas las 4 materias, el estudiante registra la URL de producción y sube el código fuente comprimido como evidencia técnica.',
    tags_sm_vc: ['URL Producción', 'Código Fuente', 'Evidencia Técnica']
  },
  {
    id_sm_vc: 'ben-04',
    icon_sm_vc: 'fact_check',
    color_sm_vc: '#a78bfa',
    titulo_sm_vc: 'Evaluación Granular de Requisitos',
    cuerpo_sm_vc: 'Los profesores pueden aprobar capítulos individualmente sin necesitar que todo el informe esté completo. Feedback quirúrgico por sección.',
    tags_sm_vc: ['Por Capítulo', 'Feedback Parcial', 'Auditoría Total']
  }
]

/* ── Pasos del flujo ── */
const pasos_sm_vc = [
  { id_sm_vc: 'p1', titulo_sm_vc: 'Registro Admin', desc_sm_vc: 'Carga masiva de cohorte', icon_sm_vc: 'upload_file' },
  { id_sm_vc: 'p2', titulo_sm_vc: 'Investigación y Desarrollo', desc_sm_vc: 'Anteproyecto',  icon_sm_vc: 'description' },
  { id_sm_vc: 'p3', titulo_sm_vc: 'Seminario de Grado',   desc_sm_vc: 'Desarrollo inicial', icon_sm_vc: 'code' },
  { id_sm_vc: 'p4', titulo_sm_vc: 'Trabajo de Grado I',  desc_sm_vc: 'Desarrollo avanzado',         icon_sm_vc: 'laptop_mac' },
  { id_sm_vc: 'p5', titulo_sm_vc: 'Trabajo de Grado II',  desc_sm_vc: 'Defensa y tesis',         icon_sm_vc: 'school' },
  { id_sm_vc: 'p6', titulo_sm_vc: 'Deploy',         desc_sm_vc: 'URL + Código fuente',      icon_sm_vc: 'rocket_launch' }
]

/* ── Intersection Observer para animar la entrada ── */
let observer_sm_vc = null

onMounted(() => {
  observer_sm_vc = new IntersectionObserver(
    ([entry_sm_vc]) => { if (entry_sm_vc.isIntersecting) visible_sm_vc.value = true },
    { threshold: 0.15 }
  )
  if (seccion_sm_vc.value) observer_sm_vc.observe(seccion_sm_vc.value)
})

onUnmounted(() => observer_sm_vc?.disconnect())
</script>

<style scoped>
.beneficios-root_sm_vc {
  padding: 6rem 2rem;
  background: var(--sn-fondo-elevado);
  border-top: 1px solid var(--sn-borde);
  border-bottom: 1px solid var(--sn-borde);
}

/* ── Encabezado ── */
.seccion-header_sm_vc {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 4rem;
  opacity: 0;
  transform: translateY(24px);
  transition: all .7s ease;
}
.seccion-header_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
.seccion-eyebrow_sm_vc {
  display: flex;
  align-items: center;
  gap: .75rem;
  justify-content: center;
  font-size: .62rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--sn-primario);
  font-family: var(--sn-font-mono);
  margin-bottom: 1rem;
}
.eyebrow-line_sm_vc {
  flex: 1;
  max-width: 60px;
  height: 1px;
  background: var(--sn-borde-activo);
}
.seccion-titulo_sm_vc {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  color: var(--sn-texto-principal);
  font-family: var(--sn-font-mono);
  letter-spacing: .04em;
  line-height: 1.2;
  margin: 0 0 1rem;
}
.titulo-acento_sm_vc { color: var(--sn-primario); }
.seccion-subtitulo_sm_vc {
  font-size: .88rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans);
  line-height: 1.7;
  margin: 0;
}

/* ── Grid de cards ── */
.beneficios-grid_sm_vc {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  max-width: 1100px;
  margin: 0 auto 3rem;
}
.ben-card_sm_vc {
  position: relative;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: 14px;
  padding: 1.75rem;
  overflow: hidden;
  opacity: 0;
  transform: translateY(28px);
  transition: all .6s ease;
}
.ben-card_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
.ben-card_sm_vc:hover {
  border-color: rgba(111,255,233,.15);
  background: var(--sn-surface-hover);
  transform: translateY(-4px) !important;
  box-shadow: var(--sn-shadow-lg);
}
.ben-card_sm_vc::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--color-acento, var(--sn-primario));
  opacity: .6;
}
.ben-orden_sm_vc {
  position: absolute;
  top: 1rem; right: 1.25rem;
  font-size: 3rem;
  font-weight: 700;
  color: var(--sn-surface-hover);
  font-family: var(--sn-font-mono);
  user-select: none;
  line-height: 1;
}
.ben-icon-wrap_sm_vc {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(var(--color-acento, '111,255,233'), .08);
  border: 1px solid rgba(111,255,233,.1);
  margin-bottom: 1.25rem;
}
.ben-titulo_sm_vc {
  font-size: .92rem;
  font-weight: 600;
  color: var(--sn-texto-principal);
  font-family: var(--sn-font-mono);
  margin: 0 0 .75rem;
  letter-spacing: .02em;
}
.ben-cuerpo_sm_vc {
  font-size: .78rem;
  color: var(--sn-texto-terciario);
  font-family: var(--sn-font-sans);
  line-height: 1.7;
  margin: 0 0 1rem;
}
.ben-tags_sm_vc { display: flex; gap: .35rem; flex-wrap: wrap; }
.ben-tag_sm_vc {
  font-size: .58rem;
  font-family: var(--sn-font-mono);
  letter-spacing: .08em;
  padding: 2px 8px;
  background: var(--sn-surface-active);
  color: var(--sn-acento-sec);
  border-radius: 3px;
}

/* ── Banner de flujo ── */
.flujo-banner_sm_vc {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.75rem;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde-activo);
  border-radius: 14px;
  opacity: 0;
  transform: translateY(20px);
  transition: all .8s .4s ease;
}
.flujo-banner_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
.flujo-titulo_sm_vc {
  display: flex; align-items: center; gap: .5rem;
  font-size: .65rem; letter-spacing: .14em; text-transform: uppercase;
  color: var(--sn-primario); font-family: var(--sn-font-mono);
  margin-bottom: 1.25rem; font-weight: 600;
}
.flujo-pasos_sm_vc {
  display: flex; align-items: center; gap: .75rem; flex-wrap: wrap;
}
.flujo-paso_sm_vc {
  display: flex; align-items: center; gap: .6rem;
  padding: .6rem .875rem;
  background: var(--sn-fondo-panel);
  border: 1px solid var(--sn-borde);
  border-radius: 8px;
  transition: all .15s;
}
.flujo-paso_sm_vc:hover { border-color: var(--sn-borde-hover); }
.paso-num_sm_vc {
  font-size: .6rem; font-weight: 700; color: var(--sn-primario);
  font-family: var(--sn-font-mono); min-width: 20px;
}
.paso-texto_sm_vc { display: flex; flex-direction: column; gap: 1px; }
.paso-titulo_sm_vc { font-size: .75rem; font-weight: 600; color: var(--sn-texto-principal); font-family: var(--sn-font-mono); }
.paso-desc_sm_vc { font-size: .6rem; color: var(--sn-texto-apagado); font-family: var(--sn-font-sans); }
.paso-icon_sm_vc { opacity: .5; color: var(--sn-primario); }
.paso-conector_sm_vc { opacity: .5; }
</style>