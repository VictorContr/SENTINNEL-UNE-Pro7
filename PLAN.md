# Auditoría y Corrección de Reactividad: ConvFormProfesor

## Objetivo
Garantizar el desmontaje síncrono y en tiempo real del formulario de evaluación en la vista conversacional del profesor cuando el estado de la materia pase a `APROBADO` o `REPROBADO`. Se debe asegurar que las actualizaciones de estado local a través de Pinia resuelvan adecuadamente las identidades (IDs) devueltas por el Backend.

## Checklist de Construcción
- [x] **Backend**: Inyectar `estudiante_id_sm_vc` en la inicialización del objeto devuelto por `getProgresoEstudiante_sm_vc` (`pasantias.service.ts`).
- [x] **Frontend (Componente DocumentConversacion)**: Transformar el handler manual de respuestas del profesor (`handleResponderCorreccion_sm_vc`) a función asíncrona (`async/await`) para esperar que el Store rehidrate la data y notifique adecuadamente evitando "fire and forget".
- [x] **Frontend (Componente DocumentConversacion)**: Mantener intacta, pero verificada la computed property `puedeEscribir_sm_vc` para que proceda de manera robustamente reactiva.

## Buenas Prácticas
- Usaremos tipado estricto implícito mediante la consistencia del Backend al devolver campos `estudiante_id_sm_vc` de manera natural y sin parchar el Frontend.
- Las variables y métodos alterados obligatoriamente incluirán o preservarán el sufijo estructurado `_sm_vc` para unificación de nombramientos.
