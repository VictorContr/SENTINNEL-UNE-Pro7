# PLAN.md — SENTINNEL: Conversaciones en Tiempo Real, Gestión de Archivos y Evaluaciones Granulares

**Arquitecto:** Full-Stack Senior Tech Lead  
**Proyecto:** SENTINNEL (NestJS + Prisma + Vue 3 Quasar)  
**Convención:** Sufijo `_sm_vc` en todo el código  
**Fecha:** 2026-04-09

---

## 1. Resumen Ejecutivo

Este plan detalla la arquitectura necesaria para habilitar un sistema de conversaciones en tiempo real entre estudiantes y profesores, gestión completa de archivos (subida/descarga) para los 3 roles, y evaluaciones granulares con control de acceso diferenciado para administradores en modo solo lectura.

---

## 2. Diagnóstico de Brechas Críticas Confirmado

### 2.1 Brecha 1: Sin WebSockets

- **Estado actual:** Todo el sistema de mensajes es HTTP request/response estático via `GET /api/conversaciones/:estudianteId`
- **Impacto:** Los usuarios deben refrescar manualmente para ver nuevos mensajes
- **Archivos afectados:** `conversaciones.service.ts`, `conversacionStore.js`, todos los componentes de chat

### 2.2 Brecha 2: Profesor Bloqueado en Frontend

- **Ubicación:** `ConversacionPage.vue:29` → `:readonly="estadoActual === 'APROBADO'"`
- **Problema:** El readonly se calcula correctamente, pero en `DocumentConversacion.vue:66-73` hay una condición compleja que evalúa `userRol_sm_vc` y confunde el contexto. Además, la vista de trazabilidad (`TrazabilidadPage.vue:168`) fuerza `esTrazabilidad_sm_vc=true` que a su vez fuerza readonly.
- **Impacto:** El profesor no puede enviar mensajes de texto ni archivos en conversaciones activas

### 2.3 Brecha 3: Descargas Desconectadas

- **Ubicación:** `ConvMessages.vue:311-329` → `handleAccionArchivo_sm_vc()` solo muestra `Notify` de "en construcción"
- **Backend disponible:** `DocumentosController:57-70` ya tiene `GET /api/documentos/:documentoId/descargar` implementado
- **Impacto:** Ningún rol puede descargar documentos subidos

### 2.4 Brecha 4: Admin sin Acceso a WebSockets

- **Estado actual:** No existe implementación WebSocket, por lo tanto no hay control de acceso para Admin
- **Requerimiento:** Admin debe poder unirse a salas como "oyente" sin permisos de escritura

---

## 3. FASE 1: Infraestructura Real-Time (Backend)

### 3.1 Arquitectura de WebSockets con Socket.io

**Nuevo Módulo:** `ChatGatewayModule`

```
backend/src/
└── chat/
    ├── chat.module.ts                    # Módulo de agrupación
    ├── gateways/
    │   └── chat.gateway.ts               # Gateway principal Socket.io
    ├── guards/
    │   └── ws-jwt.guard.ts               # Guard JWT para WebSockets
    ├── adapters/
    │   └── jwt-ws.adapter.ts             # Adapter para autenticación WS
    ├── services/
    │   └── chat-presence.service.ts      # Gestión de presencia/salas
    └── dto/
        ├── join-room.dto.ts
        ├── send-message.dto.ts
        └── typing-status.dto.ts
```

#### 3.1.1 Gateway Principal (`chat.gateway.ts`)

**Eventos requeridos:**

| Evento                     | Dirección | Descripción                   | Payload                                   |
| -------------------------- | --------- | ----------------------------- | ----------------------------------------- |
| `connection`               | C→S       | Conexión autenticada          | `{ token: JWT }` en handshake             |
| `join_conversation_sm_vc`  | C→S       | Unirse a sala de conversación | `{ estudianteId, materiaId? }`            |
| `leave_conversation_sm_vc` | C→S       | Salir de sala                 | `{ estudianteId, materiaId? }`            |
| `send_message_sm_vc`       | C→S       | Enviar mensaje de texto       | `{ contenido, materiaId?, tipo }`         |
| `typing_sm_vc`             | C→S       | Indicador "escribiendo"       | `{ isTyping: boolean }`                   |
| `message_received_sm_vc`   | S→C       | Broadcast nuevo mensaje       | `{ id, contenido, remitente, timestamp }` |
| `user_joined_sm_vc`        | S→C       | Notificación entrada          | `{ userId, rol, timestamp }`              |
| `user_left_sm_vc`          | S→C       | Notificación salida           | `{ userId, timestamp }`                   |

