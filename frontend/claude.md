### 🚫 Regla Arquitectónica Estricta: Prohibición Absoluta de Objetos Globales (`window`)

En el proyecto SENTINNEL (SGTIP-UNE), queda terminantemente prohibido el uso directo del objeto global `window` en CUALQUIER capa funcional del frontend (componentes, composables o stores). En el ecosistema de Vue 3, la manipulación de la vista recae estrictamente sobre el Virtual DOM, por lo que el entorno del navegador debe mantenerse completamente abstraído para asegurar estabilidad y escalabilidad.

**Mandato de Verificación y Refactorización (Obligatorio):**
Al auditar código heredado o generar código nuevo, es imperativo garantizar la ausencia masiva de llamadas a `window`. Si detectas alguna de estas prácticas, debes detenerte y refactorizar obligatoriamente el código utilizando las herramientas nativas del stack (Vue 3 + Quasar framework) bajo los siguientes criterios:

1. **Navegación y URLs:**
   - ❌ **Prohibido:** `window.location.href`, `window.location.replace()`, `window.open()`.
   - ✅ **Alternativa Obligatoria:** Uso exclusivo de Vue Router. Las instancias deben inyectarse manteniendo las reglas de sufijos: `const router_vc = useRouter();`, empleando `router_vc.push()`. Para componentes de UI, utiliza propiedades nativas como `<q-btn href="...">`.

2. **Responsividad y Dimensiones:**
   - ❌ **Prohibido:** `window.innerWidth`, `window.innerHeight` o el registro explícito de listeners como `window.addEventListener('resize')`.
   - ✅ **Alternativa Obligatoria:** Uso exclusivo del plugin Screen de Quasar. Inyecta el contexto de la siguiente manera: `const $q_vc = useQuasar();` y evalúa el viewport mediante la API reactiva `$q_vc.screen` (ej. `$q_vc.screen.lt.md`).

3. **Almacenamiento (Storage):**
   - ❌ **Prohibido:** `window.localStorage`, `window.sessionStorage`.
   - ✅ **Alternativa Obligatoria:** Emplear el Storage nativo inyectado por Quasar (`$q_vc.localStorage.getItem/setItem`) o en su lugar, delegar todo estado que deba permanecer en el cliente de manera directa al Store de Pinia respetando las convenciones lógicas (la instancia global de Pinia dentro de otra estructura debe mantener el sufijo `_sc`).

4. **Alertas y Confirmaciones (Interacciones Bloqueantes):**
   - ❌ **Prohibido:** `window.alert()`, `window.confirm()`, `window.prompt()`.
   - ✅ **Alternativa Obligatoria:** Uso estricto de modales asíncronos o notificaciones provistas por Quasar. Reemplazar flujos bloqueantes síncronos por promesas empleando `$q_vc.dialog({...})` o alertas fugaces con `$q_vc.notify({...})`.
