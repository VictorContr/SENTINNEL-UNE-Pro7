# Plan de Vuelo: Personalización de Sección de Autores

## Objetivo
Refinar la estética de la sección `AutoresSection.vue` integrando recursos visuales reales en lugar de placeholders. Específicamente, se debe vincular la imagen de perfil de Víctor Contreras.

## Checklist de Construcción
- [x] **Preparación**: Identificar ruta del asset en `frontend/src/assets/Victor Contreras.jpg`.
- [x] **Frontend (AutoresSection.vue)**: Importar el recurso estático mediante ESM (Vite).
- [x] **Frontend (AutoresSection.vue)**: Vincular el recurso importado a la propiedad `avatarUrl_sm_vc` del perfil de Víctor.
- [x] **Verificación**: Comprobar que el fallback de Vite maneje correctamente el espacio en el nombre del archivo ("Victor Contreras.jpg").

## Buenas Prácticas
- Usaremos la sintaxis de importación de Vite para asegurar que el hash de producción se genere correctamente.
- Mantendremos la arquitectura de `computed` para la reactividad de colores y temas.
