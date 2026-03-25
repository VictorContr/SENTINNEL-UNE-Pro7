<!-- ══════════════════════════════════════════════════════════════════
     TestimoniosSection.vue — Sección de testimonios con q-carousel.
     Lee el estado desde testimoniosStore (Pinia). Llama la action en
     onMounted. Muestra skeleton mientras carga. No hace Axios directo.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <section
    ref="seccion_sm_vc"
    id="testimonios"
    class="testimonios-root_sm_vc"
    aria-label="Testimonios de usuarios SENTINNEL">

    <!-- Encabezado -->
    <div class="seccion-header_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <div class="seccion-eyebrow_sm_vc">
        <span class="eyebrow-line_sm_vc" />
        <span>Social Proof</span>
        <span class="eyebrow-line_sm_vc" />
      </div>
      <h2 class="seccion-titulo_sm_vc">
        Lo que dicen pasantes
        <span class="titulo-acento_sm_vc">y tutores</span>
      </h2>
    </div>

    <!-- Estado: cargando (skeletons) -->
    <div v-if="store_sm_vc.cargando_sm_vc" class="skeleton-grid_sm_vc">
      <div v-for="n in 3" :key="n" class="skeleton-card_sm_vc">
        <q-skeleton type="text" width="60%" class="q-mb-sm" />
        <q-skeleton type="text" />
        <q-skeleton type="text" />
        <q-skeleton type="text" width="80%" class="q-mt-md" />
      </div>
    </div>

    <!-- Carousel de testimonios -->
    <div
      v-else
      class="carousel-wrap_sm_vc"
      :class="{ 'visible_sm_vc': visible_sm_vc }">

      <q-carousel
        v-model="slide_sm_vc"
        animated
        swipeable
        infinite
        :autoplay="5000"
        transition-prev="slide-right"
        transition-next="slide-left"
        class="sntnl-carousel_sm_vc"
        arrows
        navigation
        navigation-position="bottom"
        control-color="teal-3"
        height="auto"
      >
        <!-- Agrupamos de a 2 (vista escritorio) usando grupos computados -->
        <q-carousel-slide
          v-for="(grupo_sm_vc, idx_sm_vc) in gruposTestimonios_sm_vc"
          :key="idx_sm_vc"
          :name="idx_sm_vc"
          class="carousel-slide_sm_vc">
          <div class="slide-inner_sm_vc">
            <div
              v-for="item_sm_vc in grupo_sm_vc"
              :key="item_sm_vc.id_sm_vc"
              class="testimonio-card_sm_vc">
              <!-- Icono de cita -->
              <div class="cita-icon_sm_vc">"</div>

              <!-- Cuerpo del testimonio -->
              <p class="testimonio-cuerpo_sm_vc">{{ item_sm_vc.cuerpo_sm_vc }}</p>

              <!-- Footer del testimonio -->
              <div class="testimonio-footer_sm_vc">
                <div class="autor-avatar_sm_vc">
                  {{ item_sm_vc.pseudonimo_sm_vc.charAt(0).toUpperCase() }}
                </div>
                <div class="autor-info_sm_vc">
                  <!-- Pseudónimo generado desde la API -->
                  <span class="autor-id_sm_vc">{{ formatearId_sm_vc(item_sm_vc.pseudonimo_sm_vc) }}</span>
                  <span class="autor-rol_sm_vc">{{ item_sm_vc.rol_sm_vc }}</span>
                </div>
                <div class="autor-meta_sm_vc">
                  <div class="cohorte-chip_sm_vc">{{ item_sm_vc.cohorte_sm_vc }}</div>
                  <q-icon
                    :name="item_sm_vc.aprobado_sm_vc ? 'verified' : 'school'"
                    size="16px"
                    :color="item_sm_vc.aprobado_sm_vc ? 'teal-3' : 'amber-4'" />
                </div>
              </div>
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>

    <!-- Stats de credibilidad -->
    <div class="credibilidad-row_sm_vc" :class="{ 'visible_sm_vc': visible_sm_vc }">
      <div v-for="stat_sm_vc in stats_sm_vc" :key="stat_sm_vc.label_sm_vc" class="cred-stat_sm_vc">
        <q-icon :name="stat_sm_vc.icon_sm_vc" size="20px" color="teal-3" />
        <span class="cred-num_sm_vc">{{ stat_sm_vc.valor_sm_vc }}</span>
        <span class="cred-label_sm_vc">{{ stat_sm_vc.label_sm_vc }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTestimoniosStore } from 'src/stores/testimoniosStore.js'

