import { Module } from '@nestjs/common';
import { ChatGateway_sm_vc } from './gateways/chat.gateway';
import { WsJwtGuard_sm_vc } from './guards/ws-jwt.guard';
import { ChatRoomGuard_sm_vc } from './guards/chat-room.guard';
import { ChatPresenceService_sm_vc } from './services/chat-presence.service';
import { AuthModule_sm_vc } from '../auth/auth.module';
import { ConversacionesModule } from '../conversaciones/conversaciones.module';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * ChatModule_sm_vc — Módulo de WebSockets en tiempo real.
 *
 * Importa:
 *   - AuthModule_sm_vc    → Provee JwtService para WsJwtGuard_sm_vc y handleConnection.
 *   - ConversacionesModule → Provee ConversacionesService para persistir mensajes WS.
 *   - PrismaModule        → Provee PrismaService para ChatRoomGuard_sm_vc (validación BD).
 *
 * NO importa EventEmitterModule (es global en AppModule).
 * NO hay dependencia circular: ConversacionesModule no conoce ChatModule.
 */
@Module({
  imports: [
    AuthModule_sm_vc,
    ConversacionesModule,
    PrismaModule,  // Requerido por ChatRoomGuard_sm_vc para consultas Prisma
  ],
  providers: [
    ChatGateway_sm_vc,
    WsJwtGuard_sm_vc,
    ChatRoomGuard_sm_vc,  // Sprint 4: Guard de autorización granular por sala
    ChatPresenceService_sm_vc,
  ],
  exports: [ChatPresenceService_sm_vc],
})
export class ChatModule_sm_vc {}