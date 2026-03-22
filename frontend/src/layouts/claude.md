# 🖼️ Directrices para Layouts Dinámicos (/layouts/claude.md)

<!--
Comentario general:
Este archivo define la construcción de los Layouts en SENTINNEL. Exige el uso del ecosistema estructural de Quasar para la navegación y ordena la reactividad de la arquitectura de la plantilla basada en el rol del usuario activo.
-->

## 📐 Estructuras Maestras y Roles
Los componentes de diseño principal no deben lidiar con lógica aislada de módulos. Solo resuelven el mapeo global de la aplicación.

### Responsabilidades Asignadas:
1. **Poderío Quasar:** Emplear exclusivamente componentes envolventes como `<q-layout>`, `<q-header>`, `<q-drawer>` y `<q-page-container>`.
2. **Navegación Dinámica:** Los enlaces del menú (sidebars) deben mostrarse u ocultarse condicionalmente tras interceptar el rol o estado de verificación del usuario actual desde el JWT o Pinia.
3. **Responsive Delegado:** Construir interfaces que se plieguen nativamente en dispositivos móviles gracias al grid propio de Quasar.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue 3 (`<script setup>`), Quasar v2, Tailwind v4, Pinia.
- **Nomenclatura:** Toda métrica, variable o función lleva el sufijo `_sm_vc`.
- **ES6 Moderno:** Arrow Functions puras (`const alternarPanel_sm_vc = () => {}`).
- **Documentación:** Bloque de comentario principal restringido a 150 palabras métricas.
