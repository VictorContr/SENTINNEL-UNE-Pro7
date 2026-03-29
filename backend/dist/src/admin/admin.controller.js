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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const actualizar_periodo_dto_1 = require("./dto/actualizar-periodo.dto");
const guards_1 = require("../auth/guards");
const client_1 = require("@prisma/client");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async obtenerPeriodoActual() {
        return this.adminService.obtenerPeriodoActual();
    }
    async actualizarPeriodo(dto) {
        return this.adminService.actualizarPeriodo(dto);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('configuracion/periodo'),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "obtenerPeriodoActual", null);
__decorate([
    (0, common_1.Put)('configuracion/periodo'),
    (0, guards_1.Roles_sm_vc)(client_1.RolUsuario.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [actualizar_periodo_dto_1.ActualizarPeriodoDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "actualizarPeriodo", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc, guards_1.RolesGuard_sm_vc),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map