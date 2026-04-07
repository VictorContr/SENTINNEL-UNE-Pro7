# Manual de Arquitectura: Evaluaciones y Lógica Académica (Backend)

**Ubicación:** `backend/src/evaluaciones/` (y similares que incluyan lógica de aprobación)

## 🎯 Responsabilidad
Corazón de la plataforma académica. Este módulo dictamina cuándo un estudiante atraviesa con éxito las fases impuestas por la UNE (ej. pasa de Investigación y Desarrollo a Seminario de Grado). Aplica porcentajes mínimos de evaluación, suma de hitos y consolidación de expedientes.

## ⚠️ Reglas y Convenciones Estrictas

1. **Controladores Desnudos (Fat Service, Thin Controller):**
   - **Prohibición Total** de lógica de negocio o manejo de condicionales en el Controller. El archivo del controlador se limitará exclusivamente a mapear la ruta y delegar el payload al método correspondiente del servicio (`evaluaciones.service.ts`).

2. **Event-Driven Architecture (PUB/SUB Puro):**
   - Cada vez que ocurra un evento crítico de cambio de estado (P. ej., el estudiante aprueba), está **prohibido escribir directamente en tablas no relacionadas (ej. Triggers de BD o inyecciones manuales)**. 
   - Se debe obligatoriamente emitir un evento con `@nestjs/event-emitter`. Por ejemplo: `this.eventEmitter.emit('materia.aprobada_sm_vc', { estudianteId, descripcion_sm_vc })`. Esto permite que el módulo de `Conversaciones` trabe silenciosamente el registro en background.

3. **Desacoplamiento Estricto:**
   - Este módulo confía ciegamente en el servicio de Prisma, pero no depende de importar módulos transversales. Si requiere interactuar grandemente con otro dominio, utiliza los eventos.

4. **Variables Taxativas:**
   - La validación del dictamen (notas, estados de aprobación booleanos) requerirá instanciar variables y mutadores finales siempre terminados en `_sm_vc`.
