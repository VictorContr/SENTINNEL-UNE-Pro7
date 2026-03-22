# 🖼️ Directrices para Layouts Dinámicos (/layouts/claude.md)

<!--
Comentario general:
Este archivo define la construcción de los Layouts en SENTINNEL. Exige el uso estructural maestro de Quasar para la navegación, dictando que los menús dependan reactivamente del JWT quemado temporal dentro del prototipo simulado.
-->

## 📐 Estructuras Maestras y Roles Simulados
Los Layouts no gestionan estados hipercomplejos, se dedican a enclavar secciones perimetrales dinámicas. 

### Responsabilidades Asignadas:
1. **Poderío Quasar:** Emplear exclusivamente componentes fundacionales listos: `<q-layout>`, `<q-header>`, `<q-drawer>`, `<q-page-container>`.
2. **Navegación Dinámica Mockeada:** Acceder al Store en Pinia para leer el rol prefabricado de la sesión temporal y decidir qué hipervínculos arrojar al perfil de profesor o estudiante.
3. **Responsive Delegado:** Implementar el panel offcanvas móvil a través de las bondades directas de Quasar.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue 3 (`<script setup>`), Quasar v2, Tailwind v4, Pinia.
- **Nomenclatura:** Reflejar orden agregando explícitamente el `_sm_vc` a las variables (ej. `const panelMoviendose_sm_vc = ref(false)`). **Los nombres de archivos no llevan el sufijo.**
- **ES6 Moderno:** Metódica por constantes funcionales (`const detectarCierre_sm_vc = () => {}`).
- **Documentación:** Texto de base resumido que no exceda las 150 palabras.
