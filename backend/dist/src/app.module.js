"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const pasantias_module_1 = require("./pasantias/pasantias.module");
const mailer_module_1 = require("./mailer/mailer.module");
const admin_module_1 = require("./admin/admin.module");
const documentos_module_1 = require("./documentos/documentos.module");
const evaluaciones_module_1 = require("./evaluaciones/evaluaciones.module");
const estudiantes_module_1 = require("./estudiantes/estudiantes.module");
const deploy_module_1 = require("./deploy/deploy.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule_sm_vc,
            users_module_1.UsersModule_sm_vc,
            pasantias_module_1.PasantiasModule_sm_vc,
            mailer_module_1.MailerContactoModule_sm_vc,
            admin_module_1.AdminModule,
            documentos_module_1.DocumentosModule,
            evaluaciones_module_1.EvaluacionesModule,
            estudiantes_module_1.EstudiantesModule,
            deploy_module_1.DeployModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map