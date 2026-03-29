// =============================================================
// SRC/MAILER/MAILER.SERVICE.TS
//
// Servicio encargado de enviar correos electrónicos vía SMTP.
// Utiliza @nestjs-modules/mailer (wrapper de nodemailer) para
// abstraer la configuración del transporte SMTP. Lee el destino
// de los correos desde ConfigService (MAIL_TO en .env),
// siguiendo el principio de no hardcodear datos sensibles.
// =============================================================

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EnviarContactoDto_sm_vc } from './dto/enviar-contacto.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class MailerContactoService_sm_vc {
  // Logger de NestJS para trazabilidad en consola
  private readonly logger_sm_vc = new Logger(MailerContactoService_sm_vc.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Envía un correo al visitante con sus credenciales y crea la cuenta automáticamente.
   */
  async enviarContacto_sm_vc(
    dto_sm_vc: EnviarContactoDto_sm_vc,
  ): Promise<void> {
    try {
      // 1. Verificar si el usuario ya existe
      const usuarioExistente_sm_vc = await this.prisma.usuario.findFirst({
        where: {
          OR: [
            { correo_sm_vc: dto_sm_vc.correo_sm_vc },
            { cedula_sm_vc: dto_sm_vc.cedula_sm_vc },
          ],
        },
      });

      if (usuarioExistente_sm_vc) {
        throw new InternalServerErrorException(
          'El usuario con este correo o cédula ya se encuentra registrado.',
        );
      }

      // 2. Generar contraseña y guardar
      const clavePlana_sm_vc = Math.random().toString(36).slice(-8);
      const salt_sm_vc = await bcrypt.genSalt(10);
      const claveHash_sm_vc = await bcrypt.hash(clavePlana_sm_vc, salt_sm_vc);

      await this.prisma.usuario.create({
        data: {
          nombre_sm_vc: dto_sm_vc.nombre_sm_vc,
          apellido_sm_vc: '', // Campo no incluido en Formulario de Contacto
          cedula_sm_vc: dto_sm_vc.cedula_sm_vc,
          correo_sm_vc: dto_sm_vc.correo_sm_vc,
          clave_sm_vc: claveHash_sm_vc,
          rol_sm_vc: 'ADMIN',
          // @ts-ignore: pending prisma generated
          requiere_cambio_clave_sm_vc: true,
        },
      });
      this.logger_sm_vc.log(`Usuario ADMIN creado vía contacto: ${dto_sm_vc.correo_sm_vc}`);

      // 3. Enviar Correo al Visitante
      await this.mailerService.sendMail({
        to: dto_sm_vc.correo_sm_vc,
        subject: `[SENTINNEL] Tus credenciales de acceso — ${dto_sm_vc.asunto_sm_vc}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0d7a6f; margin-bottom: 4px;">Bienvenido a SENTINNEL</h2>
            <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Hemos recibido tu solicitud de demo. A continuación, te proporcionamos credenciales temporales para acceder al sistema con el rol administrador:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f9f9f9;">
                <td style="padding: 10px 15px; font-weight: 600; color: #333; width: 120px;">Usuario:</td>
                <td style="padding: 10px 15px; color: #0d7a6f;">${dto_sm_vc.correo_sm_vc}</td>
              </tr>
              <tr>
                <td style="padding: 10px 15px; font-weight: 600; color: #333;">Clave Temporal:</td>
                <td style="padding: 10px 15px; color: #555;"><strong>${clavePlana_sm_vc}</strong></td>
              </tr>
            </table>
            <p style="color: #d32f2f; font-size: 13px; font-weight: bold; margin-top: 24px;">Importante: Por razones de seguridad, debes cambiar esta contraseña la primera vez que inicies sesión.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 11px; color: #aaa;">Este mensaje fue generado automáticamente por el sistema SENTINNEL.</p>
          </div>
        `,
      });

      this.logger_sm_vc.log(
        `Correo de credenciales enviado a: ${dto_sm_vc.correo_sm_vc}`,
      );
    } catch (error_sm_vc) {
      this.logger_sm_vc.error(
        `Error al registrar o enviar correo: ${error_sm_vc?.message}`,
        error_sm_vc?.stack,
      );
      throw new InternalServerErrorException(
        error_sm_vc?.message || 'No se pudo registrar y enviar el correo. Inténtalo de nuevo más tarde.',
      );
    }
  }
}