defineProps({ isDark_sm_vc: { type: Boolean, default: true } })

/* ── Store ── */
const store_sm_vc = useTestimoniosStore()

/* ── Carousel state ── */
const slide_sm_vc = ref(0)

/* ── Agrupa testimonios de a 2 para mostrar en pares ── */
const gruposTestimonios_sm_vc = computed(() => {
  const lista_sm_vc = store_sm_vc.testimonios_sm_vc
  const grupos_sm_vc = []
  for (let i = 0; i < lista_sm_vc.length; i += 2) {
    grupos_sm_vc.push(lista_sm_vc.slice(i, i + 2))
  }
  return grupos_sm_vc
})

/* ── Formatea el pseudónimo desde la API (title recortado) ── */
const formatearId_sm_vc = (titulo_sm_vc) => {
  if (!titulo_sm_vc) return '---'
  const palabras_sm_vc = titulo_sm_vc.split(' ')
  return palabras_sm_vc.slice(0, 3).map(
    (w_sm_vc) => w_sm_vc.charAt(0).toUpperCase() + w_sm_vc.slice(1)
  ).join(' ')
}

/* ── Estadísticas de credibilidad ── */
const stats_sm_vc = [
  { icon_sm_vc: 'groups',      valor_sm_vc: '200+', label_sm_vc: 'Pasantes registrados' },
  { icon_sm_vc: 'description', valor_sm_vc: '1.4k', label_sm_vc: 'Informes procesados' },
  { icon_sm_vc: 'verified',    valor_sm_vc: '98%',  label_sm_vc: 'Tasa de aprobación' },
  { icon_sm_vc: 'timer',       valor_sm_vc: '-60%', label_sm_vc: 'Tiempo de gestión' }
]

/* ── Visibility animation ── */
const seccion_sm_vc = ref(null)
const visible_sm_vc = ref(false)
let observer_sm_vc = null

onMounted(() => {
  /* Cargar testimonios desde el store (que llama al servicio Axios) */
  store_sm_vc.cargarTestimonios_sm_vc()

  observer_sm_vc = new IntersectionObserver(
    ([e_sm_vc]) => { if (e_sm_vc.isIntersecting) visible_sm_vc.value = true },
    { threshold: 0.1 }
  )
  if (seccion_sm_vc.value) observer_sm_vc.observe(seccion_sm_vc.value)
})

onUnmounted(() => observer_sm_vc?.disconnect())
</script>

<style scoped>
.testimonios-root_sm_vc {
  padding: 6rem 2rem;
  background: var(--sn-fondo);
  border-bottom: 1px solid var(--sn-borde);
}

/* ── Header ── */
.seccion-header_sm_vc {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 3.5rem;
  opacity: 0; transform: translateY(20px);
  transition: all .7s ease;
}
.seccion-header_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
.seccion-eyebrow_sm_vc {
  display: flex; align-items: center; gap: .75rem; justify-content: center;
  font-size: .62rem; letter-spacing: .2em; text-transform: uppercase;
  color: var(--sn-primario); font-family: var(--sn-font-mono); margin-bottom: 1rem;
}
.eyebrow-line_sm_vc { flex: 1; max-width: 60px; height: 1px; background: var(--sn-borde-activo); }
.seccion-titulo_sm_vc {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700; color: var(--sn-texto-principal);
  font-family: var(--sn-font-mono); letter-spacing: .04em;
  line-height: 1.2; margin: 0;
}
.titulo-acento_sm_vc { color: var(--sn-primario); }

/* ── Skeletons ── */
.skeleton-grid_sm_vc {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem; max-width: 900px; margin: 0 auto;
}
.skeleton-card_sm_vc {
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde); border-radius: 14px; padding: 1.75rem;
}

