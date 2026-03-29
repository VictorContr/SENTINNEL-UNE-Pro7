// =============================================================
// SRC/MAILER/MAILER.CONTROLLER.TS
//
// Controlador que expone el endpoint público POST /api/mailer/contacto.
// Ruta SIN autenticación JWT: los visitantes de la Landing Page
// no tienen cuenta; proteger esta ruta bloquearía el propósito
// del formulario de contacto.
// =============================================================

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MailerContactoService_sm_vc } from './mailer.service';
import { EnviarContactoDto_sm_vc } from './dto/enviar-contacto.dto';

@Controller('mailer')
export class MailerController_sm_vc {
  constructor(
    private readonly mailerContactoService: MailerContactoService_sm_vc,
  ) {}

  /**
   * POST /api/mailer/contacto
   * Recibe { nombre_sm_vc, correo_sm_vc, asunto_sm_vc } del formulario
   * de la Landing y dispara el envío del correo al admin de SENTINNEL.
   */
  @Post('contacto')
  @HttpCode(HttpStatus.OK) // 200 en lugar de 201: no crea un recurso, solo ejecuta una acción
  async enviarContacto_sm_vc(
    @Body() dto_sm_vc: EnviarContactoDto_sm_vc,
  ): Promise<{ message: string }> {
    await this.mailerContactoService.enviarContacto_sm_vc(dto_sm_vc);
    return {
      message:
        'Correo enviado correctamente. ¡Nos pondremos en contacto pronto!',
    };
  }
}
