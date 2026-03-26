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
exports.UsersService_sm_vc = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService_sm_vc = class UsersService_sm_vc {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll_sm_vc() {
        const usuarios_sm_vc = await this.prisma.usuario.findMany({
            select: {
                id_sm_vc: true,
                nombre_sm_vc: true,
                correo_sm_vc: true,
                rol_sm_vc: true,
                activo_sm_vc: true,
                fecha_creacion_sm_vc: true,
            },
            orderBy: { fecha_creacion_sm_vc: 'desc' },
        });
        return usuarios_sm_vc;
    }
    async findOne_sm_vc(id_sm_vc) {
        const usuario_sm_vc = await this.prisma.usuario.findUnique({
            where: { id_sm_vc: parseInt(id_sm_vc) },
            select: {
                id_sm_vc: true,
                nombre_sm_vc: true,
                correo_sm_vc: true,
                rol_sm_vc: true,
                activo_sm_vc: true,
                fecha_creacion_sm_vc: true,
            },
        });
        if (!usuario_sm_vc) {
            throw new common_1.NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
        }
        return usuario_sm_vc;
    }
    async toggleBan_sm_vc(id_sm_vc) {
        const usuario_sm_vc = await this.prisma.usuario.findUnique({
            where: { id_sm_vc: parseInt(id_sm_vc) },
        });
        if (!usuario_sm_vc) {
            throw new common_1.NotFoundException(`Usuario ${id_sm_vc} no encontrado.`);
        }
        return this.prisma.usuario.update({
            where: { id_sm_vc: parseInt(id_sm_vc) },
            data: { activo_sm_vc: !usuario_sm_vc.activo_sm_vc },
            select: {
                id_sm_vc: true,
                nombre_sm_vc: true,
                activo_sm_vc: true,
            },
        });
    }
};
exports.UsersService_sm_vc = UsersService_sm_vc;
exports.UsersService_sm_vc = UsersService_sm_vc = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService_sm_vc);
//# sourceMappingURL=users.service.js.map