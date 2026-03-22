# 📄 Directrices para Vistas Únicas (/pages/claude.md)

<!--
Comentario general:
Este documento rige la creación de Páginas en SENTINNEL. Obliga al equipo a mantener componentes de página "tontos" (Thin Pages) cuya única tarea es acoplar subcomponentes y despachar acciones del estado, sin importar si los datos provienen de un mock temporal o del backend final.
-->

## 🧩 Regla de Oro: Thin Pages
Las vistas principales sirven únicamente como el esqueleto lógico central para ensamblar la interfaz de usuario. Tienen estrictamente prohibida la lógica de reglas de negocio profunda.

### Responsabilidades Asignadas:
1. **Ensamblaje Visual:** Importar y alinear componentes agnósticos provenientes del directorio `/components`.
2. **Reacción del Ciclo de Vida:** Disparar de manera ciega las acciones asíncronas de Pinia desde los hooks como `onMounted`.
3. **Agnosticismo del Backend:** La vista UI desconoce por completo que interactúa con un prototipo falso. Todo dato se asume fidedigno y se mapea mediante Getters estructurados.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue 3 (`<script setup>`), Quasar v2, Tailwind v4, Pinia.
- **Nomenclatura:** Propiedades y constantes exigen su sufijo identitario `_sm_vc`. **Los nombres de archivos `.vue` quedan exentos de esta regla.**
- **ES6 Moderno:** Cero declaraciones clásicas por `function`. Funciones flecha al mando (`const montarVista_sm_vc = () => {}`).
- **Documentación:** Referencia descriptiva tope de 150 palabras.
