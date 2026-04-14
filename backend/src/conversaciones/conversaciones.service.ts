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
    estudianteId:     number;
    descripcion_sm_vc: string;
    materiaId?:       number;
    // Opción B: posición de la materia para resolver la conversación correcta
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
    // posicionMateria: 0 = log global, 1-4 = materia específica
    posicionMateria?: number;
    intento?:         number;
  }) {
    try {
      // Resolver la conversación por la clave (estudiante, posicion, intento)
      // Si no se provee posicion, usamos el slot global (posicion=0).
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

      // ── Broadcast WS: notificar a clientes de la sala ──────────
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
    estudianteId:   number;
    contenido_sm_vc: string;
    materiaId?:     number;
    documentoId?:   number;
    remitenteId?:   number;  // ID del usuario que escribe (no el estudiante-contexto)
    remitenteRol?:  string;  // Rol del remitente: 'ESTUDIANTE' | 'PROFESOR'
    // Opción B: identificar la conversación por posición + intento.
    // Si no se provee, se usan los valores del estudiante actual.
    posicionMateria?: number;
    intento?:         number;
  }) {
    try {
      // Resolver ID real del estudiante (acepta usuario_id o estudiante_id)
      const estudianteVinculado_sm_vc =
        await this.prisma_sm_vc.estudiante.findFirst({
          where: {
            OR: [
              { id_sm_vc:         payload.estudianteId },
              { usuario_id_sm_vc: payload.estudianteId },
            ],
          },
          include: { materiaActiva: true },
        });

      if (!estudianteVinculado_sm_vc) {
        console.error(
          `[ConversacionesService] Estudiante no encontrado para ID: ${payload.estudianteId}`,
        );
        return;
      }

      // Determinar posición e intento para resolver el hilo correcto.
      // Si el caller no los provee, usamos la materia activa del estudiante.
      const posicion_sm_vc = payload.posicionMateria
        ?? estudianteVinculado_sm_vc.materiaActiva?.posicion_sm_vc
        ?? 0;
      const intento_sm_vc  = payload.intento
        ?? estudianteVinculado_sm_vc.intentos_materia_sm_vc
        ?? 1;

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
          es_sistema_sm_vc: false, // Mensaje MANUAL
          materia_id_sm_vc: payload.materiaId ?? null,
          documento_id_sm_vc: payload.documentoId ?? null,
          // Trazabilidad de remitente: quien realmente escribió el mensaje
          remitente_id_sm_vc: payload.remitenteId ?? null,
          remitente_rol_sm_vc: payload.remitenteRol ?? null,
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

  /**
   * Obtiene los mensajes de un estudiante.
   * Con el nuevo modelo Opción-B, la conversación se identifica por
   * (estudiante, posicionMateria, intento). Si no se proveen, se usan
   * los valores actuales del estudiante (materia activa + intentos).
   */
  async obtenerMensajes_sm_vc(
    estudianteId:   number,
    materiaId?:     number,
    posicionMateria?: number,
    intento?:       number,
  ) {
    try {
      // Resolución de IDs
      let idRealEstudiante_sm_vc = estudianteId;
      let idRealUsuario_sm_vc    = estudianteId;

      const estudianteVinculado_sm_vc =
        await this.prisma_sm_vc.estudiante.findFirst({
          where: {
            OR: [
              { id_sm_vc:         estudianteId },
              { usuario_id_sm_vc: estudianteId },
            ],
          },
          include: { materiaActiva: true },
        });

      if (estudianteVinculado_sm_vc) {
        idRealEstudiante_sm_vc = estudianteVinculado_sm_vc.id_sm_vc;
        idRealUsuario_sm_vc    = estudianteVinculado_sm_vc.usuario_id_sm_vc;
      }

      // Resolver posición e intento para el hilo correcto
      const posicion_sm_vc = posicionMateria
        ?? estudianteVinculado_sm_vc?.materiaActiva?.posicion_sm_vc
        ?? 0;
      const intento_sm_vc  = intento
        ?? estudianteVinculado_sm_vc?.intentos_materia_sm_vc
        ?? 1;

      const conversacion_sm_vc = await this.prisma_sm_vc.conversacion.upsert({
        where: {
          estudiante_id_sm_vc_posicion_materia_sm_vc_intento_sm_vc: {
            estudiante_id_sm_vc:    idRealEstudiante_sm_vc,
            posicion_materia_sm_vc: posicion_sm_vc,
            intento_sm_vc:          intento_sm_vc,
          },
        },
        update: {},
        create: {
          estudiante_id_sm_vc:    idRealEstudiante_sm_vc,
          posicion_materia_sm_vc: posicion_sm_vc,
          intento_sm_vc:          intento_sm_vc,
        },
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

      // ─── Lógica de Par de Nodos (Documento + Texto) ─────────────
      const timelineUnificado_sm_vc = mensajesRaw_sm_vc.flatMap((m: any) => {
        const nodos_sm_vc: any[] = [];

        // Si tiene documento, generar nodo DOCUMENTO primero
        if (m.documento_sm_vc) {
          const doc_sm_vc = m.documento_sm_vc;
          nodos_sm_vc.push({
            id_sm_vc: `doc-${doc_sm_vc.id_sm_vc}`,
            tipo_nodo_sm_vc: 'DOCUMENTO',
            // [FIX] documento_id_sm_vc es el ID numérico real del Documento en BD.
            // El campo id_sm_vc usa el prefijo "doc-NN" solo para evitar colisiones
            // de key en el v-for del frontend. Sin este campo, el servicio de
            // descarga enviaba "doc-NN" al ParseIntPipe → 400 Bad Request.
            documento_id_sm_vc: doc_sm_vc.id_sm_vc,
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
            // Trazabilidad del remitente (para diferenciación visual en el chat)
            remitente_id_sm_vc: m.remitente_id_sm_vc ?? null,
            remitente_rol_sm_vc: m.remitente_rol_sm_vc ?? null,
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
          // Trazabilidad del remitente (para diferenciación visual en el chat)
          remitente_id_sm_vc: m.remitente_id_sm_vc ?? null,
          remitente_rol_sm_vc: m.remitente_rol_sm_vc ?? null,
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
        // ── Trazabilidad del remitente ──
        remitente_id_sm_vc: mensaje_sm_vc.remitente_id_sm_vc ?? null,
        remitente_rol_sm_vc: mensaje_sm_vc.remitente_rol_sm_vc ?? null,
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
      // ── Trazabilidad del remitente ──
      remitente_id_sm_vc: mensaje_sm_vc.remitente_id_sm_vc ?? null,
      remitente_rol_sm_vc: mensaje_sm_vc.remitente_rol_sm_vc ?? null,
    });

    return nodos_sm_vc;
  }
}
