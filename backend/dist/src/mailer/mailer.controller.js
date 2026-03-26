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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerController_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const mailer_service_1 = require("./mailer.service");
const enviar_contacto_dto_1 = require("./dto/enviar-contacto.dto");
let MailerController_sm_vc = class MailerController_sm_vc {
    mailerContactoService;
    constructor(mailerContactoService) {
        this.mailerContactoService = mailerContactoService;
    }
    async enviarContacto_sm_vc(dto_sm_vc) {
        await this.mailerContactoService.enviarContacto_sm_vc(dto_sm_vc);
        return {
            message: 'Correo enviado correctamente. ¡Nos pondremos en contacto pronto!',
        };
    }
};
exports.MailerController_sm_vc = MailerController_sm_vc;
__decorate([
    (0, common_1.Post)('contacto'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enviar_contacto_dto_1.EnviarContactoDto_sm_vc]),
    __metadata("design:returntype", Promise)
], MailerController_sm_vc.prototype, "enviarContacto_sm_vc", null);
exports.MailerController_sm_vc = MailerController_sm_vc = __decorate([
    (0, common_1.Controller)('mailer'),
    __metadata("design:paramtypes", [mailer_service_1.MailerContactoService_sm_vc])
], MailerController_sm_vc);
//# sourceMappingURL=mailer.controller.js.map