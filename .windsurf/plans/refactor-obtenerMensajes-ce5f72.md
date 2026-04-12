# Refactorización de obtenerMensajes_sm_vc - Estructura Par de Nodos

Implementar la lógica de "Par de Nodos" (Documento + Texto) en la función `obtenerMensajes_sm_vc` para que cada mensaje con archivo vinculado genere dos nodos en el timeline.

## Cambios principales:

1. **Incluir relación documento**: Agregar `include: { documento_sm_vc: { include: { entrega: { include: { requisito: true } } } } }` a la consulta `mensaje.findMany`

2. **Reemplazar .map() por .flatMap()**: Procesar mensajes con lógica de desdoblamiento:
   - Si tiene `documento_sm_vc`: retornar array con 2 objetos (DOCUMENTO + TEXTO)
   - Si no tiene documento: retornar array con 1 objeto (TEXTO)

3. **IDs con prefijo "doc-"**: Los nodos DOCUMENTO deben usar `doc-${documento.id_sm_vc}` para evitar colisiones

4. **Consistencia de fechas**: Ambos nodos (documento y texto) deben compartir la misma `fecha_creacion_sm_vc`

5. **Mantener sufijos _sm_vc**: Todos los campos deben conservar el sufijo requerido

## Estructura del nodo DOCUMENTO:
- `id_sm_vc`: `doc-${doc.id_sm_vc}`
- `tipo_nodo_sm_vc`: 'DOCUMENTO'
- `archivo_nombre_sm_vc`, `ruta_archivo_sm_vc`, `tamanio_sm_vc`
- `mock_sm_vc`, `estado_sm_vc`, `requisito_id_sm_vc`, `materia_id_sm_vc`
- `fecha_creacion_sm_vc`: igual al mensaje

## Estructura del nodo TEXTO:
- `id_sm_vc`: mensaje.id_sm_vc
- `tipo_nodo_sm_vc`: 'TEXTO'
- `contenido_sm_vc`, `es_sistema_sm_vc`, `materia_id_sm_vc`
- `fecha_creacion_sm_vc`: mensaje.fecha_creacion_sm_vc
