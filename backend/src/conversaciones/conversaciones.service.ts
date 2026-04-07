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

  @OnEvent('deploy.completado_sm_vc')
  async manejarDeployCompletado_sm_vc(payload: { estudianteId: number; descripcion_sm_vc: string }) {
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
      // 0. Aclaratoria de IDs: El frontend a veces manda el usuario_id_sm_vc pensando que es el estudianteId
      // Buscamos el registro del Estudiante para tener certeza de ambos IDs
      let idRealEstudiante = estudianteId;
      let idRealUsuario = estudianteId;

      const estudianteVinculado = await this.prisma_sm_vc.estudiante.findFirst({
        where: {
          OR: [
            { id_sm_vc: estudianteId },
            { usuario_id_sm_vc: estudianteId }
          ]
        }
      });

      if (estudianteVinculado) {
        idRealEstudiante = estudianteVinculado.id_sm_vc;
        idRealUsuario = estudianteVinculado.usuario_id_sm_vc;
      }

      // 1. Aseguramos que la conversación siempre exista usando el ID REAL de Estudiante
      const conversacion = await this.prisma_sm_vc.conversacion.upsert({
        where: { estudiante_id_sm_vc: idRealEstudiante },
        update: {},
        create: { estudiante_id_sm_vc: idRealEstudiante },
        include: {
          mensajes: {
            orderBy: { fecha_creacion_sm_vc: 'asc' },
          },
        },
      });

      const mensajesRaw = conversacion.mensajes || [];

      // 2. Obtener los documentos usando el ID REAL de Usuario Subida
      const documentos = await this.prisma_sm_vc.documento.findMany({
        where: { usuario_subida_id_sm_vc: idRealUsuario },
        include: { entrega: true },
        orderBy: { fecha_subida_sm_vc: 'asc' },
      });

      // 3. Mapear los mensajes de sistema
      const msgsTexto = mensajesRaw.map((m: any) => ({
        id_sm_vc:             m.id_sm_vc,
        tipo_nodo_sm_vc:      'TEXTO',
        contenido_sm_vc:      m.contenido_sm_vc,
        es_sistema_sm_vc:     m.es_sistema_sm_vc,
        fecha_creacion_sm_vc: m.fecha_creacion_sm_vc,
      }));

      // 4. Mapear los documentos para que el frontend los despliegue en formato de tarjetas UI
      const msgsDoc = documentos.map((d: any) => ({
        id_sm_vc:             `doc-${d.id_sm_vc}`,
        tipo_nodo_sm_vc:      'DOCUMENTO',
        archivo_nombre_sm_vc: d.nombre_archivo_sm_vc,
        ruta_archivo_sm_vc:   d.ruta_archivo_sm_vc,
        tamanio_sm_vc:        d.tamanio_bytes_sm_vc ? `${Math.round(d.tamanio_bytes_sm_vc / 1024)} KB` : '1.2 MB',
        mock_sm_vc:           d.mock_sm_vc,
        fecha_creacion_sm_vc: d.fecha_subida_sm_vc,
        es_sistema_sm_vc:     false, // Representa un envío por parte del usuario (Estudiante)
        requisito_id_sm_vc:   d.entrega?.requisito_id_sm_vc || null,
        estado_sm_vc:         d.entrega?.estado_sm_vc || 'PENDIENTE',
      }));

      // 5. Unir y ordenar cronológicamente (Timeline Integrado)
      const timelineUnificado = [...msgsTexto, ...msgsDoc].sort((a, b) => 
        a.fecha_creacion_sm_vc.getTime() - b.fecha_creacion_sm_vc.getTime()
      );

      return {
        id_sm_vc:            conversacion.id_sm_vc,
        estudiante_id_sm_vc: estudianteId,
        mensajes_sm_vc:      timelineUnificado,
      };
    } catch (error) {
      console.error('Error obtenerMensajes_sm_vc:', error);
      throw new InternalServerErrorException('Error al obtener el historial de mensajes unificado.');
    }
  }
}
