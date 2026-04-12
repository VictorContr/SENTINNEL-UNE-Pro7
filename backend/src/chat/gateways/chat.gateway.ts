import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { WsJwtGuard_sm_vc } from '../guards/ws-jwt.guard';
import { ChatRoomGuard_sm_vc } from '../guards/chat-room.guard';
import { ChatPresenceService_sm_vc } from '../services/chat-presence.service';
import { ConversacionesService } from '../../conversaciones/conversaciones.service';
import { JoinRoomDto_sm_vc } from '../dto/join-room.dto';
import {
  SendMessageDto_sm_vc,
  TipoMensajeChat_sm_vc,
} from '../dto/send-message.dto';
import { TypingStatusDto_sm_vc } from '../dto/typing-status.dto';

/** Payload tipado que emite ConversacionesService vía EventEmitter2 */
interface MensajeCreadoPayload_sm_vc {
  estudianteId_sm_vc: number;
  materiaId_sm_vc?: number;
  mensaje_sm_vc: Record<string, unknown>;
}

/** Datos del usuario autenticado en socket.data.user_sm_vc */
interface JwtPayloadWs_sm_vc {
  sub: number;
  rol: string;
  correo: string;
}

/**
 * ChatGateway_sm_vc — Gateway principal de WebSockets para SENTINNEL.
 *
 * Namespace : /chat_sm_vc
 * Salas     : conv:{estudianteId}:{materiaId|'global'}
 *
 * Arquitectura event-driven (desacoplada):
 *   • Eventos entrantes del cliente → handlers @SubscribeMessage
 *   • Broadcast saliente al cliente → @OnEvent('mensaje.creado_sm_vc')
 *     desencadenado por ConversacionesService vía EventEmitter2
 *
 * Esto garantiza que el gateway NUNCA emite directamente: primero persiste
 * en BD (ConversacionesService), luego el EventEmitter dispara el broadcast.
 */
