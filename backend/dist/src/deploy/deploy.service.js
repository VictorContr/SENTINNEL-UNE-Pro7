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
exports.DeployService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DeployService = class DeployService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registrarDeploy_sm_vc(estudianteId, dto, archivoZip, archivoPdf, usuarioActorId) {
        try {
            const estudiante = await this.prisma.estudiante.findUnique({
                where: { id_sm_vc: estudianteId },
                include: {
                    usuario: true,
                    materiaActiva: { include: { requisitos: true } },
                },
            });
            if (!estudiante)
                throw new common_1.NotFoundException(`Estudiante ${estudianteId} no encontrado.`);
            if (estudiante.usuario_id_sm_vc !== usuarioActorId) {
                const actor = await this.prisma.usuario.findUnique({
                    where: { id_sm_vc: usuarioActorId },
                });
                if (actor?.rol_sm_vc !== 'ADMIN')
                    throw new common_1.ForbiddenException('Solo el propio estudiante o un Admin puede registrar el deploy.');
            }
            await this.validarMateriasTodosAprobadas_sm_vc(estudianteId, estudiante.materiaActiva.periodo_sm_vc);
            if (!archivoZip)
                throw new common_1.BadRequestException('El archivo ZIP con el código fuente es obligatorio.');
            if (!archivoPdf)
                throw new common_1.BadRequestException('El PDF de documentación técnica es obligatorio.');
            const docZip = await this.prisma.documento.create({
                data: {
                    usuario_subida_id_sm_vc: usuarioActorId,
                    tipo_sm_vc: client_1.TipoDocumento.CODIGO_ZIP,
                    nombre_archivo_sm_vc: archivoZip.originalname,
                    ruta_archivo_sm_vc: archivoZip.path,
                    tamanio_bytes_sm_vc: archivoZip.size,
                    mime_type_sm_vc: archivoZip.mimetype,
                },
            });
            const docPdf = await this.prisma.documento.create({
                data: {
                    usuario_subida_id_sm_vc: usuarioActorId,
                    tipo_sm_vc: client_1.TipoDocumento.DOCUMENTACION_DEPLOY,
                    nombre_archivo_sm_vc: archivoPdf.originalname,
                    ruta_archivo_sm_vc: archivoPdf.path,
                    tamanio_bytes_sm_vc: archivoPdf.size,
                    mime_type_sm_vc: archivoPdf.mimetype,
                },
            });
            const deploy = await this.prisma.proyectoDeploy.upsert({
                where: { estudiante_id_sm_vc: estudianteId },
                create: {
                    estudiante_id_sm_vc: estudianteId,
                    url_produccion_sm_vc: dto.url_produccion_sm_vc,
                    archivo_codigo_id_sm_vc: docZip.id_sm_vc,
                    documentacion_tecnica_id_sm_vc: docPdf.id_sm_vc,
                },
                update: {
                    url_produccion_sm_vc: dto.url_produccion_sm_vc,
                    archivo_codigo_id_sm_vc: docZip.id_sm_vc,
                    documentacion_tecnica_id_sm_vc: docPdf.id_sm_vc,
                    fecha_deploy_sm_vc: new Date(),
                },
                include: {
                    archivoCodigo: true,
                    documentacionTecnica: true,
                },
            });
            await this.prisma.historialTrazabilidad.create({
                data: {
                    estudiante_id_sm_vc: estudianteId,
                    actor_id_sm_vc: usuarioActorId,
                    accion_sm_vc: 'DEPLOY_REGISTRADO',
                    detalles_sm_vc: `Deploy registrado. URL: ${dto.url_produccion_sm_vc}. ` +
                        `ZIP: ${archivoZip.originalname}. PDF: ${archivoPdf.originalname}.`,
                },
            });
            await this.prisma.notificacion.create({
                data: {
                    emisor_id_sm_vc: usuarioActorId,
                    receptor_id_sm_vc: estudiante.usuario_id_sm_vc,
                    tipo_sm_vc: client_1.TipoNotificacion.INFORMATIVA,
                    titulo_sm_vc: '🚀 Deploy del Proyecto Final registrado',
                    contenido_sm_vc: `Tu proyecto en "${dto.url_produccion_sm_vc}" fue registrado exitosamente con toda la documentación requerida.`,
                },
            });
            return this.generarRespuesta_sm_vc(deploy);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException ||
                error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al registrar el deploy.');
        }
    }
    async obtenerDeploy_sm_vc(estudianteId) {
        const deploy = await this.prisma.proyectoDeploy.findUnique({
            where: { estudiante_id_sm_vc: estudianteId },
            include: {
                archivoCodigo: true,
                documentacionTecnica: true,
            },
        });
        if (!deploy)
            throw new common_1.NotFoundException(`El estudiante ${estudianteId} no tiene un deploy registrado.`);
        return this.generarRespuesta_sm_vc(deploy);
    }
    async validarMateriasTodosAprobadas_sm_vc(estudianteId, periodo) {
        const materias = await this.prisma.materia.findMany({
            where: { periodo_sm_vc: periodo },
            include: { requisitos: true },
        });
        const entregas = await this.prisma.entrega.findMany({
            where: { estudiante_id_sm_vc: estudianteId },
        });
        for (const materia of materias) {
            const todasAprobadas = materia.requisitos.every((req) => {
                const entrega = entregas.find((e) => e.requisito_id_sm_vc === req.id_sm_vc);
                return entrega?.estado_sm_vc === client_1.EstadoAprobacion.APROBADO;
            });
            if (!todasAprobadas) {
                throw new common_1.ForbiddenException(`No puedes registrar el deploy hasta aprobar todos los requisitos de "${materia.nombre_sm_vc}".`);
            }
        }
    }
    generarRespuesta_sm_vc(deploy) {
        return {
            id_sm_vc: deploy.id_sm_vc,
            estudiante_id_sm_vc: deploy.estudiante_id_sm_vc,
            url_produccion_sm_vc: deploy.url_produccion_sm_vc,
            fecha_deploy_sm_vc: deploy.fecha_deploy_sm_vc,
            archivo_codigo_sm_vc: {
                id_sm_vc: deploy.archivoCodigo?.id_sm_vc,
                nombre_sm_vc: deploy.archivoCodigo?.nombre_archivo_sm_vc,
                tamanio_bytes_sm_vc: deploy.archivoCodigo?.tamanio_bytes_sm_vc,
            },
            documentacion_sm_vc: {
                id_sm_vc: deploy.documentacionTecnica?.id_sm_vc,
                nombre_sm_vc: deploy.documentacionTecnica?.nombre_archivo_sm_vc,
                tamanio_bytes_sm_vc: deploy.documentacionTecnica?.tamanio_bytes_sm_vc,
            },
        };
    }
};
exports.DeployService = DeployService;
exports.DeployService = DeployService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeployService);
//# sourceMappingURL=deploy.service.js.map