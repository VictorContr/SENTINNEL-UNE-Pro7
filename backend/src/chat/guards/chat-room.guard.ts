import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { JoinRoomDto_sm_vc } from '../dto/join-room.dto';

/**
 * Payload del JWT almacenado en socket.data.user_sm_vc al momento de la conexión.
 * Definido de forma consistente con WsJwtGuard_sm_vc y handleConnection.
 */
interface JwtPayloadWs_sm_vc {
  sub: number;
  rol: string;
  correo: string;
}

/**
 * ChatRoomGuard_sm_vc — Guard de Autorización por Sala (Sprint 4).
 *
 * Intercepta el evento 'join_conversation_sm_vc' ANTES de que llegue al handler
 * del Gateway y aplica la política de acceso según el rol del usuario autenticado:
 *
 *   ESTUDIANTE → Solo puede unirse a su propia sala (sub === estudianteId).
 *   PROFESOR   → Solo puede unirse a salas de sus estudiantes asignados.
 *                Validación activa vía Prisma: busca en `tdestudiante_sm_vc`
 *                que el student tenga `profesor_id_sm_vc === profesorId (sub)`.
 *   ADMIN      → Acceso universal (modo oyente). Retorna true inmediatamente.
 *                El bloqueo de escritura se aplica en el Gateway, no aquí.
 *
 * En caso de denegación, lanza WsException (no HttpException), lo que Socket.io
 * captura y transmite como evento 'exception' al cliente de forma limpia.
 *
 * @injectable — Debe registrarse como provider en ChatModule_sm_vc.
 */
@Injectable()
export class ChatRoomGuard_sm_vc implements CanActivate {
  private readonly logger_sm_vc = new Logger(ChatRoomGuard_sm_vc.name);

