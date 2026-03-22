# 🛤️ Directrices para el Router (/router/claude.md)

<!--
Comentario general:
Esta guía establece los estándares de configuración del Router en la SPA de SENTINNEL. Exige protección JWT estricta y optimiza el empaquetado inicial usando carga perezosa para todas las vistas, protegiendo así el sistema interno de usuarios no autorizados.
-->

## 🚦 Flujo y Custodia de Navegación

### 1. Lazy Loading Obligatorio
Ninguna vista debe importarse al inicio del archivo global. Usa la importación de componentes asíncrona para dividir el peso de la app:
`component: () => import('pages/Dashboard_sm_vc.vue')`

### 2. Navigation Guards (JWT)
Uso mandatorio de interceptores globales (ej. `router.beforeEach`) o de ruta para:
- Detectar intención de acceso a rutas privadas.
- Validar la existencia y firma del Token JWT.
- Abortar navegación y redirigir limpiamente a `/login` si no hay permisos.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue Router v4 bajo Vue 3.
- **Nomenclatura:** Parámetros y funciones con sufijo `_sm_vc` (ej. `const rutaProtegida_sm_vc = (...) => {}`).
- **ES6 Moderno:** Se destierra la palabra `function`. Todo es declarado por constantes y flechas.
- **Documentación:** Texto instructivo inicial de no más de 150 palabras.
