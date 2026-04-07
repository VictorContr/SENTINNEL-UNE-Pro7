# Manual de Arquitectura: Servicios HTTP (Frontend)

**Ubicación:** `frontend/src/services/`

## 🎯 Responsabilidad
Los archivos en esta capa actúan como la **puerta de enlace exclusiva** hacia el backend. Son repositorios de llamadas a la API que envuelven las peticiones Axios (`api_vc`) aislando la lógica de red del resto de la aplicación.

## ⚠️ Reglas y Convenciones Estrictas

1. **Funciones Puras e Independientes:**
   - Un servicio es solo un contenedor de funciones exportadas asíncronas.
   - **Desacoplamiento total:** Los servicios **NUNCA** deben importar instancias de Pinia (stores) ni de UI de Quasar (`Dialog`, `Notify`). Su único trabajo es ir por la data y regresarla limpia o lanzar el `throw error`.

2. **Convención de Nombres Obligatoria (`_sm_vc`):**
   - El nombre de TODA función exportada debe denotar su acción e incluir el sufijo exigido. Ejemplos obligatorios: `obtenerEstudiantes_sm_vc()`, `actualizarMatricula_sm_vc(payload)`.

3. **Try/Catch Autónomo:**
   - Cada llamado debe manejar su propio bloque `try/catch`. 
   - En caso de error, el servicio extraerá y aplanará el mensaje conflictivo desde `err.response.data.message` (o similar) y luego **propagará el error** usando `throw new Error(...)` para que el Store responsable dispare las notificaciones a la UI.

4. **Sin TypeScript:**
   - Documentar con bloque de comentarios JSDoc si es necesario sobre el signature paramétrico, pero se restringe estrictamente a JavaScript puro.