**Implementación clave:**

```typescript
@WebSocketGateway({
  namespace: "chat_sm_vc",
  cors: { origin: process.env.FRONTEND_URL },
})
export class ChatGateway_sm_vc
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server_sm_vc: Server;

  // Salas: `conv:${estudianteId}:${materiaId || 'global'}`
  // Ejemplo: conv:42:3 (estudiante 42, materia 3)

  async handleConnection(client_sm_vc: Socket) {
    // Validar JWT del handshake auth.token
    // Extraer user desde JWT Strategy adaptado a WS
    // Asignar client.data.user_sm_vc = usuario
  }

  @SubscribeMessage("join_conversation_sm_vc")
  async handleJoin_sm_vc(client: Socket, payload: JoinRoomDto) {
    const roomId_sm_vc = `conv:${payload.estudianteId}:${payload.materiaId || "global"}`;

    // Verificar permisos:
    // - ESTUDIANTE: solo puede unirse a su propia conversación
    // - PROFESOR: puede unirse a conversaciones de sus estudiantes asignados
    // - ADMIN: puede unirse a cualquier conversación (modo oyente)

    await client.join(roomId_sm_vc);
    client.to(roomId_sm_vc).emit("user_joined_sm_vc", {
      userId: client.data.user_sm_vc.id_sm_vc,
      rol: client.data.user_sm_vc.rol_sm_vc,
      timestamp: new Date(),
    });
  }
}
```

#### 3.1.2 Autenticación JWT en WebSockets (`ws-jwt.guard.ts`)

```typescript
@Injectable()
export class WsJwtGuard_sm_vc implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth.token || client.handshake.query.token;

    try {
      const payload = this.jwtService.verify(token);
      client.data.user_sm_vc = payload;
      return true;
    } catch {
      client.disconnect(true);
      return false;
    }
  }
}
```

#### 3.1.3 Integración con Módulo de Conversaciones (Event-Driven)

**EVITAR dependencia circular:** No inyectar Gateway en Service ni viceversa. Usar `@nestjs/event-emitter`.

En `conversaciones.service.ts`:

```typescript
@Injectable()
export class ConversacionesService {
  constructor(
    private readonly prisma_sm_vc: PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2,  // Inyectar event emitter
  ) {}

  async registrarMensajeManual_sm_vc(payload: {...}) {
    // ... guardar en BD ...

    // Emitir evento interno (desacoplado del Gateway)
    this.eventEmitter_sm_vc.emit('mensaje.creado_sm_vc', {
      estudianteId: payload.estudianteId,
      materiaId: payload.materiaId,
      mensaje: mensajeFormateado,
    });

    return mensaje;
  }
}
```

En `chat.gateway.ts`:

```typescript
@WebSocketGateway({...})
export class ChatGateway_sm_vc implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server_sm_vc: Server;

  @OnEvent('mensaje.creado_sm_vc')
  handleMensajeCreado_sm_vc(payload: {
    estudianteId: number;
    materiaId?: number;
    mensaje: any;
  }) {
    const roomId_sm_vc = `conv:${payload.estudianteId}:${payload.materiaId || 'global'}`;
    this.server_sm_vc.to(roomId_sm_vc).emit('message_received_sm_vc', payload.mensaje);
  }
}
```

**Ventaja:** El `ConversacionesService` no conoce la existencia del WebSocket. Desacoplamiento total.

#### 3.1.4 Dependencias a Instalar

```bash
npm install @nestjs/platform-socket.io socket.io
npm install -D @types/socket.io
```

Modificar `app.module.ts`:

```typescript
import { ChatModule_sm_vc } from './chat/chat.module';

@Module({
  imports: [
    // ... existing imports
    ChatModule_sm_vc,  // Agregar
  ]
})
```

#### 3.1.5 Configuración CORS para Descargas (main.ts)

