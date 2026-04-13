<!-- ══════════════════════════════════════════════════════════════════
     DeployFileViewer.vue — Tarjeta de descarga de archivos del deploy.
     Componente puramente presentacional de solo-lectura para Profesor y Admin.
     Recibe 'nombre', 'tipo' (zip|pdf), 'estudianteId' y dispara descarga
     vía el deployStore. Acento visual dinámico según el tipo de archivo.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div
    class="file-viewer_sm_vc"
    :class="isAmber_sm_vc ? 'file-viewer--amber_sm_vc' : 'file-viewer--teal_sm_vc'"
    @click="descargar_sm_vc"
    :title="`Descargar ${nombre}`"
  >
    <!-- Ícono del tipo de archivo -->
    <div class="fv-icon-wrap_sm_vc" :class="isAmber_sm_vc ? 'fv-icon--amber_sm_vc' : 'fv-icon--teal_sm_vc'">
      <q-icon :name="icono_sm_vc" size="22px" :color="colorIcono_sm_vc" />
    </div>

    <!-- Nombre del archivo + metadata -->
    <div class="fv-info_sm_vc">
      <p class="fv-label_sm_vc">{{ etiqueta_sm_vc }}</p>
      <p class="fv-name_sm_vc">{{ nombre || 'Sin archivo registrado' }}</p>
    </div>

    <!-- Acción de descarga -->
    <div class="fv-action_sm_vc">
      <q-spinner-dots v-if="descargando_sm_vc" :color="colorIcono_sm_vc" size="16px" />
      <q-icon
        v-else
        name="download"
        size="16px"
        :color="colorIcono_sm_vc"
        class="fv-download-icon_sm_vc"
      />
      <span class="fv-action-label_sm_vc">{{ descargando_sm_vc ? 'Descargando...' : 'Descargar' }}</span>
    </div>

    <!-- Tooltip informativo -->
    <q-tooltip class="bg-dark text-caption" :delay="600">
      Haz clic para descargar: {{ nombre }}
    </q-tooltip>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDeployStore } from 'src/stores/deployStore'

const props = defineProps({
  /** Nombre del archivo a mostrar */
  nombre: { type: String, default: '' },
  /** Tipo de archivo: 'zip' para código fuente, 'pdf' para documentación */
  tipo: { type: String, default: 'zip' },
  /** ID del estudiante dueño del deploy */
  estudianteId: { type: [Number, String], required: true },
  /** Etiqueta descriptiva del campo (ej: "Código Fuente") */
  etiqueta: { type: String, default: '' }
})

const deployStore_sm_vc = useDeployStore()

// Estado de carga local para feedback visual inmediato
const descargando_sm_vc = ref(false)

// ── Computed de presentación ──────────────────────────────────────────
const isAmber_sm_vc = computed(() => props.tipo === 'pdf')

const icono_sm_vc = computed(() =>
  props.tipo === 'pdf' ? 'picture_as_pdf' : 'folder_zip'
)

const colorIcono_sm_vc = computed(() =>
  isAmber_sm_vc.value ? 'amber-4' : 'teal-3'
)

const etiqueta_sm_vc = computed(() =>
  props.etiqueta || (props.tipo === 'pdf' ? 'Documentación Técnica (.pdf)' : 'Código Fuente (.zip)')
)

// ── Descarga ──────────────────────────────────────────────────────────
const descargar_sm_vc = async () => {
  if (descargando_sm_vc.value || !props.nombre) return
  descargando_sm_vc.value = true
  try {
    await deployStore_sm_vc.descargarArchivo_sm_vc(props.estudianteId, props.tipo)
  } finally {
    descargando_sm_vc.value = false
  }
}
</script>

<style scoped>
/* Contenedor principal — tarjeta clickeable */
.file-viewer_sm_vc {
  display: flex;
  align-items: center;
  gap: .875rem;
  padding: .75rem 1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  user-select: none;
}

/* Variante teal (zip) */
.file-viewer--teal_sm_vc {
  background: rgba(111, 255, 233, .04);
  border-color: rgba(111, 255, 233, .12);
}
.file-viewer--teal_sm_vc:hover {
  background: rgba(111, 255, 233, .09);
  border-color: rgba(111, 255, 233, .3);
  transform: translateY(-1px);
}

/* Variante amber (pdf) */
.file-viewer--amber_sm_vc {
  background: rgba(240, 165, 0, .04);
  border-color: rgba(240, 165, 0, .12);
}
.file-viewer--amber_sm_vc:hover {
  background: rgba(240, 165, 0, .09);
  border-color: rgba(240, 165, 0, .3);
  transform: translateY(-1px);
}

/* Ícono contenedor */
.fv-icon-wrap_sm_vc {
  width: 40px;
  height: 40px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fv-icon--teal_sm_vc { background: rgba(111, 255, 233, .1); }
.fv-icon--amber_sm_vc { background: rgba(240, 165, 0, .1); }

/* Texto del archivo */
.fv-info_sm_vc { flex: 1; min-width: 0; }
.fv-label_sm_vc {
  font-size: .55rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--sn-texto-apagado);
  margin: 0 0 2px;
  font-family: var(--sn-font-mono);
}
.fv-name_sm_vc {
  font-size: .75rem;
  color: var(--sn-texto-secundario);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--sn-font-mono);
}

/* Botón de descarga */
.fv-action_sm_vc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.fv-action-label_sm_vc {
  font-size: .55rem;
  color: var(--sn-texto-apagado);
  letter-spacing: .06em;
}
.fv-download-icon_sm_vc {
  transition: transform 0.2s;
}
.file-viewer_sm_vc:hover .fv-download-icon_sm_vc {
  transform: translateY(2px);
}
</style>
