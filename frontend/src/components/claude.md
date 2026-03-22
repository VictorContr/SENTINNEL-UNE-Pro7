# 🧱 Directrices Atómicas de UI (/components/claude.md)

<!--
Comentario general:
Este archivo norma la arquitectura de Componentes Atómicos en SENTINNEL. Elimina las construcciones espartanas en HTML base y exige prioridad sobre el Framework Quasar. Prohíbe mantener código espagueti en archivos grandes para formularios, tarjetas o modales interactivos.
-->

## ⚛️ Jerarquía de UI y Fragmentación Sensata

### Responsabilidades Asignadas:
1. **Quasar First:** Obligación moral de revisar la documentación de Quasar v2 antes de diseñar un input o tabla. Se prefiere usar (`<q-card>`, `<q-btn>`, `<q-dialog>`) en lugar de `divs` crudos estilizados a mano.
2. **Aniquilación del Código Espagueti:** Modales inmensos, barras de chat, y formularios de más de 50 líneas dentro de vistas deben extraerse inmediatamente a un componente [.vue](cci:7://file:///var/www/html/Programacion%207/Project/frontend/src/components/shared/DocumentConversacion.vue:0:0-0:0) propio.
3. **Comportamiento Modular (Props y Emits):** Los componentes encapsulados deben poder insertarse en cualquier lado enviando mutaciones por `defineEmits` y recibiendo variables por `defineProps`.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue 3 (`<script setup>`), Quasar v2, Tailwind v4.
- **Nomenclatura:** Nombres de variables internas y clases exigen el sufijo `_sm_vc`.
- **ES6 Moderno:** Arrow Functions puras (`const cambiarModo_sm_vc = () => {}`). Cero `function`.
- **Documentación:** Resumen inicial en lenguaje humano y sencillo, topando las 150 palabras.
