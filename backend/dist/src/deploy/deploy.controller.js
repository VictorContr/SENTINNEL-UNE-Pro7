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
exports.DeployController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const deploy_service_1 = require("./deploy.service");
const crear_deploy_dto_1 = require("./dto/crear-deploy.dto");
const multer_config_1 = require("../config/multer.config");
const guards_1 = require("../auth/guards");
const client_1 = require("@prisma/client");
let DeployController = class DeployController {
    deployService;
    constructor(deployService) {
        this.deployService = deployService;
    }
    async registrarDeploy(estudianteId, dto, files, req) {
        return this.deployService.registrarDeploy_sm_vc(estudianteId, dto, files?.codigo?.[0], files?.documentacion?.[0], req.user.id_sm_vc);
    }
    async obtenerDeploy(estudianteId) {
        return this.deployService.obtenerDeploy_sm_vc(estudianteId);
    }
};
exports.DeployController = DeployController;
__decorate([
    (0, common_1.Post)(':estudianteId'),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.ESTUDIANTE, client_1.RolUsuario.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'codigo', maxCount: 1 },
        { name: 'documentacion', maxCount: 1 },
    ], multer_config_1.multerDeployConfig)),
    __param(0, (0, common_1.Param)('estudianteId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, crear_deploy_dto_1.CrearDeployDto, Object, Object]),
    __metadata("design:returntype", Promise)
], DeployController.prototype, "registrarDeploy", null);
__decorate([
    (0, common_1.Get)(':estudianteId'),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.ESTUDIANTE, client_1.RolUsuario.PROFESOR, client_1.RolUsuario.ADMIN),
    __param(0, (0, common_1.Param)('estudianteId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DeployController.prototype, "obtenerDeploy", null);
exports.DeployController = DeployController = __decorate([
    (0, common_1.Controller)('deploy'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc, guards_1.RolesGuard_sm_vc),
    __metadata("design:paramtypes", [deploy_service_1.DeployService])
], DeployController);
//# sourceMappingURL=deploy.controller.js.map