  constructor(private readonly prisma_sm_vc: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extraemos el cliente y el payload del evento WebSocket
    const client_sm_vc  = context.switchToWs().getClient<Socket>();
    const payload_sm_vc = context.switchToWs().getData<JoinRoomDto_sm_vc>();

    // Recuperamos el usuario autenticado que WsJwtGuard_sm_vc inyectó en handleConnection
    const user_sm_vc = client_sm_vc.data?.user_sm_vc as JwtPayloadWs_sm_vc | undefined;

    // Defensa: si el guard se usa sin WsJwtGuard, jamás debe pasar
    if (!user_sm_vc) {
      this.logger_sm_vc.warn(
        `[ChatRoomGuard] socket=${client_sm_vc.id} — user_sm_vc no encontrado en socket.data.` +
        ' ¿Falta WsJwtGuard en handleConnection?',
      );
      throw new WsException({
        code_sm_vc:    'UNAUTHORIZED',
        message_sm_vc: 'Sesión no autenticada. Token JWT requerido.',
      });
    }

    const estudianteId_sm_vc = payload_sm_vc?.estudianteId_sm_vc;

    // Validar que el payload contiene el campo obligatorio
    if (!estudianteId_sm_vc || isNaN(Number(estudianteId_sm_vc))) {
      throw new WsException({
        code_sm_vc:    'BAD_REQUEST',
        message_sm_vc: 'El campo estudianteId_sm_vc es obligatorio y debe ser un número válido.',
      });
    }

    this.logger_sm_vc.debug(
      `[ChatRoomGuard] Verificando acceso: rol=${user_sm_vc.rol} ` +
      `userId=${user_sm_vc.sub} → estudianteId=${estudianteId_sm_vc}`,
    );

    switch (user_sm_vc.rol) {
      case 'ESTUDIANTE':
        return await this.verificarEstudiante_sm_vc(user_sm_vc, estudianteId_sm_vc);

      case 'PROFESOR':
        return await this.verificarProfesor_sm_vc(user_sm_vc, estudianteId_sm_vc);

      case 'ADMIN':
        // El administrador puede observar cualquier sala (modo oyente universal).
        // La restricción de escritura se aplica en Chat Gateway, no aquí.
        this.logger_sm_vc.debug(
          `[ChatRoomGuard] ADMIN (userId=${user_sm_vc.sub}) → acceso universal concedido.`,
        );
        return true;

      default:
        // Rol desconocido: rechazar con WsException para cierre limpio
        this.logger_sm_vc.warn(
          `[ChatRoomGuard] Rol desconocido "${user_sm_vc.rol}" para socket=${client_sm_vc.id}. Acceso denegado.`,
        );
        throw new WsException({
          code_sm_vc:    'FORBIDDEN',
          message_sm_vc: `Rol "${user_sm_vc.rol}" no tiene permisos para acceder a las salas de conversación.`,
        });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // ══════════════════════════════════════════════════════════════

  /**
   * verificarEstudiante_sm_vc — Política de sala para ESTUDIANTE.
   *
   * Un estudiante solo puede unirse a la sala que corresponde a su propio ID.
   * Comparamos `user.sub` (id del JWT) con el `estudianteId_sm_vc` del DTO.
   *
   * IMPORTANTE: Comparamos como números para evitar fallos de tipo ('5' !== 5).
   */
  private async verificarEstudiante_sm_vc(
    user_sm_vc: JwtPayloadWs_sm_vc,
    estudianteId_sm_vc: number,
  ): Promise<boolean> {
    try {
      const estudiante_sm_vc = await this.prisma_sm_vc.estudiante.findFirst({
        where: {
          id_sm_vc: Number(estudianteId_sm_vc),
          usuario_id_sm_vc: Number(user_sm_vc.sub),
        },
        select: { id_sm_vc: true },
      });

      if (!estudiante_sm_vc) {
        this.logger_sm_vc.warn(
          `[ChatRoomGuard] ESTUDIANTE (userId=${user_sm_vc.sub}) intentó acceder ` +
          `a sala de estudianteId=${estudianteId_sm_vc} que NO le pertenece. Acceso DENEGADO.`,
        );
        throw new WsException({
          code_sm_vc:    'FORBIDDEN',
          message_sm_vc: 'Solo puedes acceder a tu propia conversación.',
        });
      }

      return true;
    } catch (err_sm_vc) {
      if (err_sm_vc instanceof WsException) throw err_sm_vc;
      this.logger_sm_vc.error(
        `[ChatRoomGuard] Error validando ESTUDIANTE (userId=${user_sm_vc.sub}): ${(err_sm_vc as Error).message}`,
      );
      throw new WsException({
        code_sm_vc:    'INTERNAL_ERROR',
        message_sm_vc: 'Error al verificar permisos de acceso a la sala. Intenta de nuevo.',
      });
    }
  }

  /**
   * verificarProfesor_sm_vc — Política de sala para PROFESOR.
   *
   * El sistema consulta la tabla `tdestudiante_sm_vc` para verificar si el
   * estudiante solicitado tiene asignado al profesor como tutor:
   *   WHERE id_sm_vc = estudianteId AND profesor_id_sm_vc = userId (sub del JWT)
   *
   * Si no existe esta relación, el profesor no tiene permiso para ver la sala.
   *
   * @throws WsException si el estudiante no está asignado al profesor.
   */
  private async verificarProfesor_sm_vc(
    user_sm_vc: JwtPayloadWs_sm_vc,
    estudianteId_sm_vc: number,
  ): Promise<boolean> {
    try {
      const estudianteAsignado_sm_vc = await this.prisma_sm_vc.estudiante.findFirst({
        where: {
          // El estudiante cuya sala se solicita
          id_sm_vc: Number(estudianteId_sm_vc),
          // Y que tenga a este profesor como tutor asignado
          profesor_id_sm_vc: Number(user_sm_vc.sub),
        },
        // Solo necesitamos confirmar existencia
        select: { id_sm_vc: true },
      });

      if (!estudianteAsignado_sm_vc) {
        this.logger_sm_vc.warn(
          `[ChatRoomGuard] PROFESOR (userId=${user_sm_vc.sub}) intentó acceder ` +
          `a sala del estudianteId=${estudianteId_sm_vc} que NO le pertenece. Acceso DENEGADO.`,
        );
        throw new WsException({
          code_sm_vc:    'FORBIDDEN',
          message_sm_vc: 'Solo puedes acceder a conversaciones de tus estudiantes asignados.',
        });
      }

      this.logger_sm_vc.debug(
        `[ChatRoomGuard] PROFESOR (userId=${user_sm_vc.sub}) → ` +
        `acceso concedido a sala de estudianteId=${estudianteId_sm_vc}.`,
      );

      return true;
    } catch (err_sm_vc) {
      // Re-lanzar WsException sin modificar (es parte del flujo normal de negación)
      if (err_sm_vc instanceof WsException) throw err_sm_vc;

      // Para errores inesperados de BD, loguear y lanzar WsException genérica
      this.logger_sm_vc.error(
        `[ChatRoomGuard] Error inesperado consultando Prisma para ` +
        `PROFESOR (userId=${user_sm_vc.sub}): ${(err_sm_vc as Error).message}`,
        (err_sm_vc as Error).stack,
      );
      throw new WsException({
        code_sm_vc:    'INTERNAL_ERROR',
        message_sm_vc: 'Error al verificar permisos de acceso a la sala. Intenta de nuevo.',
      });
    }
  }
}
