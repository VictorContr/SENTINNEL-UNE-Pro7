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
const client_1 = require("@prisma/client");
let PasantiasService_sm_vc = class PasantiasService_sm_vc {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMaterias_sm_vc() {
        return this.prisma.materia.findMany({
            include: {
                requisitos: {
                    orderBy: { posicion_sm_vc: 'asc' }
                }
            },
            orderBy: { posicion_sm_vc: 'asc' },
        });
    }
    async validarProgresoEstudiante_sm_vc(estudianteId, materiaId) {
        const estudiante = await this.prisma.estudiante.findUnique({
            where: { id_sm_vc: estudianteId },
            include: { materiaActiva: true }
        });
        if (!estudiante) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        const materiaActual = await this.prisma.materia.findUnique({
            where: { id_sm_vc: materiaId },
            include: { requisitos: true }
        });
        if (!materiaActual) {
            throw new common_1.NotFoundException('Materia no encontrada');
        }
        if (materiaActual.posicion_sm_vc === 1) {
            return true;
        }
        const materiaAnterior = await this.prisma.materia.findFirst({
            where: {
                posicion_sm_vc: materiaActual.posicion_sm_vc - 1,
                periodo_sm_vc: materiaActual.periodo_sm_vc
            }
        });
        if (!materiaAnterior) {
            throw new common_1.NotFoundException('No se encuentra la materia anterior');
        }
        const entregasAnteriores = await this.prisma.entrega.findMany({
            where: {
                estudiante_id_sm_vc: estudianteId,
                requisito: {
                    materia_id_sm_vc: materiaAnterior.id_sm_vc
                }
            },
            include: {
                evaluacion: true
            }
        });
        const todosAprobados = entregasAnteriores.every(entrega => entrega.evaluacion?.decision_sm_vc === client_1.EstadoAprobacion.APROBADO);
        if (!todosAprobados) {
            throw new common_1.ForbiddenException(`No puedes avanzar a ${materiaActual.nombre_sm_vc} hasta aprobar todos los requisitos de ${materiaAnterior.nombre_sm_vc}`);
        }
        return true;
    }
    async crearEntrega_sm_vc(estudianteId, requisitoId) {
        const requisito = await this.prisma.requisito.findUnique({
            where: { id_sm_vc: requisitoId },
            include: { materia: true }
        });
        if (!requisito) {
            throw new common_1.NotFoundException('Requisito no encontrado');
        }
        await this.validarProgresoEstudiante_sm_vc(estudianteId, requisito.materia.id_sm_vc);
        return this.prisma.entrega.create({
            data: {
                estudiante_id_sm_vc: estudianteId,
                requisito_id_sm_vc: requisitoId,
                estado_sm_vc: client_1.EstadoAprobacion.PENDIENTE
            },
            include: {
                estudiante: true,
                requisito: {
                    include: { materia: true }
                }
            }
        });
    }
    async getProgresoEstudiante_sm_vc(estudianteId) {
        const estudiante = await this.prisma.estudiante.findUnique({
            where: { id_sm_vc: estudianteId },
            include: {
                materiaActiva: {
                    include: {
                        requisitos: {
                            include: {
                                entregas: {
                                    where: { estudiante_id_sm_vc: estudianteId },
                                    include: { evaluacion: true }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!estudiante) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        return estudiante;
    }
};
exports.PasantiasService_sm_vc = PasantiasService_sm_vc;
exports.PasantiasService_sm_vc = PasantiasService_sm_vc = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PasantiasService_sm_vc);
//# sourceMappingURL=pasantias.service.js.map