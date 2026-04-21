# 🚀 BITÁCORA DE VUELO: DESARROLLO TÉCNICO

## 📋 Tarea Actual: Aislamiento y Resolución de Filtros Reactivos en EstudiantesPage
**Estatus:** Completado y Desplegado Localmente.

### 📝 Desarrollo Paso a Paso

1. **Modificación del Payload en Backend (`estudiantes.service.ts`)**
   - **Problema Inicial:** El mapper `mapearEstudianteConProgresoExtendido_sm_vc` destruía el objeto anidado original de Prisma. El frontend recibía un string hueco que no permitía acceder a las propiedades de la materia o del periodo.
   - **Solución Aplicada:** Inyectamos `e.materiaActiva` intacto en el array que se devuelve al frontend. Al haber incluido `include: { periodo: true }` en Prisma, esto asegura que el frontend reciba toda la foto histórica en el primer `GET`.

2. **Reemplazo de Periodos Hardcodeados (`EstudiantesPage.vue`)**
   - **Solución Aplicada:** Añadimos una petición en paralelo en el `onMounted` a `api_vc.get("/periodos")`.
   - **Justificación:** Una aplicación escalable jamás debe tener arrays estáticos. Ahora el `<q-select>` de periodos se llena reactivamente desde la base de datos real.

3. **Inyección de Metadatos en Pinia (`progressBarStore.js`)**
   - **Problema Inicial:** La lógica visual dependía de cruzar datos en el template de forma tosca.
   - **Solución Aplicada:** Añadimos `materia_activa_nombre` y `posicion_sm_vc` a la transformación de Pinia, dejando la data pre-procesada y lista para el consumo. `cohorte` ya estaba correctamente mapeada extrayendo el `nombre_sm_vc` del periodo anidado.

4. **Reactividad de Vue 3 (`computed` y `Map`)**
   - **Solución Aplicada:** El filtro `materiasOpc_sm_vc` usa ahora un `new Map()` indexado por `posicion_sm_vc` (1 al 4) en lugar de un ID crudo.
   - **Justificación:** "Trabajo de Grado I" en el periodo P-163 tiene un ID distinto al "Trabajo de Grado I" de P-164. Si indexáramos por ID, el Select mostraría múltiples opciones repetidas ("Trabajo de Grado I", "Trabajo de Grado I"). Indexar por Posición soluciona el problema de raíz bloqueando los duplicados en la entrada.

5. **Mejoras Visuales (Trazabilidad Inmediata)**
   - **Solución Aplicada:** Reestructuración de los badges de la tarjeta para agrupar visualmente la materia y el periodo activo: `Trabajo de Grado I (P-165)`.
   - **Justificación:** Es imperativo para el usuario (Profesor) ver al instante si un estudiante está rezagado en un periodo viejo o está activo en el nuevo, sin necesidad de dar clics adicionales.

### 🛑 Lo que NO se hizo
* No se modificó ningún archivo del sistema de Notificaciones Admin o `bulk-upload`. Aislar el problema fue la mejor estrategia para no inyectar regresiones en otras partes del ecosistema.

### ⏭️ Próximos Pasos (Si el usuario lo requiere)
* Continuar con el refactor de Notificaciones Admin (`bulk-upload`) en un entorno aislado.
