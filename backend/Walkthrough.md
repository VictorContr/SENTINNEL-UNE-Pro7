# 📄 Walkthrough.md - Bitácora de Vuelo

## 🚀 Estado Actual
- **Fase:** Planificación y Diagnóstico.
- **Acción:** Identificación de vulnerabilidad en `lodash` (<=4.17.23).

## 📝 Decisiones Técnicas
- **Rechazo de `npm audit fix --force`**: Se determinó que la sugerencia de npm rompería el backend al degradar `@nestjs/config` a v1.x (Incompatible con NestJS 11).
- **Elección de `overrides`**: Técnica más limpia y segura para forzar parches en dependencias profundas.

## 🏁 Pendiente
- Implementación de los cambios en `package.json`.
- Validación de integridad.
