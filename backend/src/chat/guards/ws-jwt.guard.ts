import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * WsJwtGuard_sm_vc — Guard de autenticación JWT para eventos WebSocket.
 *
 * Extrae el token de `handshake.auth.token` (preferido) o de
 * `handshake.query.token` (fallback para clientes que no soportan auth map).
 * En caso de token inválido desconecta el socket de forma limpia.
 */
@Injectable()
export class WsJwtGuard_sm_vc implements CanActivate {
  private readonly logger_sm_vc = new Logger(WsJwtGuard_sm_vc.name);

  constructor(private readonly jwtService_sm_vc: JwtService) {}

  canActivate(context_sm_vc: ExecutionContext): boolean {
    const client_sm_vc = context_sm_vc.switchToWs().getClient<Socket>();

    try {
      const token_sm_vc = this.extraerToken_sm_vc(client_sm_vc);

      if (!token_sm_vc) {
        this.rechazarConexion_sm_vc(
          client_sm_vc,
          'TOKEN_MISSING',
          'Token de autenticación no proporcionado.',
        );
        return false;
      }

      const payload_sm_vc = this.jwtService_sm_vc.verify(token_sm_vc);
      client_sm_vc.data.user_sm_vc = payload_sm_vc;
      return true;
    } catch (err_sm_vc) {
      this.logger_sm_vc.warn(
        `[WsJwtGuard_sm_vc] Evento rechazado para socket ${client_sm_vc.id}: ${err_sm_vc.message}`,
      );
      this.rechazarConexion_sm_vc(
        client_sm_vc,
        'TOKEN_INVALID',
        'Token JWT inválido o expirado.',
      );
      return false;
    }
  }

  // ─── Helpers privados ───────────────────────────────────────────

  private extraerToken_sm_vc(client_sm_vc: Socket): string | null {
    return (
      (client_sm_vc.handshake.auth?.token as string | undefined) ??
      (client_sm_vc.handshake.query?.token as string | undefined) ??
      null
    );
  }

  private rechazarConexion_sm_vc(
    client_sm_vc: Socket,
    code_sm_vc: string,
    message_sm_vc: string,
  ): void {
    client_sm_vc.emit('error_sm_vc', { code_sm_vc, message_sm_vc });
    client_sm_vc.disconnect(true);
    throw new WsException(message_sm_vc);
  }
}