@WebSocketGateway({
  namespace: 'chat_sm_vc',
  cors: {
    origin: (_origin: string, cb: (err: null, allow: boolean) => void) =>
      cb(null, true),
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway_sm_vc
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server_sm_vc: Server;

  private readonly logger_sm_vc = new Logger(ChatGateway_sm_vc.name);

  constructor(
    private readonly jwtService_sm_vc: JwtService,
    private readonly presenceService_sm_vc: ChatPresenceService_sm_vc,
    private readonly conversacionesService_sm_vc: ConversacionesService,
    private readonly configService_sm_vc: ConfigService,
  ) {}

  // ══════════════════════════════════════════════════════════════
  // LIFECYCLE HOOKS
  // ══════════════════════════════════════════════════════════════

  afterInit(_server_sm_vc: Server): void {
    this.logger_sm_vc.log(
      `[ChatGateway_sm_vc] Namespace /chat_sm_vc inicializado | ` +
        `Frontend esperado: ${this.configService_sm_vc.get('FRONTEND_URL') ?? 'http://localhost:9000'}`,
    );
  }

  /**
   * handleConnection — Se ejecuta inmediatamente al conectar el socket.
   *
   * Valida el JWT del handshake ANTES de que el cliente pueda emitir eventos.
   * Si el token es inválido, desconecta el socket de forma limpia.
   */
  async handleConnection(client_sm_vc: Socket): Promise<void> {
    try {
      const token_sm_vc = this.extraerTokenHandshake_sm_vc(client_sm_vc);

      if (!token_sm_vc) {
        this.emitirError_sm_vc(
          client_sm_vc,
          'TOKEN_MISSING',
          'Token de autenticación requerido.',
        );
        client_sm_vc.disconnect(true);
        return;
      }

      const payload_sm_vc =
        this.jwtService_sm_vc.verify<JwtPayloadWs_sm_vc>(token_sm_vc);
      client_sm_vc.data.user_sm_vc = payload_sm_vc;

      this.presenceService_sm_vc.registrarConexion_sm_vc(
        client_sm_vc.id,
        payload_sm_vc.sub,
        payload_sm_vc.rol,
      );

      this.logger_sm_vc.log(
        `[Conexión] socket=${client_sm_vc.id} userId=${payload_sm_vc.sub} rol=${payload_sm_vc.rol}`,
      );
    } catch (err_sm_vc) {
      this.logger_sm_vc.warn(
        `[Conexión rechazada] socket=${client_sm_vc.id} — ${(err_sm_vc as Error).message}`,
      );
      this.emitirError_sm_vc(
        client_sm_vc,
        'UNAUTHORIZED',
        'Token JWT inválido o expirado.',
      );
      client_sm_vc.disconnect(true);
    }
  }

  /**
   * handleDisconnect — Limpia la presencia en memoria al desconectar.
   */
  handleDisconnect(client_sm_vc: Socket): void {
    this.presenceService_sm_vc.registrarDesconexion_sm_vc(client_sm_vc.id);
    this.logger_sm_vc.log(`[Desconexión] socket=${client_sm_vc.id}`);
  }

  // ══════════════════════════════════════════════════════════════
  // EVENTOS ENTRANTES (Cliente → Servidor)
  // ══════════════════════════════════════════════════════════════

  /**
   * join_conversation_sm_vc — El cliente solicita unirse a una sala.
   *
   * Control de acceso (aplicado por la cadena de Guards en orden):
   *   1. WsJwtGuard_sm_vc    → Verifica que el socket tenga JWT válido.
   *   2. ChatRoomGuard_sm_vc → Aplica política de acceso granular por rol:
   *        ESTUDIANTE → solo su propia sala (sub === estudianteId).
   *        PROFESOR   → solo estudiantes asignados (validado en Prisma).
   *        ADMIN      → cualquier sala en modo observador (sin escritura).
   *
   * Si cualquier guard falla, lanza WsException → Socket.io emite 'exception'
   * al cliente y el handler nunca se ejecuta.
   */
  @UseGuards(WsJwtGuard_sm_vc, ChatRoomGuard_sm_vc)
  @SubscribeMessage('join_conversation_sm_vc')
  async handleJoin_sm_vc(
    @ConnectedSocket() client_sm_vc: Socket,
    @MessageBody() payload_sm_vc: JoinRoomDto_sm_vc,
  ): Promise<void> {
    try {
      const user_sm_vc = this.obtenerUserAutenticado_sm_vc(client_sm_vc);

      if (
        !this.verificarPermisoSala_sm_vc(
          user_sm_vc,
          payload_sm_vc.estudianteId_sm_vc,
        )
      ) {
        this.emitirError_sm_vc(
          client_sm_vc,
          'FORBIDDEN',
          'No tienes permiso para acceder a esta conversación.',
        );
        return;
      }

      const roomId_sm_vc = this.buildRoomId_sm_vc(
        payload_sm_vc.estudianteId_sm_vc,
        payload_sm_vc.materiaId_sm_vc,
      );

      await client_sm_vc.join(roomId_sm_vc);
      this.presenceService_sm_vc.unirASala_sm_vc(client_sm_vc.id, roomId_sm_vc);

      // Notificar a los ya presentes en la sala
      client_sm_vc.to(roomId_sm_vc).emit('user_joined_sm_vc', {
        userId_sm_vc: user_sm_vc.sub,
        rol_sm_vc: user_sm_vc.rol,
        timestamp_sm_vc: new Date().toISOString(),
      });

      // Confirmar al cliente que se unió exitosamente
      client_sm_vc.emit('room_joined_sm_vc', {
        roomId_sm_vc,
        estudianteId_sm_vc: payload_sm_vc.estudianteId_sm_vc,
        materiaId_sm_vc: payload_sm_vc.materiaId_sm_vc ?? null,
        esAdminObservador_sm_vc: user_sm_vc.rol === 'ADMIN',
        timestamp_sm_vc: new Date().toISOString(),
      });

      this.logger_sm_vc.debug(
        `[Sala] ${user_sm_vc.rol} (${user_sm_vc.sub}) → sala "${roomId_sm_vc}"`,
      );
    } catch (err_sm_vc) {
      this.logger_sm_vc.error(
        `[join_conversation_sm_vc] ${(err_sm_vc as Error).message}`,
        (err_sm_vc as Error).stack,
      );
      this.emitirError_sm_vc(
        client_sm_vc,
        'INTERNAL_ERROR',
        'Error al unirse a la sala.',
      );
    }
  }

  /**
   * leave_conversation_sm_vc — El cliente abandona una sala.
   */
  @UseGuards(WsJwtGuard_sm_vc)
  @SubscribeMessage('leave_conversation_sm_vc')
  async handleLeave_sm_vc(
    @ConnectedSocket() client_sm_vc: Socket,
    @MessageBody() payload_sm_vc: JoinRoomDto_sm_vc,
  ): Promise<void> {
    try {
      const user_sm_vc = this.obtenerUserAutenticado_sm_vc(client_sm_vc);
      const roomId_sm_vc = this.buildRoomId_sm_vc(
        payload_sm_vc.estudianteId_sm_vc,
        payload_sm_vc.materiaId_sm_vc,
      );

      await client_sm_vc.leave(roomId_sm_vc);
      this.presenceService_sm_vc.salirDeSala_sm_vc(
        client_sm_vc.id,
        roomId_sm_vc,
      );

      client_sm_vc.to(roomId_sm_vc).emit('user_left_sm_vc', {
        userId_sm_vc: user_sm_vc.sub,
        timestamp_sm_vc: new Date().toISOString(),
      });

      this.logger_sm_vc.debug(
        `[Sala] ${user_sm_vc.sub} salió de "${roomId_sm_vc}"`,
      );
    } catch (err_sm_vc) {
      this.logger_sm_vc.error(
        `[leave_conversation_sm_vc] ${(err_sm_vc as Error).message}`,
        (err_sm_vc as Error).stack,
      );
    }
  }

  /**
   * send_message_sm_vc — El cliente envía un mensaje de texto.
   *
   * FLUJO:
   *   1. Verificar que hay user autenticado (WsJwtGuard garantiza esto).
   *   2. [SEGURIDAD SPRINT 4] Bloqueo estricto de escritura para ADMIN:
   *      - Se emite evento 'error_sm_vc' al cliente con código 'FORBIDDEN'.
   *      - Se lanza WsException para cortar el flujo de forma semántica.
   *      - Return temprano: nunca llega a la capa de persistencia.
   *   3. Persistir en BD vía ConversacionesService (event-driven).
   *   4. handleMensajeCreado_sm_vc escucha el EventEmitter y hace el broadcast.
   *
   * Este desacoplamiento garantiza que el Gateway NUNCA emite directamente
   * antes de que el mensaje esté persistido en Base de Datos.
   */
  @UseGuards(WsJwtGuard_sm_vc)
  @SubscribeMessage('send_message_sm_vc')
  async handleSendMessage_sm_vc(
    @ConnectedSocket() client_sm_vc: Socket,
    @MessageBody() payload_sm_vc: SendMessageDto_sm_vc,
  ): Promise<void> {
    try {
      const user_sm_vc = this.obtenerUserAutenticado_sm_vc(client_sm_vc);

      // ── [SPRINT 4] Bloque de Seguridad Estricto: Admin es Solo Lectura ──────────
      // El ADMIN puede OBSERVAR salas de conversación pero NUNCA puede emitir
      // mensajes. Si un cliente intenta bypassear la UI y enviar directamente
      // al socket, este bloque lo intercepta a nivel de protocolo.
      //
      // Doble acción para máxima seguridad y mejor DX del cliente:
      //   1. emit 'error_sm_vc' → el frontend puede reaccionar visualmente.
      //   2. WsException        → corta el flujo y registra el intento.
      // ────────────────────────────────────────────────────────────────────────────
      if (user_sm_vc.rol === 'ADMIN') {
        // Notificar al cliente con el evento de error estandarizado del proyecto
        this.emitirError_sm_vc(
          client_sm_vc,
          'FORBIDDEN',
          'El administrador tiene acceso de solo lectura. No puede enviar mensajes.',
        );

        this.logger_sm_vc.warn(
          `[send_message_sm_vc] INTENTO BLOQUEADO: ` +
            `ADMIN (userId=${user_sm_vc.sub}) intentó escribir en el chat. socket=${client_sm_vc.id}`,
        );

        // Return temprano: el flujo termina aquí, no se persiste nada.
        return;
      }
      // ────────────────────────────────────────────────────────────────────────────

      // ── Persistir en BD (el service emitirá el evento para broadcast) ──
      const mensajeGuardado_sm_vc =
        await this.conversacionesService_sm_vc.registrarMensajeManual_sm_vc({
          estudianteId: payload_sm_vc.estudianteId_sm_vc,
          contenido_sm_vc: payload_sm_vc.contenido_sm_vc,
          materiaId: payload_sm_vc.materiaId_sm_vc,
          documentoId: payload_sm_vc.documentoId_sm_vc,
        });

      // ACK al remitente: confirmación de que el mensaje fue guardado en BD
      // [FIX] Incluir el mensaje completo para actualización optimista de la UI
      client_sm_vc.emit('message_ack_sm_vc', {
        status_sm_vc: 'guardado',
        timestamp_sm_vc: new Date().toISOString(),
        mensaje_sm_vc: mensajeGuardado_sm_vc,
      });
    } catch (err_sm_vc) {
      this.logger_sm_vc.error(
        `[send_message_sm_vc] ${(err_sm_vc as Error).message}`,
        (err_sm_vc as Error).stack,
      );
      this.emitirError_sm_vc(
        client_sm_vc,
        'INTERNAL_ERROR',
        'Error al procesar el mensaje. Inténtalo de nuevo.',
      );
    }
  }

  /**
   * typing_sm_vc — Indicador "escribiendo..." en tiempo real. [Sprint 5]
   *
   * Recibe el estado de escritura del cliente (true/false) y lo retransmite
   * a los DEMÁS miembros de la sala mediante broadcast (excluye al emisor).
   *
   * CONTRATO DE EVENTOS:
   *   Cliente → Servidor : 'typing_sm_vc'        { isTyping_sm_vc, estudianteId_sm_vc, materiaId_sm_vc? }
   *   Servidor → Sala    : 'typing_status_sm_vc'  { userId_sm_vc, rol_sm_vc, isTyping_sm_vc, timestamp_sm_vc }
   *
   * El frontend escucha 'typing_status_sm_vc' en el chatStore_sm_vc para actualizar
   * el mapa reactivo `escribiendo_sm_vc` y mostrar el indicador visual.
   *
   * RESTRICCIONES:
   *   - ADMIN no puede emitir señales de escritura (es solo lectura).
   *   - Si el payload es inválido (sin estudianteId) se descarta silenciosamente.
   *   - No persiste en BD: el broadcast es efímero y no tiene efecto en el historial.
   *
   * @param client_sm_vc  Socket del emisor (excluido del broadcast via .broadcast.to).
   * @param payload_sm_vc DTO con el estado de escritura y contexto de sala.
   */
  @UseGuards(WsJwtGuard_sm_vc)
  @SubscribeMessage('typing_sm_vc')
  handleTyping_sm_vc(
    @ConnectedSocket() client_sm_vc: Socket,
    @MessageBody() payload_sm_vc: TypingStatusDto_sm_vc,
  ): void {
    try {
      const user_sm_vc = this.obtenerUserAutenticado_sm_vc(client_sm_vc);

      // ADMIN no puede emitir señales de escritura (es observador)
      if (user_sm_vc.rol === 'ADMIN') return;

      // Validación defensiva: estudianteId es obligatorio para construir la sala
      if (!payload_sm_vc?.estudianteId_sm_vc) {
        this.logger_sm_vc.warn(
          `[typing_sm_vc] Payload sin estudianteId_sm_vc. socket=${client_sm_vc.id} Descartado.`,
        );
        return;
      }

      const roomId_sm_vc = this.buildRoomId_sm_vc(
        payload_sm_vc.estudianteId_sm_vc,
        payload_sm_vc.materiaId_sm_vc,
      );

      // broadcast.to(room) — envía a TODOS en la sala EXCEPTO al emisor.
      // Semánticamente equivalente a client.to(room) pero más explícito en intención.
      client_sm_vc.broadcast.to(roomId_sm_vc).emit('typing_status_sm_vc', {
        userId_sm_vc: user_sm_vc.sub,
        rol_sm_vc: user_sm_vc.rol,
        isTyping_sm_vc: payload_sm_vc.isTyping_sm_vc,
        timestamp_sm_vc: new Date().toISOString(),
      });

      this.logger_sm_vc.debug(
        `[Typing] userId=${user_sm_vc.sub} isTyping=${payload_sm_vc.isTyping_sm_vc} → sala "${roomId_sm_vc}"`,
      );
    } catch (err_sm_vc) {
      this.logger_sm_vc.error(
        `[typing_sm_vc] Error inesperado: ${(err_sm_vc as Error).message}`,
      );
    }
  }

  // ══════════════════════════════════════════════════════════════
  // LISTENER DE EVENTO INTERNO — EventEmitter2 (Servidor → Sala)
  // ══════════════════════════════════════════════════════════════

  /**
   * handleMensajeCreado_sm_vc — Listener del evento 'mensaje.creado_sm_vc'.
   *
   * Este método es el único punto donde el gateway emite mensajes a las salas.
   * Es invocado por EventEmitter2 cuando ConversacionesService persiste
   * un mensaje (manual o de sistema). Garantía: el mensaje ya está en BD
   * antes de que llegue al cliente.
   */
  @OnEvent('mensaje.creado_sm_vc', { async: true })
  handleMensajeCreado_sm_vc(payload_sm_vc: MensajeCreadoPayload_sm_vc): void {
    try {
      const roomId_sm_vc = this.buildRoomId_sm_vc(
        payload_sm_vc.estudianteId_sm_vc,
        payload_sm_vc.materiaId_sm_vc,
      );

      this.server_sm_vc
        .to(roomId_sm_vc)
        .emit('message_received_sm_vc', payload_sm_vc.mensaje_sm_vc);

      this.logger_sm_vc.debug(
        `[Broadcast] message_received_sm_vc → sala "${roomId_sm_vc}"`,
      );
    } catch (err_sm_vc) {
      this.logger_sm_vc.error(
        `[handleMensajeCreado_sm_vc] Error en broadcast: ${(err_sm_vc as Error).message}`,
        (err_sm_vc as Error).stack,
      );
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ══════════════════════════════════════════════════════════════

  /**
   * Construye el roomId con el patrón estándar del proyecto:
   *   conv:{estudianteId}:{materiaId|'global'}
   */
  private buildRoomId_sm_vc(
    estudianteId_sm_vc: number,
    materiaId_sm_vc?: number,
  ): string {
    return `conv:${estudianteId_sm_vc}:${materiaId_sm_vc ?? 'global'}`;
  }

  /**
   * verificarPermisoSala_sm_vc — Verificación de sala para el handler leave.
   *
   * [SPRINT 4 COMPLETADO]: La validación granular de acceso al unirse a salas
   * la gestiona ChatRoomGuard_sm_vc (Guards de NestJS), no este método.
   * Este helper se mantiene únicamente para handleLeave_sm_vc donde no aplica
   * el guard de sala (salir es siempre un acto permitido si ya estás dentro).
   *
   *   ESTUDIANTE → solo puede salir de su propia sala.
   *   PROFESOR   → puede salir de cualquier sala a la que accedió.
   *   ADMIN      → puede salir de cualquier sala (oyente universal).
   */
  private verificarPermisoSala_sm_vc(
    user_sm_vc: JwtPayloadWs_sm_vc,
    estudianteId_sm_vc: number,
  ): boolean {
    switch (user_sm_vc.rol) {
      case 'ESTUDIANTE':
        return user_sm_vc.sub === estudianteId_sm_vc;
      case 'PROFESOR':
        // Al salir no re-validamos BD: si entró, fue porque tenía permiso.
        return true;
      case 'ADMIN':
        return true;
      default:
        return false;
    }
  }

  /** Obtiene el payload del usuario autenticado desde socket.data. */
  private obtenerUserAutenticado_sm_vc(
    client_sm_vc: Socket,
  ): JwtPayloadWs_sm_vc {
    const user_sm_vc = client_sm_vc.data?.user_sm_vc as
      | JwtPayloadWs_sm_vc
      | undefined;
    if (!user_sm_vc) {
      this.emitirError_sm_vc(
        client_sm_vc,
        'UNAUTHORIZED',
        'Sesión no autenticada.',
      );
      client_sm_vc.disconnect(true);
      throw new Error(`Socket ${client_sm_vc.id} sin user_sm_vc en data.`);
    }
    return user_sm_vc;
  }

  /** Extrae el Bearer token del handshake (auth o query). */
  private extraerTokenHandshake_sm_vc(client_sm_vc: Socket): string | null {
    return (
      (client_sm_vc.handshake.auth?.token as string | undefined) ??
      (client_sm_vc.handshake.query?.token as string | undefined) ??
      null
    );
  }

  /** Emite un error estandarizado al cliente. */
  private emitirError_sm_vc(
    client_sm_vc: Socket,
    code_sm_vc: string,
    message_sm_vc: string,
  ): void {
    client_sm_vc.emit('error_sm_vc', {
      code_sm_vc,
      message_sm_vc,
      timestamp_sm_vc: new Date().toISOString(),
    });
  }
}
