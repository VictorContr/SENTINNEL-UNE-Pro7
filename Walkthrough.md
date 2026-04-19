# Walkthrough.md: Bitácora de Diagnóstico y Mitigación de Deuda Técnica

**Fecha de Diagnóstico:** 2026-04-19
**Arquitecto a Cargo:** AntiGravity (Tech Lead)
**Estado:** 🔍 EN DIAGNÓSTICO PRELIMINAR

---

## 🚫 Hallazgos Críticos en Infracción de Reglas Clave

El diagnóstico inicial de la base de código revela violaciones directas a las normativas de arquitectura establecidas, las cuales ponen en riesgo la mantenibilidad y escalabilidad de SENTINNEL-UNE.

### 1. Infracción: Sintaxis Tradicional (Regla 3)
A pesar de la instrucción de usar una infraestructura puramente ES6+, el código aún posee funciones legacy.
- **Backend:** En el archivo principal `main.ts` tenemos `async function bootstrap()`. Esto requiere refactorización para acatar la regla de `const bootstrap_sm_vc = async () => {}` bajo ES6 puro.
- **Frontend:** Hay trazas vivas confirmadas de la palabra reservada `function` en `router/index.js`, `HistorialPage.vue`, `ConversacionPage.vue` y stores como `requisitoContextoStore.js`. Deben migrarse a Arrow Functions de inmediato.

### 2. Infracción: Fugas de Lógica de Negocio (Regla 4 y 6)
Actualmente hay deuda acumulada en separación de responsabilidades:
- **Frontend:** Numerosos `.vue` (como `ConvFormProfesor.vue` en el historial reciente) y otras vistas mapean arreglos o tienen condicionales que deberían estar englobadas en los `Getters` o `Actions` de Pinia.
- **Backend:** Se requiere una evaluación quirúrgica para garantizar que en NestJS ningún Controlador (`.controller.ts`) hace el papel del middleware o procesa lógica compleja (Regla 6 SRP). Todo debe derivar en un `Service_sm_vc`.

### 3. Infracción: Mezcla de Lenguajes y Archivos sueltos (Regla 5)
- **Backend:** Hemos detectado en la raíz y subcarpetas la existencia de scripts como `test_notif.js` y `check_db.js`. El backend en NestJS no debe hospedar `Javascript` suelto. Deben transformarse en utils de `.ts` si tienen funciones en el ecosistema, o borrarse/aislarse si son únicamente bash scripts experimentales, ya que ensucian el tipado estricto.

### 4. Infracción: Anomalías de Sufijos (Reglas 1 y 2)
Aunque ha habido avances integrando `_sm_vc`, un refactor requiere revisar a profundidad:
- Nombres de interfaces como los DTOs, que podrían venir nombrados convencionalmente (`CreateUserDto`) en vez de (`CreateUserDto_sm_vc`).
- Asegurar que variables locales (dentro de Store Actions o Services) tampoco se escapen. Cada iterador o variable derivada de un `map`/`filter` internamente debe usar la nomenclatura `_sm_vc`.

---

## 🛠 Plan de Mitigación Estructural (El "Cómo")

No vamos a "escupir código" de forma descontrolada. Se aplicará este protocolo estricto:

1. **Aislamiento Controlado:** Tomaré un dominio a la vez (ej. Módulo de Pasantías en Backend, luego Módulo de Pasantías en Frontend).
2. **Cirugía Sintáctica:** Reemplazo de palabras `var`, `function` y migración a Constantes Funcionales asíncronas.
3. **Testing de DTOs:** Reforzar con librerías tipo `class-validator` en todos los endpoints, exigiendo que toda respuesta o payload cumpla.
4. **Vaciado de Componentes (Dumping):** Entrar a cada `.vue`, extraer cualquier condicional complejo en los `metohds` y encapsularlos en acciones nativas de su respectivo Store Pinia para obedecer ciegamente la Regla 4.

**Estatus actual:** En pausa. Esperando validación del Plan de Vuelo por parte de Arquitectura (Usuario) para dar lugar a la Fase 1: Backend.
