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
exports.PasantiasService_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PasantiasService_sm_vc = class PasantiasService_sm_vc {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMaterias_sm_vc() {
        return this.prisma.materia_sm.findMany({
            where: { activo_sm_vc: true },
            include: { requisitos: { orderBy: { orden_sm_int: 'asc' } } },
            orderBy: { orden_sm_int: 'asc' },
        });
    }
};
exports.PasantiasService_sm_vc = PasantiasService_sm_vc;
exports.PasantiasService_sm_vc = PasantiasService_sm_vc = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PasantiasService_sm_vc);
//# sourceMappingURL=pasantias.service.js.map