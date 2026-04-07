# Manual de Arquitectura Backend - Proyecto SENTINNEL

Este documento actúa como el "Manual de Vuelo y Arquitectura" del proyecto SENTINNEL. Cualquier agente, desarrollador o contribuidor debe seguir **ESTRICTAMENTE** estas directivas antes de tocar una sola línea de código en el ecosistema NestJS/Prisma.

## 📌 1. Reglas Globales (Obligatorias)

1. **Uso de Sufijo `_sm_vc`**: Todas las variables, funciones de control, DTOs de respuesta y propiedades en relaciones/modelos que dictan la lógica de negocio deben estar sufijadas obligatoriamente con `_sm_vc` (ej: `id_sm_vc`, `mensajes_sm_vc`, `filas_exitosas_sm_vc`).
2. **Lenguaje**: El backend **DEBE** desarrollarse enteramente en **TypeScript** estructurado con tipado estricto e interfaces claras.
3. **Manejo de Errores**: Todo endpoint o llamado asíncrono debe ir encapsulado en un bloque `try/catch`. Nunca se deben retornar errores no tratados (Status 500 crudos de framework); deben parsearse con `HttpException`, `BadRequestException`, etc.

---

## 🚀 2. Módulo / Carpeta `deploy`

**Propósito**: Controla la subida de los entregables (manuales, URL en vivo, código fuente) por parte de estudiantes que han completado todas sus fases.

- **Reglas de Storage**: 
  - Usar unicamente `memoryStorage` de Multer en el interceptor. 
  - **Prohibido** usar `diskStorage` o guardar estáticos físicos en el arbol de este servidor de backend (se proyecta usar soluciones tipo Buffer o Cloud en las siguientes capas de arquitectura).
- **Reglas de Archivos**: 
  - Limite de peso estricto: **50 MB máximo** para archivos ZIP (código fuente) y **10 MB máximo** para PDF (manuales e informes).
  - Estrategia de nombrado al ser procesados: `[TIMESTAMP]_[CEDULA]_[TIPO_DOCUMENTO]_sm_vc.ext`.
- **Reglas de Seguridad**: 
  - Protección estricta mediante Role-Based Access Control (RBAC).
  - Solo los usuarios tipo ESTUDIANTE con su flag de elegibilidad activo (`puede_hacer_deploy_sm_vc === true`) pueden ejecutar la acción.
  - Validación de expresión regular obligatoria para URLs: deben comenzar con `https://`.

---

## 👥 3. Módulo / Carpeta `usuarios` (Carga Masiva)

**Propósito**: Importación masiva de estudiantes y profesores.

- **Reglas de Transacción**: 
  - Se prohíbe terminantemente usar la instrucción `createMany` para transacciones masivas. El menor error en una fila (restricción por email o cédula repetida) abortaría la petición entera.
  - El sistema **debe usar** iteración segura (`for...of` con try/catches por fila) o Promise orchestration (`Promise.allSettled()`).
- **Tolerancia a fallos**:
  - La respuesta HTTP hacia el frontend debe seguir un patrón híbrido (Estatus 207 Multi-Status o 200 OK con payload informativo).
  - Estructura obligatoria a retornar en el JSON:
    - `filas_exitosas_sm_vc`: [Número]
    - `filas_con_error_sm_vc`: [Número]
    - `detalles_sm_vc`: Array con el desglose exacto (Fila en el excel, Correo, Cédula y Error detectado).

---

## 💬 4. Módulo / Carpeta `conversaciones` (Trazabilidad)

**Propósito**: Historial automático (Logs) de eventos que ocurren sobre la carrera de un estudiante.

- **Reglas de Eventos**: 
  - **No usar Triggers a nivel de Base de Datos**.
  - Todo registro de auditoría en la conversación se realiza **exclusivamente** bajo el patrón PUB/SUB usando Event Emitters (`@nestjs/event-emitter`). Los servicios emiten eventos (ej: `materia.aprobada_sm_vc`) y la capa de conversación escucha e inserta.
- **Estructura JSON (Contrato con el Frontend)**:
  - Todo Endpoint GET que devuelva la trazabilidad a un estudiante debe empaquetar el payload para que el Frontend detecte fácil los arreglos.
  - El arreglo primario donde viene cargada la colección de eventos debe devolverse bajo la clave exacta: `mensajes_sm_vc`.
  - El store de frontend extrae la data como: `data.mensajes_sm_vc`.