**CRÍTICO:** Agregar `exposedHeaders: ['Content-Disposition']` para permitir que Axios lea el nombre del archivo:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: config.get("FRONTEND_URL") || "http://localhost:9000",
  credentials: true,
  exposedHeaders: ["Content-Disposition"], // CRÍTICO: para descargas de archivos
});
```

**Por qué:** El header `Content-Disposition` contiene el nombre original del archivo (`filename="documento.pdf"`). Sin esta configuración, Axios no puede acceder a él por seguridad CORS.

---

## 4. FASE 2: Desbloqueo y Simetría de Roles (Frontend)

### 4.1 Análisis del Problema Actual

**Flujo de renderizado en `DocumentConversacion.vue`:**

```vue
<!-- Líneas 52-74 -->
<ConvMessages :readonly="readonly || esTrazabilidad_sm_vc" />

<!-- Líneas 59-74 -->
<template v-if="!readonly && !esTrazabilidad_sm_vc">
  <ConvFormEstudiante v-if="userRol_sm_vc === 'ESTUDIANTE'" />
  <ConvFormProfesor
    v-if="userRol_sm_vc === 'PROFESOR' || userRol_sm_vc === 'ADMIN'" />
</template>
```

**Problema identificado:**

1. En `TrazabilidadPage.vue:167`, siempre se pasa `es-trazabilidad_sm_vc="true"` al componente
2. Esto fuerza `readonly=true` en la línea 56 del componente
3. Resultado: El profesor nunca ve los formularios de entrada

### 4.2 Solución: Separación de Conceptos

**Nueva Arquitectura de Props:**

```typescript
interface DocumentConversacionProps {
  materiaId: number | null;
  estudianteId: number;
  modoVista_sm_vc: "CHAT" | "TRAZABILIDAD" | "HISTORIAL";
  estadoProgreso: string;
}
```

| Modo           | Descripción                       | Rol Escritura        | Rol Lectura     |
| -------------- | --------------------------------- | -------------------- | --------------- |
| `CHAT`         | Conversación bidireccional activa | ESTUDIANTE, PROFESOR | ADMIN (oyente)  |
| `TRAZABILIDAD` | Vista solo lectura para profesor  | Ninguno              | PROFESOR, ADMIN |
| `HISTORIAL`    | Vista post-aprobación             | Ninguno              | Todos           |

### 4.3 Cambios Requeridos

#### 4.3.1 Refactor `DocumentConversacion.vue`

```vue
<!-- Nueva lógica de renderizado -->
<template>
  <ConvMessages :mensajes="mensajesOrdenados_sm_vc" />

  <!-- Panel de entrada según rol y modo -->
  <template v-if="puedeEscribir_sm_vc">
    <ConvFormEstudiante
      v-if="userRol_sm_vc === 'ESTUDIANTE'"
      @enviar="handleEnviar_mensaje_sm_vc" />
    <ConvFormProfesor
      v-if="userRol_sm_vc === 'PROFESOR'"
      @responder="handleEnviar_mensaje_sm_vc"
      @evaluar="handleEvaluar_sm_vc" />
  </template>

  <!-- Banner de solo lectura para Admin -->
  <div
    v-else-if="userRol_sm_vc === 'ADMIN' && modoVista_sm_vc === 'CHAT'"
    class="readonly-banner_sm_vc">
    <q-icon name="visibility" /> Modo Supervisor — Solo lectura
  </div>
</template>

<script setup>
const puedeEscribir_sm_vc = computed(() => {
  // Estudiante puede escribir si la materia no está aprobada
  if (userRol_sm_vc.value === "ESTUDIANTE") {
    return estadoProgreso.value !== "APROBADO";
  }
  // Profesor puede escribir si está en modo CHAT (no en TRAZABILIDAD)
  if (userRol_sm_vc.value === "PROFESOR") {
    return (
      props.modoVista_sm_vc === "CHAT" && estadoProgreso.value !== "APROBADO"
    );
  }
  // Admin nunca escribe
  return false;
});
</script>
```

#### 4.3.2 Refactor `TrazabilidadPage.vue` (Profesor)

```vue
<!-- Cambiar línea 164-169 -->
<DocumentConversacion
  :materia-id="materiaSeleccionada_sm_vc.id_sm_vc"
  :estudiante-id="estudianteId_sm_vc"
  :modo-vista_sm_vc="'TRAZABILIDAD'"  <!-- Era es-trazabilidad_sm_vc -->
  :estado-progreso="materiaSeleccionada_sm_vc.estado_aprobacion_sm_vc" />
