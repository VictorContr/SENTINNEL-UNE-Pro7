# PLAN.md: Estrategia de Refactorización Estructural (SENTINNEL-UNE)

## 📌 Objetivo General
Ejecutar una refactorización arquitectónica total del sistema SENTINNEL-UNE, asegurando el 100% de la funcionalidad actual, pero elevando la calidad del código a los estándares corporativos requeridos mediante 6 Reglas de Oro inquebrantables.

## 🏗 Arquitectura de Refactorización en Fases

### Fase 1: Saneamiento del Backend (NestJS + Prisma)
**Foco:** Refuerzo de tipado, aplicación de asilamiento de capas (SRP/MVC) y nomenclaturas.

1. **Auditoría de Extensiones (Regla 5):** 
   - Eliminación o migración de cualquier archivo `.js` huérfano dentro de los límites del Backend a `.ts`. NestJS debe ser 100% puro Typecript.
2. **Reestructuración Sintáctica (Regla 3):**
   - Rastrear y sustituir cualquier declaración `function nombre()` por Arrow Functions `const nombre_sm_vc = () => {}` (salvo métodos nativos de clases y decoradores).
3. **Nomenclatura Estricta (Reglas 1 y 2):**
   - Asegurar que todos los DTOs, interfaces, variables locales y funciones utilicen la convención `_sm_vc` (ej: `UsuarioDto_sm_vc`).
   - Validar que los archivos respeten el naming convention limpio: `usuario.service.ts`, `auth.controller.ts`.
4. **Patrón MVC y Principios SOLID (Regla 6):**
   - Auditar Controladores: Deben limitarse exclusivamente a capturar peticiones, validar con `DTOs` e invocar al Servicio. Toda lógica condicional, procesamiento o acceso a Prisma se delega a la capa Service.

### Fase 2: Sanamiento del Frontend (Vue 3 + Pinia)
**Foco:** Separación de responsabilidades, migración de lógica a Pinia y limpieza a ES6 puro.

1. **Limpieza de Tipado (Regla 5):**
   - Validar que no haya TypeScript subyacente. Todo el ecosistema debe ser Javascript puro (`.js`, `.vue`).
2. **Delegación de Responsabilidades (Regla 4):**
   - **Views (`.vue`):** Purgarlas de cualquier transformación de datos. Deberán únicamente consumir estado y emitir acciones de Pinia.
   - **Services:** Convertirlos en puentes mudos (solo Axios calls con Try/Catch). Si procesan datos, moverlo al Action del Store.
   - **Stores (`Pinia`):** Centralizar allí toda regla de negocio (ej. filtrados de `mock_sm_vc`, cálculos de fechas).
3. **Erradicación de Sintaxis Obsoleta y Reglas de Sufijo (Reglas 1, 2 y 3):**
   - Todas las variables reactivas (`ref`, `computed`), mutaciones y acciones de Store llevarán `_sm_vc`.
   - Conversión masiva de `function` y `var` a `const`/`let` + Arrow functions puras.

---

## 🚦 Checklist de Operación

- [ ] Aprobar este PLAN.md.
- [ ] Iniciar Fase 1: Auditar e intervenir de manera quirúrgica `/backend/src`.
- [ ] Ejecutar Testing Backend post-refactor (levantar servidor).
- [ ] Iniciar Fase 2: Auditar componentes `/frontend/src`.
- [ ] Centralizar lógica huérfana en `Stores`.
- [ ] Testing Frontend general (`npm run dev`).

> **NOTA PARA EL ARQUITECTO:** La ejecución será progresiva asumiendo un riesgo bajo al preservar la lógica exacta. Una vez apruebes el documento, comenzaré atacando la Fase 1.
