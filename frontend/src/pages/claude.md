# 📄 Directrices para Vistas Únicas (/pages/claude.md)

<!--
Comentario general:
Este documento rige la creación de Páginas en SENTINNEL. Obliga al equipo a mantener componentes de página "tontos" (Thin Pages) cuya única tarea es acoplar subcomponentes y despachar acciones del estado, sin ensuciarse con lógica de negocio pesada.
-->

## 🧩 Regla de Oro: Thin Pages
Las vistas principales de la aplicación sirven únicamente como el esqueleto lógico para ensamblar la interfaz de usuario. Tienen prohibido el cálculo profundo de datos.

### Responsabilidades Asignadas:
1. **Ensamblaje Visual:** Importar y alinear componentes provenientes del directorio `/components`.
2. **Reacción del Ciclo de Vida:** Disparar acciones iniciales de Pinia a través de hooks del ciclo de vida como `onMounted`.
3. **Consumo de Getters:** Leer datos procesados directamente a través de Getters del Store (ej. leer una tabla filtrada en Pinia en vez de filtrarla en la vista).

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue 3 (`<script setup>`), Quasar v2, Tailwind v4, Pinia.
- **Nomenclatura:** Toda variable en la vista finaliza con `_sm_vc`.
- **ES6 Moderno:** Exclusividad de Arrow Functions. Ejemplo: `const montarVista_sm_vc = () => {}`.
- **Documentación:** Comentario superior conciso, en español, límite estricto de 150 palabras.
