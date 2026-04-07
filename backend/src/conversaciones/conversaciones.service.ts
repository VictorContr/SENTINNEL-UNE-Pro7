import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversacionesService {
  constructor(private readonly prisma_sm_vc: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // LISTENERS DE EVENTOS (Trazabilidad automática)
  // Cada evento recibe el materiaId para segmentar el log correctamente.
  // ─────────────────────────────────────────────────────────────────

  @OnEvent('materia.aprobada_sm_vc')
  async manejarMateriaAprobada_sm_vc(payload: {
    estudianteId:      number;
    descripcion_sm_vc: string;
    materiaId?:        number; // ID de la materia a la que pertenece el log
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  @OnEvent('documento.subido_sm_vc')
  async manejarDocumentoSubido_sm_vc(payload: {
    estudianteId:      number;
    descripcion_sm_vc: string;
    materiaId?:        number;
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  @OnEvent('deploy.completado_sm_vc')
  async manejarDeployCompletado_sm_vc(payload: {
    estudianteId:      number;
    descripcion_sm_vc: string;
    materiaId?:        number; // null = log global de deploy
  }) {
    await this.registrarMensajeSistema_sm_vc(payload);
  }

  /** Persiste un mensaje generado automáticamente por el sistema.
   *  Si materiaId es null/undefined, el mensaje queda como "Global" (sin materia).
   */
  private async registrarMensajeSistema_sm_vc(payload: {
    estudianteId:      number;
    descripcion_sm_vc: string;
    materiaId?:        number;
  }) {
    try {
      // Resolver el ID real del Estudiante (el payload siempre viene con el id de Estudiante,
      // ya que los servicios internos lo gestionan correctamente, pero por seguridad verificamos)
      const conversacion = await this.prisma_sm_vc.conversacion.findFirst({
        where: { estudiante_id_sm_vc: payload.estudianteId },
      });

      if (!conversacion) {
        console.error(`[ConversacionesService] Conversación no encontrada para estudianteId: ${payload.estudianteId}`);
        return;
      }

      await this.prisma_sm_vc.mensaje.create({
        data: {
          conversacion_id_sm_vc: conversacion.id_sm_vc,
          contenido_sm_vc:       payload.descripcion_sm_vc,
          es_sistema_sm_vc:      true,
          materia_id_sm_vc:      payload.materiaId ?? null, // null = log global
        },
      });
    } catch (error) {
      console.error('[ConversacionesService] Error al registrar mensaje de sistema:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // ENDPOINTS DE LOGICA DE NEGOCIO
  // ─────────────────────────────────────────────────────────────────

  /**
   * Obtiene el historial unificado (mensajes + documentos) de un estudiante.
   *
   * @param estudianteId - Puede ser usuario_id_sm_vc o estudiante_id_sm_vc (se resuelve internamente).
   * @param materiaId    - Opcional. Si se proporciona, filtra los mensajes y documentos por esa materia.
   *                       Si es null/undefined, devuelve el historial global completo.
   */
  async obtenerMensajes_sm_vc(estudianteId: number, materiaId?: number) {
    try {
      // ── 0. Resolución de IDs (Defensa ante ambigüedad Frontend) ──
      // El frontend puede enviar el usuario_id_sm_vc o el estudiante_id_sm_vc.
      // Buscamos el registro de Estudiante resolviendo ambas posibilidades.
      let idRealEstudiante = estudianteId;
      let idRealUsuario    = estudianteId;

      const estudianteVinculado = await this.prisma_sm_vc.estudiante.findFirst({
        where: {
          OR: [
            { id_sm_vc:          estudianteId },
            { usuario_id_sm_vc:  estudianteId },
          ],
        },
      });

      if (estudianteVinculado) {
        idRealEstudiante = estudianteVinculado.id_sm_vc;
        idRealUsuario    = estudianteVinculado.usuario_id_sm_vc;
      }

      // ── 1. Garantizar que el registro de Conversación existe (Upsert) ──
      const conversacion = await this.prisma_sm_vc.conversacion.upsert({
        where:  { estudiante_id_sm_vc: idRealEstudiante },
        update: {},
        create: { estudiante_id_sm_vc: idRealEstudiante },
      });

      // ── 2. Obtener mensajes de texto CON filtro de materia condicional ──
      const mensajesRaw = await this.prisma_sm_vc.mensaje.findMany({
        where: {
          conversacion_id_sm_vc: conversacion.id_sm_vc,
          // Si materiaId está presente → filtra estrictamente por esa materia.
          // Si no está presente       → devuelve TODOS los mensajes (global).
          // NOTA técnica: null en Prisma WHERE no es lo mismo que campo omitido.
          // Al omitir el campo, Prisma no aplica filtro sobre él.
          ...(materiaId != null ? { materia_id_sm_vc: materiaId } : {}),
        },
        orderBy: { fecha_creacion_sm_vc: 'asc' },
      });

      // ── 3. Obtener documentos CON filtro de materia condicional ──
      // Los documentos se vinculan a una materia a través de:
      // Documento → Entrega → Requisito → Materia
      const documentos = await this.prisma_sm_vc.documento.findMany({
        where: {
          usuario_subida_id_sm_vc: idRealUsuario,
          // Filtro por materia: si se proporciona, solo docs de req. de esa materia
          ...(materiaId != null
            ? { entrega: { requisito: { materia_id_sm_vc: materiaId } } }
            : {}),
        },
        include: { entrega: { include: { requisito: true } } },
        orderBy: { fecha_subida_sm_vc: 'asc' },
      });

      // ── 4. Mapear mensajes de texto a nodos del timeline ──
      const msgsTexto = mensajesRaw.map((m: any) => ({
        id_sm_vc:             m.id_sm_vc,
        tipo_nodo_sm_vc:      'TEXTO',
        contenido_sm_vc:      m.contenido_sm_vc,
        es_sistema_sm_vc:     m.es_sistema_sm_vc,
        fecha_creacion_sm_vc: m.fecha_creacion_sm_vc,
        materia_id_sm_vc:     m.materia_id_sm_vc,
      }));

      // ── 5. Mapear documentos a nodos del timeline (tarjetas de archivo) ──
      const msgsDoc = documentos.map((d: any) => ({
        id_sm_vc:             `doc-${d.id_sm_vc}`,
        tipo_nodo_sm_vc:      'DOCUMENTO',
        archivo_nombre_sm_vc: d.nombre_archivo_sm_vc,
        ruta_archivo_sm_vc:   d.ruta_archivo_sm_vc,
        tamanio_sm_vc:        d.tamanio_bytes_sm_vc
                                ? `${(d.tamanio_bytes_sm_vc / 1024).toFixed(1)} KB`
                                : '1.2 MB',
        mock_sm_vc:           d.mock_sm_vc,
        fecha_creacion_sm_vc: d.fecha_subida_sm_vc,
        es_sistema_sm_vc:     false, // Subida del Estudiante (no es log de sistema)
        requisito_id_sm_vc:   d.entrega?.requisito_id_sm_vc ?? null,
        estado_sm_vc:         d.entrega?.estado_sm_vc ?? 'PENDIENTE',
        materia_id_sm_vc:     d.entrega?.requisito?.materia_id_sm_vc ?? null,
      }));

      // ── 6. Unir y ordenar cronológicamente (Timeline Integrado) ──
      const timelineUnificado = [...msgsTexto, ...msgsDoc].sort(
        (a, b) =>
          new Date(a.fecha_creacion_sm_vc).getTime() -
          new Date(b.fecha_creacion_sm_vc).getTime(),
      );

      return {
        id_sm_vc:            conversacion.id_sm_vc,
        estudiante_id_sm_vc: estudianteId,
        materia_id_sm_vc:    materiaId ?? null, // Refleja el filtro aplicado
        mensajes_sm_vc:      timelineUnificado,
      };
    } catch (error) {
      console.error('[ConversacionesService] Error en obtenerMensajes_sm_vc:', error);
      throw new InternalServerErrorException(
        'Error al obtener el historial de mensajes unificado.',
      );
    }
  }
}