```

**IMPORTANTE - Memory Leak Prevention:**

```vue
<script setup>
import { onUnmounted } from "vue";
import { useChatStore_sm_vc } from "src/stores/chatStore_sm_vc";

const chatStore_sm_vc = useChatStore_sm_vc();

// LIMPIEZA OBLIGATORIA al cambiar de ruta
onUnmounted(() => {
  chatStore_sm_vc.salirDeSala_sm_vc();
});
</script>
```

#### 4.3.3 Refactor `ConversacionPage.vue` (Profesor)

```vue
<!-- Cambiar línea 26-32 -->
<DocumentConversacion
  :materia-id="materiaId"
  :estudiante-id="estudianteId"
  :modo-vista_sm_vc="'CHAT'"  <!-- Nuevo modo explícito -->
  :estado-progreso="estadoActual"
  @mensajeEnviado="onMensajeEnviado" />
```

**IMPORTANTE - Memory Leak Prevention:**

```vue
<script setup>
import { onUnmounted } from "vue";
import { useChatStore_sm_vc } from "src/stores/chatStore_sm_vc";

const chatStore_sm_vc = useChatStore_sm_vc();

// LIMPIEZA OBLIGATORIA al salir de la conversación
onUnmounted(() => {
  chatStore_sm_vc.salirDeSala_sm_vc();
});
</script>
```

**Nota:** Aplicar el mismo patrón `onUnmounted` en todas las vistas que usen el chat:

- `pages/estudiante/HistorialPage.vue`
- `pages/estudiante/TrazabilidadPage.vue`
- `pages/admin/TrazabilidadPage.vue`

### 4.4 Nuevo Store: `chatStore_sm_vc.js`

```javascript
// stores/chatStore_sm_vc.js
export const useChatStore_sm_vc = defineStore("chat", () => {
  // Estado
  const socket_sm_vc = ref(null);
  const conectado_sm_vc = ref(false);
  const salaActual_sm_vc = ref(null);
  const mensajesPendientes_sm_vc = ref([]);

  // Actions
  const conectar_sm_vc = (token) => {
    socket_sm_vc.value = io(`${API_URL}/chat_sm_vc`, {
      auth: { token },
    });

    socket_sm_vc.value.on("connect", () => (conectado_sm_vc.value = true));
    socket_sm_vc.value.on("message_received_sm_vc", (msg) => {
      // Agregar a conversaciones si es de la sala actual
      conversacionStore.conversaciones_sm_vc.push(msg);
    });
  };

  const unirASala_sm_vc = (estudianteId, materiaId) => {
    const roomId = `conv:${estudianteId}:${materiaId || "global"}`;
    socket_sm_vc.value.emit("join_conversation_sm_vc", {
      estudianteId,
      materiaId,
    });
    salaActual_sm_vc.value = roomId;
  };

  const enviarMensaje_sm_vc = (contenido, materiaId) => {
    socket_sm_vc.value.emit("send_message_sm_vc", {
      contenido_sm_vc: contenido,
      materiaId,
      tipo: "TEXTO",
    });
  };

  const salirDeSala_sm_vc = () => {
    if (socket_sm_vc.value && salaActual_sm_vc.value) {
      socket_sm_vc.value.emit("leave_conversation_sm_vc");
      socket_sm_vc.value.disconnect();
      salaActual_sm_vc.value = null;
    }
  };

  return {
    conectado_sm_vc,
    conectar_sm_vc,
    unirASala_sm_vc,
    enviarMensaje_sm_vc,
    salirDeSala_sm_vc, // EXPONER para limpieza en onUnmounted
  };
});
```

---

## 5. FASE 3: Flujo de Archivos (Full-Stack)

### 5.1 Arquitectura de Subida/Download

```
┌─────────────────┐     multipart      ┌──────────────────┐
│  Vue Component  │ ─────────────────→ │  Documentos      │
│  (ConvForm*)    │    FormData        │  Controller        │
└─────────────────┘                    │  POST /documentos  │
                                      └──────────────────┘
                                               ↓
