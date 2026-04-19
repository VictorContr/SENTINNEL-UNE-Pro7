<!-- ══════════════════════════════════════════════════════════════════
     MapaSection.vue — Sección del mapa interactivo de la UNE.
     Integra Leaflet.js + OpenStreetMap tiles para mostrar la
     ubicación de la Universidad Nueva Esparta en Los Naranjos,
     Caracas, Venezuela. Consume mapaStore.js que a su vez usa
     mapaService.js → Nominatim API (con fallback a coords verificadas).
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <section
    class="mapa-section_sm_vc"
    :class="{ 'mapa-dark_sm_vc': isDark_sm_vc }"
  >
    <div class="mapa-inner_sm_vc">

      <!-- ── Encabezado ── -->
      <div class="mapa-header_sm_vc">
        <span class="mapa-badge_sm_vc">
          <q-icon name="location_on" size="xs" /> Encuéntranos
        </span>
        <h2 class="mapa-titulo_sm_vc">Universidad Nueva Esparta</h2>
        <p class="mapa-subtitulo_sm_vc">
          Los Naranjos, Caracas, Venezuela — Sede del programa
          gestionado por SENTINNEL.
        </p>
      </div>

      <!-- ── Contenedor del mapa ── -->
      <div class="mapa-card_sm_vc">

        <!-- Skeleton mientras Nominatim responde -->
        <div v-if="store_sm_vc.cargando_sm_vc" class="mapa-skeleton_sm_vc">
          <q-skeleton type="rect" class="h-full" />
        </div>

        <!-- El div que Leaflet monta: id único para que L.map() lo encuentre -->
        <div
          v-show="!store_sm_vc.cargando_sm_vc"
          id="mapa-une_sm_vc"
          class="mapa-leaflet_sm_vc"
        />

        <!-- Chip de información sobre el mapa -->
        <div class="mapa-overlay-chip_sm_vc">
          <q-icon name="location_on" color="teal-5" size="xs" />
          <span>Universidad Nueva Esparta · Los Naranjos, Caracas</span>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useMapaStore } from 'src/stores/mapaStore.js'

/* ── Importaciones Leaflet ──
   Leaflet se importará aquí como módulo ES para que Vite lo procese.
   El CSS de Leaflet se importará directo para que los tiles se vean. */
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* Solución al bug conocido de Leaflet con Webpack/Vite:
   los íconos del marcador no se resuelven correctamente sin esto. */
import iconUrl       from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl     from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

/* ── Props ── */
defineProps({
  'isDark_sm_vc': {
    type: Boolean,
    default: false,
  },
})

/* ── Store ── */
const store_sm_vc = useMapaStore()

/* ── Referencia interna al mapa Leaflet (no reactiva: Leaflet la gestiona) ── */
let mapa_sm_vc = null

/**
 * Inicializa el mapa Leaflet con las coordenadas del store.
 * Se llama después de que tanto el DOM como las coordenadas estén listos.
 */
const iniciarMapa_sm_vc = () => {
  // Evitar doble inicialización si el componente se remonta
  if (mapa_sm_vc) {
    mapa_sm_vc.remove()
    mapa_sm_vc = null
  }

  const lat_sm_vc = store_sm_vc.latitud_sm_vc
  const lon_sm_vc = store_sm_vc.longitud_sm_vc

  // 1. Crear instancia del mapa centrada en las coordenadas de la UNE
  mapa_sm_vc = L.map('mapa-une_sm_vc', {
    zoomControl: true,
    scrollWheelZoom: false, // UX: no secuestrar el scroll de la página
  }).setView([lat_sm_vc, lon_sm_vc], 16)

  // 2. Añadir capa de tiles OpenStreetMap (atribución obligatoria por licencia OdbL)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa_sm_vc)

  // 3. Marcador con popup informativo
  L.marker([lat_sm_vc, lon_sm_vc])
    .addTo(mapa_sm_vc)
    .bindPopup(
      `<div style="font-family:sans-serif;text-align:center;line-height:1.5;">
        <strong style="color:#0d7a6f;font-size:13px;">Universidad Nueva Esparta</strong><br/>
        <span style="font-size:11px;color:#666;">Los Naranjos, Caracas, Venezuela</span>
      </div>`,
      { maxWidth: 220 }
    )
    .openPopup()
}

/* ── Ciclo de vida ── */
onMounted(async () => {
  // Primero cargamos las coordenadas (Nominatim o fallback)
  await store_sm_vc.cargarUbicacion_sm_vc()
  // Luego inicializamos el mapa con los valores del store
  await nextTick()
  iniciarMapa_sm_vc()
})

/* Reaccionar si las coordenadas cambian (ej. Nominatim responde tarde) */
watch(
  [() => store_sm_vc.latitud_sm_vc, () => store_sm_vc.longitud_sm_vc],
  async () => {
    if (!store_sm_vc.cargando_sm_vc) {
      await nextTick()
      iniciarMapa_sm_vc()
    }
  }
)

/* Limpiar la instancia de Leaflet para evitar memory leaks */
onUnmounted(() => {
  if (mapa_sm_vc) {
    mapa_sm_vc.remove()
    mapa_sm_vc = null
  }
})
</script>

<style scoped>
/* ── Sección wrapper ── */
.mapa-section_sm_vc {
  padding: 4rem 1.5rem 6rem;
  background: var(--sn-fondo);
}

.mapa-inner_sm_vc {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

/* ── Encabezado ── */
.mapa-header_sm_vc {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
}
.mapa-badge_sm_vc {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--sn-primario);
  border: 1px solid var(--sn-primario);
  padding: .25rem .75rem;
  border-radius: 999px;
}
.mapa-titulo_sm_vc {
  font-size: clamp(1.25rem, 3vw, 1.875rem);
  font-weight: 800;
  color: var(--sn-texto-principal);
  margin: 0;
}
.mapa-subtitulo_sm_vc {
  font-size: .875rem;
  color: var(--sn-texto-terciario);
  max-width: 480px;
  margin: 0;
}

/* ── Card contenedora del mapa ── */
.mapa-card_sm_vc {
  width: 100%;
  height: 420px;
  border-radius: var(--sn-radius-lg, 16px);
  overflow: hidden;
  border: 1px solid var(--sn-borde);
  box-shadow: var(--sn-shadow-md);
  position: relative;
}

/* ── El contenedor real de Leaflet ── */
.mapa-leaflet_sm_vc {
  width: 100%;
  height: 100%;
}

/* ── Skeleton de carga ── */
.mapa-skeleton_sm_vc {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Chip de información sobre el mapa ── */
.mapa-overlay-chip_sm_vc {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--sn-glass-bg, rgba(255,255,255,0.85));
  backdrop-filter: blur(10px);
  border: 1px solid var(--sn-borde);
  border-radius: 999px;
  padding: .4rem 1rem;
  font-size: .7rem;
  color: var(--sn-texto-secundario);
  display: flex;
  align-items: center;
  gap: .35rem;
  white-space: nowrap;
  z-index: 1000; /* Por encima de los controles de Leaflet */
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
}

/* ── Modo oscuro: overlay chip ── */
.mapa-dark_sm_vc .mapa-overlay-chip_sm_vc {
  background: rgba(15, 23, 42, 0.88);
}
</style>
