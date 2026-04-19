# Bitácora de Vuelo: Personalización de Sección de Autores

**Fecha:** 2026-04-19 | **Diagnóstico:** AntiGravity | **Estado:** ✅ IMPLEMENTADO

## ¿Qué se implementó?

1. **Vincular Imagen de Perfil de Víctor Contreras:**
   - **Problema:** Los perfiles de los desarrolladores en la landing page usaban imágenes generadas por `ui-avatars.com`. Aunque funcionales, no daban la sensación de "producto premium" y "humanos reales" que se busca.
   - **Solución:** Sustituir dinámicamente el placeholder por el asset `Victor Contreras.jpg` ubicado en la carpeta de recursos del frontend mediante importación ESM en Vite.
   - **Por qué:** Cumplir con la regla de diseño de "Rich Aesthetics" y "No placeholders", elevando la calidad visual de la sección de créditos.

2. **Limpieza de Código (Linting):**
   - **Problema:** La variable `color1_sm_vc` quedó huérfana tras eliminar el placeholder de Víctor, provocando un fallo en la compilación por la regla `no-unused-vars` de ESLint.
   - **Solución:** Eliminación de la constante redundante en el `computed` de desarrolladores.
   - **Por qué:** Mantener un codebase limpio y libre de advertencias de compilación.

## Siguientes Pasos
- [x] Aplicar el cambio en `AutoresSection.vue`.
- [x] Verificar la resolución del asset en el servidor de desarrollo mediante `npm run dev`.
