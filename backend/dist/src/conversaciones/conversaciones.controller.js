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
exports.ConversacionesController = void 0;
const common_1 = require("@nestjs/common");
const conversaciones_service_1 = require("./conversaciones.service");
const guards_1 = require("../auth/guards");
let ConversacionesController = class ConversacionesController {
    conversacionesService_sm_vc;
    constructor(conversacionesService_sm_vc) {
        this.conversacionesService_sm_vc = conversacionesService_sm_vc;
    }
    async obtenerHistorial_sm_vc(estudianteId) {
        try {
            return await this.conversacionesService_sm_vc.obtenerMensajes_sm_vc(estudianteId);
        }
        catch (error) {
            if (error.status)
                throw error;
            throw new common_1.HttpException('Error al procesar la solicitud de conversación.', 500);
        }
    }
};
exports.ConversacionesController = ConversacionesController;
__decorate([
    (0, common_1.Get)(':estudianteId'),
    __param(0, (0, common_1.Param)('estudianteId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ConversacionesController.prototype, "obtenerHistorial_sm_vc", null);
exports.ConversacionesController = ConversacionesController = __decorate([
    (0, common_1.Controller)('conversaciones'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc),
    __metadata("design:paramtypes", [conversaciones_service_1.ConversacionesService])
], ConversacionesController);
//# sourceMappingURL=conversaciones.controller.js.map