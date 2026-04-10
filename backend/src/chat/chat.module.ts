import { Module } from '@nestjs/common';
import { ChatGateway_sm_vc } from './gateways/chat.gateway';
import { WsJwtGuard_sm_vc } from './guards/ws-jwt.guard';
import { ChatPresenceService_sm_vc } from './services/chat-presence.service';
import { AuthModule_sm_vc } from '../auth/auth.module';
import { ConversacionesModule } from '../conversaciones/conversaciones.module';

/**
 * ChatModule_sm_vc — Módulo de WebSockets en tiempo real.
 *
 * Importa:
 *   - AuthModule_sm_vc    → Provee JwtService para WsJwtGuard_sm_vc y handleConnection.
 *   - ConversacionesModule → Provee ConversacionesService para persistir mensajes WS.
 *
 * NO importa EventEmitterModule (es global en AppModule).
 * NO hay dependencia circular: ConversacionesModule no conoce ChatModule.
 */
@Module({
  imports: [
    AuthModule_sm_vc,
    ConversacionesModule,
  ],
  providers: [
    ChatGateway_sm_vc,
    WsJwtGuard_sm_vc,
    ChatPresenceService_sm_vc,
  ],
  exports: [ChatPresenceService_sm_vc],
})
export class ChatModule_sm_vc {}