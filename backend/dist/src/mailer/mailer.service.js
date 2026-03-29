"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailerContactoService_sm_vc_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerContactoService_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let MailerContactoService_sm_vc = MailerContactoService_sm_vc_1 = class MailerContactoService_sm_vc {
    mailerService;
    configService;
    prisma;
    logger_sm_vc = new common_1.Logger(MailerContactoService_sm_vc_1.name);
    constructor(mailerService, configService, prisma) {
        this.mailerService = mailerService;
        this.configService = configService;
        this.prisma = prisma;
    }
    async enviarContacto_sm_vc(dto_sm_vc) {
        try {
            const usuarioExistente_sm_vc = await this.prisma.usuario.findFirst({
                where: {
                    OR: [
                        { correo_sm_vc: dto_sm_vc.correo_sm_vc },
                        { cedula_sm_vc: dto_sm_vc.cedula_sm_vc },
                    ],
                },
            });
            if (usuarioExistente_sm_vc) {
                throw new common_1.InternalServerErrorException('El usuario con este correo o cédula ya se encuentra registrado.');
            }
            const clavePlana_sm_vc = Math.random().toString(36).slice(-8);
            const salt_sm_vc = await bcrypt.genSalt(10);
            const claveHash_sm_vc = await bcrypt.hash(clavePlana_sm_vc, salt_sm_vc);
            await this.prisma.usuario.create({
                data: {
                    nombre_sm_vc: dto_sm_vc.nombre_sm_vc,
                    apellido_sm_vc: '',
                    cedula_sm_vc: dto_sm_vc.cedula_sm_vc,
                    correo_sm_vc: dto_sm_vc.correo_sm_vc,
                    clave_sm_vc: claveHash_sm_vc,
                    rol_sm_vc: 'ADMIN',
                    requiere_cambio_clave_sm_vc: true,
                },
            });
            this.logger_sm_vc.log(`Usuario ADMIN creado vía contacto: ${dto_sm_vc.correo_sm_vc}`);
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
            this.logger_sm_vc.log(`Correo de credenciales enviado a: ${dto_sm_vc.correo_sm_vc}`);
        }
        catch (error_sm_vc) {
            this.logger_sm_vc.error(`Error al registrar o enviar correo: ${error_sm_vc?.message}`, error_sm_vc?.stack);
            throw new common_1.InternalServerErrorException(error_sm_vc?.message || 'No se pudo registrar y enviar el correo. Inténtalo de nuevo más tarde.');
        }
    }
};
exports.MailerContactoService_sm_vc = MailerContactoService_sm_vc;
exports.MailerContactoService_sm_vc = MailerContactoService_sm_vc = MailerContactoService_sm_vc_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService, typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, prisma_service_1.PrismaService])
], MailerContactoService_sm_vc);
//# sourceMappingURL=mailer.service.js.map