<!-- ══════════════════════════════════════════════════════════════════
     DeployUploadZone.vue — Zona de arrastre/selección de archivo.
     Componente atómico reutilizable por ambas páginas de Deploy.
     Recibe 'accept', 'accentColor' y emite 'archivoSeleccionado'.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <div
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
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  accept: { type: String, default: '.pdf' },
  icon: { type: String, default: 'picture_as_pdf' },
  accentColor: { type: String, default: 'teal' },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'archivoSeleccionado'])

const drag_sm_vc = ref(false)
const inputRef_sm_vc = ref(null)

const archivo_sm_vc = computed(() => props.modelValue)

const iconColor_sm_vc = computed(() =>
  props.accentColor === 'amber' ? 'amber-4' : 'teal-3'
)
const iconColor = iconColor_sm_vc

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