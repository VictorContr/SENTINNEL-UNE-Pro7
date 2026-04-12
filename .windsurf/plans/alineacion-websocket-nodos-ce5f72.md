# Alineación WebSocket - Estructura Par de Nodos

Alinear el formato de emisión WebSocket con el HTTP GET para que ambos envíen el mismo array de nodos desdoblados.

## Backend (ConversacionesService.ts)

1. **Refactorizar `formatearNodoTimeline_sm_vc`**:
   - Cambiar retorno de `Record<string, unknown>` a `Record<string, unknown>[]`
   - Si tiene documento: retornar `[nodoDocumento, nodoTexto]`
   - Si no tiene documento: retornar `[nodoTexto]`

2. **Actualizar emisiones**:
   - `registrarMensajeSistema_sm_vc`: Ya usa `formatearNodoTimeline_sm_vc`, se arregla automáticamente
   - `registrarMensajeManual_sm_vc`: Ya usa `formatearNodoTimeline_sm_vc`, se arregla automáticamente

## Backend (chat.gateway.ts)

1. **Importar `ConversacionesService`** para acceder al formateador (ya está importado)
2. **`handleSendMessage_sm_vc`**: Usar `formatearNodoTimeline_sm_vc` en el ACK para enviar el array de nodos
3. **`handleMensajeCreado_sm_vc`**: El payload ya viene formateado desde ConversacionesService

## Frontend (chatStore_sm_vc.js)

1. **Actualizar `_inyectarMensajeEnStore_sm_vc`**:
   ```javascript
   const _inyectarMensajeEnStore_sm_vc = (mensaje_sm_vc) => {
     import("src/stores/conversacionStore").then(
       ({ useConversacionStore_sm_vc }) => {
         const conversacionStore_sm_vc = useConversacionStore_sm_vc();
         if (Array.isArray(mensaje_sm_vc)) {
           conversacionStore_sm_vc.conversaciones_sm_vc.push(...mensaje_sm_vc);
         } else {
           conversacionStore_sm_vc.conversaciones_sm_vc.push(mensaje_sm_vc);
         }
       },
     );
   };
   ```

## Reglas de calidad:
- Mantener sufijos `_sm_vc` estrictamente
- IDs de documento con prefijo `doc-`
- Fechas consistentes entre nodos del par
