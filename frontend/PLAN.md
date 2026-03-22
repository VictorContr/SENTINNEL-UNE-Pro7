# 🗺️ PLAN.md - Arquitectura y Estrategia de Refactorización (SENTINNEL)

<!--
Comentario general:
Este documento rige la arquitectura central y la estrategia de refactorización para el frontend de SENTINNEL (SGTIP-UNE). Actúa como la fuente de verdad absoluta para Víctor Contreras y Santiago, garantizando un desarrollo libre de deuda técnica, fuertemente tipado y modular.
-->

## 🎯 Objetivo Arquitectónico
Transformar el frontend actual en una aplicación modular, escalable y mantenible, erradicando los componentes monolíticos. El desarrollo debe separar de manera estricta la capa visual de la capa lógica de negocio.

## 🧪 Arquitectura de Prototipo Funcional (Mock-First)
El sistema operará temporalmente como un **Prototipo Funcional Autónomo** desconectado del backend (NestJS). 
Para la UI, el backend debe parecer 100% real. Pinia se encargará de inyectar datos predefinidos estáticos (Mocks) y simulará la latencia de red mediante Promesas con retrasos artificiales, logrando un flujo operativo completo sin depender de un servidor externo.

## 🏗️ Estrategia y Refactorización
1. **Erradicación de God Components:** Desmantelar componentes gigantes bajo el principio de Responsabilidad Única (SRP).
2. **Centralización Asíncrona:** El flujo de Axios no entra en las vistas visuales. Pinia controlará el Mocking.
3. **Sinergia Quasar/Tailwind:** Quasar v2 administrará componentes atómicos complejos. Tailwind CSS v4 ajustará posicionamiento.

## 📂 Propósito por Directorio
- `/pages`: Vistas orquestadoras aisladas (Thin Pages).
- `/components`: Piezas de UI atómicas.
- `/layouts`: Esqueletos y menús de navegación por roles.
- `/router`: Protección de la app y simulaciones de sesión.
- `/stores`: Manejo de Estado y simulación total del Backend.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Vue 3 (`<script setup>`), Quasar v2, Tailwind v4, Pinia.
- **Nomenclatura:** Variables, estados y métodos finalizan obligatoriamente con `_sm_vc`. **Excepción:** Los nombres de archivos y componentes (ej. `.vue`, `.js`) **NO** deben llevar el sufijo.
- **ES6 Moderno:** Uso absoluto de Arrow Functions (`const inicializar_sm_vc = () => {}`). La palabra reservada `function` queda prohibida.
- **Documentación:** Comentario inicial explicativo en bloque inferior a 150 palabras.