┌─────────────────┐                   ┌──────────────────┐
│  ConvMessages   │ ←─────────────────│  Documentos      │
│  (Download)     │    GET /download  │  Service         │
└─────────────────┘                   │  (Stream file)   │
                                      └──────────────────┘
```

### 5.2 Backend: Endpoint de Descarga (Ya Implementado)

**Verificado:** `DocumentosController:57-70` y `DocumentosService:113-146` ya tienen:

- `GET /api/documentos/:documentoId/descargar`
- Validación de documento existente
- Validación de documento no-MOCK
- Streaming de archivo físico con headers correctos

**Acceso requerido por rol:**

| Rol        | Descargar archivos de | Endpoint                      |
| ---------- | --------------------- | ----------------------------- |
| ESTUDIANTE | Sus propias entregas  | GET /documentos/:id/descargar |
| PROFESOR   | Estudiantes asignados | GET /documentos/:id/descargar |
| ADMIN      | Todos los documentos  | GET /documentos/:id/descargar |

### 5.3 Frontend: Servicio de Descarga

**Nuevo archivo:** `src/services/documentosService.js`

```javascript
export const descargarDocumento_sm_vc = async (documentoId) => {
  const response = await api_vc.get(`/documentos/${documentoId}/descargar`, {
    responseType: "blob",
  });

  // Crear blob y descargar
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = obtenerNombreArchivoDeHeaders(response.headers);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
```

### 5.4 Frontend: Modificar `ConvMessages.vue`

**Cambio en `handleAccionArchivo_sm_vc` (líneas 311-329):**

```javascript
const handleAccionArchivo_sm_vc = async (msg_sm_vc, accion_sm_vc) => {
  // Validar mock
  if (msg_sm_vc.mock_sm_vc) {
    $q.notify({ type: "info", message: "Documento de simulación" });
    return;
  }

  if (accion_sm_vc === "descargar") {
    try {
      await descargarDocumento_sm_vc(msg_sm_vc.id_sm_vc.replace("doc-", ""));
      $q.notify({ type: "positive", message: "Descarga iniciada" });
    } catch (err) {
      $q.notify({ type: "negative", message: "Error al descargar" });
    }
    return;
  }

  if (accion_sm_vc === "visualizar") {
    // Abrir en nueva pestaña para preview
    const url = `${API_URL}/documentos/${msg_sm_vc.id_sm_vc.replace("doc-", "")}/preview`;
    window.open(url, "_blank");
  }
};
```

### 5.5 Subida de Archivos con WebSockets

**Flujo para mensajes con archivo:**

1. Usuario selecciona archivo en `ConvFormEstudiante` o `ConvFormProfesor`
2. Frontend sube archivo primero: `POST /api/documentos` (multipart)
3. Backend responde con `documentoId` creado
4. Frontend emite evento WebSocket: `send_message_sm_vc` con `documentoId` adjunto
5. Backend guarda mensaje vinculado al documento
6. Backend broadcast a sala con información del documento

**DTO modificado:**

```typescript
// send-message.dto.ts
export class SendMessageDto_sm_vc {
  contenido_sm_vc: string;
  materiaId?: number;
  documentoId?: number; // Nuevo: vincular archivo al mensaje
  tipo: "TEXTO" | "DOCUMENTO";
}
```

---

## 6. FASE 4: Control de Acceso (Admin)

### 6.1 Arquitectura de Permisos en WebSockets

**Guard de Autorización por Sala:**

```typescript
@Injectable()
export class ChatRoomGuard_sm_vc implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const payload = context.switchToWs().getData<JoinRoomDto>();
    const user = client.data.user_sm_vc;

    switch (user.rol_sm_vc) {
      case "ESTUDIANTE":
        // Solo su propia conversación
        return await this.esSuPropiaConversacion(
          user.id_sm_vc,
          payload.estudianteId,
        );

      case "PROFESOR":
        // Solo estudiantes asignados
        return await this.esEstudianteAsignado(
          user.id_sm_vc,
          payload.estudianteId,
        );

      case "ADMIN":
        // Admin puede entrar a cualquier sala (modo oyente)
        return true;

      default:
        return false;
    }
  }
}
```

### 6.2 Middleware de Solo Lectura para Admin

**En `ChatGateway_sm_vc`:**

```typescript
@SubscribeMessage('send_message_sm_vc')
async handleMessage(client: Socket, payload: SendMessageDto) {
  const user = client.data.user_sm_vc;

  // Admin no puede enviar mensajes
  if (user.rol_sm_vc === 'ADMIN') {
    client.emit('error_sm_vc', {
      code: 'FORBIDDEN',
      message: 'Admin tiene acceso solo lectura'
    });
    return;
  }

  // ... resto del handler
}
```

### 6.3 Indicador Visual en Frontend

**En `DocumentConversacion.vue`:**

```vue
<!-- Banner de Admin Supervisor -->
<div v-if="userRol_sm_vc === 'ADMIN'" class="admin-banner_sm_vc">
  <q-icon name="admin_panel_settings" color="warning" />
  <span>Modo Supervisor — Estás visualizando como Administrador (solo lectura)</span>
