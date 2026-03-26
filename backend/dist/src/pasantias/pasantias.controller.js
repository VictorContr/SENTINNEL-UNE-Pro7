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
exports.PasantiasController_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const pasantias_service_1 = require("./pasantias.service");
const create_entrega_dto_1 = require("./dto/create-entrega.dto");
let PasantiasController_sm_vc = class PasantiasController_sm_vc {
    pasantiasService;
    constructor(pasantiasService) {
        this.pasantiasService = pasantiasService;
    }
    async getMaterias_sm_vc() {
        return this.pasantiasService.getMaterias_sm_vc();
    }
    async crearEntrega_sm_vc(req, createEntregaDto) {
        const estudianteId = req.user.sub;
        return this.pasantiasService.crearEntrega_sm_vc(estudianteId, createEntregaDto.requisito_id_sm_vc);
    }
    async getProgresoEstudiante_sm_vc(id) {
        return this.pasantiasService.getProgresoEstudiante_sm_vc(parseInt(id));
    }
    async getMiProgreso_sm_vc(req) {
        const estudianteId = req.user.sub;
        return this.pasantiasService.getProgresoEstudiante_sm_vc(estudianteId);
    }
};
exports.PasantiasController_sm_vc = PasantiasController_sm_vc;
__decorate([
    (0, common_1.Get)('materias'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PasantiasController_sm_vc.prototype, "getMaterias_sm_vc", null);
__decorate([
    (0, common_1.Post)('entregas'),
    (0, guards_1.Roles_sm_vc)('ESTUDIANTE'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_entrega_dto_1.CreateEntregaDto_sm_vc]),
    __metadata("design:returntype", Promise)
], PasantiasController_sm_vc.prototype, "crearEntrega_sm_vc", null);
__decorate([
    (0, common_1.Get)('estudiantes/:id/progreso'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PasantiasController_sm_vc.prototype, "getProgresoEstudiante_sm_vc", null);
__decorate([
    (0, common_1.Get)('estudiantes/mi-progreso'),
    (0, guards_1.Roles_sm_vc)('ESTUDIANTE'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PasantiasController_sm_vc.prototype, "getMiProgreso_sm_vc", null);
exports.PasantiasController_sm_vc = PasantiasController_sm_vc = __decorate([
    (0, common_1.Controller)('pasantias'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc),
    __metadata("design:paramtypes", [pasantias_service_1.PasantiasService_sm_vc])
], PasantiasController_sm_vc);
//# sourceMappingURL=pasantias.controller.js.map