# 🛤️ Directrices para el Router (/router/claude.md)

<!--
Comentario general:
Esta guía establece los estándares de configuración del Router en la SPA de SENTINNEL. Optimiza las cargas usando Lazy Loading estricto y salvaguarda las rutas utilizando un perfilamiento de Guardias basados en un modelo de JWT "quemado" que emula la persistencia.
-->

## 🚦 Flujo y Custodia de Navegación

### 1. Lazy Loading Estricto
Toda importación a una vista en rama secundaria será fraccionada y cargada a demanda.
Ejemplo: `component: () => import('pages/GestionUsuarios.vue')`

### 2. Navigation Guards (Sesiones Artificiales)
- Un mock login inyectará un string artificial estático en Session/Local Storage (v.gr., `'JWT_MOCK_PROFESOR_ACTIVO_91XX'`).
- Un `router.beforeEach` se convertirá en portero implacable interrogando si la falsa credencial consta en almacenamiento y empatando contra sus requisitos meta.
- Redirección veloz a `/entrar` si el filtro falla.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue Router v4 en Vue 3.
- **Nomenclatura:** Obligatoriedad transversal en código terminada en `_sm_vc` (ej. `const validarCredencial_sm_vc = (...) => {}`). **Los archivos `.vue` no usan este sufijo.**
- **ES6 Moderno:** Arrow functions para todo middleware sintáctico.
- **Documentación:** Encabezado documentado con máximo 150 palabras de concisión descriptiva.