/* ── Carousel ── */
.carousel-wrap_sm_vc {
  max-width: 960px; margin: 0 auto 3rem;
  opacity: 0; transform: translateY(20px);
  transition: all .8s .15s ease;
}
.carousel-wrap_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
:deep(.sntnl-carousel_sm_vc) {
  background: transparent !important;
  min-height: unset !important;
}
:deep(.sntnl-carousel_sm_vc .q-carousel__navigation .q-btn) {
  color: var(--sn-primario) !important;
}
:deep(.sntnl-carousel_sm_vc .q-carousel__prev-btn),
:deep(.sntnl-carousel_sm_vc .q-carousel__next-btn) {
  background: var(--sn-surface-alpha) !important;
  border: 1px solid var(--sn-borde) !important;
}
.carousel-slide_sm_vc { padding: .5rem 3rem 2rem !important; }
.slide-inner_sm_vc {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;
}
@media (max-width: 640px) { .slide-inner_sm_vc { grid-template-columns: 1fr; } }

/* ── Tarjeta de testimonio ── */
.testimonio-card_sm_vc {
  position: relative;
  background: var(--sn-surface-alpha);
  border: 1px solid var(--sn-borde);
  border-radius: 14px;
  padding: 1.75rem;
  display: flex; flex-direction: column; gap: 1rem;
  transition: all .15s ease;
}
.testimonio-card_sm_vc:hover {
  border-color: var(--sn-borde-hover);
  background: var(--sn-surface-hover);
}
.cita-icon_sm_vc {
  position: absolute; top: .75rem; right: 1.25rem;
  font-size: 5rem; font-weight: 700;
  color: var(--sn-surface-active); line-height: 1;
  font-family: var(--sn-font-mono); user-select: none;
}
.testimonio-cuerpo_sm_vc {
  font-size: .82rem; color: var(--sn-texto-secundario);
  font-family: var(--sn-font-sans); line-height: 1.75;
  margin: 0; flex: 1; font-style: italic;
}
.testimonio-footer_sm_vc {
  display: flex; align-items: center; gap: .75rem;
  border-top: 1px solid var(--sn-borde); padding-top: 1rem;
}
.autor-avatar_sm_vc {
  width: 36px; height: 36px; border-radius: 8px;
  background: var(--sn-surface-active);
  border: 1px solid var(--sn-borde-activo);
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 700; color: var(--sn-primario);
  font-family: var(--sn-font-mono); flex-shrink: 0;
}
.autor-info_sm_vc { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.autor-id_sm_vc {
  font-size: .72rem; font-weight: 600; color: var(--sn-texto-principal);
  font-family: var(--sn-font-mono); white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.autor-rol_sm_vc {
  font-size: .62rem; color: var(--sn-texto-apagado); font-family: var(--sn-font-sans);
}
.autor-meta_sm_vc { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; }
.cohorte-chip_sm_vc {
  font-size: .58rem; font-family: var(--sn-font-mono);
  padding: 1px 6px; border-radius: 3px;
  background: var(--sn-surface-active); color: var(--sn-acento-sec);
}

/* ── Stats de credibilidad ── */
.credibilidad-row_sm_vc {
  display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;
  max-width: 700px; margin: 0 auto;
  opacity: 0; transform: translateY(16px);
  transition: all .7s .3s ease;
}
.credibilidad-row_sm_vc.visible_sm_vc { opacity: 1; transform: translateY(0); }
.cred-stat_sm_vc {
  display: flex; flex-direction: column; align-items: center; gap: .3rem;
  padding: 1rem 1.5rem;
  background: var(--sn-surface-alpha); border: 1px solid var(--sn-borde); border-radius: 10px;
}
.cred-num_sm_vc {
  font-size: 1.6rem; font-weight: 700; color: var(--sn-primario);
  font-family: var(--sn-font-mono);
}
.cred-label_sm_vc {
  font-size: .62rem; color: var(--sn-texto-apagado);
  font-family: var(--sn-font-mono); text-transform: uppercase; letter-spacing: .1em;
}
</style>