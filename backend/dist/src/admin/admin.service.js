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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obtenerPeriodoActual() {
        try {
            let config = await this.prisma.configuracionSistema.findUnique({
                where: { id_sm_vc: 1 }
            });
            if (!config) {
                config = await this.prisma.configuracionSistema.create({
                    data: {
                        id_sm_vc: 1,
                        periodo_actual_sm_vc: 'P-165'
                    }
                });
            }
            return config;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error al obtener el periodo académico actual');
        }
    }
    async actualizarPeriodo(dto) {
        try {
            const config = await this.prisma.configuracionSistema.upsert({
                where: { id_sm_vc: 1 },
                update: {
                    periodo_actual_sm_vc: dto.periodo_actual_sm_vc
                },
                create: {
                    id_sm_vc: 1,
                    periodo_actual_sm_vc: dto.periodo_actual_sm_vc
                }
            });
            return config;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.BadRequestException('Error de duplicidad en la configuración del sistema');
            }
            throw new common_1.InternalServerErrorException('Error al actualizar el periodo académico');
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map