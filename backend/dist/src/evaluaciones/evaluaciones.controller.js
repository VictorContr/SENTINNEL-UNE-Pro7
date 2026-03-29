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
exports.EvaluacionesController = void 0;
const common_1 = require("@nestjs/common");
const evaluaciones_service_1 = require("./evaluaciones.service");
const crear_evaluacion_dto_1 = require("./dto/crear-evaluacion.dto");
const guards_1 = require("../auth/guards");
const client_1 = require("@prisma/client");
let EvaluacionesController = class EvaluacionesController {
    evaluacionesService;
    constructor(evaluacionesService) {
        this.evaluacionesService = evaluacionesService;
    }
    async evaluarEntrega(dto, req) {
        return this.evaluacionesService.evaluarEntrega_sm_vc(dto, req.user.id_sm_vc);
    }
    async obtenerEvaluacion(entregaId) {
        return this.evaluacionesService.obtenerEvaluacionDeEntrega_sm_vc(entregaId);
    }
};
exports.EvaluacionesController = EvaluacionesController;
__decorate([
    (0, common_1.Post)(),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.PROFESOR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_evaluacion_dto_1.CrearEvaluacionDto, Object]),
    __metadata("design:returntype", Promise)
], EvaluacionesController.prototype, "evaluarEntrega", null);
__decorate([
    (0, common_1.Get)('entrega/:entregaId'),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.PROFESOR, client_1.RolUsuario.ADMIN),
    __param(0, (0, common_1.Param)('entregaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EvaluacionesController.prototype, "obtenerEvaluacion", null);
exports.EvaluacionesController = EvaluacionesController = __decorate([
    (0, common_1.Controller)('evaluaciones'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc, guards_1.RolesGuard_sm_vc),
    __metadata("design:paramtypes", [evaluaciones_service_1.EvaluacionesService])
], EvaluacionesController);
//# sourceMappingURL=evaluaciones.controller.js.map