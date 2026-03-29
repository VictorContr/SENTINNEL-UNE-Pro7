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
    async validarProgresoEstudiante_sm_vc(usuarioId, materiaId) {
        const estudiante = await this.prisma.estudiante.findUnique({
            where: { usuario_id_sm_vc: usuarioId },
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
                estudiante_id_sm_vc: estudiante.id_sm_vc,
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
    async crearEntrega_sm_vc(usuarioId, requisitoId) {
        const requisito = await this.prisma.requisito.findUnique({
            where: { id_sm_vc: requisitoId },
            include: { materia: true }
        });
        if (!requisito) {
            throw new common_1.NotFoundException('Requisito no encontrado');
        }
        const estudiante = await this.prisma.estudiante.findUnique({
            where: { usuario_id_sm_vc: usuarioId },
            select: { id_sm_vc: true }
        });
        if (!estudiante) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        await this.validarProgresoEstudiante_sm_vc(usuarioId, requisito.materia.id_sm_vc);
        return this.prisma.entrega.create({
            data: {
                estudiante_id_sm_vc: estudiante.id_sm_vc,
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
    async getProgresoEstudiante_sm_vc(usuarioId) {
        const estudianteBase = await this.prisma.estudiante.findUnique({
            where: { usuario_id_sm_vc: usuarioId },
            include: { materiaActiva: true }
        });
        if (!estudianteBase) {
            throw new common_1.NotFoundException('Estudiante no encontrado');
        }
        const materias = await this.prisma.materia.findMany({
            include: { requisitos: true },
            orderBy: { posicion_sm_vc: 'asc' }
        });
        const entregas = await this.prisma.entrega.findMany({
            where: { estudiante_id_sm_vc: estudianteBase.id_sm_vc }
        });
        const resultado = materias.map(materia => {
            const requisitosMateria = materia.requisitos;
            const totalRequisitos = requisitosMateria.length;
            const entregasMateria = entregas.filter(e => requisitosMateria.some(req => req.id_sm_vc === e.requisito_id_sm_vc));
            const aprobados = entregasMateria.filter(e => e.estado_sm_vc === client_1.EstadoAprobacion.APROBADO).length;
            let progresoDecimal = totalRequisitos > 0 ? aprobados / totalRequisitos : 0;
            let estadoAprobacion = client_1.EstadoAprobacion.PENDIENTE;
            let bloqueada = materia.posicion_sm_vc > estudianteBase.materiaActiva.posicion_sm_vc;
            if (materia.posicion_sm_vc < estudianteBase.materiaActiva.posicion_sm_vc) {
                estadoAprobacion = client_1.EstadoAprobacion.APROBADO;
                progresoDecimal = 1.0;
            }
            else if (materia.posicion_sm_vc === estudianteBase.materiaActiva.posicion_sm_vc) {
                if (aprobados === totalRequisitos && totalRequisitos > 0) {
                    estadoAprobacion = client_1.EstadoAprobacion.APROBADO;
                }
                else if (entregasMateria.some(e => e.estado_sm_vc === client_1.EstadoAprobacion.REPROBADO)) {
                    estadoAprobacion = client_1.EstadoAprobacion.REPROBADO;
                }
                else if (entregasMateria.some(e => e.estado_sm_vc === client_1.EstadoAprobacion.ENTREGADO || e.estado_sm_vc === client_1.EstadoAprobacion.PENDIENTE)) {
                    estadoAprobacion = client_1.EstadoAprobacion.ENTREGADO;
                }
                else {
                    estadoAprobacion = client_1.EstadoAprobacion.PENDIENTE;
                }
            }
            return {
                id_sm_vc: materia.id_sm_vc,
                nombre_sm_vc: materia.nombre_sm_vc,
                orden_sm_int: materia.posicion_sm_vc,
                posicion_sm_vc: materia.posicion_sm_vc,
                periodo_sm_vc: materia.periodo_sm_vc,
                estado_aprobacion_sm_vc: estadoAprobacion,
                progreso_decimal: progresoDecimal,
                requisitos_aprobados_sm_int: aprobados,
                total_requisitos_sm_int: totalRequisitos,
                bloqueada: bloqueada,
                requisitos: requisitosMateria,
                nota_sm_dec: null,
                intentos_sm_int: 0,
                conversacion_count_sm_int: entregasMateria.length,
                progreso: {
                    requisitos_aprobados_detalle_sm_vc: entregasMateria
                        .filter(e => e.estado_sm_vc === client_1.EstadoAprobacion.APROBADO)
                        .map(e => ({ requisito_id_sm_vc: e.requisito_id_sm_vc }))
                }
            };
        });
        return resultado;
    }
};
exports.PasantiasService_sm_vc = PasantiasService_sm_vc;
exports.PasantiasService_sm_vc = PasantiasService_sm_vc = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PasantiasService_sm_vc);
//# sourceMappingURL=pasantias.service.js.map