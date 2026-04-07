# 📄 Walkthrough.md — La Bitácora de Vuelo (Reestructuración Integral del Módulo Conversación)

## 🏁 Estado Actual: OPERATIVO
Backend y Frontend en línea con el flujo de datos correcto.

---

## 🛠️ Acciones Realizadas (Sesión Actual)

### 1. Fix Backend — Null ID Bug (Conversaciones)
- **Problema:** `id_sm_vc: null` en la respuesta del endpoint `/api/conversaciones/:id`.
- **Causa Raíz:** Se usaba `findUnique` (pasivo), lo que no creaba el registro si el estudiante aún no tenía conversación, retornando `null`.
- **Solución:** Migración a `upsert()`: garantiza que el registro de conversación **siempre exista** antes de devolver el JSON. `id_sm_vc` ahora es siempre un entero válido.

### 2. Fix Backend — Foreign Key Constraint (P2003)
- **Problema:** `ForeignKeyConstraintViolation` al ejecutar el `upsert`.
- **Causa Raíz:** El frontend enviaba el `usuario_id_sm_vc = 9` pero la FK de `Conversacion` exige el `Estudiante.id_sm_vc` (que es distinto).
- **Solución:** Implementado un "Traductor de Identidades" en el servicio: el endpoint ejecuta un `findFirst` con `OR [{ id_sm_vc }, { usuario_id_sm_vc }]` para resolver el ID correcto del `Estudiante` y el del `Usuario` antes de operar.

### 3. Fix Backend — Data Enriquecida
- El query de `documento.findMany` ahora hace `include: { entrega: true }` para transportar `requisito_id_sm_vc` y `estado_sm_vc` al payload del frontend. Esto elimina la necesidad de IDs crudos en la UI.

### 4. Reestructuración Integral del Frontend (Smart vs. Dumb Components)

#### `DocumentConversacion.vue` (Smart Component — Orquestador)
- Declarado formalmente el prop `esTrazabilidad_sm_vc: Boolean`.
- Implementado `watch(idEstudianteFinal_sm_vc)` para recargar automáticamente al navegar entre estudiantes.
- Agregado `mensajesOrdenados_sm_vc` como `computed` con `.sort()` de seguridad en el frontend (cronológico ascendente) para garantizar el orden fiel al JSON del backend.
- Alternancia condicional: `ConvTimeline` si `esTrazabilidad_sm_vc` es `true`, `ConvMessages` si es `false`.

#### `ConvTimeline.vue` (Dumb Component — Timeline)
- **Reescritura total**: soporte polimórfico para nodos `TEXTO` y `DOCUMENTO`.
- **Diferenciación visual:**
  - Log de Sistema (`es_sistema = true`): borde izquierdo `teal`, ícono `verified`.
  - Mensaje de Estudiante (`es_sistema = false`): borde izquierdo `amber`, ícono `chat`.
  - Tarjeta de Documento: card compacta con franja de color según `estado_sm_vc` (verde=APROBADO, rojo=REPROBADO, azul=ENTREGADO, gris=PENDIENTE).
- Botones de descarga condicionados a `mock_sm_vc`.

#### `ConvMessages.vue` (Dumb Component — Chat)
- **Reescritura total**: todas las funciones helpers (`bgColor`, `evalIcon`, `getRequisitoNombre`) correctamente usadas en el template — ESLint limpio.
- IDs de requisito reemplazados por nombres legibles vía `getRequisitoNombre_sm_vc`.
- Franja lateral de color en cards por estado de aprobación.
- Lógica de `handleAccionArchivo_sm_vc`: early return con `Notify.info` para mocks, placeholder para archivos reales.

---

## ✅ Resultado de Verificación
- `npm run lint` → **Exit code: 0** (cero errores, cero warnings)
- Backend responde con `id_sm_vc` no nulo y `mensajes_sm_vc` ordenados cronológicamente.
- Timeline y Chat funcionan como componentes intercambiables via el prop `esTrazabilidad_sm_vc`.

## 📝 Decisiones Técnicas
- **Upsert Pattern:** Elegido sobre `findOrCreate` manual para evitar race conditions en entornos concurrentes.
- **Safety Sort en Frontend:** El sort en el `computed` es redundante por diseño (el backend ya ordena), pero actúa como guard de seguridad ante mutaciones locales del store.
- **Smart/Dumb Pattern:** `DocumentConversacion` es el único que toca el store; sus hijos (`ConvMessages`, `ConvTimeline`) son puros (solo props → render).
