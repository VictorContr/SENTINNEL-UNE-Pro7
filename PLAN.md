# 🏛️ PLAN DE ARQUITECTURA: FILTROS REACTIVOS Y TARJETAS UI

## 🎯 OBJETIVO GENERAL
Aislar el problema de filtrado y visualización en el panel de Estudiantes. Implementar una solución reactiva, 100% frontend en `computed`, extrayendo la "foto completa" del estudiante en una sola consulta desde el backend.

---

## 🏗️ ARQUITECTURA DE LA SOLUCIÓN

### 1️⃣ Backend: La Raíz de los Datos (NestJS + Prisma)
- **Consulta Anidada:** En `estudiantes.service.ts`, incluir el objeto `materiaActiva` (con su `periodo` anidado) dentro del mapper principal, permitiendo que el payload inicial tenga todo lo necesario.
- **Endpoint Independiente:** El endpoint de `periodos` (`GET /api/periodos`) expuesto para alimentar opciones de select en el frontend sin hardcodear periodos en arrays locales.

### 2️⃣ Frontend: Reactividad Pura (Vue 3 + Quasar)
- **Extracción de Materias con Set/Map:** Computed `materiasOpc_sm_vc` que filtra las materias únicas en base a `posicion_sm_vc`, previniendo que se repita la misma materia proveniente de distintos periodos históricos.
- **Microsegundos de Refresco:** Uso de `computed` (`estudiantesFiltrados_sm_vc`) en lugar de watchers pesados o peticiones a backend repetitivas. Quasar actualizará la DOM reactivamente a medida que cambie `filtroPeriodo_sm_vc` o `filtroMateria_sm_vc`.
- **Badge Visual de Trazabilidad:** Las tarjetas visualizan de manera combinada: `{{ estudiante.materia_activa_nombre }} ({{ estudiante.cohorte }})`.

### 3️⃣ Estandarización de Código
- Mantener sufijos `_sm_vc` y `setup` nativo sin mutaciones manuales al DOM.

---

## ✅ FASES DE LA IMPLEMENTACIÓN
- [x] Backend: Exponer `e.materiaActiva` en la respuesta JSON dentro de `estudiantes.service.ts`.
- [x] Frontend: Llamar `GET /api/periodos` en el `onMounted` y reemplazar array estático.
- [x] Frontend: Refactorizar `progressBarStore.js` para exponer `posicion_sm_vc` y `materia_activa_nombre`.
- [x] Frontend: Re-escribir lógica en `EstudiantesPage.vue` para que filtre las materias únicas en el select apoyándose de un `Map` por posición.
- [x] Frontend: Ajustar la UI de las tarjetas (badges) para mostrar materia + periodo dinámicamente.
