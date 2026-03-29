import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversacionesService {
  constructor(private readonly prisma_sm_vc: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // LISTENERS DE EVENTOS (Trazabilidad automática)
  // ─────────────────────────────────────────────────────────────────

  @OnEvent('materia.aprobada_sm_vc')
  async manejarMateriaAprobada_sm_vc(payload: { estudianteId: number; descripcion_sm_vc: string }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  @OnEvent('documento.subido_sm_vc')
  async manejarDocumentoSubido_sm_vc(payload: { estudianteId: number; descripcion_sm_vc: string }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  private async registrarMensajeSistema_sm_vc(payload: { estudianteId: number; descripcion_sm_vc: string }) {
    try {
      // 1. Buscar la conversación del estudiante
      const conversacion = await this.prisma_sm_vc.conversacion.findUnique({
        where: { estudiante_id_sm_vc: payload.estudianteId },
      });

      if (!conversacion) {
        console.error(`Conversación no encontrada para estudiante ${payload.estudianteId}`);
        return;
      }

      // 2. Insertar el mensaje marcado como sistema
      await this.prisma_sm_vc.mensaje.create({
        data: {
          conversacion_id_sm_vc: conversacion.id_sm_vc,
          contenido_sm_vc:       payload.descripcion_sm_vc,
          es_sistema_sm_vc:      true,
        },
      });
    } catch (error) {
      console.error('Error al registrar mensaje de sistema:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // ENDPOINTS DE LOGICA DE NEGOCIO
  // ─────────────────────────────────────────────────────────────────

  async obtenerMensajes_sm_vc(estudianteId: number) {
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
        throw new NotFoundException(`No se encontró conversación para el estudiante ${estudianteId}.`);
      }

      return {
        id_sm_vc:            conversacion.id_sm_vc,
        estudiante_id_sm_vc: conversacion.estudiante_id_sm_vc,
        mensajes_sm_vc:      conversacion.mensajes.map((m: any) => ({
          id_sm_vc:             m.id_sm_vc,
          contenido_sm_vc:      m.contenido_sm_vc,
          es_sistema_sm_vc:     m.es_sistema_sm_vc,
          fecha_creacion_sm_vc: m.fecha_creacion_sm_vc,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al obtener el historial de mensajes.');
    }
  }
}
