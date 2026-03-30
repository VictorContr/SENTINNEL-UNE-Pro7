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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documentos_service_1 = require("./documentos.service");
const crear_documento_dto_1 = require("./dto/crear-documento.dto");
const multer_config_1 = require("../config/multer.config");
const guards_1 = require("../auth/guards");
const client_1 = require("@prisma/client");
let DocumentosController = class DocumentosController {
    documentosService;
    constructor(documentosService) {
        this.documentosService = documentosService;
    }
    async subirDocumento(dto, file, req) {
        return this.documentosService.subirDocumento_sm_vc(dto, file, req.user.id_sm_vc);
    }
    async obtenerDocumentosPorEntrega(entregaId) {
        return this.documentosService.obtenerDocumentosDeEntrega_sm_vc(entregaId);
    }
};
exports.DocumentosController = DocumentosController;
__decorate([
    (0, common_1.Post)(),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.ESTUDIANTE, client_1.RolUsuario.PROFESOR),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('archivo', multer_config_1.multerDocumentosConfig)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof crear_documento_dto_1.CrearDocumentoDto !== "undefined" && crear_documento_dto_1.CrearDocumentoDto) === "function" ? _a : Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentosController.prototype, "subirDocumento", null);
__decorate([
    (0, common_1.Get)('entrega/:entregaId'),
    __param(0, (0, common_1.Param)('entregaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DocumentosController.prototype, "obtenerDocumentosPorEntrega", null);
exports.DocumentosController = DocumentosController = __decorate([
    (0, common_1.Controller)('documentos'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc, guards_1.RolesGuard_sm_vc),
    __metadata("design:paramtypes", [documentos_service_1.DocumentosService])
], DocumentosController);
//# sourceMappingURL=documentos.controller.js.map