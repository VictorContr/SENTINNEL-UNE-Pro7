import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversacionesService {
  constructor(
    private readonly prisma_sm_vc: PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2,
  ) {}

  // ─── Listeners de Eventos (trazabilidad automática) ────────────

  @OnEvent('materia.aprobada_sm_vc')
  async manejarMateriaAprobada_sm_vc(payload: {
    estudianteId:     number;
    descripcion_sm_vc: string;
    materiaId?:       number;
    posicionMateria?: number;
    intento?:         number;
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  @OnEvent('documento.subido_sm_vc')
  async manejarDocumentoSubido_sm_vc(payload: {
    estudianteId:     number;
    descripcion_sm_vc: string;
    materiaId?:       number;
    posicionMateria?: number;
    intento?:         number;
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  @OnEvent('deploy.completado_sm_vc')
  async manejarDeployCompletado_sm_vc(payload: {
    estudianteId:     number;
    descripcion_sm_vc: string;
    materiaId?:       number;
    posicionMateria?: number;
    intento?:         number;
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  // ─── Persistencia de mensajes de sistema ───────────────────────

  private async registrarMensajeSistema_sm_vc(payload: {
    estudianteId:     number;
    descripcion_sm_vc: string;
    materiaId?:       number;
    posicionMateria?: number;
    intento?:         number;
  }) {
    try {
      const posicion_sm_vc = payload.posicionMateria ?? 0;
      const intento_sm_vc  = payload.intento ?? 1;

      const conversacion_sm_vc = await this.prisma_sm_vc.conversacion.upsert({
        where: {
          estudiante_id_sm_vc_posicion_materia_sm_vc_intento_sm_vc: {
            estudiante_id_sm_vc:    payload.estudianteId,
            posicion_materia_sm_vc: posicion_sm_vc,
            intento_sm_vc:          intento_sm_vc,
          },
        },
        update: {},
        create: {
          estudiante_id_sm_vc:    payload.estudianteId,
          posicion_materia_sm_vc: posicion_sm_vc,
          intento_sm_vc:          intento_sm_vc,
        },
      });

      const mensajeGuardado_sm_vc = await this.prisma_sm_vc.mensaje.create({
        data: {
          conversacion_id_sm_vc: conversacion_sm_vc.id_sm_vc,
          contenido_sm_vc:       payload.descripcion_sm_vc,
          es_sistema_sm_vc:      true,
          materia_id_sm_vc:      payload.materiaId ?? null,
        },
      });

      this.eventEmitter_sm_vc.emit('mensaje.creado_sm_vc', {
        estudianteId_sm_vc:     payload.estudianteId,
        materiaId_sm_vc:        payload.materiaId ?? null,
        conversacion_id_sm_vc:  conversacion_sm_vc.id_sm_vc,
        mensaje_sm_vc:          this.formatearNodoTimeline_sm_vc(mensajeGuardado_sm_vc),
      });
    } catch (error_sm_vc) {
      console.error(
        '[ConversacionesService] Error al registrar mensaje de sistema:',
        error_sm_vc,
      );
    }
  }

  // ─── Persistencia de mensajes manuales (Estudiante/Profesor) ───

  async registrarMensajeManual_sm_vc(payload: {
    estudianteId:   number;
    contenido_sm_vc: string;
    materiaId?:     number;
    documentoId?:   number;
    remitenteId?:   number;  
    remitenteRol?:  string;  
    posicionMateria?: number;
    intento?:         number;
  }) {
    try {
      // ✅ FIX: Prioridad estricta al ID de Estudiante para evitar colisiones
      let estudianteVinculado_sm_vc = await this.prisma_sm_vc.estudiante.findUnique({
        where: { id_sm_vc: payload.estudianteId },
        include: { materiaActiva: true },
      });

      if (!estudianteVinculado_sm_vc) {
        estudianteVinculado_sm_vc = await this.prisma_sm_vc.estudiante.findFirst({
          where: { usuario_id_sm_vc: payload.estudianteId },
          include: { materiaActiva: true },
        });
      }

      if (!estudianteVinculado_sm_vc) {
        console.error(
          `[ConversacionesService] Estudiante no encontrado para ID: ${payload.estudianteId}`,
        );
        return;
      }

      let posicion_sm_vc = payload.posicionMateria ?? 0;

      if (payload.posicionMateria == null && payload.materiaId != null) {
        const materiaConsultada = await this.prisma_sm_vc.materia.findUnique({
          where: { id_sm_vc: payload.materiaId },
          select: { posicion_sm_vc: true },
        });
        if (!materiaConsultada) {
           throw new NotFoundException(`Materia con ID ${payload.materiaId} no encontrada`);
        }
        posicion_sm_vc = materiaConsultada.posicion_sm_vc;
      } else if (payload.posicionMateria == null && payload.materiaId == null) {
        posicion_sm_vc = estudianteVinculado_sm_vc.materiaActiva?.posicion_sm_vc ?? 0;
      }

      let intento_sm_vc = payload.intento;
      if (intento_sm_vc == null) {
        const ultimaConv = await this.prisma_sm_vc.conversacion.findFirst({
          where: {
            estudiante_id_sm_vc: estudianteVinculado_sm_vc.id_sm_vc,
            posicion_materia_sm_vc: posicion_sm_vc,
          },
          orderBy: { intento_sm_vc: 'desc' },
          select: { intento_sm_vc: true },
        });
        intento_sm_vc = ultimaConv?.intento_sm_vc ?? estudianteVinculado_sm_vc.intentos_materia_sm_vc ?? 1;
      }

      const conversacion_sm_vc = await this.prisma_sm_vc.conversacion.upsert({
        where: {
          estudiante_id_sm_vc_posicion_materia_sm_vc_intento_sm_vc: {
            estudiante_id_sm_vc:    estudianteVinculado_sm_vc.id_sm_vc,
            posicion_materia_sm_vc: posicion_sm_vc,
            intento_sm_vc:          intento_sm_vc,
          },
        },
        update: {},
        create: {
          estudiante_id_sm_vc:    estudianteVinculado_sm_vc.id_sm_vc,
          posicion_materia_sm_vc: posicion_sm_vc,
          intento_sm_vc:          intento_sm_vc,
        },
      });

      const mensajeGuardado_sm_vc = await this.prisma_sm_vc.mensaje.create({
        data: {
          conversacion_id_sm_vc: conversacion_sm_vc.id_sm_vc,
          contenido_sm_vc: payload.contenido_sm_vc,
          es_sistema_sm_vc: false, 
          materia_id_sm_vc: payload.materiaId ?? null,
          documento_id_sm_vc: payload.documentoId ?? null,
          remitente_id_sm_vc: payload.remitenteId ?? null,
          remitente_rol_sm_vc: payload.remitenteRol ?? null,
        },
        include: { documento_sm_vc: true },
      });

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

  async obtenerMensajes_sm_vc(
    estudianteId:     number,
    materiaId?:       number,   
    posicionMateria?: number,
    _intento?:        number,   
  ) {
    try {
      // ✅ FIX: Prioridad estricta al ID de Estudiante
      let estudianteVinculado_sm_vc = await this.prisma_sm_vc.estudiante.findUnique({
        where: { id_sm_vc: estudianteId },
        include: { materiaActiva: true },
      });

      if (!estudianteVinculado_sm_vc) {
        estudianteVinculado_sm_vc = await this.prisma_sm_vc.estudiante.findFirst({
          where: { usuario_id_sm_vc: estudianteId },
          include: { materiaActiva: true },
        });
      }

      const idRealEstudiante_sm_vc = estudianteVinculado_sm_vc?.id_sm_vc ?? estudianteId;

      let posicion_sm_vc: number;

      if (posicionMateria != null) {
        posicion_sm_vc = posicionMateria;
      } else if (materiaId != null) {
        const materiaConsultada = await this.prisma_sm_vc.materia.findUnique({
          where:  { id_sm_vc: materiaId },
          select: { posicion_sm_vc: true },
        });
        if (!materiaConsultada) {
          throw new NotFoundException(`Materia con ID ${materiaId} no encontrada`);
        }
        posicion_sm_vc = materiaConsultada.posicion_sm_vc;
      } else {
        posicion_sm_vc = estudianteVinculado_sm_vc?.materiaActiva?.posicion_sm_vc ?? 0;
      }

      const conversacionesDeFase_sm_vc = await this.prisma_sm_vc.conversacion.findMany({
        where: {
          estudiante_id_sm_vc:    idRealEstudiante_sm_vc,
          posicion_materia_sm_vc: posicion_sm_vc,
        },
        select:  { id_sm_vc: true },
        orderBy: { intento_sm_vc: 'asc' }, 
      });

      const idsConversaciones_sm_vc = conversacionesDeFase_sm_vc.map(c => c.id_sm_vc);

      if (idsConversaciones_sm_vc.length === 0) {
        return {
          id_sm_vc:            null,
          estudiante_id_sm_vc: idRealEstudiante_sm_vc,
          posicion_sm_vc,
          mensajes_sm_vc:      [],
        };
      }

      const mensajesRaw_sm_vc = await this.prisma_sm_vc.mensaje.findMany({
        where: {
          conversacion_id_sm_vc: { in: idsConversaciones_sm_vc },
        },
        include: {
          documento_sm_vc: {
            include: {
              entrega: { include: { requisito: true } },
            },
          },
        },
        orderBy: { fecha_creacion_sm_vc: 'asc' }, 
      });

      const timelineUnificado_sm_vc = mensajesRaw_sm_vc.flatMap((m: any) => {
        const nodos_sm_vc: any[] = [];

        if (m.documento_sm_vc) {
          const doc_sm_vc = m.documento_sm_vc;
          nodos_sm_vc.push({
            id_sm_vc:             `doc-${doc_sm_vc.id_sm_vc}`,
            tipo_nodo_sm_vc:      'DOCUMENTO',
            documento_id_sm_vc:   doc_sm_vc.id_sm_vc,
            // ✅ FIX: Usar el nombre original; si es null (mock antiguo), usar el nombre de archivo
            archivo_nombre_sm_vc: doc_sm_vc.nombre_original_sm_vc || doc_sm_vc.nombre_archivo_sm_vc,
            ruta_archivo_sm_vc:   doc_sm_vc.ruta_archivo_sm_vc,
            tamanio_sm_vc: doc_sm_vc.tamanio_bytes_sm_vc
              ? `${(doc_sm_vc.tamanio_bytes_sm_vc / 1024).toFixed(1)} KB`
              : '1.2 MB',
            mock_sm_vc:           doc_sm_vc.mock_sm_vc,
            fecha_creacion_sm_vc: m.fecha_creacion_sm_vc,
            es_sistema_sm_vc:     m.es_sistema_sm_vc,
            requisito_id_sm_vc:   doc_sm_vc.entrega?.requisito_id_sm_vc ?? null,
            estado_sm_vc:         doc_sm_vc.entrega?.estado_sm_vc ?? 'ENTREGADO',
            materia_id_sm_vc:
              doc_sm_vc.entrega?.requisito?.materia_id_sm_vc ??
              m.materia_id_sm_vc ??
              null,
            remitente_id_sm_vc:  m.remitente_id_sm_vc  ?? null,
            remitente_rol_sm_vc: m.remitente_rol_sm_vc ?? null,
          });
        }

        nodos_sm_vc.push({
          id_sm_vc:             m.id_sm_vc,
          tipo_nodo_sm_vc:      'TEXTO',
          contenido_sm_vc:      m.contenido_sm_vc,
          es_sistema_sm_vc:     m.es_sistema_sm_vc,
          fecha_creacion_sm_vc: m.fecha_creacion_sm_vc,
          materia_id_sm_vc:     m.materia_id_sm_vc,
          remitente_id_sm_vc:   m.remitente_id_sm_vc  ?? null,
          remitente_rol_sm_vc:  m.remitente_rol_sm_vc ?? null,
        });

        return nodos_sm_vc;
      });

      return {
        id_sm_vc:            idsConversaciones_sm_vc[idsConversaciones_sm_vc.length - 1],
        estudiante_id_sm_vc: idRealEstudiante_sm_vc,
        posicion_sm_vc,
        mensajes_sm_vc:      timelineUnificado_sm_vc,
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

  formatearNodoTimeline_sm_vc(mensaje_sm_vc: any): Record<string, unknown>[] {
    const nodos_sm_vc: Record<string, unknown>[] = [];
    const tieneDocumento_sm_vc = !!mensaje_sm_vc.documento_sm_vc;

    if (tieneDocumento_sm_vc) {
      const doc_sm_vc = mensaje_sm_vc.documento_sm_vc;
      nodos_sm_vc.push({
        id_sm_vc: `doc-${doc_sm_vc.id_sm_vc}`,
        tipo_nodo_sm_vc: 'DOCUMENTO',
        contenido_sm_vc: mensaje_sm_vc.contenido_sm_vc,
        es_sistema_sm_vc: mensaje_sm_vc.es_sistema_sm_vc,
        fecha_creacion_sm_vc: mensaje_sm_vc.fecha_creacion_sm_vc.toISOString(),
        materia_id_sm_vc: mensaje_sm_vc.materia_id_sm_vc,
        documento_id_sm_vc: doc_sm_vc.id_sm_vc,
        // ✅ FIX: Usar el nombre original; si es null (mock antiguo), usar el nombre de archivo
        archivo_nombre_sm_vc: doc_sm_vc.nombre_original_sm_vc || doc_sm_vc.nombre_archivo_sm_vc,
        tamanio_sm_vc: doc_sm_vc.tamanio_bytes_sm_vc
          ? `${(doc_sm_vc.tamanio_bytes_sm_vc / 1024).toFixed(1)} KB`
          : '1.2 MB',
        mock_sm_vc: doc_sm_vc.mock_sm_vc ?? false,
        estado_sm_vc: 'ENTREGADO',
        ruta_archivo_sm_vc: doc_sm_vc.ruta_archivo_sm_vc,
        requisito_id_sm_vc: doc_sm_vc.entrega?.requisito_id_sm_vc ?? null,
        remitente_id_sm_vc: mensaje_sm_vc.remitente_id_sm_vc ?? null,
        remitente_rol_sm_vc: mensaje_sm_vc.remitente_rol_sm_vc ?? null,
      });
    }

    nodos_sm_vc.push({
      id_sm_vc: mensaje_sm_vc.id_sm_vc,
      tipo_nodo_sm_vc: 'TEXTO',
      contenido_sm_vc: mensaje_sm_vc.contenido_sm_vc,
      es_sistema_sm_vc: mensaje_sm_vc.es_sistema_sm_vc,
      fecha_creacion_sm_vc: mensaje_sm_vc.fecha_creacion_sm_vc.toISOString(),
      materia_id_sm_vc: mensaje_sm_vc.materia_id_sm_vc,
      remitente_id_sm_vc: mensaje_sm_vc.remitente_id_sm_vc ?? null,
      remitente_rol_sm_vc: mensaje_sm_vc.remitente_rol_sm_vc ?? null,
    });

    return nodos_sm_vc;
  }
}