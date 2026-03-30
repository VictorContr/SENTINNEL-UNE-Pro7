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
exports.ConversacionesService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../prisma/prisma.service");
let ConversacionesService = class ConversacionesService {
    prisma_sm_vc;
    constructor(prisma_sm_vc) {
        this.prisma_sm_vc = prisma_sm_vc;
    }
    async manejarMateriaAprobada_sm_vc(payload) {
        await this.registrarMensajeSistema_sm_vc(payload);
    }
    async manejarDocumentoSubido_sm_vc(payload) {
        await this.registrarMensajeSistema_sm_vc(payload);
    }
    async manejarDeployCompletado_sm_vc(payload) {
        await this.registrarMensajeSistema_sm_vc(payload);
    }
    async registrarMensajeSistema_sm_vc(payload) {
        try {
            const conversacion = await this.prisma_sm_vc.conversacion.findUnique({
                where: { estudiante_id_sm_vc: payload.estudianteId },
            });
            if (!conversacion) {
                console.error(`Conversación no encontrada para estudiante ${payload.estudianteId}`);
                return;
            }
            await this.prisma_sm_vc.mensaje.create({
                data: {
                    conversacion_id_sm_vc: conversacion.id_sm_vc,
                    contenido_sm_vc: payload.descripcion_sm_vc,
                    es_sistema_sm_vc: true,
                },
            });
        }
        catch (error) {
            console.error('Error al registrar mensaje de sistema:', error);
        }
    }
    async obtenerMensajes_sm_vc(estudianteId) {
        try {
            const conversacion = await this.prisma_sm_vc.conversacion.findUnique({
                where: { estudiante_id_sm_vc: estudianteId },
                include: {
                    mensajes: {
                        orderBy: { fecha_creacion_sm_vc: 'asc' },
                    },
                },
            });
            if (!conversacion) {
                throw new common_1.NotFoundException(`No se encontró conversación para el estudiante ${estudianteId}.`);
            }
            return {
                id_sm_vc: conversacion.id_sm_vc,
                estudiante_id_sm_vc: conversacion.estudiante_id_sm_vc,
                mensajes_sm_vc: conversacion.mensajes.map((m) => ({
                    id_sm_vc: m.id_sm_vc,
                    contenido_sm_vc: m.contenido_sm_vc,
                    es_sistema_sm_vc: m.es_sistema_sm_vc,
                    fecha_creacion_sm_vc: m.fecha_creacion_sm_vc,
                })),
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al obtener el historial de mensajes.');
        }
    }
};
exports.ConversacionesService = ConversacionesService;
__decorate([
    (0, event_emitter_1.OnEvent)('materia.aprobada_sm_vc'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConversacionesService.prototype, "manejarMateriaAprobada_sm_vc", null);
__decorate([
    (0, event_emitter_1.OnEvent)('documento.subido_sm_vc'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConversacionesService.prototype, "manejarDocumentoSubido_sm_vc", null);
__decorate([
    (0, event_emitter_1.OnEvent)('deploy.completado_sm_vc'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConversacionesService.prototype, "manejarDeployCompletado_sm_vc", null);
exports.ConversacionesService = ConversacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConversacionesService);
//# sourceMappingURL=conversaciones.service.js.map