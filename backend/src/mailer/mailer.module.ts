// =============================================================
// SRC/MAILER/MAILER.MODULE.TS
//
// Módulo NestJS que configura @nestjs-modules/mailer de forma
// asíncrona, leyendo las credenciales SMTP desde ConfigService
// (variables de entorno). Expone el controlador y servicio.
// =============================================================

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerController_sm_vc } from './mailer.controller';
import { MailerContactoService_sm_vc } from './mailer.service';

@Module({
  imports: [
    // Configuración asíncrona: lee del ConfigService para no exponer secrets en código
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false, // false = TLS via STARTTLS (puerto 587). Cambiar a true para puerto 465
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
      }),
    }),
  ],
  controllers: [MailerController_sm_vc],
  providers: [MailerContactoService_sm_vc],
})
export class MailerContactoModule_sm_vc {}
