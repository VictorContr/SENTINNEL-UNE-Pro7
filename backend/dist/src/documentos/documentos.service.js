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
exports.DocumentosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DocumentosService = class DocumentosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async subirDocumento_sm_vc(dto, file, usuarioId) {
        try {
            const entrega = await this.prisma.entrega.findUnique({
                where: { id_sm_vc: dto.entrega_id_sm_vc },
                include: {
                    estudiante: { include: { usuario: true } },
                    requisito: { include: { materia: true } },
                },
            });
            if (!entrega) {
                throw new common_1.NotFoundException(`Entrega ${dto.entrega_id_sm_vc} no encontrada.`);
            }
            if (entrega.estado_sm_vc === client_1.EstadoAprobacion.APROBADO) {
                throw new common_1.ForbiddenException('No se puede subir documentos a una entrega ya aprobada.');
            }
            const documento = await this.prisma.documento.create({
                data: {
                    entrega_id_sm_vc: dto.entrega_id_sm_vc,
                    usuario_subida_id_sm_vc: usuarioId,
                    tipo_sm_vc: dto.tipo_sm_vc,
                    nombre_archivo_sm_vc: file.originalname,
                    ruta_archivo_sm_vc: file.path,
                    tamanio_bytes_sm_vc: file.size,
                    mime_type_sm_vc: file.mimetype,
                },
            });
            await this.prisma.entrega.update({
                where: { id_sm_vc: dto.entrega_id_sm_vc },
                data: { estado_sm_vc: client_1.EstadoAprobacion.ENTREGADO },
            });
            await this.prisma.historialTrazabilidad.create({
                data: {
                    estudiante_id_sm_vc: entrega.estudiante.id_sm_vc,
                    actor_id_sm_vc: usuarioId,
                    accion_sm_vc: 'DOCUMENTO_SUBIDO',
                    detalles_sm_vc: `Documento "${file.originalname}" subido para el requisito ` +
                        `"${entrega.requisito.nombre_sm_vc}" ` +
                        `de la materia "${entrega.requisito.materia.nombre_sm_vc}".`,
                },
            });
            return this.generarRespuesta_sm_vc(documento);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al subir el documento.');
        }
    }
    async obtenerDocumentosDeEntrega_sm_vc(entregaId) {
        try {
            const documentos = await this.prisma.documento.findMany({
                where: { entrega_id_sm_vc: entregaId },
                orderBy: { fecha_subida_sm_vc: 'desc' },
            });
            return documentos.map((d) => this.generarRespuesta_sm_vc(d));
        }
        catch {
            throw new common_1.InternalServerErrorException('Error al obtener los documentos.');
        }
    }
    generarRespuesta_sm_vc(documento) {
        return {
            id_sm_vc: documento.id_sm_vc,
            entrega_id_sm_vc: documento.entrega_id_sm_vc,
            tipo_sm_vc: documento.tipo_sm_vc,
            nombre_archivo_sm_vc: documento.nombre_archivo_sm_vc,
            tamanio_bytes_sm_vc: documento.tamanio_bytes_sm_vc,
            mime_type_sm_vc: documento.mime_type_sm_vc,
            fecha_subida_sm_vc: documento.fecha_subida_sm_vc,
        };
    }
};
exports.DocumentosService = DocumentosService;
exports.DocumentosService = DocumentosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentosService);
//# sourceMappingURL=documentos.service.js.map