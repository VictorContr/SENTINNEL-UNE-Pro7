<!-- ══════════════════════════════════════════════════════════════════
     DeployPage.vue (profesor) — Vista del deploy de un estudiante.
     Muestra el panel de solo lectura si ya existe deploy, o el
     formulario de registro. Thin Page; delega al pasantiasStore.
     ══════════════════════════════════════════════════════════════════ -->
<template>
  <q-page class="sntnl-page_sm_vc">
    <q-btn
      flat no-caps icon="arrow_back" label="Volver"
      color="grey-5" size="sm" class="q-mb-md"
      @click="router_sm_vc.back()" />

    <div class="page-header_sm_vc">
      <div class="page-title-row_sm_vc">
        <q-icon name="rocket_launch" size="22px" color="teal-3" class="q-mr-sm" />
        <h1 class="page-title_sm_vc">Deploy del Proyecto Final</h1>
      </div>
      <p class="page-subtitle_sm_vc">
        Estudiante: <span class="code-tag_sm_vc">{{ estudianteId_sm_vc }}</span>
      </p>
    </div>

    <!-- Sin deploy registrado -->
    <div v-if="!deployEstudiante_sm_vc" class="locked-state_sm_vc">
      <q-icon name="pending" size="40px" color="blue-grey-7" />
      <div>
        <p class="locked-title_sm_vc">Sin deploy registrado</p>
        <p class="locked-desc_sm_vc">
          El estudiante aún no ha registrado la URL de producción ni subido el código fuente.
        </p>
      </div>
    </div>

    <!-- Deploy registrado — vista readonly -->
    <div v-else class="deploy-readonly-panel_sm_vc">
      <div class="section-title_sm_vc">
        <q-icon name="rocket_launch" size="16px" color="teal-3" />
        <span>Proyecto Final Registrado</span>
      </div>

      <div class="deploy-field-grid_sm_vc">
        <!-- URL de producción -->
        <div class="deploy-field-item_sm_vc">
          <label class="deploy-field-label_sm_vc">URL de Producción</label>
          <a
            :href="deployEstudiante_sm_vc.url_produccion_sm_vc"
            target="_blank"
            class="deploy-url_sm_vc">
            <q-icon name="open_in_new" size="13px" />
            {{ deployEstudiante_sm_vc.url_produccion_sm_vc }}
          </a>
        </div>

        <!-- Código fuente .zip -->
        <div class="deploy-field-item_sm_vc">
          <label class="deploy-field-label_sm_vc">Código Fuente (.zip)</label>
          <div class="deploy-file-chip_sm_vc border-teal-500/20 bg-teal-500/5">
            <q-icon name="folder_zip" size="14px" color="teal-3" />
            <span class="truncate">{{ deployEstudiante_sm_vc.archivo_codigo_sm_vc?.nombre_sm_vc }}</span>
            <q-btn
              flat dense no-caps label="Descargar"
              color="teal-3" size="xs"
              @click="deployStore_sm_vc.descargarArchivo_sm_vc(estudianteId_sm_vc, 'zip')" />
          </div>
        </div>

        <!-- Documentación .pdf -->
        <div class="deploy-field-item_sm_vc">
          <label class="deploy-field-label_sm_vc">Documentación (.pdf)</label>
          <div class="deploy-file-chip_sm_vc border-amber-500/20 bg-amber-500/5">
            <q-icon name="picture_as_pdf" size="14px" color="amber-4" />
            <span class="truncate">{{ deployEstudiante_sm_vc.documentacion_sm_vc?.nombre_sm_vc }}</span>
            <q-btn
              flat dense no-caps label="Ver PDF"
              color="amber-4" size="xs"
              @click="deployStore_sm_vc.descargarArchivo_sm_vc(estudianteId_sm_vc, 'pdf')" />
          </div>
        </div>

        <!-- Fecha de registro -->
        <div class="deploy-field-item_sm_vc">
          <label class="deploy-field-label_sm_vc">Fecha de Registro</label>
          <span class="deploy-value_sm_vc">
            {{ formatDate_sm_vc(deployEstudiante_sm_vc.fecha_deploy_sm_vc) }}
          </span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeployStore } from 'src/stores/deployStore'

const route_sm_vc = useRoute()
const router_sm_vc = useRouter()
const deployStore_sm_vc = useDeployStore()

const estudianteId_sm_vc = computed(() => Number(route_sm_vc.params.id_sm_vc))

const deployEstudiante_sm_vc = computed(() => deployStore_sm_vc.datosDeploy_sm_vc)

onMounted(() => {
  if (estudianteId_sm_vc.value) {
    deployStore_sm_vc.verificarEstadoDeploy_sm_vc(estudianteId_sm_vc.value)
  }
})

const formatDate_sm_vc = (iso_sm_vc) =>
  new Date(iso_sm_vc).toLocaleDateString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
</script>

<style scoped>
.sntnl-page_sm_vc { padding: 1.75rem 2rem; position: relative; z-index: 1; font-family: var(--sn-font-mono); }
.page-header_sm_vc { margin-bottom: 1.5rem; }
.page-title-row_sm_vc { display: flex; align-items: center; margin-bottom: .25rem; }
.page-title_sm_vc { font-size: 1.2rem; font-weight: 700; color: var(--sn-texto-principal); letter-spacing: .06em; margin: 0; }
.page-subtitle_sm_vc { font-size: .72rem; color: var(--sn-texto-terciario); margin: 0; }
.code-tag_sm_vc { background: rgba(111,255,233,.08); color: var(--sn-acento-sec); padding: 1px 5px; border-radius: 3px; font-size: .68rem; }
.locked-state_sm_vc { display: flex; align-items: center; gap: 1.25rem; padding: 2rem; background: rgba(255,255,255,.02); border: 1px dashed rgba(255,255,255,.07); border-radius: 12px; max-width: 480px; }
.locked-title_sm_vc { font-size: .88rem; font-weight: 600; color: var(--sn-texto-secundario); margin: 0 0 3px; }
.locked-desc_sm_vc { font-size: .75rem; color: var(--sn-texto-apagado); margin: 0; font-family: var(--sn-font-sans); line-height: 1.6; }
.section-title_sm_vc { display: flex; align-items: center; gap: .5rem; font-size: .72rem; font-weight: 600; color: var(--sn-acento-sec); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 1.25rem; }
.deploy-readonly-panel_sm_vc { max-width: 640px; }
.deploy-field-grid_sm_vc { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
.deploy-field-item_sm_vc { display: flex; flex-direction: column; gap: .4rem; }
.deploy-field-label_sm_vc { font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; color: var(--sn-texto-apagado); font-family: var(--sn-font-mono); }
.deploy-url_sm_vc { display: flex; align-items: center; gap: .35rem; font-size: .78rem; color: var(--sn-primario); text-decoration: none; word-break: break-all; }
.deploy-url_sm_vc:hover { text-decoration: underline; }
.deploy-file-chip_sm_vc { display: flex; align-items: center; gap: .4rem; padding: .4rem .75rem; background: rgba(255,255,255,.03); border: 1px solid var(--sn-borde); border-radius: 6px; }
.deploy-file-chip_sm_vc span { font-size: .72rem; color: var(--sn-texto-secundario); flex: 1; }
.deploy-value_sm_vc { font-size: .78rem; color: var(--sn-texto-secundario); }
</style>