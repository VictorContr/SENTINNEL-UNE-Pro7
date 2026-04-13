<!-- ══════════════════════════════════════════════════════════════════
     DeployUploadZone.vue — Zona de arrastre/selección de archivo.
     Comportamiento ampliado para el estudiante:
     - Si existe un archivo previo (archivoExistente prop), muestra un
       chip con el nombre. Al hacer clic en él, se "destruye" el chip
       y se reemplaza por este componente en modo subida para elegir
       un nuevo archivo (comportamiento de remount controlado).
     - Si el estudiante ya descargó/confirmó que quiere cambiar,
       muestra la zona de drag & drop normal.
     Recibe 'accept', 'accentColor', 'archivoExistente' y emite
     'archivoSeleccionado', 'solicitarDescarga'.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div>
    <!--
      MODO EXISTENTE: Se muestra cuando hay un archivo previo en el servidor
      y el estudiante NO ha solicitado cambiarlo todavía.
      Clic en nombre → emite 'solicitarDescarga'.
      Clic en "Cambiar" → destruye este chip y muestra la zona de subida.
    -->
    <div
      v-if="mostrarExistente_sm_vc"
      class="existing-file-chip_sm_vc"
      :class="isAmber_sm_vc ? 'existing-file-chip--amber_sm_vc' : 'existing-file-chip--teal_sm_vc'"
    >
      <!-- Ícono del tipo -->
      <div class="ef-icon-wrap_sm_vc" :class="isAmber_sm_vc ? 'ef-icon--amber_sm_vc' : 'ef-icon--teal_sm_vc'">
        <q-icon :name="icon" size="20px" :color="colorIcono_sm_vc" />
      </div>

      <!-- Nombre del archivo (clickeable para descargar) -->
      <div class="ef-info_sm_vc" @click="emit('solicitarDescarga')" role="button" title="Clic para descargar tu archivo">
        <span class="ef-hint_sm_vc">Archivo subido anteriormente</span>
        <span class="ef-name_sm_vc">
          <q-icon name="download" size="11px" :color="colorIcono_sm_vc" class="q-mr-xs" />
          {{ archivoExistente }}
        </span>
      </div>

      <!-- Botón para indicar que quiere subir uno nuevo -->
      <q-btn
        flat no-caps
        label="Cambiar"
        icon="swap_horiz"
        color="grey-5"
        size="xs"
        @click="activarModoSubida_sm_vc"
        class="ef-change-btn_sm_vc"
      />
    </div>

    <!--
      MODO SUBIDA: Se muestra cuando no hay archivo previo o el estudiante
      decidió cambiar el archivo existente.
    -->
    <div
      v-else
      class="upload-zone_sm_vc"
      :class="{
        'upload-zone--active_sm_vc': drag_sm_vc,
        'upload-zone--filled_sm_vc': !!archivo_sm_vc,
        'upload-zone--alt_sm_vc': accentColor === 'amber'
      }"
      @dragover.prevent="drag_sm_vc = true"
      @dragleave="drag_sm_vc = false"
      @drop.prevent="handleDrop_sm_vc"
      @click="inputRef_sm_vc?.click()"
    >
      <!-- Estado: sin archivo seleccionado -->
      <template v-if="!archivo_sm_vc">
        <div class="upload-inner_sm_vc">
          <div class="upload-icon-wrap_sm_vc" :class="accentColor">
            <q-icon :name="icon" size="28px" :color="iconColor" />
          </div>
          <div class="upload-text_sm_vc">
            <p class="upload-main_sm_vc">
              Arrastra tu archivo
              <span class="code-tag_sm_vc" :class="`code-tag--${accentColor}_sm_vc`">
                {{ accept }}
              </span>
            </p>
            <p class="upload-sub_sm_vc">o haz clic para seleccionar</p>
          </div>
        </div>
      </template>

      <!-- Estado: archivo seleccionado -->
      <template v-else>
        <div class="upload-inner_sm_vc">
          <div class="upload-icon-wrap_sm_vc done" :class="accentColor">
            <q-icon name="task" size="24px" :color="iconColor" />
          </div>
          <div class="upload-text_sm_vc">
            <p class="upload-file-name_sm_vc">{{ archivo_sm_vc }}</p>
          </div>
          <q-btn
            flat no-caps label="Cambiar" color="grey-5" size="xs"
            @click.stop="limpiar_sm_vc" />
        </div>
      </template>

      <input
        ref="inputRef_sm_vc"
        type="file" :accept="accept" hidden
        @change="handleInput_sm_vc" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  accept: { type: String, default: '.pdf' },
  icon: { type: String, default: 'picture_as_pdf' },
  accentColor: { type: String, default: 'teal' },
  modelValue: { type: String, default: '' },
  /**
   * Nombre del archivo ya subido al servidor.
   * Si está presente, se muestra el chip "Archivo previo" en lugar de la zona de drag & drop.
   * El estudiante puede hacer clic en el nombre para descargar, o en "Cambiar" para subir uno nuevo.
   */
  archivoExistente: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'archivoSeleccionado', 'solicitarDescarga'])

// Controla si mostramos el chip del archivo existente o la zona de subida.
// Inicia como true si hay archivo previo; el estudiante lo puede desactivar.
const modoExistente_sm_vc = ref(true)

