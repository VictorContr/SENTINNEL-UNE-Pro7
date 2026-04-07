# Manual de Arquitectura: Inicialización y Boot (Frontend)

**Ubicación:** `frontend/src/boot/`

## 🎯 Responsabilidad
Esta carpeta contiene los archivos de inicialización y configuración global que Quasar ejecuta antes de que se monte la instancia principal de Vue. Aquí residen elementos fundacionales como la configuración del cliente HTTP (Axios) bajo la instancia `api_vc`, inyección de plugins globales, registro de componentes base y configuraciones de internacionalización (i18n).

## ⚠️ Reglas y Convenciones Estrictas

1. **Cero Lógica de Negocio:**
   - Está **estrictamente prohibido** procesar reglas de dominio o manipular el DOM directamente desde un archivo boot.
   
2. **Cero Aislamiento de Estado (Pinia):**
   - Los archivos boot **no deben** manejar estado reactivo (`ref`, `computed`) ni intentar persistir información compleja en instanciamientos locales. Pinia debe inyectarse a través del callback del boot si (y solo si) es estrictamente necesario, pero se prefiere delegar el estado a `src/stores/`.

3. **Interceptores HTTP Rigurosos:**
   - La configuración de Axios (`api_vc`) debe encargarse de la inyección global de cabeceras, particularmente el token de autorización JWT (`Authorization: Bearer <token>`).
   - El interceptor de respuestas debe interceptar los códigos `401 Unauthorized` o `403 Forbidden` para despachar limpiezas de sesión de forma centralizada.

4. **Nomenclatura Strict JavaScript:**
   - Los objetos inyectados en la configuración de la app de Vue deben usar el sufijo `_sm_vc`.
   - **No TypeScript:** El código será puro JavaScript moderno ES6+.
