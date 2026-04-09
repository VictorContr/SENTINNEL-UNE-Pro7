import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { LocalStorage, Notify } from "quasar";
import {
  login_sm_vc,
  cambiarClaveInicial_sm_vc as cambiarClaveService_sm_vc,
} from "src/services/authService";
import { purgarContextoRequisitos_sm_vc } from "src/stores/requisitoContextoStore";
import { decryptSession_sm_vc } from "src/stores/cryptoStore";

/**
 * SENTINNEL – authStore
 * Manejo global de autenticación JWT y estado de sesión.
 */
export const useAuthStore = defineStore("auth", () => {
  /* ── State ─────────────────────────────────────────────────── */
  const user_sm_vc = ref(null);
  const token_sm_vc = ref(null);
  const loading_sm_vc = ref(false);
  const error_sm_vc = ref(null);

  /* ── Hydrate from localStorage ──────────────────────────────── */
  const _hidratar_sm_vc = async () => {
    try {
      const stored_sm_vc = LocalStorage.getItem("sentinnel_session");
      if (stored_sm_vc && typeof stored_sm_vc === "string") {
        // Decrypt the encrypted session from backend
        const decrypted_sm_vc = await decryptSession_sm_vc(stored_sm_vc);
        user_sm_vc.value = decrypted_sm_vc.user;
        token_sm_vc.value = decrypted_sm_vc.token;
      }
    } catch (err) {
      console.error("Error decrypting session:", err);
      LocalStorage.remove("sentinnel_session");
      LocalStorage.remove("token_sm_vc");
    }
  };
  // Async hydrate - will be called after store creation
  const hydratePromise = _hidratar_sm_vc();

  /* ── Getters ─────────────────────────────────────────────────
   *
   * FIX #7: Se agrega el getter puede_hacer_deploy_sm_vc
   *
   * Lee el flag desde el perfil de estudiante anidado en el
   * objeto de usuario que devuelve el endpoint /auth/login.
   * Esto evita que los componentes accedan a
   * `auth.user?.estudiante_sm_vc?.puede_hacer_deploy_sm_vc`
   * directamente (código frágil y difícil de mantener).
   * ────────────────────────────────────────────────────────── */
  const is_authenticated_sm_vc = computed(
    () => !!token_sm_vc.value && !!user_sm_vc.value,
  );

  const rol_sm_vc = computed(() => user_sm_vc.value?.rol_sm_vc ?? null);

  const is_admin_sm_vc = computed(
    () => rol_sm_vc.value === "ADMINISTRADOR" || rol_sm_vc.value === "ADMIN",
  );
  const is_profesor_sm_vc = computed(() => rol_sm_vc.value === "PROFESOR");
  const is_estudiante_sm_vc = computed(() => rol_sm_vc.value === "ESTUDIANTE");

  /**
   * FIX #7 — Getter centralizado para el flag de deploy.
   *
   * El backend devuelve el perfil de estudiante anidado como
   * `user.estudiante_sm_vc` en el response del login. Este getter
   * lo normaliza para que router y componentes lo usen de forma
   * uniforme sin acoplarse a la estructura interna del objeto.
   */
  const puede_hacer_deploy_sm_vc = computed(
    () => user_sm_vc.value?.estudiante_sm_vc?.puede_hacer_deploy_sm_vc === true,
  );

  const nombreCorto_sm_vc = computed(() => {
    if (!user_sm_vc.value?.nombre_sm_vc) return "";
    return user_sm_vc.value.nombre_sm_vc.split(" ")[0];
  });

  /* ── Actions ─────────────────────────────────────────────────── */
  const action_login_sm_vc = async (correo_input_sm_vc, clave_input_sm_vc) => {
    loading_sm_vc.value = true;
    error_sm_vc.value = null;

    try {
      const data_sm_vc = await login_sm_vc(
        correo_input_sm_vc.trim().toLowerCase(),
        clave_input_sm_vc,
      );

      if (data_sm_vc.requires_password_change) {
        return {
          requires_password_change: true,
          user: data_sm_vc.user_sm_vc || data_sm_vc.usuario_sm_vc,
        };
      }

      user_sm_vc.value =
        data_sm_vc.user_sm_vc || data_sm_vc.usuario_sm_vc || data_sm_vc.user;
      token_sm_vc.value =
        data_sm_vc.access_token_sm_vc ||
        data_sm_vc.token ||
        data_sm_vc.access_token;

      // Store the encrypted session from backend (not plain JSON)
      if (data_sm_vc.session_encrypted_sm_vc) {
        LocalStorage.set(
          "sentinnel_session",
          data_sm_vc.session_encrypted_sm_vc,
        );
      }
      LocalStorage.set("token_sm_vc", token_sm_vc.value);

      Notify.create({
        message: `Bienvenido, ${user_sm_vc.value?.nombre_sm_vc || ""}`,
        color: "positive",
        icon: "check_circle",
      });

      return true;
    } catch (err_sm_vc) {
      error_sm_vc.value =
        err_sm_vc.response?.data?.message ||
        err_sm_vc?.message ||
        "Error inesperado al iniciar sesión.";
      Notify.create({
        message: error_sm_vc.value,
        color: "negative",
        icon: "error",
      });
      return false;
    } finally {
      // FIX reactividad: siempre se libera el estado de carga
      loading_sm_vc.value = false;
    }
  };

  const cambiar_clave_inicial_sm_vc = async (
    correo_sm_vc,
    clave_temporal_sm_vc,
    nueva_clave_sm_vc,
  ) => {
    loading_sm_vc.value = true;
    error_sm_vc.value = null;
    try {
      const resp_sm_vc = await cambiarClaveService_sm_vc(
        correo_sm_vc,
        clave_temporal_sm_vc,
        nueva_clave_sm_vc,
      );
      Notify.create({
        message: resp_sm_vc.message || "Contraseña cambiada exitosamente.",
        color: "positive",
      });
      return true;
    } catch (err_sm_vc) {
      error_sm_vc.value =
        err_sm_vc.response?.data?.message ||
        err_sm_vc?.message ||
        "Error al cambiar la contraseña.";
      Notify.create({
        message: error_sm_vc.value,
        color: "negative",
        icon: "error",
      });
      return false;
    } finally {
      loading_sm_vc.value = false;
    }
  };

  const verificarExpiracion_sm_vc = () => {
    if (!token_sm_vc.value) return false;

    try {
      // Usamos atob para decodificar la segunda parte (payload) del JWT
      const payloadBase64_sm_vc = token_sm_vc.value.split(".")[1];
      const payload_sm_vc = JSON.parse(atob(payloadBase64_sm_vc));

      // Multiplicamos por 1000 porque exp viene en segundos; Date.now() es ms
      const tiempoExpiracion_sm_vc = payload_sm_vc.exp * 1000;

      if (Date.now() >= tiempoExpiracion_sm_vc) {
        return true;
      }
      return false;
    } catch (e_sm_vc) {
      console.error("Error al decodificar el token:", e_sm_vc);
      // Si el token es inválido o no se puede decodificar, lo consideramos expirado por seguridad
      return true;
    }
  };

  const logout_sm_vc = (motivo_sm_vc = "manual") => {
    user_sm_vc.value = null;
    token_sm_vc.value = null;

    // Purga TODA la información del localStorage (sesión, tokens previos, caché de materias, etc.)
    LocalStorage.clear();

    // Purga todas las claves de contexto de requisito de forma explícita por seguridad (en caso de que localStorage.clear falle en algun SSR)
    purgarContextoRequisitos_sm_vc();

    if (motivo_sm_vc === "expirado") {
      Notify.create({
        type: "negative",
        message: "Su sesión ha expirado por seguridad.",
        caption: "Por favor, inicie sesión nuevamente.",
        icon: "lock_clock",
        position: "top",
        timeout: 4500,
      });
    } else {
      Notify.create({
        message: "Sesión finalizada correctamente",
        color: "info",
        icon: "info",
      });
    }
  };

  return {
    /* State */
    user_sm_vc,
    token_sm_vc,
    loading_sm_vc,
    error_sm_vc,

    /* Getters */
    is_authenticated_sm_vc,
    rol_sm_vc,
    is_admin_sm_vc,
    is_profesor_sm_vc,
    is_estudiante_sm_vc,
    puede_hacer_deploy_sm_vc, // ← FIX #7
    nombreCorto_sm_vc,

    /* Alias legacy (usado en MainLayout.vue como auth.nombreCorto) */
    get nombreCorto() {
      return nombreCorto_sm_vc.value;
    },

    /* Actions */
    login_sm_vc: action_login_sm_vc,
    logout_sm_vc,
    cambiar_clave_inicial_sm_vc,
    verificarExpiracion_sm_vc,

    /* Hydration */
    _hydratePromise: hydratePromise,
  };
});
