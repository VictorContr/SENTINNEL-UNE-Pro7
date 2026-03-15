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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasantiasController_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const pasantias_service_1 = require("./pasantias.service");
let PasantiasController_sm_vc = class PasantiasController_sm_vc {
    pasantiasService;
    constructor(pasantiasService) {
        this.pasantiasService = pasantiasService;
    }
    async getMaterias_sm_vc() {
        return this.pasantiasService.getMaterias_sm_vc();
    }
};
exports.PasantiasController_sm_vc = PasantiasController_sm_vc;
__decorate([
    (0, common_1.Get)('materias'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PasantiasController_sm_vc.prototype, "getMaterias_sm_vc", null);
exports.PasantiasController_sm_vc = PasantiasController_sm_vc = __decorate([
    (0, common_1.Controller)('pasantias'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard_sm_vc),
    __metadata("design:paramtypes", [pasantias_service_1.PasantiasService_sm_vc])
], PasantiasController_sm_vc);
//# sourceMappingURL=pasantias.controller.js.map