</div>
```

---

## 7. Estructura de Datos Extendida

### 7.1 Extensión del Schema Prisma (Opcional)

Si se requiere tracking de "quién está conectado":

```prisma
model ChatPresence {
  id_sm_vc          Int      @id @default(autoincrement())
  usuario_id_sm_vc  Int
  sala_id_sm_vc     String   // "conv:42:3"
  conectado_sm_vc   Boolean  @default(true)
  ultimo_ping_sm_vc DateTime @default(now())

  @@map("tdchatpresence_sm_vc")
}
```

### 7.2 Mensaje WebSocket Estandarizado

```typescript
interface ChatMessageEvent_sm_vc {
  id_sm_vc: string;
  tipo_sm_vc: "TEXTO" | "DOCUMENTO" | "SISTEMA";
  contenido_sm_vc: string;
  remitente_sm_vc: {
    id_sm_vc: number;
    nombre_sm_vc: string;
    rol_sm_vc: "ESTUDIANTE" | "PROFESOR" | "ADMIN";
  };
  documento_sm_vc?: {
    id_sm_vc: number;
    nombre_sm_vc: string;
    tamanio_sm_vc: string;
  };
  timestamp_sm_vc: string; // ISO 8601
  sala_id_sm_vc: string; // "conv:42:3"
}
```

---

## 8. Plan de Implementación por Sprints

### Sprint 1: Infraestructura Backend

- [ ] Instalar dependencias `@nestjs/platform-socket.io`, `socket.io`
- [ ] Crear módulo `ChatModule_sm_vc` con estructura de carpetas
- [ ] Implementar `ChatGateway_sm_vc` con eventos básicos
- [ ] Implementar `WsJwtGuard_sm_vc` para autenticación
- [ ] Crear `ChatPresenceService` para gestión de salas
- [ ] Integrar emisiones desde `ConversacionesService`
- [ ] Tests de conexión con Socket.io client

### Sprint 2: Frontend - Store y Componentes

- [ ] Instalar `socket.io-client` en frontend
- [ ] Crear `chatStore_sm_vc.js` con conexión/desconexión
- [ ] Refactor `DocumentConversacion.vue` con nuevo prop `modoVista_sm_vc`
- [ ] Actualizar `ConversacionPage.vue` (modo CHAT)
- [ ] Actualizar `TrazabilidadPage.vue` (modo TRAZABILIDAD)
- [ ] Implementar indicadores de conexión (online/offline)
- [ ] Implementar "escribiendo..." indicator

### Sprint 3: Archivos y Descargas

- [ ] Crear `documentosService.js` con función de descarga
- [ ] Modificar `ConvMessages.vue` para conectar descargas
- [ ] Implementar subida de archivos + mensaje WebSocket
- [ ] Preview de documentos en nueva pestaña
- [ ] Tests de descarga para los 3 roles

### Sprint 4: Control de Acceso Admin

- [ ] Implementar `ChatRoomGuard_sm_vc` con lógica de roles
- [ ] Agregar middleware de solo lectura para Admin
- [ ] Banner visual de "Modo Supervisor" en UI
- [ ] Tests de seguridad: Admin intentando escribir
- [ ] Tests: Estudiante intentando acceder a conversación ajena

### Sprint 5: Integración y QA

- [ ] End-to-end: Estudiante envía mensaje → Profesor recibe en tiempo real
- [ ] End-to-end: Profesor envía corrección → Estudiante recibe notificación
- [ ] End-to-end: Admin observa conversación sin interferir
- [ ] Pruebas de carga: Múltiples usuarios en misma sala
- [ ] Manejo de reconexión ante desconexión de red

---

## 9. Diagrama de Secuencia: Mensaje Estudiante → Profesor

```
Estudiante (Vue)          Backend (NestJS)          Profesor (Vue)
     |                           |                        |
     │── socket.emit('send_msg')──→│                        │
     │                             │── Guard: esEstudiante? │
     │                             │── Service: guardarMsg  │
     │                             │── DB: mensaje creado   │
     │                             │                        │
     │←──────── ack ───────────────│                        │
     │                             │── socket.to(room).emit │
     │                             │──────────('msg_recv')──→│
     │                             │                        │── Store: agregarMsg
     │                             │                        │── UI: render burbuja
