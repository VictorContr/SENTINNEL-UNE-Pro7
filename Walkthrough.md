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
- **Unificación Visual:** Se deprecó el uso del condicional renderizado con `q-timeline`. Ahora todo el sistema renderiza la vista `ConvMessages` (burbujas de chat) de manera invariable para darle un aspecto fiel de conversación y mensajería en ambos contextos. El flag `esTrazabilidad_sm_vc` únicamente detona el modo *solo-lectura* (sin carga de forms).

#### `ConvMessages.vue` (Dumb Component — Único Visor Maestro)
- Ahora funge como visor único tanto para Trazabilidad como para Conversaciones regulares.
- **Reescritura total**: todas las funciones helpers (`bgColor`, `evalIcon`, `getRequisitoNombre`) correctamente usadas en el template — ESLint limpio.
- IDs de requisito reemplazados por nombres legibles vía `getRequisitoNombre_sm_vc`.
- Franja lateral de color en cards por estado de aprobación.
- Lógica de `handleAccionArchivo_sm_vc`: early return con `Notify.info` para mocks, placeholder para archivos reales.

~~#### `ConvTimeline.vue` (Deprecado)~~
- Eliminado del orquestador. Todo usa el flujo visual conversacional.

---

## ✅ Resultado de Verificación
- `npm run lint` → **Exit code: 0** (cero errores, cero warnings)
- Backend responde con `id_sm_vc` no nulo y `mensajes_sm_vc` ordenados cronológicamente.
- Timeline y Chat funcionan como componentes intercambiables via el prop `esTrazabilidad_sm_vc`.

## 📝 Decisiones Técnicas
- **Upsert Pattern:** Elegido sobre `findOrCreate` manual para evitar race conditions en entornos concurrentes.
- **Safety Sort en Frontend:** El sort en el `computed` es redundante por diseño (el backend ya ordena), pero actúa como guard de seguridad ante mutaciones locales del store.
- **Smart/Dumb Pattern:** `DocumentConversacion` es el único que toca el store; sus hijos (`ConvMessages`, `ConvTimeline`) son puros (solo props → render).

---

## 🛠️ Acciones Realizadas (Módulo Profesor: Mis Estudiantes)

### 1. Backend — Endpoint de Estudiantes Asignados
- Refactorizamos `@Get()` a `@Get('mis-estudiantes_sm_vc')` en `EstudiantesController`.
- Extraemos el `id_sm_vc` directamente del JWT vía el decorador `@Request() req: RequestWithUser` (`req.user.id_sm_vc`), evitando por completo enviar el ID a través de *query params* (Best practice en RBAC).
- En el servicio `EstudiantesService`, inyectamos `.periodo_sm_vc` dentro del payload de `materiaActiva`.

### 2. Frontend — Conexión y Store (Pinia)
- **Servicio:** Creado el archivo modular `estudiantesService.js` con la definición `getMisEstudiantes_sm_vc()`.
- **Store:** El `progressBarStore.js` ha mutado: pasamos de recibir un `profesorId` como parámetro en un *getter* puro a tener un estado centralizado `estudiantesAsignados_sm_vc (ref)` y la acción explícita asincrónica `fetchEstudiantesProfesor_sm_vc()`.
- Transformamos `getProgresoEstudiantesProfesor` a la propiedad reactiva (`computed`) `progresoEstudiantesProfesor_sm_vc`, la cual mapea el DTO puro del backend para ajustarse 1:1 a los campos que consume la UI.

### 3. Frontend — Reestructuración del Componente (Fetch on Mount)
- **`EstudiantesPage.vue`:**
  - Importado y ejecutado `onMounted` reactivo, invocando directamente `progressBarStore_sm_vc.fetchEstudiantesProfesor_sm_vc()`.
  - La propiedad local filtrada `estudiantesFiltrados_sm_vc` ya no ejecuta cálculos, sólo actúa como "Instant Search" visual para iterar en el *grid*.

---

## 🛠️ Acciones Realizadas (Módulo Seguridad: Expiración JWT SPA)

### 1. Parche Proactivo en Router Guard (`src/router/index.js`)
- Agregamos validación proactiva (*Paso 2.5* en `router.beforeEach`) utilizando un nuevo método `verificarExpiracion_sm_vc` del `authStore`.
- Protege a la SPA (Single Page Aplication) previniendo que un componente levante con un token local vencido sin siquiera agotar un recurso de la red.

### 2. Parche Reactivo en Interceptor Axios (`src/boot/axios.js`)
- Reestructuración ES Modules mediante carga dinámica: reemplazamos `require` por una carga diferida (`import()`) de Pinia `useAuthStore()` cuando estallla un error 401. Esto elimina el problema clásico de *dependencia circular* entre Axios y el Router en Quasar.
- Reemplazo del recargo bruto de ventana completa por navegación con hash inyectado vía JS nativo `window.location.hash = '#/login'`, y de soporte por Router API (`router_sm_vc.push`) si está instanciado; conservando el contexto PWA de estado limpio y transiciones.

### 3. Modificaciones Base `authStore.js`
- Desdoble interno del payload JWT nativo usando `atob()` y descarte de peso de dependencias de terceros.
- Lógica de depuración agresiva: `LocalStorage.clear()` sustituyendo el mero removedor de tokens en el payload. 
- Integración final y comprobada exitosa `npm run lint` y `npm run build`.

---

## 🛠️ Acciones Realizadas (Módulo Profesor: Visibilidad Integral)

### 1. Backend — Agregación Multimateria (`src/estudiantes/estudiantes.service.ts`)
- Refactorizado `obtenerMisEstudiantes_sm_vc` para realizar una carga en lote de las materias del periodo de cada estudiante.
- Implementado el mapeador `mapearEstudianteConProgresoExtendido_sm_vc`, el cual proyecta un array de las 4 materias de grado con su progreso individual calculado a partir de las entregas existentes.

### 2. Frontend — Adaptación del Store (`src/stores/progressBarStore.js`)
- El computed `progresoEstudiantesProfesor_sm_vc` ahora es agnóstico a la cantidad de materias, mapeando dinámicamente la colección enviada por el servidor.
- Sincronización de flags de bloqueo (`bloqueada`) para alimentar la UI.

### 3. UI/UX — Grid de Estudiantes Responsivo (`EstudiantesPage.vue`)
- Implementado el diseño de "Barras de Ciclo Completo".
- Aplicada jerarquía visual mediante **gris desaturado (opacity 0.6 + grayscale)** y etiquetas de "Bloqueada" con icono de candado para materias futuras.
- Compactación del diseño (reducción de GAP y tamaño de barras) para mantener la legibilidad con 4 indicadores por tarjeta.
