// =============================================================
// SRC/STORES/CONTACTOSTORE.JS — Store Pinia del Formulario
//
// Gestiona el estado y la lógica del formulario de contacto
// de la Landing Page. Delega el transporte HTTP a contactoService.js
// y provee feedback al usuario via $q.notify (mismo patrón que
// testimoniosStore.js).
// =============================================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { enviarContacto_sm_vc as postContacto_sm_vc } from 'src/services/contactoService.js';

export const useContactoStore = defineStore('contacto', () => {
  const $q_sm_vc = useQuasar();

  /* ── State ── */
  const enviando_sm_vc = ref(false);  // true mientras la petición HTTP está en vuelo
  const exito_sm_vc    = ref(false);  // true cuando el correo se envió correctamente
  const error_sm_vc    = ref(null);   // string con el mensaje de error o null

  /* ── Action principal ── */
  /**
   * Envía el formulario de contacto al backend NestJS.
   * Muestra notificaciones Quasar en caso de éxito o fallo.
   *
   * @param {{ nombre_sm_vc: string, cedula_sm_vc: string, correo_sm_vc: string, asunto_sm_vc: string }} datos_sm_vc
   */
  const enviarFormulario_sm_vc = async (datos_sm_vc) => {
    enviando_sm_vc.value = true;
    exito_sm_vc.value    = false;
    error_sm_vc.value    = null;

    try {
      await postContacto_sm_vc(datos_sm_vc);
      exito_sm_vc.value = true;

      $q_sm_vc.notify({
        type:     'positive',
        message:  '¡Mensaje enviado!',
        caption:  'Nos pondremos en contacto contigo pronto.',
        icon:     'check_circle',
        position: 'top-right',
        timeout:  5000,
      });
    } catch (err_sm_vc) {
      console.error('[contactoStore] Error al enviar formulario:', err_sm_vc);
      let errorMsg = err_sm_vc?.response?.data?.message ?? err_sm_vc?.message ?? 'Error desconocido';
      
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(' ');
      }
      
      error_sm_vc.value = errorMsg;

      $q_sm_vc.notify({
        type:     'negative',
        message:  'No se pudo enviar el mensaje',
        caption:  error_sm_vc.value,
        icon:     'error_outline',
        position: 'top-right',
        timeout:  6000,
      });
    } finally {
      enviando_sm_vc.value = false;
    }
  };

  /* ── Resetear formulario ── */
  const resetear_sm_vc = () => {
    exito_sm_vc.value  = false;
    error_sm_vc.value  = null;
  };

  return {
    enviando_sm_vc,
    exito_sm_vc,
    error_sm_vc,
    enviarFormulario_sm_vc,
    resetear_sm_vc,
  };
});
