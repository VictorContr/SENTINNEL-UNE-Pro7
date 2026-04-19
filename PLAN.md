# 🧠 PLAN: AntiGravity Tech Lead

## 🎯 Objetivo General
Auditar y rediseñar la lógica de la acción "Reprobar" del formulario del Profesor en SENTINNEL-UNE, asegurando que cuando el profesor tome la decisión de reprobar a un alumno globalmente, esta se persista en base de datos correctamente sin intentar vincularse forzosamente a una única entrega asíncrona y bloquee permanentemente el uso de la sala de chat ("modulo historial").

## 🏛️ Arquitectura de la Solución (Lógica de Negocio Reprobación Global)
1. **Backend - Nuevos Contratos DTO** (`backend/src/pasantias/dto/evaluar-entrega.dto.ts`):
   - Definir un DTO con `class-validator` utilizando `@ValidateIf` para requerir el `estudiante_id` y `materia_id` cuando `es_reprobacion_global_sm_vc` sea verdadero.
   - Refactorizar el controlador `/pasantias/evaluar-entrega` para inyectar este DTO y re-direccionar el flujo hacia el nuevo método de negocio.

2. **Backend - Método Transaccional** (`backend/src/pasantias/pasantias.service.ts`):
   - Implementar `reprobarMateriaGlobal_sm_vc` utilizando `$transaction` de Prisma, el cual barrerá todos los requisitos de la materia (independientemente si no estaban entregados) y forzará artificialmente su existencia para setearlos todos a `REPROBADO`.
   - Escribir en el historial del chat un mensaje automático del profesor y enviar la notificación de Sistema.
   - Emitir evento de 'reprobado' por WebSockets.

3. **Frontend - Adaptación de Stores y UI** (`frontend/src/stores/pasantiasStore.js`, `DocumentConversacion.vue`):
   - Modificar store `pasantiasStore` para inyectar el identificador del alumno y de la materia al array FormData.
   - Computar en `DocumentConversacion.vue` de forma estricta que si la propiedad transitiva devuelve `estadoProgreso === 'REPROBADO'` se retorne FALSO y se remueva la interfaz completa del formulario, mostrando el banner de lectura "Historial".

## 📋 Checklist de Implementación
- [x] Crear DTO de control de "Reprobación condicional".
- [x] Refactor en el Backend (`Controller` + `Service`).
- [x] Refactor en el Store del Frontend con datos paramétricos extra.
- [x] Refactor UI de componentes para bloquear interacciones.

## 🛡️ Buenas Prácticas y Filosofía
- **Inmutabilidad y Auditoría Directa:** No queremos mutar el Enum de la base de datos `EstadoAprobacion` con subestados, la historia de "Intento = X" con "REPROBADO" será la firma pura para auditoría.
- **Transaccionalidad Rigurosa:** Requisitos incompletos deben persistir por defecto como reprobados al fallar la cursada.
