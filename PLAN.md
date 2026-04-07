# 📄 PLAN.md — Arquitectura de Solución (Fix: Bug ID Null y Frontend Linters)

## 🎯 Objetivo General
Resolver la falta del ID primario en el JSON de conversacion y eliminar los errores del linter ESLint en el frontend debido a funciones declaradas y no utilizadas, garantizando un flujo correcto de Smart vs Dumb component.

## 🏗️ Arquitectura de la Solución

### 1. Backend: Garantizar retorno completo (Upsert de Conversación)
En `conversaciones.service.ts`:
- Refactorizaremos el método `obtenerMensajes_sm_vc(estudianteId: number)`.
- Reemplazamos la búsqueda pasiva con una verificación: Si no existe la conversación, se creará un registro vacío para el estudiante.
- Ampliaremos la consulta de `documentos` para incluir `entrega { requisito_id_sm_vc, estado_sm_vc }` y enviarlo al payload.
- Devolvemos estructuradamente el ID no nulo.

### 2. Frontend: Limpieza de ESLint y Smart/Dumb Components
En `ConvMessages.vue`:
- Se utilizaran `bgColor_sm_vc`, `getRequisitoNombre_sm_vc` e `evalIcon_sm_vc` en el `<template>`.
- Evitaremos quemar "DOCUMENTO FRONTEND". Mostraremos el leguaje y nombre real del requisito de forma dinámica (`getRequisitoNombre_sm_vc`).
- Aprovecharemos `evalIcon_sm_vc` para asignar el icono adecuado de check de UI en base al estado del documento.

### 3. Uso de Mocks: Descargas vs Demo
En `ConvMessages.vue -> handleAccionArchivo_sm_vc`:
- Se aplicará el short-circuit (notify + return) si `mock_sm_vc` del mensaje es true.
- El resto utilizará conectividad con un servicio Axios.

## 🛡️ Buenas Prácticas Aplicadas
- **Early Return:** En el caso de encontrar mocks.
- **Fail-safe Backend:** Al crear automáticamente el registro de conversacion para evitar que otras lógicas truenen.
- **Dumb Component:** `ConvMessages.vue` confía ciegamente en sus props.
