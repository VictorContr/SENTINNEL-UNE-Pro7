# Walkthrough.md — Bitácora de Vuelo SENTINNEL

**Misión:** Corregir el error de identidades en la trazabilidad del profesor (ID Estudiante vs ID Usuario).  
**Estatus:** 🛠️ En Planificación  
**Sufijo Obligatorio:** `_sm_vc`

---

## 📋 Bitácora de Operaciones

### 1. Investigación y Diagnóstico (Completado)
- [x] Identificación de discrepancia en `EstudiantesPage.vue` vs `TrazabilidadPage.vue`.
- [x] Verificación de endpoints en el backend (`estudiantes.controller.ts`).
- [x] Análisis de `usersStore.js` y `pasantiasStore.js`.
- [x] Confirmación con el cliente sobre la restricción de no tocar `TrazabilidadLayout.vue`.

### 2. Actualización de Infraestructura Frontend (Completado)
- [x] Implementar `getDetalleEstudiante_sm_vc` en `estudiantesService.js`.
- [x] Refactorizar carga de datos en `TrazabilidadPage.vue` (Profesor) de forma secuencial.

### 3. Disambiguación de Identidades en Backend (Completado)
- [x] Refactorizar `pasantias.service.ts` para buscar el progreso estrictamente por `usuario_id` o `estudiante_id`.
- [x] Actualizar `pasantias.controller.ts` para enviar el flag de identidad correspondiente en base a quién hace la solicitud (Módulo Estudiante vs Módulo Profesor).

---

## 🚀 Decisiones Técnicas

| Decisión | Razón |
| :--- | :--- |
| **Uso de `/estudiantes/:id/detalle`** | Permite obtener el usuario vinculado usando solo el Student ID, eliminando la necesidad de que el front conozca el User ID de antemano. |
| **Inyección Manual en `usersStore`** | Evitamos crear nuevos métodos de búsqueda en el store de usuarios y reciclamos la reactividad del objeto `usuarioActual_sm_vc`. Se agruparon las propiedades bajo `estudiante_sm_vc` para máxima compatibilidad con el resto de la UI. |

---

## 🛡️ Pendiente según PLAN.md
- [x] Validar que la ficha del estudiante cargue correctamente para "Victor".
- [x] Asegurar que el stepper de materias no pierda funcionalidad.