const drag_sm_vc = ref(false)
const inputRef_sm_vc = ref(null)

const archivo_sm_vc = computed(() => props.modelValue)

// Se muestra el chip solo si hay archivo en el servidor Y el usuario no pidió cambiar.
const mostrarExistente_sm_vc = computed(
  () => !!props.archivoExistente && modoExistente_sm_vc.value
)

const isAmber_sm_vc = computed(() => props.accentColor === 'amber')

const iconColor_sm_vc = computed(() =>
  props.accentColor === 'amber' ? 'amber-4' : 'teal-3'
)
// Alias sin sufijo para mantener compatibilidad con el template original
const iconColor = iconColor_sm_vc
const colorIcono_sm_vc = iconColor_sm_vc

// Destruye el chip del archivo existente y muestra la zona de drag & drop
const activarModoSubida_sm_vc = () => {
  modoExistente_sm_vc.value = false
}

const procesarArchivo_sm_vc = (file_sm_vc) => {
  if (!file_sm_vc) return
  emit('update:modelValue', file_sm_vc.name)
  emit('archivoSeleccionado', file_sm_vc)
}

const handleInput_sm_vc = (e_sm_vc) => {
  procesarArchivo_sm_vc(e_sm_vc.target.files[0])
}

const handleDrop_sm_vc = (e_sm_vc) => {
  drag_sm_vc.value = false
  procesarArchivo_sm_vc(e_sm_vc.dataTransfer.files[0])
}

const limpiar_sm_vc = () => {
  emit('update:modelValue', '')
  if (inputRef_sm_vc.value) inputRef_sm_vc.value.value = ''
}
</script>

<style scoped>
/* ── Chip de archivo existente ────────────────────────────────────── */
.existing-file-chip_sm_vc {
  display: flex;
  align-items: center;
  gap: .875rem;
  padding: .7rem 1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s;
  margin-bottom: 2px;
}
.existing-file-chip--teal_sm_vc {
  background: rgba(111, 255, 233, .04);
  border-color: rgba(111, 255, 233, .18);
}
.existing-file-chip--amber_sm_vc {
  background: rgba(240, 165, 0, .04);
  border-color: rgba(240, 165, 0, .18);
}

/* Contenedor del ícono */
.ef-icon-wrap_sm_vc {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ef-icon--teal_sm_vc { background: rgba(111, 255, 233, .1); }
.ef-icon--amber_sm_vc { background: rgba(240, 165, 0, .1); }

/* Información del archivo */
.ef-info_sm_vc {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}
.ef-info_sm_vc:hover .ef-name_sm_vc {
  text-decoration: underline;
  opacity: 0.85;
}
.ef-hint_sm_vc {
  display: block;
  font-size: .55rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--sn-texto-apagado);
  margin-bottom: 2px;
  font-family: var(--sn-font-mono);
}
.ef-name_sm_vc {
  display: block;
  font-size: .74rem;
  color: var(--sn-texto-secundario);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--sn-font-mono);
  transition: opacity 0.15s;
}

/* Botón cambiar */
.ef-change-btn_sm_vc {
  flex-shrink: 0;
}

/* ── Zona de drag & drop (idéntica a la original) ─────────────────── */
.upload-zone_sm_vc {
  border: 2px dashed var(--sn-borde-hover);
  border-radius: 10px;
  background: var(--sn-surface-alpha);
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}
.upload-zone_sm_vc:hover { border-color: rgba(111,255,233,.35); background: rgba(111,255,233,.04); }
.upload-zone--alt_sm_vc { border-color: rgba(240,165,0,.15); background: rgba(240,165,0,.02); }
.upload-zone--alt_sm_vc:hover { border-color: rgba(240,165,0,.35); background: rgba(240,165,0,.04); }
.upload-zone--active_sm_vc { border-color: rgba(111,255,233,.6) !important; background: rgba(111,255,233,.07) !important; }
.upload-zone--filled_sm_vc { border-style: solid; border-color: rgba(111,255,233,.25); }
.upload-zone--alt_sm_vc.upload-zone--filled_sm_vc { border-color: rgba(240,165,0,.25); }
.upload-inner_sm_vc { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
.upload-icon-wrap_sm_vc {
  width: 46px; height: 46px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.upload-icon-wrap_sm_vc.teal { background: rgba(111,255,233,.08); }
.upload-icon-wrap_sm_vc.amber { background: rgba(240,165,0,.08); }
.upload-icon-wrap_sm_vc.done { opacity: 0.8; }
.upload-text_sm_vc { flex: 1; }
.upload-main_sm_vc { font-size: .78rem; color: var(--sn-texto-secundario); margin: 0 0 2px; font-family: var(--sn-font-sans); }
.upload-sub_sm_vc { font-size: .62rem; color: var(--sn-texto-apagado); margin: 0; }
.upload-file-name_sm_vc { font-size: .78rem; color: var(--sn-primario); margin: 0; word-break: break-word; }
.code-tag_sm_vc { background: rgba(111,255,233,.08); color: var(--sn-acento-sec); padding: 1px 5px; border-radius: 3px; font-size: .68rem; }
.code-tag--amber_sm_vc { background: rgba(240,165,0,.08); color: var(--sn-advertencia); }
</style>