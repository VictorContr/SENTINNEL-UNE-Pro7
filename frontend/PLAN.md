# 🗺️ PLAN.md - Arquitectura y Estrategia de Refactorización (SENTINNEL)

<!--
Comentario general:
Este documento rige la arquitectura central y la estrategia de refactorización para el frontend de SENTINNEL (SGTIP-UNE). Actúa como la fuente de verdad absoluta para Víctor Contreras y Santiago, garantizando un desarrollo libre de deuda técnica, fuertemente tipado y modular.
-->

## 🎯 Objetivo Arquitectónico
Transformar el frontend actual en una aplicación modular, escalable y mantenible. Nuestro principal oponente son los componentes monolíticos. El desarrollo debe separar de manera estricta la capa visual de la capa lógica de negocio.

## 🏗️ Estrategia y Refactorización
1. **Erradicación de God Components:** Todo componente que mezcle responsabilidad de interfaz, modales pesados y peticiones HTTP debe ser desmantelado usando el principio de Responsabilidad Única (SRP).
2. **Centralización Asíncrona:** El flujo de Axios no tiene cabida en los componentes visuales. Pinia centralizará las peticiones al backend.
3. **Sinergia Quasar/Tailwind:** Quasar v2 aportará todos los elementos complejos (modales, tablas, inputs). Tailwind CSS v4 se reserva exclusivamente para alineación, márgenes y diseño profundo.

## 📂 Propósito por Directorio
- `/pages`: Vistas orquestadoras (Thin Pages).
- `/components`: Piezas de UI atómicas e independientes.
- `/layouts`: Estructuras maestras para navegación por roles.
- `/router`: Control de acceso y Lazy Loading.
- `/stores`: Manejo de estado global, Getters y Axios.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue 3 (`<script setup>`), Quasar Framework v2, Tailwind CSS v4, Pinia.
- **Nomenclatura:** Variables, funciones, stores y clases propias exigen el sufijo `_sm_vc`.
- **ES6 Moderno:** Prohibido el uso de `function`. Se exige uso de Arrow Functions (`const inicializar_sm_vc = () => {}`). Solo se tolera la excepción en asincronía si se prefiere (`async function`), aunque se prioriza `const metodo_sm_vc = async () => {}`.
- **Documentación:** Cada sección de código lleva un comentario inicial en español, claro y no mayor a 150 palabras.
