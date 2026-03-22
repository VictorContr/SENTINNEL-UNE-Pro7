# 📦 Directrices para Estado y Pinia Mock-First (/stores/claude.md)

<!--
Comentario general:
La ley madre del prototipo SENTINNEL: Pinia asume temporalmente la carga del backend inexistente. Gestiona Mocks, clona retrasos de la red a través de setTimeouts y blinda errores predecibles, preparando un terreno neutro al que solo se le reemplazarán las conexiones Axios a futuro.
-->

## 🧠 El Falso Fuste (El Servidor Fantasma)

### Responsabilidades de Mocking:
1. **Emulación Asíncrona (Promesas + setTimeout):** Las acciones (ej. `enviarInforme_sm_vc`) operarán bajo promesas falsas de resolución controladas para introducir retrasos realistas (600ms - 1200ms) de modo que la UI destelle animadores de carga de manera consecuente.
2. **Data Fija Fidedigna:** Listas, arrays anidados e identidades serán despachadas localmente en este entorno para asegurar operabilidad completa, sin colapsar las `Thin Pages`.
3. **Mapeo de Estados Failsafe:** Obligatoriedad de enclavar `try/catch` ficticio. Toda petición activará `cargando_sm_vc = true` al invocar, y se apaciguará en zona de `finally`.

## ⚖️ Reglas Globales y Exigencias
- **Stack:** Pinia con Composition API en Vue 3.
- **Nomenclatura:** Acciones, Getter, Variables se coronan con `_sm_vc` (ej. `const simularPeticion_sm_vc = async () => {}`). **El nombre del archivo del store no lleva el sufijo.**
- **ES6 Moderno:** Extirpada la palabra `function`. Predominio total de expresiones Arrow Func.
- **Documentación:** Explicación técnica delimitada al estricto rango de 150 palabras iniciales.
