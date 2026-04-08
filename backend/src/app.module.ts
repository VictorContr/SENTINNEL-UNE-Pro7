import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
<<<<<<< HEAD
=======
import { EventEmitterModule } from '@nestjs/event-emitter';
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
import { PrismaModule }              from './prisma/prisma.module';
import { AuthModule_sm_vc }          from './auth/auth.module';
import { UsersModule_sm_vc }         from './users/users.module';
import { PasantiasModule_sm_vc }     from './pasantias/pasantias.module';
import { MailerContactoModule_sm_vc } from './mailer/mailer.module';
import { AdminModule }               from './admin/admin.module';
// ── Nuevos módulos ──
import { DocumentosModule }  from './documentos/documentos.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { EstudiantesModule }  from './estudiantes/estudiantes.module';
import { DeployModule }       from './deploy/deploy.module';
<<<<<<< HEAD
=======
import { ConversacionesModule } from './conversaciones/conversaciones.module';
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
<<<<<<< HEAD
=======
    EventEmitterModule.forRoot(),
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
    PrismaModule,
    AuthModule_sm_vc,
    UsersModule_sm_vc,
    PasantiasModule_sm_vc,
    MailerContactoModule_sm_vc,
    AdminModule,
    // ── Módulos nuevos SENTINNEL ──
    DocumentosModule,
    EvaluacionesModule,
    EstudiantesModule,
    DeployModule,
<<<<<<< HEAD
=======
    ConversacionesModule,
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
  ],
})
export class AppModule {}