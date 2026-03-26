"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailerContactoService_sm_vc_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerContactoService_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
let MailerContactoService_sm_vc = MailerContactoService_sm_vc_1 = class MailerContactoService_sm_vc {
    mailerService;
    configService;
    logger_sm_vc = new common_1.Logger(MailerContactoService_sm_vc_1.name);
    constructor(mailerService, configService) {
        this.mailerService = mailerService;
        this.configService = configService;
    }
    async enviarContacto_sm_vc(dto_sm_vc) {
        const destinatario_sm_vc = this.configService.get('MAIL_TO');
        if (!destinatario_sm_vc) {
            this.logger_sm_vc.error('Variable de entorno MAIL_TO no configurada.');
            throw new common_1.InternalServerErrorException('El servidor de correo no está configurado correctamente.');
        }
        try {
            await this.mailerService.sendMail({
                to: destinatario_sm_vc,
                subject: `[SENTINNEL] Solicitud de Demo — ${dto_sm_vc.asunto_sm_vc}`,
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
            this.logger_sm_vc.log(`Correo de contacto enviado por: ${dto_sm_vc.correo_sm_vc}`);
        }
        catch (error_sm_vc) {
            this.logger_sm_vc.error(`Error al enviar correo de contacto: ${error_sm_vc?.message}`, error_sm_vc?.stack);
            throw new common_1.InternalServerErrorException('No se pudo enviar el correo. Inténtalo de nuevo más tarde.');
        }
    }
};
exports.MailerContactoService_sm_vc = MailerContactoService_sm_vc;
exports.MailerContactoService_sm_vc = MailerContactoService_sm_vc = MailerContactoService_sm_vc_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        config_1.ConfigService])
], MailerContactoService_sm_vc);
//# sourceMappingURL=mailer.service.js.map