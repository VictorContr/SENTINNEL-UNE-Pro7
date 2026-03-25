<!-- ══════════════════════════════════════════════════════════════════
     DeployPage.vue (estudiante) — Registro del deploy final.
     Thin Page: toda la lógica de validación y estado vive en computed
     y en el pasantiasStore. Extrae DeployUploadZone y DeployChecklist.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <q-btn
      flat no-caps icon="arrow_back" label="Volver"
      color="grey-5" size="sm" class="q-mb-md"
      @click="router_sm_vc.push('/estudiante/trazabilidad')" />

    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="rocket_launch" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Registrar Deploy Final</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Solo habilitado cuando las 3 materias estén aprobadas.
      </p>
    </div>

    <!-- Estado bloqueado -->
    <div v-if="!store_sm_vc.todasAprobadas" class="locked-state_sm_vc">
      <div class="locked-icon_sm_vc">
        <q-icon name="lock" size="32px" color="blue-grey-7" />
      </div>
      <div>
        <p class="locked-title_sm_vc">Formulario bloqueado</p>
        <p class="locked-desc_sm_vc">
          Debes aprobar las 3 materias antes de registrar tu deploy.
        </p>
        <div class="locked-progress_sm_vc">
          <div
            v-for="mat in store_sm_vc.miProgreso"
            :key="mat.id_sm_vc"
            class="lock-mat_sm_vc">
            <q-icon
              :name="mat.estado_aprobacion_sm_vc === 'APROBADO'
                ? 'check_circle' : 'radio_button_unchecked'"
              :color="mat.estado_aprobacion_sm_vc === 'APROBADO'
                ? 'teal-4' : 'blue-grey-8'"
              size="14px" />
            <span>{{ mat.nombre_sm_vc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario activo -->
    <template v-else>
      <!-- Banner de deploy existente -->
      <div v-if="store_sm_vc.miDeploy" class="existing-deploy-banner_sm_vc">
        <q-icon name="info" size="16px" color="teal-3" />
        <span>Ya tienes un deploy registrado. Puedes actualizarlo.</span>
        <div class="existing-url_sm_vc">
          <q-icon name="link" size="12px" color="teal-3" />
          <a :href="store_sm_vc.miDeploy.url_produccion_sm_vc"
            target="_blank" class="url-link_sm_vc">
            {{ store_sm_vc.miDeploy.url_produccion_sm_vc }}
          </a>
        </div>
      </div>

      <div class="section-notice_sm_vc">
        <q-icon name="check_circle" size="16px" color="teal-4" />
        <span>Todas tus materias están aprobadas. Completa los datos a continuación.</span>
      </div>

      <q-form @submit.prevent="registrarDeploy_sm_vc" class="deploy-form_sm_vc">
        <!-- URL producción -->
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            URL de Producción <span class="req-mark_sm_vc">*</span>
            <q-icon name="help_outline" size="12px" color="blue-grey-6" class="q-ml-xs">
              <q-tooltip class="bg-dark text-caption">
                URL donde está desplegada tu app (Netlify, Vercel, Railway…)
              </q-tooltip>
            </q-icon>
          </label>
          <q-input
            v-model="form_sm_vc.url_produccion_sm_vc"
            dense outlined color="teal-3" class="sntnl-input_sm_vc"
            :placeholder="store_sm_vc.miDeploy?.url_produccion_sm_vc
              || 'https://mi-proyecto.netlify.app'"
            :rules="[
              val => !!val || 'Campo requerido',
              val => /^https?:\/\/.+/.test(val) || 'URL inválida'
            ]">
            <template #prepend>
              <q-icon name="link" color="teal-3" size="18px" />
            </template>
          </q-input>
        </div>

        <!-- Código fuente .zip -->
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            Código Fuente <span class="req-mark_sm_vc">*</span>
            <span class="format-hint_sm_vc">.zip</span>
          </label>
          <DeployUploadZone
            v-model="form_sm_vc.archivo_codigo_nombre_sm_vc"
            accept=".zip"
            icon="folder_zip"
            accent-color="teal" />
        </div>

        <!-- Documentación .pdf -->
        <div class="field-group_sm_vc">
          <label class="field-label_sm_vc">
            Documentación Técnica <span class="req-mark_sm_vc">*</span>
            <span class="format-hint_sm_vc">.pdf</span>
          </label>
          <DeployUploadZone
            v-model="form_sm_vc.documentacion_nombre_sm_vc"
            accept=".pdf"
            icon="picture_as_pdf"
            accent-color="amber" />
        </div>

        <!-- Checklist preflight -->
        <DeployChecklist :checks="preflightChecks_sm_vc" />

        <q-btn
          type="submit" unelevated no-caps
          :label="store_sm_vc.miDeploy ? 'Actualizar Deploy' : 'Registrar Deploy'"
          icon="rocket_launch"
          class="submit-btn_sm_vc"
          :loading="submitting_sm_vc"
          :disable="!todosOk_sm_vc" >
          <template #loading>
            <q-spinner-dots color="#0b132b" size="20px" />
            <span class="q-ml-sm loader-text_sm_vc">Registrando…</span>
          </template>
        </q-btn>
      </q-form>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { usePasantiasStore } from 'src/stores/pasantiasStore'
import DeployUploadZone from 'src/components/shared/deploy/DeployUploadZone.vue'
import DeployChecklist from 'src/components/shared/deploy/DeployChecklist.vue'

const router_sm_vc = useRouter()
const $q_sm_vc = useQuasar()
const store_sm_vc = usePasantiasStore()

const submitting_sm_vc = ref(false)

const form_sm_vc = ref({
  url_produccion_sm_vc: store_sm_vc.miDeploy?.url_produccion_sm_vc ?? '',
  archivo_codigo_nombre_sm_vc: '',
  documentacion_nombre_sm_vc: ''
})

const preflightChecks_sm_vc = computed(() => [
  {
    label: 'URL de producción ingresada',
    ok: /^https?:\/\/.+/.test(form_sm_vc.value.url_produccion_sm_vc)
  },
  {
    label: 'Archivo de código .zip adjunto',
    ok: !!form_sm_vc.value.archivo_codigo_nombre_sm_vc
  },
  {
    label: 'Documentación técnica .pdf adjunta',
    ok: !!form_sm_vc.value.documentacion_nombre_sm_vc
  },
  {
    label: 'Todas las materias aprobadas',
    ok: store_sm_vc.todasAprobadas
  }
])

const todosOk_sm_vc = computed(() =>
  preflightChecks_sm_vc.value.every((c) => c.ok)
)

const registrarDeploy_sm_vc = async () => {
  submitting_sm_vc.value = true
  await new Promise((r) => setTimeout(r, 1200))
  store_sm_vc.registrarDeploy({
    url_produccion_sm_vc: form_sm_vc.value.url_produccion_sm_vc,
    archivo_codigo_nombre: form_sm_vc.value.archivo_codigo_nombre_sm_vc,
    documentacion_nombre: form_sm_vc.value.documentacion_nombre_sm_vc
  })
  submitting_sm_vc.value = false
  $q_sm_vc.notify({
    type: 'positive',
    message: '¡Deploy registrado exitosamente!',
    caption: form_sm_vc.value.url_produccion_sm_vc,
    icon: 'rocket_launch',
    position: 'top-right',
    timeout: 5000
  })
  router_sm_vc.push('/estudiante/trazabilidad')
}
</script>

<style scoped>
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; font-family: var(--sn-font-mono); }
.page-header_sm_vc { margin-bottom: 1.5rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.page-title_sm_vc { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: .06em; margin: 0; }
.page-subtitle_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; font-family: var(--sn-font-sans); }
.locked-state_sm_vc { display: flex; align-items: flex-start; gap: 1.25rem; padding: 1.5rem; background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.07); border-radius: 12px; max-width: 480px; }
.locked-icon_sm_vc { flex-shrink: 0; }
.locked-title_sm_vc { font-size: .88rem; font-weight: 600; color: var(--sn-texto-secundario); margin: 0 0 4px; }
.locked-desc_sm_vc { font-size: .75rem; color: var(--sn-texto-apagado); margin: 0 0 .75rem; font-family: var(--sn-font-sans); }
.locked-progress_sm_vc { display: flex; flex-direction: column; gap: .3rem; }
.lock-mat_sm_vc { display: flex; align-items: center; gap: .4rem; font-size: .68rem; color: var(--sn-texto-terciario); }
.existing-deploy-banner_sm_vc { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; padding: .75rem 1rem; background: rgba(111,255,233,.04); border: 1px solid rgba(111,255,233,.12); border-radius: 8px; margin-bottom: 1rem; max-width: 600px; font-size: .72rem; color: var(--sn-acento-sec); }
.existing-url_sm_vc { display: flex; align-items: center; gap: .3rem; }
.url-link_sm_vc { color: var(--sn-primario); text-decoration: none; font-size: .7rem; }
.url-link_sm_vc:hover { text-decoration: underline; }
.section-notice_sm_vc { display: flex; align-items: center; gap: .5rem; font-size: .72rem; color: var(--sn-acento-sec); background: rgba(111,255,233,.05); border: 1px solid rgba(111,255,233,.15); border-radius: 8px; padding: .6rem .875rem; margin-bottom: 1.5rem; max-width: 520px; font-family: var(--sn-font-sans); }
.deploy-form_sm_vc { display: flex; flex-direction: column; gap: 1.25rem; max-width: 520px; }
.field-group_sm_vc { display: flex; flex-direction: column; gap: .35rem; }
.field-label_sm_vc { font-size: .62rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sn-acento-sec); font-weight: 500; display: flex; align-items: center; gap: .35rem; }
.req-mark_sm_vc { color: var(--sn-error-claro); }
.format-hint_sm_vc { font-size: .55rem; background: rgba(255,255,255,.05); padding: 1px 5px; border-radius: 3px; color: var(--sn-texto-terciario); }
:deep(.sntnl-input_sm_vc .q-field__control) { background: rgba(255,255,255,.03) !important; border: 1px solid rgba(91,192,190,.2) !important; border-radius: 6px !important; }
:deep(.sntnl-input_sm_vc .q-field__native) { color: var(--sn-texto-principal) !important; font-size: .82rem !important; font-family: var(--sn-font-mono) !important; }
.submit-btn_sm_vc { background: #6fffe9 !important; color: #0b132b !important; font-size: .75rem !important; font-weight: 700 !important; letter-spacing: .1em !important; border-radius: 6px !important; padding: .6rem 1.5rem !important; box-shadow: 0 0 20px rgba(111,255,233,.2); align-self: flex-start; }
.submit-btn_sm_vc:not(:disabled):hover { box-shadow: 0 0 30px rgba(111,255,233,.35) !important; transform: translateY(-1px); }
.submit-btn_sm_vc:disabled { opacity: .4 !important; }
.loader-text_sm_vc { color: #0b132b; font-weight: 700; font-size: .72rem; }
</style>