```

---

## 10. Consideraciones de Seguridad

1. **Validación de Sala:** Siempre verificar que el usuario tiene permiso para unirse a la sala solicitada
2. **Sanitización:** Limpiar contenido de mensajes antes de broadcast (XSS)
3. **Rate Limiting:** Implementar limitador de mensajes por usuario (anti-spam)
4. **Persistencia:** Los mensajes deben guardarse en BD antes de broadcast (garantía de entrega)
5. **Desconexión:** Limpiar presencia cuando `handleDisconnect` se ejecuta

---

## 11. Notas de Implementación

### 11.1 Convención de Nombres

- Todos los nuevos archivos/clases/variables deben usar sufijo `_sm_vc`
- Eventos Socket.io: `snake_case_sm_vc` (ej: `send_message_sm_vc`)
- Salas: `conv:${estudianteId}:${materiaId || 'global'}`

### 11.2 Backward Compatibility

- Mantener endpoint REST `GET /api/conversaciones/:estudianteId` para carga inicial
- WebSocket solo para actualizaciones en tiempo real
- Soporte graceful degradation si WS no disponible (polling opcional)

### 11.3 Configuración de Entorno

```env
# .env backend
WEBSOCKET_CORS_ORIGIN=http://localhost:9000
WEBSOCKET_NAMESPACE=chat_sm_vc

# .env frontend
VUE_APP_WS_URL=http://localhost:3000
```

---

## 12. Resumen de Archivos a Crear/Modificar

### Nuevos Archivos (12)

```
backend/src/chat/
├── chat.module.ts
├── gateways/chat.gateway.ts
├── guards/ws-jwt.guard.ts
├── guards/chat-room.guard.ts
├── services/chat-presence.service.ts
└── dto/
    ├── join-room.dto.ts
    ├── send-message.dto.ts
    └── typing-status.dto.ts

frontend/src/
├── services/documentosService.js
├── services/chatService.js
└── stores/chatStore_sm_vc.js
```

### Archivos a Modificar (9)

```
backend/src/
├── app.module.ts                    # Agregar ChatModule
├── main.ts                          # Configurar CORS para WS
├── conversaciones/
│   └── conversaciones.service.ts    # Emitir eventos WS
└── documentos/
    └── documentos.controller.ts     # Agregar endpoint preview

frontend/src/
├── components/shared/
│   ├── DocumentConversacion.vue     # Nuevo prop modoVista
│   ├── conv/ConvMessages.vue        # Conectar descargas
│   ├── conv/ConvFormEstudiante.vue  # Subida + WS
│   └── conv/ConvFormProfesor.vue    # Subida + WS
└── pages/profesor/
    ├── ConversacionPage.vue         # Modo CHAT
    └── TrazabilidadPage.vue         # Modo TRAZABILIDAD
```

---

## 13. Próximos Pasos

1. **Revisión del Plan:** Validar con stakeholders la arquitectura propuesta
2. **Aprobación:** Obtener luz verde para iniciar Sprint 1
3. **Preparación:** Crear rama feature `feature/chat-realtime-sm-vc`
4. **Ejecución:** Comenzar con implementación de WebSocket Gateway

---

**Fin del Plan de Implementación Maestro**
