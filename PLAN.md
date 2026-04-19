# PLAN: Refactorización de Estados y Colisión Semántica

## 🎯 Objetivo General
Resolver el bug crítico donde la evaluación con "OBSERVACIONES" de un documento indiviual causaba el estado global de "REPROBADO" y cerraba accidentalmente la conversación en la UI (debido a colisión semántica de estados).

## 🏛️ Arquitectura de la Solución
**1. Backend (NestJS + Prisma):**
- Modificar `schema.prisma` para agregar el estado formal `OBSERVACIONES` en el enum `EstadoAprobacion`.
- Refactorizar `pasantias.service.ts` eliminando el "Mapeador de Enum" forzado. El backend ahora guardará y emitirá el estado de `OBSERVACIONES` de forma nativa sin hacer by-pass a TypeScript.
- Se removerán los emojis residuales en la trazabilidad de los servicios y se enviarán mensajes más limpios.

**2. Frontend (Vue 3 + Pinia):**
- En `pasantiasStore.js`, incorporar la constante `OBSERVACIONES` a `ESTADO_APROBACION` asignándole su color de alerta y mapeo correspondiente.
- En `DocumentConversacion.vue`, el cómputo de `puedeEscribir_sm_vc` seguirá garantizando el bloqueo de UI solo en estados terminales absolutos (`APROBADO` o `REPROBADO`), permitiendo continuar si es `OBSERVACIONES`.
- En `ConvFormProfesor.vue` y visualmente, reemplazar `block` y `warning_amber` con los íconos oficiales solicitados (`warning text-warning` y `cancel text-negative`).

## ☑️ Checklist Paso a Paso
- [ ] Inyectar `OBSERVACIONES` en `schema.prisma` y sincronizar la base de datos local (Push/Generate).
- [ ] Refactorizar `pasantias.service.ts` para respetar `OBSERVACIONES` y quitar type casting `as any`.
- [ ] Mapear visualmente `OBSERVACIONES` en `pasantiasStore.js`.
- [ ] Actualizar íconos según requerimientos estrictos en `DocumentConversacion.vue` y `ConvFormProfesor.vue`.
- [ ] Conservar nomemclatura `_sm_vc`.
