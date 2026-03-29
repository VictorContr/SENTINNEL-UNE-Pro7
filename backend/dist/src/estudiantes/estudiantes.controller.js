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
exports.EstudiantesController = void 0;
const common_1 = require("@nestjs/common");
const estudiantes_service_1 = require("./estudiantes.service");
const guards_1 = require("../auth/guards");
const client_1 = require("@prisma/client");
let EstudiantesController = class EstudiantesController {
    estudiantesService;
    constructor(estudiantesService) {
        this.estudiantesService = estudiantesService;
    }
    async obtenerMisEstudiantes(req) {
        return this.estudiantesService.obtenerMisEstudiantes_sm_vc(req.user.id_sm_vc);
    }
    async obtenerDetalle(id) {
        return this.estudiantesService.obtenerDetalleEstudiante_sm_vc(id);
    }
    async obtenerProgresoMaterias(id) {
        return this.estudiantesService.obtenerProgresoMaterias_sm_vc(id);
    }
};
exports.EstudiantesController = EstudiantesController;
__decorate([
    (0, common_1.Get)(),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.PROFESOR),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EstudiantesController.prototype, "obtenerMisEstudiantes", null);
__decorate([
    (0, common_1.Get)(':id/detalle'),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.PROFESOR, client_1.RolUsuario.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EstudiantesController.prototype, "obtenerDetalle", null);
__decorate([
    (0, common_1.Get)(':id/progreso-materias'),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.PROFESOR, client_1.RolUsuario.ADMIN, client_1.RolUsuario.ESTUDIANTE),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EstudiantesController.prototype, "obtenerProgresoMaterias", null);
exports.EstudiantesController = EstudiantesController = __decorate([
    (0, common_1.Controller)('estudiantes'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc, guards_1.RolesGuard_sm_vc),
    __metadata("design:paramtypes", [estudiantes_service_1.EstudiantesService])
], EstudiantesController);
//# sourceMappingURL=estudiantes.controller.js.map