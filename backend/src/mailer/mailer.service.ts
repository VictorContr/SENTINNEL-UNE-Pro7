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

@Injectable()
export class MailerContactoService_sm_vc {
  // Logger de NestJS para trazabilidad en consola
  private readonly logger_sm_vc = new Logger(MailerContactoService_sm_vc.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Envía un correo al administrador de SENTINNEL con los datos
   * enviados desde el formulario de contacto de la Landing Page.
   */
  async enviarContacto_sm_vc(
    dto_sm_vc: EnviarContactoDto_sm_vc,
  ): Promise<void> {
    // Destinatario admin obtenido desde .env (MAIL_TO)
    const destinatario_sm_vc = this.configService.get<string>('MAIL_TO');

    if (!destinatario_sm_vc) {
      this.logger_sm_vc.error('Variable de entorno MAIL_TO no configurada.');
      throw new InternalServerErrorException(
        'El servidor de correo no está configurado correctamente.',
      );
    }

    try {
      await this.mailerService.sendMail({
        to: destinatario_sm_vc,
        // El asunto del correo incluye el asunto del visitante para identificarlo fácilmente
        subject: `[SENTINNEL] Solicitud de Demo — ${dto_sm_vc.asunto_sm_vc}`,
        // Plantilla HTML del correo con diseño minimalista
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #0d7a6f; margin-bottom: 4px;">Nueva solicitud de demo — SENTINNEL</h2>
            <p style="color: #666; font-size: 13px; margin-bottom: 24px;">Un visitante de la Landing Page ha solicitado información.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #333; width: 120px;">Nombre:</td>
                <td style="padding: 10px 0; color: #555;">${dto_sm_vc.nombre_sm_vc}</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #333;">Correo:</td>
                <td style="padding: 10px 0; color: #555;"><a href="mailto:${dto_sm_vc.correo_sm_vc}" style="color: #0d7a6f;">${dto_sm_vc.correo_sm_vc}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #333;">Asunto:</td>
                <td style="padding: 10px 0; color: #555;">${dto_sm_vc.asunto_sm_vc}</td>
              </tr>
            </table>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 11px; color: #aaa;">Este mensaje fue generado automáticamente por el sistema SENTINNEL.</p>
          </div>
        `,
      });

      this.logger_sm_vc.log(
        `Correo de contacto enviado por: ${dto_sm_vc.correo_sm_vc}`,
      );
    } catch (error_sm_vc) {
      this.logger_sm_vc.error(
        `Error al enviar correo de contacto: ${error_sm_vc?.message}`,
        error_sm_vc?.stack,
      );
      throw new InternalServerErrorException(
        'No se pudo enviar el correo. Inténtalo de nuevo más tarde.',
      );
    }
  }
}
