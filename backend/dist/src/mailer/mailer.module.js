"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerContactoModule_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const mailer_controller_1 = require("./mailer.controller");
const mailer_service_1 = require("./mailer.service");
let MailerContactoModule_sm_vc = class MailerContactoModule_sm_vc {
};
exports.MailerContactoModule_sm_vc = MailerContactoModule_sm_vc;
exports.MailerContactoModule_sm_vc = MailerContactoModule_sm_vc = __decorate([
    (0, common_1.Module)({
        imports: [
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    transport: {
                        host: configService.get('SMTP_HOST'),
                        port: configService.get('SMTP_PORT'),
                        secure: false,
                        auth: {
                            user: configService.get('SMTP_USER'),
                            pass: configService.get('SMTP_PASS'),
                        },
                    },
                    defaults: {
                        from: configService.get('MAIL_FROM'),
                    },
                }),
            }),
        ],
        controllers: [mailer_controller_1.MailerController_sm_vc],
        providers: [mailer_service_1.MailerContactoService_sm_vc],
    })
], MailerContactoModule_sm_vc);
//# sourceMappingURL=mailer.module.js.map