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
exports.EvaluacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let EvaluacionesService = class EvaluacionesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async evaluarEntrega_sm_vc(dto, profesorId) {
        try {
            const entrega = await this.prisma.entrega.findUnique({
                where: { id_sm_vc: dto.entrega_id_sm_vc },
                include: {
                    estudiante: { include: { usuario: true, materiaActiva: true } },
                    requisito: { include: { materia: true } },
                    evaluacion: true,
                },
            });
            if (!entrega) {
                throw new common_1.NotFoundException(`Entrega ${dto.entrega_id_sm_vc} no encontrada.`);
            }
            if (entrega.estado_sm_vc === client_1.EstadoAprobacion.PENDIENTE) {
                throw new common_1.BadRequestException('No se puede evaluar una entrega en estado PENDIENTE.');
            }
            if (entrega.estado_sm_vc === client_1.EstadoAprobacion.APROBADO) {
                throw new common_1.ForbiddenException('Esta entrega ya fue aprobada y no puede ser re-evaluada.');
            }
            const evaluacion = await this.prisma.evaluacion.upsert({
                where: { entrega_id_sm_vc: dto.entrega_id_sm_vc },
                create: {
                    entrega_id_sm_vc: dto.entrega_id_sm_vc,
                    profesor_id_sm_vc: profesorId,
                    decision_sm_vc: dto.decision_sm_vc,
                    observaciones_sm_vc: dto.observaciones_sm_vc ?? null,
                },
                update: {
                    profesor_id_sm_vc: profesorId,
                    decision_sm_vc: dto.decision_sm_vc,
                    observaciones_sm_vc: dto.observaciones_sm_vc ?? null,
                    fecha_evaluacion_sm_vc: new Date(),
                },
            });
            await this.prisma.entrega.update({
                where: { id_sm_vc: dto.entrega_id_sm_vc },
                data: { estado_sm_vc: dto.decision_sm_vc },
            });
            const estudianteId = entrega.estudiante.id_sm_vc;
            const materiaId = entrega.requisito.materia_id_sm_vc;
            const materiaNombre = entrega.requisito.materia.nombre_sm_vc;
            const requisitoNombre = entrega.requisito.nombre_sm_vc;
            await this.prisma.historialTrazabilidad.create({
                data: {
                    estudiante_id_sm_vc: estudianteId,
                    actor_id_sm_vc: profesorId,
                    accion_sm_vc: dto.decision_sm_vc === client_1.EstadoAprobacion.APROBADO
                        ? 'REQUISITO_APROBADO'
                        : 'REQUISITO_REPROBADO',
                    detalles_sm_vc: `Profesor evaluó "${requisitoNombre}" como ${dto.decision_sm_vc}.` +
                        (dto.observaciones_sm_vc ? ` Observaciones: ${dto.observaciones_sm_vc}` : ''),
                },
            });
            await this.notificarEstudiante_sm_vc(profesorId, entrega.estudiante.usuario_id_sm_vc, dto.decision_sm_vc, requisitoNombre, materiaNombre, dto.observaciones_sm_vc);
            let materiaDesbloqueada = null;
            if (dto.decision_sm_vc === client_1.EstadoAprobacion.APROBADO) {
                materiaDesbloqueada = await this.verificarYDesbloquearMateria_sm_vc(estudianteId, materiaId, entrega.requisito.materia.posicion_sm_vc, entrega.requisito.materia.periodo_sm_vc, materiaNombre, entrega.estudiante.usuario_id_sm_vc, profesorId);
            }
            return this.generarRespuesta_sm_vc(evaluacion, materiaDesbloqueada);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al registrar la evaluación.');
        }
    }
    async obtenerEvaluacionDeEntrega_sm_vc(entregaId) {
        const evaluacion = await this.prisma.evaluacion.findUnique({
            where: { entrega_id_sm_vc: entregaId },
            include: { profesor: { select: { nombre_sm_vc: true, apellido_sm_vc: true } } },
        });
        if (!evaluacion)
            throw new common_1.NotFoundException(`No hay evaluación para la entrega ${entregaId}.`);
        return evaluacion;
    }
    async verificarYDesbloquearMateria_sm_vc(estudianteId, materiaId, materiaPos, materiaPeriodo, materiaNombre, usuarioEstudianteId, actorId) {
        const requisitos = await this.prisma.requisito.findMany({
            where: { materia_id_sm_vc: materiaId },
        });
        const entregas = await this.prisma.entrega.findMany({
            where: {
                estudiante_id_sm_vc: estudianteId,
                requisito: { materia_id_sm_vc: materiaId },
            },
            include: { requisito: true },
        });
        const todasAprobadas = requisitos.every((req) => {
            const entrega = entregas.find((e) => e.requisito_id_sm_vc === req.id_sm_vc);
            return entrega?.estado_sm_vc === client_1.EstadoAprobacion.APROBADO;
        });
        if (!todasAprobadas)
            return null;
        const siguienteMateria = await this.prisma.materia.findFirst({
            where: {
                posicion_sm_vc: materiaPos + 1,
                periodo_sm_vc: materiaPeriodo,
            },
        });
        if (!siguienteMateria) {
            await this.prisma.historialTrazabilidad.create({
                data: {
                    estudiante_id_sm_vc: estudianteId,
                    actor_id_sm_vc: actorId,
                    accion_sm_vc: 'TODAS_MATERIAS_COMPLETADAS',
                    detalles_sm_vc: `El estudiante completó todas las materias del periodo ${materiaPeriodo}. Deploy habilitado.`,
                },
            });
            await this.prisma.notificacion.create({
                data: {
                    emisor_id_sm_vc: actorId,
                    receptor_id_sm_vc: usuarioEstudianteId,
                    tipo_sm_vc: client_1.TipoNotificacion.IMPORTANTE,
                    titulo_sm_vc: '¡Proceso completado! Deploy habilitado',
                    contenido_sm_vc: `Has aprobado todas las materias. El módulo de Deploy del Proyecto Final está desbloqueado.`,
                },
            });
            return 'TODAS_COMPLETADAS';
        }
        await this.prisma.estudiante.update({
            where: { id_sm_vc: estudianteId },
            data: { materia_activa_id_sm_vc: siguienteMateria.id_sm_vc },
        });
        await this.prisma.historialTrazabilidad.create({
            data: {
                estudiante_id_sm_vc: estudianteId,
                actor_id_sm_vc: actorId,
                accion_sm_vc: 'MATERIA_COMPLETADA',
                detalles_sm_vc: `"${materiaNombre}" completada. "${siguienteMateria.nombre_sm_vc}" desbloqueada automáticamente.`,
            },
        });
        await this.prisma.notificacion.create({
            data: {
                emisor_id_sm_vc: actorId,
                receptor_id_sm_vc: usuarioEstudianteId,
                tipo_sm_vc: client_1.TipoNotificacion.INFORMATIVA,
                titulo_sm_vc: `${materiaNombre} completada — ${siguienteMateria.nombre_sm_vc} desbloqueada`,
                contenido_sm_vc: `¡Felicitaciones! Aprobaste todos los requisitos de "${materiaNombre}". ` +
                    `Ya puedes comenzar con "${siguienteMateria.nombre_sm_vc}".`,
            },
        });
        return siguienteMateria.nombre_sm_vc;
    }
    async notificarEstudiante_sm_vc(emisorId, receptorId, decision, requisitoNombre, materiaNombre, observaciones) {
        const esAprobado = decision === client_1.EstadoAprobacion.APROBADO;
        await this.prisma.notificacion.create({
            data: {
                emisor_id_sm_vc: emisorId,
                receptor_id_sm_vc: receptorId,
                tipo_sm_vc: esAprobado ? client_1.TipoNotificacion.INFORMATIVA : client_1.TipoNotificacion.URGENTE,
                titulo_sm_vc: esAprobado
                    ? `✔ "${requisitoNombre}" aprobado`
                    : `✗ "${requisitoNombre}" requiere correcciones`,
                contenido_sm_vc: esAprobado
                    ? `Tu entrega del requisito "${requisitoNombre}" en "${materiaNombre}" fue aprobada.`
                    : `Tu entrega del requisito "${requisitoNombre}" fue reprobada.` +
                        (observaciones ? ` Observaciones: ${observaciones}` : ''),
            },
        });
    }
    generarRespuesta_sm_vc(evaluacion, materiaDesbloqueada) {
        return {
            id_sm_vc: evaluacion.id_sm_vc,
            entrega_id_sm_vc: evaluacion.entrega_id_sm_vc,
            decision_sm_vc: evaluacion.decision_sm_vc,
            observaciones_sm_vc: evaluacion.observaciones_sm_vc,
            fecha_evaluacion_sm_vc: evaluacion.fecha_evaluacion_sm_vc,
            materia_desbloqueada_sm_vc: materiaDesbloqueada,
        };
    }
};
exports.EvaluacionesService = EvaluacionesService;
exports.EvaluacionesService = EvaluacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EvaluacionesService);
//# sourceMappingURL=evaluaciones.service.js.map