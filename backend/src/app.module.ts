import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule }              from './prisma/prisma.module';
import { AuthModule_sm_vc }          from './auth/auth.module';
import { UsersModule_sm_vc }         from './users/users.module';
import { PasantiasModule_sm_vc }     from './pasantias/pasantias.module';
import { MailerContactoModule_sm_vc } from './mailer/mailer.module';
import { AdminModule }               from './admin/admin.module';
import { DocumentosModule }          from './documentos/documentos.module';
import { EvaluacionesModule }        from './evaluaciones/evaluaciones.module';
import { EstudiantesModule }         from './estudiantes/estudiantes.module';
import { DeployModule }              from './deploy/deploy.module';
import { ConversacionesModule }      from './conversaciones/conversaciones.module';
// ── Sprint 1: Módulo de WebSockets ──────────────────────────────
import { ChatModule_sm_vc }          from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule_sm_vc,
    UsersModule_sm_vc,
    PasantiasModule_sm_vc,
    MailerContactoModule_sm_vc,
    AdminModule,
    DocumentosModule,
    EvaluacionesModule,
    EstudiantesModule,
    DeployModule,
    ConversacionesModule,
    // ── WebSockets en tiempo real ──
    ChatModule_sm_vc,
  ],
})
export class AppModule {}