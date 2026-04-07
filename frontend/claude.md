# Manual de Arquitectura Frontend - Proyecto SENTINNEL

Este documento actúa como el "Manual de Vuelo y Arquitectura" del proyecto SENTINNEL. Cualquier agente, desarrollador o contribuidor debe seguir **ESTRICTAMENTE** estas directivas antes de tocar una sola línea de código en el ecosistema Vue 3 (Composition API) / Quasar.

## 📌 1. Reglas Globales (Obligatorias)

1. **Lenguaje Estricto**: El frontend **NO USA TypeScript**. Se desarrollará enteramente con **JavaScript puro** usando la Composition API (`<script setup>`). Queda rotundamente prohibido inyectar lang="ts" en las vistas de Vue o crear archivos `.ts`.
2. **Uso de Sufijo `_sm_vc`**: Todas las variables reactivas (`ref()`, `computed()`), funciones, requests, responses y propiedades lógicas deben finalizar con `_sm_vc` (ej: `cargando_sm_vc`, `obtenerConversacion_sm_vc`).
3. **Manejo de Estados de Carga (Spinners)**: Variables de UI como `cargando_sm_vc` DEBEN siempre tener una limpieza obligatoria. Se apagarán (`.value = false`) dentro del bloque `finally` de todo try/catch. Se prohíben las cargas infinitas (UX Silences).

---

## 🏛 2. Componentes UI (Thin Views vs Fat Stores)

- **Patrón "Thin View"**: Los componentes (`.vue`) son estúpidos; su única misión es el enrutamiento visual, data binding y accionar disparadores hacia Pinia (P. Ej: un `@click="usuariosStore.crear(...)`).
- **Patrón "Fat Store"**: La capa de Pinia (en `src/stores/`) maneja el peso del estado global (REST APIs, Axios, mutaciones y lógica de negocio).
- **Prohibición**: Se limitarán las inyecciones de instancias como `api.post(...)` o `api.get(...)` nativas desde un componente `.vue`, excepto en componentes estructurales atípicos. Específicamente, cualquier upload complejo (carga masiva) debe pasar por el Store.

---

## 👥 3. Módulo de Carga Masiva (`usuariosStore.js` / Frontend)

- **Consumo Híbrido**: El componente visual de carga de Excel (`q-uploader`) debe estar enlazado a una "Custom Action" hacia el Store, no al proxy HTTP nativo de Quasar.
- **Validación del Objeto de Respuesta**: El store detectará qué filas triunfaron y cuáles no. Debe consumir exactamente `filas_exitosas_sm_vc` y `filas_con_error_sm_vc`.
- **UX**: Notificaciones manejadas globalmente mediante `Notify.create` tras la carga. Los errores de validación de fila rebotados por Prisma se pintarán en la Tabla del UI para ser corregidos manualmente por el usuario.

---

## 💬 4. Módulo de Conversaciones (Trazabilidad)

- **Reactividad Defensiva**: El store (`conversacionStore.js`) no asume que el backend devolverá la colección en crudo. Extraerá el array del payload basándose en el contrato del backend (`conversaciones_sm_vc.value = data.mensajes_sm_vc || []`).
- **Renderizado Seguro**: Un componente tipo `q-timeline` utilizará `v-for="msg in conversaciones_sm_vc"` únicamente sabiendo que Pinia lo provee ya estructurado como Array iterable verdadero.

---

## 🚀 5. Módulo de Deploy (Estudiante)

- **Restricciones de UI**: Ocultar el panel o botonera de Deploy hasta verificar a través del User Auth que `puede_hacer_deploy_sm_vc` es verdadero.
- **Envío Multipart**: La carga de archivos binarios (Zip e Informes) se prepara en un objeto `FormData` que se delega a `deployStore.js`.
