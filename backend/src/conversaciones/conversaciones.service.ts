import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversacionesService {
  constructor(
    private readonly prisma_sm_vc: PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2, // ← NUEVO
  ) {}

  // ─── Listeners de Eventos (trazabilidad automática) ────────────

  @OnEvent('materia.aprobada_sm_vc')
  async manejarMateriaAprobada_sm_vc(payload: {
    estudianteId: number;
    descripcion_sm_vc: string;
    materiaId?: number;
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  @OnEvent('documento.subido_sm_vc')
  async manejarDocumentoSubido_sm_vc(payload: {
    estudianteId: number;
    descripcion_sm_vc: string;
    materiaId?: number;
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  @OnEvent('deploy.completado_sm_vc')
  async manejarDeployCompletado_sm_vc(payload: {
    estudianteId: number;
    descripcion_sm_vc: string;
    materiaId?: number;
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  // ─── Persistencia de mensajes de sistema ───────────────────────

  private async registrarMensajeSistema_sm_vc(payload: {
    estudianteId: number;
    descripcion_sm_vc: string;
    materiaId?: number;
  }) {
    try {
      const conversacion_sm_vc = await this.prisma_sm_vc.conversacion.findFirst(
        {
          where: { estudiante_id_sm_vc: payload.estudianteId },
        },
      );

      if (!conversacion_sm_vc) {
        console.error(
          `[ConversacionesService] Conversación no encontrada para estudianteId: ${payload.estudianteId}`,
        );
        return;
      }

      const mensajeGuardado_sm_vc = await this.prisma_sm_vc.mensaje.create({
        data: {
          conversacion_id_sm_vc: conversacion_sm_vc.id_sm_vc,
          contenido_sm_vc: payload.descripcion_sm_vc,
          es_sistema_sm_vc: true,
          materia_id_sm_vc: payload.materiaId ?? null,
        },
      });

      // ── Broadcast WS: notificar a clientes de la sala ──────────
      this.eventEmitter_sm_vc.emit('mensaje.creado_sm_vc', {
        estudianteId_sm_vc: payload.estudianteId,
        materiaId_sm_vc: payload.materiaId ?? null,
        conversacion_id_sm_vc: conversacion_sm_vc.id_sm_vc,
        mensaje_sm_vc: this.formatearNodoTimeline_sm_vc(mensajeGuardado_sm_vc),
      });
    } catch (error_sm_vc) {
      console.error(
        '[ConversacionesService] Error al registrar mensaje de sistema:',
        error_sm_vc,
      );
    }
  }

  // ─── Persistencia de mensajes manuales (Estudiante/Profesor) ───

  /**
   * registrarMensajeManual_sm_vc — Guarda un mensaje enviado por un usuario
   * (no generado por el sistema) y dispara el broadcast de WebSocket.
   *
   * FLUJO DE TIEMPO REAL:
   *   Frontend WS send_message_sm_vc
   *     → ChatGateway_sm_vc.handleSendMessage_sm_vc
   *       → este método (persiste en BD)
   *         → emit 'mensaje.creado_sm_vc' (EventEmitter2)
   *           → ChatGateway_sm_vc.handleMensajeCreado_sm_vc (broadcast a sala)
   */
  async registrarMensajeManual_sm_vc(payload: {
    estudianteId: number;
    contenido_sm_vc: string;
    materiaId?: number;
    documentoId?: number;
  }) {
    try {
      // Resolver ID real del estudiante (acepta usuario_id o estudiante_id)
      const estudianteVinculado_sm_vc =
        await this.prisma_sm_vc.estudiante.findFirst({
          where: {
            OR: [
              { id_sm_vc: payload.estudianteId },
              { usuario_id_sm_vc: payload.estudianteId },
            ],
          },
        });

      if (!estudianteVinculado_sm_vc) {
        console.error(
          `[ConversacionesService] Estudiante no encontrado para ID: ${payload.estudianteId}`,
        );
        return;
      }

      const conversacion_sm_vc = await this.prisma_sm_vc.conversacion.upsert({
        where: { estudiante_id_sm_vc: estudianteVinculado_sm_vc.id_sm_vc },
        update: {},
        create: { estudiante_id_sm_vc: estudianteVinculado_sm_vc.id_sm_vc },
      });

      const mensajeGuardado_sm_vc = await this.prisma_sm_vc.mensaje.create({
        data: {
          conversacion_id_sm_vc: conversacion_sm_vc.id_sm_vc,
          contenido_sm_vc: payload.contenido_sm_vc,
          es_sistema_sm_vc: false, // Mensaje MANUAL
          materia_id_sm_vc: payload.materiaId ?? null,
          documento_id_sm_vc: payload.documentoId ?? null,
        },
        include: { documento_sm_vc: true },
      });

      // ── Broadcast vía EventEmitter2 → ChatGateway_sm_vc ──
      this.eventEmitter_sm_vc.emit('mensaje.creado_sm_vc', {
        estudianteId_sm_vc: estudianteVinculado_sm_vc.id_sm_vc,
        materiaId_sm_vc: payload.materiaId ?? null,
        conversacion_id_sm_vc: conversacion_sm_vc.id_sm_vc,
        mensaje_sm_vc: this.formatearNodoTimeline_sm_vc(mensajeGuardado_sm_vc),
      });

      return mensajeGuardado_sm_vc;
    } catch (error_sm_vc) {
      console.error(
        '[ConversacionesService] Error en registrarMensajeManual_sm_vc:',
        error_sm_vc,
      );
      throw error_sm_vc;
    }
  }

  // ─── Consulta del historial ─────────────────────────────────────

  async obtenerMensajes_sm_vc(estudianteId: number, materiaId?: number) {
    try {
      // Resolución de IDs
      let idRealEstudiante_sm_vc = estudianteId;
      let idRealUsuario_sm_vc = estudianteId;

      const estudianteVinculado_sm_vc =
        await this.prisma_sm_vc.estudiante.findFirst({
          where: {
            OR: [
              { id_sm_vc: estudianteId },
              { usuario_id_sm_vc: estudianteId },
            ],
          },
        });

      if (estudianteVinculado_sm_vc) {
        idRealEstudiante_sm_vc = estudianteVinculado_sm_vc.id_sm_vc;
        idRealUsuario_sm_vc = estudianteVinculado_sm_vc.usuario_id_sm_vc;
      }

      const conversacion_sm_vc = await this.prisma_sm_vc.conversacion.upsert({
        where: { estudiante_id_sm_vc: idRealEstudiante_sm_vc },
        update: {},
        create: { estudiante_id_sm_vc: idRealEstudiante_sm_vc },
      });

      const mensajesRaw_sm_vc = await this.prisma_sm_vc.mensaje.findMany({
        where: {
          conversacion_id_sm_vc: conversacion_sm_vc.id_sm_vc,
          ...(materiaId != null ? { materia_id_sm_vc: materiaId } : {}),
        },
        include: {
          documento_sm_vc: {
            include: {
              entrega: {
                include: { requisito: true },
              },
            },
          },
        },
        orderBy: { fecha_creacion_sm_vc: 'asc' },
      });

      // ─── Lógica de Par de Nodos (Documento + Texto) ───────────
      const timelineUnificado_sm_vc = mensajesRaw_sm_vc.flatMap((m: any) => {
        const nodos_sm_vc: any[] = [];

        // Si tiene documento, generar nodo DOCUMENTO primero
        if (m.documento_sm_vc) {
          const doc_sm_vc = m.documento_sm_vc;
          nodos_sm_vc.push({
            id_sm_vc: `doc-${doc_sm_vc.id_sm_vc}`,
            tipo_nodo_sm_vc: 'DOCUMENTO',
            archivo_nombre_sm_vc: doc_sm_vc.nombre_archivo_sm_vc,
            ruta_archivo_sm_vc: doc_sm_vc.ruta_archivo_sm_vc,
            tamanio_sm_vc: doc_sm_vc.tamanio_bytes_sm_vc
              ? `${(doc_sm_vc.tamanio_bytes_sm_vc / 1024).toFixed(1)} KB`
              : '1.2 MB',
            mock_sm_vc: doc_sm_vc.mock_sm_vc,
            fecha_creacion_sm_vc: m.fecha_creacion_sm_vc,
            es_sistema_sm_vc: m.es_sistema_sm_vc,
            requisito_id_sm_vc: doc_sm_vc.entrega?.requisito_id_sm_vc ?? null,
            estado_sm_vc: doc_sm_vc.entrega?.estado_sm_vc ?? 'ENTREGADO',
            materia_id_sm_vc:
              doc_sm_vc.entrega?.requisito?.materia_id_sm_vc ??
              m.materia_id_sm_vc ??
              null,
          });
        }

        // Siempre generar nodo TEXTO
        nodos_sm_vc.push({
          id_sm_vc: m.id_sm_vc,
          tipo_nodo_sm_vc: 'TEXTO',
          contenido_sm_vc: m.contenido_sm_vc,
          es_sistema_sm_vc: m.es_sistema_sm_vc,
          fecha_creacion_sm_vc: m.fecha_creacion_sm_vc,
          materia_id_sm_vc: m.materia_id_sm_vc,
        });

        return nodos_sm_vc;
      });

      return {
        id_sm_vc: conversacion_sm_vc.id_sm_vc,
        estudiante_id_sm_vc: estudianteId,
        materia_id_sm_vc: materiaId ?? null,
        mensajes_sm_vc: timelineUnificado_sm_vc,
      };
    } catch (error_sm_vc) {
      console.error(
        '[ConversacionesService] Error en obtenerMensajes_sm_vc:',
        error_sm_vc,
      );
      throw new InternalServerErrorException(
        'Error al obtener el historial de mensajes unificado.',
      );
    }
  }

  // ─── Helper privado ─────────────────────────────────────────────

  /**
   * Formatea un registro Prisma de Mensaje al nodo de timeline
   * que espera el frontend (ConvMessages.vue).
   *
   * Implementa la estructura "Par de Nodos": si el mensaje tiene un documento
   * vinculado, retorna un array con [nodoDocumento, nodoTexto].
   * Si no tiene documento, retorna un array con [nodoTexto].
   *
   * Esto asegura consistencia entre HTTP GET y WebSocket broadcast.
   */
  formatearNodoTimeline_sm_vc(mensaje_sm_vc: any): Record<string, unknown>[] {
    const nodos_sm_vc: Record<string, unknown>[] = [];
    const tieneDocumento_sm_vc = !!mensaje_sm_vc.documento_sm_vc;

    // ── Nodo DOCUMENTO (primero, si existe) ──
    if (tieneDocumento_sm_vc) {
      const doc_sm_vc = mensaje_sm_vc.documento_sm_vc;
      nodos_sm_vc.push({
        id_sm_vc: `doc-${doc_sm_vc.id_sm_vc}`,
        tipo_nodo_sm_vc: 'DOCUMENTO',
        contenido_sm_vc: mensaje_sm_vc.contenido_sm_vc,
        es_sistema_sm_vc: mensaje_sm_vc.es_sistema_sm_vc,
        fecha_creacion_sm_vc: mensaje_sm_vc.fecha_creacion_sm_vc.toISOString(),
        materia_id_sm_vc: mensaje_sm_vc.materia_id_sm_vc,
        // ── Metadata del documento ──
        documento_id_sm_vc: doc_sm_vc.id_sm_vc,
        archivo_nombre_sm_vc: doc_sm_vc.nombre_archivo_sm_vc,
        tamanio_sm_vc: doc_sm_vc.tamanio_bytes_sm_vc
          ? `${(doc_sm_vc.tamanio_bytes_sm_vc / 1024).toFixed(1)} KB`
          : '1.2 MB',
        mock_sm_vc: doc_sm_vc.mock_sm_vc ?? false,
        estado_sm_vc: 'ENTREGADO',
        ruta_archivo_sm_vc: doc_sm_vc.ruta_archivo_sm_vc,
        requisito_id_sm_vc: doc_sm_vc.entrega?.requisito_id_sm_vc ?? null,
      });
    }

    // ── Nodo TEXTO (siempre presente) ──
    nodos_sm_vc.push({
      id_sm_vc: mensaje_sm_vc.id_sm_vc,
      tipo_nodo_sm_vc: 'TEXTO',
      contenido_sm_vc: mensaje_sm_vc.contenido_sm_vc,
      es_sistema_sm_vc: mensaje_sm_vc.es_sistema_sm_vc,
      fecha_creacion_sm_vc: mensaje_sm_vc.fecha_creacion_sm_vc.toISOString(),
      materia_id_sm_vc: mensaje_sm_vc.materia_id_sm_vc,
    });

    return nodos_sm_vc;
  }
}
