# 🧱 Directrices Atómicas de UI (/components/claude.md)

<!--
Comentario general:
Este archivo rige la arquitectura de Componentes Atómicos en SENTINNEL. Prohíbe construir componentes hiperdensos y HTML desde cero cuando puedan resolverse mediante Quasar, pregonando extracciones limpias que operan disociadas de si consumen Mocks de Pinia o APIs Reales.
-->

## ⚛️ Jerarquía de UI y Fragmentación Sensata

### Responsabilidades Asignadas:
1. **Quasar En Primera Línea:** Todo elemento iterado parte desde componentes listos (`<q-file>`, `<q-select>`, `<q-dialog>`), suprimiendo creaciones dudosas basadas solo en puros atributos standard y DOM.
2. **Aniquilación del Código Espagueti:** Tarjetones, modales voluminosos y renglones de chat deberán extraerse bajo encapsulamiento, naciendo archivos como `TarjetaMateriaListada.vue`.
3. **Puntualidad en Modularidad:** El componente atómico expone `defineProps` rigurosos y remite alertas vía `defineEmits`. No dialoga a ciegas con el exterior.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue 3 (`<script setup>`), Quasar v2, Tailwind v4.
- **Nomenclatura:** Variables interinas del módulo terminantes con `_sm_vc` inamovible (ej. `const expandirInfo_sm_vc = ref(false)`). **Los componentes `.vue` NO deben llevar el sufijo en su nombre de archivo.**
- **ES6 Moderno:** Mutaciones con un solo estándar Arrow (ej. `const manejarAccion_sm_vc = () => {}`).
- **Documentación:** Texto humanizado superior no rebasando las 150 palabras.
