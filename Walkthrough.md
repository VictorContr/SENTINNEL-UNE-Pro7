# Bitácora de Vuelo: Corrección de Reactividad ConvFormProfesor

## ¿Qué se implementó y por qué?

1. **Resolución de la Identidad en Backend (getProgresoEstudiante_sm_vc):**
   - **Problema:** El componente de Vue (y Pinia) esperaba la propiedad `estudiante_id_sm_vc` dentro de cada objeto del arreglo de progreso devuelto para poder compararlo con el ID de la URL. Al ser devuelto como `undefined`, el estado actual quedaba permanentemente como `'PENDIENTE'`.
   - **Solución:** Se añadió el mapeo explícito de `estudiante_id_sm_vc: estudianteBase.id_sm_vc` en `pasantias.service.ts` dentro de la función `getProgresoEstudiante_sm_vc`.
   - **Por qué:** Mantener el Backend como fuente de la verdad estricta.

2. **Resolución de Async/Await en Frontend (DocumentConversacion.vue):**
   - **Problema:** En el componente padre (`DocumentConversacion`), la función `handleResponderCorreccion_sm_vc` emitía un evento de éxito sin esperar (`await`) a que `pasantiasStore_sm_vc.responderCorreccion` finalizara el flujo asíncrono hacia el servidor.
   - **Solución:** Se transformó el handler a `async` y se implementó un `await`. Además, la notificación síncrona solo se emite cuando la respuesta del servidor es exitosa.
   - **Por qué:** Prevenir "race conditions" (condiciones de carrera) entre la respuesta visual del UI y el completamiento de los mutate del Store, asegurando que cuando el UI pregunte si puede renderizar el componente (en `puedeEscribir_sm_vc`), el Store de Pinia ya tenga en memoria el nuevo estado general (ej: `REPROBADO` o `APROBADO`) desabilitando el formulario instantáneamente.

## Siguientes Pasos
- Las correcciones abren la puerta a flujos completamente fluidos. Pinia mantendrá de manera síncrona la fidelidad visual, permitiéndole a **WebSockets** enfocarse únicamente en el tráfico para las notificaciones entre el profesor y el estudiante, sin latencias locales.

---

# Bitácora de Vuelo: Corrección de Reactividad — TrazabilidadPage (Cambio de Período)

**Fecha:** 2026-04-19 | **Diagnóstico:** AntiGravity | **Estado:** ✅ IMPLEMENTADO

## Root Cause: "Muerte por Cache Local" (Triada de Fallos)

El bug de "datos que no se renderizan en el primer intento tras un cambio de período" fue causado por tres fallos concurrentes:

| # | Componente | Fallo | Síntoma |
|---|---|---|---|
| 1 | `pasantiasStore.js` | `procesarCambioPeriodo_sm_vc` vaciaba `progreso_sm_vc` pero nunca lo rehidrataba. Solo hacía `fetch_materias_sm_vc()`. | Store en estado "zombie": vacío pero sin pedir datos nuevos. |
| 2 | `TrazabilidadPage.vue` | La única fuente de datos era `onMounted`. Si el componente ya estaba vivo cuando el período cambió, nunca se re-ejecutaba el fetch. | UI en blanco; obligaba a navegar o recargar la página. |
| 3 | `watchEffect` del Stepper | Guard `if (stepActivo_sm_vc.value) return` congelaba el stepper en su posición anterior aunque llegaran datos de un período completamente diferente. | Stepper no se reposicionaba con los datos del período nuevo. |

**Hallazgo adicional (MainLayout.vue L.271):** El layout ya usa `:key="currentRoute.fullPath"` en el `<router-view>`, por lo que el componente **SÍ se desmonta y remonta** al navigar entre rutas distintas. El problema de "primer render" ocurría porque el store estaba en un estado zombie ANTES de que la vista se montara.

## Parches Aplicados

### Parche 1 — `pasantiasStore.js`
**Por qué:** La rehidratación parcial (solo materias) dejaba `progreso_sm_vc = []`. El componente recibía un array vacío como dato "válido" y la UI quedaba en blanco.

**Solución:** `procesarCambioPeriodo_sm_vc` ahora ejecuta un `Promise.all([fetch_materias_sm_vc(), fetch_mi_progreso_sm_vc()])` en paralelo tras el reset atómico del estado.

### Parche 2 — `TrazabilidadPage.vue` (Estudiante y Profesor)
**Por qué:** No había mecanismo de detección de cambio de período mientras el componente estaba vivo en el DOM.

**Solución:** Se importó `usePeriodoStore` y se añadió un `watch(() => periodo_sm_vc.periodoActual_sm_vc, ...)` con `{ flush: 'post' }`. Cuando el admin ejecuta un Roll-Forward, el watcher detecta el cambio, resetea `stepActivo_sm_vc = null` y ejecuta un re-fetch del progreso. La guarda `!periodoPrevio_sm_vc` previene la doble carga al montar.

### Parche 3 — `watchEffect` del Stepper (Estudiante y Profesor)
**Por qué:** El guard `if (stepActivo_sm_vc.value) return` era demasiado agresivo. Impedía cualquier reposicionamiento aunque los datos subyacentes hubieran cambiado completamente.

**Solución:** Se sustituyó por una verificación inteligente de existencia: `lista_sm_vc.some(m => m.id_sm_vc === stepActivo_sm_vc.value)`. Si el ID activo actual ya no existe en la nueva lista de materias, se reposiciona en la primera desbloqueada. Si el ID sí existe, preserva la navegación manual del usuario.

## Archivos Modificados
- `frontend/src/stores/pasantiasStore.js`
- `frontend/src/pages/estudiante/TrazabilidadPage.vue`
- `frontend/src/pages/profesor/TrazabilidadPage.vue`

