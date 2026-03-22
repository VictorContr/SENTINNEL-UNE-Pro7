# 📦 Directrices para Estado y Pinia (/stores/claude.md)

<!--
Comentario general:
Este documento es la ley absoluta para el manejo de estados en SENTINNEL. Define a Pinia como el núcleo asíncrono y de lógica de negocio, delegándole exclusivamente el trato de Axios, la mutación de arrays complejos y las capturas de error global.
-->

## 🧠 El Cerebro Asíncrono de SENTINNEL

### Responsabilidades Asignadas:
1. **Exclusividad Axios:** Ningún componente [.vue](cci:7://file:///var/www/html/Programacion%207/Project/frontend/src/components/shared/DocumentConversacion.vue:0:0-0:0) invocará a Axios. Toda comunicación de red va en la raíz de las `actions` de Pinia.
2. **Failsafes (Try/Catch):** Toda petición asíncrona vivirá bajo un implacable bloque `try/catch`. 
3. **Loading Flags:** Se insta a gestionar una variable de estado reactivo global o sectorizada: `cargando_sm_vc = true` al inicio de la petición y `false` en en la resolución (`finally`).
4. **Cálculos Complejos a Getters:** Las transformaciones de colecciones masivas o reglas de negocio condicionadas se resuelven a través de Getters cacheados.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Pinia con Composition API.
- **Nomenclatura:** Estado global finaliza en `_sm_vc` (ej. `const informesRechazados_sm_vc = ref([])`). 
- **ES6 Moderno:** Regla férrea de Arrow Functions. `const solicitarAPI_sm_vc = async () => {}`.
- **Documentación:** Encabezado documentado con máximo 150 palabras directas en español.
