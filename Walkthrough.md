# 🛸 Walkthrough: Bitácora de Vuelo de AntiGravity

## 📌 Contexto
Se completó auditoría y refactor del flujo de "Reprobación de Materia". Antes, el frontend enviaba un estado de "REPROBADO" sin identificar el payload adecuado ni inhabilitar la UI consecuentemente, lo que provocaba una excepción 400 del Backend (requería `entrega_id_sm_vc` por defecto para evaluación puntual). 

## 🛠️ Modificaciones y Decisiones (Sprint: Resolución de Reprobación)

### 1. Reajuste de Esquemas en Pasantías DTO (Backend)
- `backend/src/pasantias/dto/evaluar-entrega.dto.ts` ✅ **Implementado**
- **Por qué:** Aplicamos `@ValidateIf` para condicionalmente tolerar transacciones que NO posean el ID de una entrega (`entrega_id_sm_vc = null`), de manera que el sistema comprenda que estamos abortando globalmente, y en su lugar exigimos `estudiante_id` y `materia_id`. Validar DTOs con la capa de `class-validator` y `class-transformer` previene mutaciones inesperadas y 500 Internals. 

### 2. Controlador de Pasantías (Backend)
- `backend/src/pasantias/pasantias.controller.ts` ✅ **Implementado**
- **Por qué:** El endpoint ahora intercepta si posee el flag de *Reprobación Global*. Redirige la data cruda, ya limpia mediante el interceptor de DTO a un método transaccional de Pasantías Service adaptado.

### 3. Función `reprobarMateriaGlobal_sm_vc` en `PasantiasService` (Backend)
- `backend/src/pasantias/pasantias.service.ts` ✅ **Implementado**
- **Por qué:** Un ciclo iterativo basado en los requisitos formales de la materia, iterando y forzando con `upsert` que se escriban las entregas como "REPROBADAS", más el guardado global en evaluaciones. Tras la transacción ACID exitosa emitimos por Gateway. 

### 4. Modificaciones en el Store Pinia (Frontend)
- `frontend/src/stores/pasantiasStore.js` ✅ **Implementado**
- **Por qué:** Al disparar la reprobación desde el modal, el formData de `responderCorreccion` ahora acopla los id forzosos (estudiante y materia).

### 5. Interfaz Restrictiva (Frontend)
- `frontend/src/components/shared/DocumentConversacion.vue` ✅ **Implementado**
- **Por qué:** Hemos agregado la directiva condicional computada que verifica si `props.estadoProgreso === "REPROBADO"`. Cortamos del DOM (`v-if`) cualquier capa de inputs impidiendo enviar cosas adicionales. Además inyectamos el cartel de `.readonly-banner-reprobado_sm_vc`.

### 🚨 Conclusión
La base de código se mantiene fiel a SOLID y DRY preservando `EstadoAprobacion.REPROBADO` en vez de migraciones nuevas. La transición funcionará de forma natural cuando ocurra el cambio semestral y la UI vuelva al estado "PENDIENTE".
