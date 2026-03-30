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
exports.EstudiantesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let EstudiantesService = class EstudiantesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obtenerMisEstudiantes_sm_vc(profesorId) {
        try {
            const estudiantes = await this.prisma.estudiante.findMany({
                where: { profesor_id_sm_vc: profesorId },
                include: {
                    usuario: {
                        select: {
                            id_sm_vc: true,
                            nombre_sm_vc: true,
                            apellido_sm_vc: true,
                            correo_sm_vc: true,
                            activo_sm_vc: true,
                        },
                    },
                    materiaActiva: {
                        include: {
                            requisitos: { orderBy: { posicion_sm_vc: 'asc' } },
                        },
                    },
                    entregas: {
                        include: { requisito: true, evaluacion: true },
                    },
                },
                orderBy: { usuario: { apellido_sm_vc: 'asc' } },
            });
            return estudiantes.map((e) => this.mapearEstudianteConProgreso_sm_vc(e));
        }
        catch {
            throw new common_1.InternalServerErrorException('Error al obtener los estudiantes.');
        }
    }
    async obtenerDetalleEstudiante_sm_vc(estudianteId) {
        try {
            const estudiante = await this.prisma.estudiante.findUnique({
                where: { id_sm_vc: estudianteId },
                include: {
                    usuario: true,
                    materiaActiva: true,
                    profesorTutor: {
                        select: { nombre_sm_vc: true, apellido_sm_vc: true, correo_sm_vc: true },
                    },
                    entregas: {
                        include: {
                            requisito: { include: { materia: true } },
                            documentos: { orderBy: { fecha_subida_sm_vc: 'desc' } },
                            evaluacion: { include: { profesor: { select: { nombre_sm_vc: true, apellido_sm_vc: true } } } },
                        },
                        orderBy: { fecha_actualizacion_sm_vc: 'desc' },
                    },
                    proyectoDeploy: {
                        include: {
                            archivoCodigo: true,
                            documentacionTecnica: true,
                        },
                    },
                    historial: {
                        orderBy: { fecha_sm_vc: 'desc' },
                        take: 20,
                    },
                },
            });
            if (!estudiante)
                throw new common_1.NotFoundException(`Estudiante ${estudianteId} no encontrado.`);
            return this.mapearDetalleEstudiante_sm_vc(estudiante);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al obtener el detalle.');
        }
    }
    async obtenerProgresoMaterias_sm_vc(estudianteId) {
        try {
            const estudiante = await this.prisma.estudiante.findUnique({
                where: { id_sm_vc: estudianteId },
                include: { materiaActiva: true },
            });
            if (!estudiante)
                throw new common_1.NotFoundException(`Estudiante ${estudianteId} no encontrado.`);
            const materias = await this.prisma.materia.findMany({
                where: { periodo_sm_vc: estudiante.materiaActiva.periodo_sm_vc },
                include: { requisitos: { orderBy: { posicion_sm_vc: 'asc' } } },
                orderBy: { posicion_sm_vc: 'asc' },
            });
            const entregas = await this.prisma.entrega.findMany({
                where: { estudiante_id_sm_vc: estudianteId },
                include: { evaluacion: true },
            });
            return materias.map((materia) => {
                const reqsMateria = materia.requisitos;
                const entregasMateria = entregas.filter((e) => reqsMateria.some((r) => r.id_sm_vc === e.requisito_id_sm_vc));
                const aprobados = entregasMateria.filter((e) => e.estado_sm_vc === client_1.EstadoAprobacion.APROBADO).length;
                const bloqueada = materia.posicion_sm_vc > estudiante.materiaActiva.posicion_sm_vc;
                return {
                    id_sm_vc: materia.id_sm_vc,
                    nombre_sm_vc: materia.nombre_sm_vc,
                    descripcion_sm_vc: materia.descripcion_sm_vc,
                    posicion_sm_vc: materia.posicion_sm_vc,
                    periodo_sm_vc: materia.periodo_sm_vc,
                    bloqueada_sm_vc: bloqueada,
                    es_activa_sm_vc: materia.id_sm_vc === estudiante.materia_activa_id_sm_vc,
                    total_requisitos_sm_vc: reqsMateria.length,
                    requisitos_aprobados_sm_vc: aprobados,
                    progreso_decimal_sm_vc: reqsMateria.length > 0
                        ? parseFloat((aprobados / reqsMateria.length).toFixed(2))
                        : 0,
                    estado_sm_vc: this.calcularEstadoMateria_sm_vc(entregasMateria, aprobados, reqsMateria.length, bloqueada),
                    requisitos: reqsMateria.map((req) => {
                        const entrega = entregasMateria.find((e) => e.requisito_id_sm_vc === req.id_sm_vc);
                        return {
                            id_sm_vc: req.id_sm_vc,
                            nombre_sm_vc: req.nombre_sm_vc,
                            descripcion_sm_vc: req.descripcion_sm_vc,
                            posicion_sm_vc: req.posicion_sm_vc,
                            estado_sm_vc: entrega?.estado_sm_vc ?? client_1.EstadoAprobacion.PENDIENTE,
                            entrega_id_sm_vc: entrega?.id_sm_vc ?? null,
                        };
                    }),
                };
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al obtener el progreso.');
        }
    }
    calcularEstadoMateria_sm_vc(entregas, aprobados, total, bloqueada) {
        if (bloqueada)
            return client_1.EstadoAprobacion.PENDIENTE;
        if (aprobados === total && total > 0)
            return client_1.EstadoAprobacion.APROBADO;
        if (entregas.some((e) => e.estado_sm_vc === client_1.EstadoAprobacion.REPROBADO))
            return client_1.EstadoAprobacion.REPROBADO;
        if (entregas.some((e) => e.estado_sm_vc === client_1.EstadoAprobacion.ENTREGADO))
            return client_1.EstadoAprobacion.ENTREGADO;
        return client_1.EstadoAprobacion.PENDIENTE;
    }
    mapearEstudianteConProgreso_sm_vc(e) {
        const reqsActivos = e.materiaActiva.requisitos;
        const entregasActivas = e.entregas.filter((ent) => reqsActivos.some((r) => r.id_sm_vc === ent.requisito_id_sm_vc));
        const aprobados = entregasActivas.filter((ent) => ent.estado_sm_vc === client_1.EstadoAprobacion.APROBADO).length;
        return {
            id_sm_vc: e.id_sm_vc,
            usuario_id_sm_vc: e.usuario_id_sm_vc,
            nombre_sm_vc: e.usuario.nombre_sm_vc,
            apellido_sm_vc: e.usuario.apellido_sm_vc,
            correo_sm_vc: e.usuario.correo_sm_vc,
            activo_sm_vc: e.usuario.activo_sm_vc,
            empresa_sm_vc: e.empresa_sm_vc,
            titulo_proyecto_sm_vc: e.titulo_proyecto_sm_vc,
            tutor_empresarial_sm_vc: e.tutor_empresarial_sm_vc,
            materia_activa_sm_vc: {
                id_sm_vc: e.materiaActiva.id_sm_vc,
                nombre_sm_vc: e.materiaActiva.nombre_sm_vc,
                posicion_sm_vc: e.materiaActiva.posicion_sm_vc,
                total_requisitos_sm_vc: reqsActivos.length,
                aprobados_sm_vc: aprobados,
                progreso_decimal_sm_vc: reqsActivos.length > 0
                    ? parseFloat((aprobados / reqsActivos.length).toFixed(2))
                    : 0,
                estado_sm_vc: this.calcularEstadoMateria_sm_vc(entregasActivas, aprobados, reqsActivos.length, false),
            },
        };
    }
    mapearDetalleEstudiante_sm_vc(e) {
        return {
            id_sm_vc: e.id_sm_vc,
            usuario: e.usuario,
            empresa_sm_vc: e.empresa_sm_vc,
            tutor_empresarial_sm_vc: e.tutor_empresarial_sm_vc,
            titulo_proyecto_sm_vc: e.titulo_proyecto_sm_vc,
            profesor_tutor: e.profesorTutor,
            materia_activa: e.materiaActiva,
            entregas: e.entregas,
            proyecto_deploy: e.proyectoDeploy,
            historial: e.historial,
        };
    }
};
exports.EstudiantesService = EstudiantesService;
exports.EstudiantesService = EstudiantesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EstudiantesService);
//# sourceMappingURL=estudiantes.service.js.map