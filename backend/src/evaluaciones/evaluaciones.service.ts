import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAprobacion, RolUsuario, TipoNotificacion, TipoDocumento } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { DocumentosService } from '../documentos/documentos.service';

@Injectable()
export class EvaluacionesService {
  constructor(
    private readonly prisma:            PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2,
    private readonly documentosService: DocumentosService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // POST /api/evaluaciones
  // Evalúa una entrega (APROBADO | REPROBADO).
  // FIX: upsert de evaluación + update de entrega ahora son atómicos
  //      dentro de $transaction. Las notificaciones y eventos se
  //      emiten después, fuera de la transacción.
  // ─────────────────────────────────────────────────────────────────
  async evaluarEntrega_sm_vc(
    dto: CrearEvaluacionDto,
    profesorId: number,
    file?: Express.Multer.File
  ) {
    try {
      // 1. Cargar la entrega con su contexto completo (fuera de tx: solo lectura)
      const entrega = await this.prisma.entrega.findUnique({
        where: { id_sm_vc: dto.entrega_id_sm_vc },
        include: {
          estudiante: { include: { usuario: true, materiaActiva: true } },
          // Incluir el periodo de la materia para acceder a su ID (FK real)
          requisito:  { include: { materia: { include: { periodo: true } } } },
          evaluacion: true,
        },
      });

      if (!entrega) {
        throw new NotFoundException(`Entrega ${dto.entrega_id_sm_vc} no encontrada.`);
      }

      if (entrega.estado_sm_vc === EstadoAprobacion.PENDIENTE) {
        throw new BadRequestException(
          'No se puede evaluar una entrega en estado PENDIENTE.',
        );
      }

      if (entrega.estado_sm_vc === EstadoAprobacion.APROBADO) {
        throw new ForbiddenException(
          'Esta entrega ya fue aprobada and no puede ser re-evaluada.',
        );
      }

      const estudianteId   = entrega.estudiante.id_sm_vc;
      const materiaId      = entrega.requisito.materia_id_sm_vc;
      const materiaNombre  = entrega.requisito.materia.nombre_sm_vc;
      const requisitoNombre = entrega.requisito.nombre_sm_vc;

      // ── Transacción atómica ──
      const evaluacion = await this.prisma.$transaction(async (tx_sm_vc) => {
        // 1. Upsert de evaluación
        const eval_sm_vc = await tx_sm_vc.evaluacion.upsert({
          where:  { entrega_id_sm_vc: dto.entrega_id_sm_vc },
          create: {
            entrega_id_sm_vc:    dto.entrega_id_sm_vc,
            profesor_id_sm_vc:   profesorId,
            decision_sm_vc:      dto.decision_sm_vc,
            observaciones_sm_vc: dto.observaciones_sm_vc ?? null,
          },
          update: {
            profesor_id_sm_vc:      profesorId,
            decision_sm_vc:         dto.decision_sm_vc,
            observaciones_sm_vc:    dto.observaciones_sm_vc ?? null,
            fecha_evaluacion_sm_vc: new Date(),
          },
        });

        // 2. Actualizar estado de entrega
        await tx_sm_vc.entrega.update({
          where: { id_sm_vc: dto.entrega_id_sm_vc },
          data:  { estado_sm_vc: dto.decision_sm_vc },
        });

        // 3. Registrar documento de corrección (si existe)
        if (file) {
          await tx_sm_vc.documento.create({
            data: {
              entrega_id_sm_vc:        dto.entrega_id_sm_vc,
              usuario_subida_id_sm_vc: profesorId,
              tipo_sm_vc:              TipoDocumento.CORRECCION_PROFESOR,
              nombre_archivo_sm_vc:    file.originalname,
              ruta_archivo_sm_vc:      file.path,
              tamanio_bytes_sm_vc:     file.size,
              mime_type_sm_vc:         file.mimetype,
            }
          });
        }

        return eval_sm_vc;
      });

      // ── Post-transacción: Trazabilidad ──
      let descripcionTrazabilidad_sm_vc = `Requisito "${requisitoNombre}" evaluado como **${dto.decision_sm_vc}**.`;
      
      if (file) {
        const peso_sm_vc = DocumentosService.formatearTamanioArchivo_sm_vc(file.size);
        descripcionTrazabilidad_sm_vc += ` Adjunto correction: **${file.originalname}** (${peso_sm_vc}).`;
      }

      if (dto.observaciones_sm_vc) {
        descripcionTrazabilidad_sm_vc += `\n\n**Observaciones:** ${dto.observaciones_sm_vc}`;
      }

      this.eventEmitter_sm_vc.emit('materia.aprobada_sm_vc', {
        estudianteId:     estudianteId,
        materiaId:        materiaId,
        descripcion_sm_vc: descripcionTrazabilidad_sm_vc,
      });

      // Notificación al estudiante
      await this.notificarEstudiante_sm_vc(
        profesorId,
        entrega.estudiante.usuario_id_sm_vc,
        dto.decision_sm_vc,
        requisitoNombre,
        materiaNombre,
        dto.observaciones_sm_vc,
      );

      this.eventEmitter_sm_vc.emit('entrega.actualizada_sm_vc', {
        estudianteId_sm_vc: entrega.estudiante_id_sm_vc,
        materiaId_sm_vc: entrega.requisito.materia_id_sm_vc,
        entrega_id_sm_vc: dto.entrega_id_sm_vc,
        estado_sm_vc: dto.decision_sm_vc,
        requisito_id_sm_vc: entrega.requisito_id_sm_vc,
      });

      // Verificar desbloqueo de materia
      let materiaDesbloqueada: string | null = null;
      if (dto.decision_sm_vc === EstadoAprobacion.APROBADO) {
        materiaDesbloqueada = await this.verificarYDesbloquearMateria_sm_vc(
          estudianteId,
          materiaId,
          entrega.requisito.materia.posicion_sm_vc,
          // Usamos el periodo_id_sm_vc (FK real) en lugar del string eliminado
          entrega.requisito.materia.periodo_id_sm_vc,
          materiaNombre,
          entrega.estudiante.usuario_id_sm_vc,
          profesorId,
        );
      }

      return this.generarRespuesta_sm_vc(evaluacion, materiaDesbloqueada);
    } catch (error) {
      if (
        error instanceof NotFoundException  ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) throw error;

      console.error('[EvaluacionesService] Error:', error);
      throw new InternalServerErrorException('Error al registrar la evaluación.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/evaluaciones/entrega/:entregaId
  // ─────────────────────────────────────────────────────────────────
  async obtenerEvaluacionDeEntrega_sm_vc(entregaId: number) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where:   { entrega_id_sm_vc: entregaId },
      include: { profesor: { select: { nombre_sm_vc: true, apellido_sm_vc: true } } },
    });

    if (!evaluacion) {
      throw new NotFoundException(`No hay evaluación para la entrega ${entregaId}.`);
    }

    return evaluacion;
  }

  // ─────────────────────────────────────────────────────────────────
  // LÓGICA CRÍTICA: Verificar si la materia quedó completa
  // ─────────────────────────────────────────────────────────────────
  private async verificarYDesbloquearMateria_sm_vc(
    estudianteId:        number,
    materiaId:           number,
    materiaPos:          number,
    // Cambiado de string a number: ahora recibe el ID del período (FK real)
    periodoId:           number,
    materiaNombre:       string,
    usuarioEstudianteId: number,
    actorId:             number,
  ): Promise<string | null> {

    const requisitos = await this.prisma.requisito.findMany({
      where: { materia_id_sm_vc: materiaId },
    });

    const entregas = await this.prisma.entrega.findMany({
      where: {
        estudiante_id_sm_vc: estudianteId,
        requisito: { materia_id_sm_vc: materiaId },
      },
      include: { requisito: true },
    });

    const todasAprobadas = requisitos.every((req) => {
      const entrega = entregas.find((e) => e.requisito_id_sm_vc === req.id_sm_vc);
      return entrega?.estado_sm_vc === EstadoAprobacion.APROBADO;
    });

    if (!todasAprobadas) return null;

    // Buscar la siguiente materia usando FK real (periodo_id_sm_vc) en lugar del string
    const siguienteMateria = await this.prisma.materia.findFirst({
      where: { posicion_sm_vc: materiaPos + 1, periodo_id_sm_vc: periodoId },
    });

    if (!siguienteMateria) {
      // Última materia completada → habilitar deploy
      await this.prisma.estudiante.update({
        where: { id_sm_vc: estudianteId },
        data:  { puede_hacer_deploy_sm_vc: true },
      });

      // Log global de deploy (sin materia específica → materiaId no se pasa = null)
      this.eventEmitter_sm_vc.emit('materia.aprobada_sm_vc', {
        estudianteId:     estudianteId,
        descripcion_sm_vc: '¡Proceso completado! Todas las materias aprobadas. Deploy habilitado.',
      });

      // Desbloqueo maneja su propia logica de enviar sockets a traves del logger o dejaremos que Nextjs emita events
      const notif1 = await this.prisma.notificacion.create({
        data: {
          emisor_id_sm_vc:   actorId,
          receptor_id_sm_vc: usuarioEstudianteId,
          tipo_sm_vc:        TipoNotificacion.IMPORTANTE,
          titulo_sm_vc:      '¡Proceso completado! Deploy habilitado',
          contenido_sm_vc:   'Has aprobado todas las materias. El módulo de Deploy del Proyecto Final está desbloqueado.',
        },
      });
      this.eventEmitter_sm_vc.emit('notificacion.enviar', { receptorId: usuarioEstudianteId, notificacion: notif1 });


      return 'TODAS_COMPLETADAS';
    }

    // Avanzar a la siguiente materia
    await this.prisma.estudiante.update({
      where: { id_sm_vc: estudianteId },
      data:  { materia_activa_id_sm_vc: siguienteMateria.id_sm_vc },
    });

    // Log de avance de materia (contexto de la materia recién completada que lo despachó)
    this.eventEmitter_sm_vc.emit('materia.aprobada_sm_vc', {
      estudianteId:     estudianteId,
      materiaId:        materiaId,
      descripcion_sm_vc: `Materia "${materiaNombre}" completada. "${siguienteMateria.nombre_sm_vc}" desbloqueada automáticamente.`,
    });

    const notif2 = await this.prisma.notificacion.create({
      data: {
        emisor_id_sm_vc:   actorId,
        receptor_id_sm_vc: usuarioEstudianteId,
        tipo_sm_vc:        TipoNotificacion.INFORMATIVA,
        titulo_sm_vc:      `${materiaNombre} completada — ${siguienteMateria.nombre_sm_vc} desbloqueada`,
        contenido_sm_vc:   `¡Felicitaciones! Aprobaste todos los requisitos de "${materiaNombre}". Ya puedes comenzar con "${siguienteMateria.nombre_sm_vc}".`,
      },
    });
    this.eventEmitter_sm_vc.emit('notificacion.enviar', { receptorId: usuarioEstudianteId, notificacion: notif2 });

    return siguienteMateria.nombre_sm_vc;
  }

  // ─────────────────────────────────────────────────────────────────
  // Notificar al estudiante sobre el resultado de su entrega
  // ─────────────────────────────────────────────────────────────────
  private async notificarEstudiante_sm_vc(
    emisorId:        number,
    receptorId:      number,
    decision:        EstadoAprobacion,
    requisitoNombre: string,
    materiaNombre:   string,
    observaciones?:  string,
  ) {
    const esAprobado = decision === EstadoAprobacion.APROBADO;

    const tipo = esAprobado ? TipoNotificacion.INFORMATIVA : TipoNotificacion.URGENTE;
    const titulo = esAprobado
      ? `✔ "${requisitoNombre}" aprobado`
      : `✗ "${requisitoNombre}" requiere correcciones`;
    const contenido = esAprobado
      ? `Tu entrega del requisito "${requisitoNombre}" en "${materiaNombre}" fue aprobada.`
      : `Tu entrega del requisito "${requisitoNombre}" fue reprobada.` +
        (observaciones ? ` Observaciones: ${observaciones}` : '');

    const notif = await this.prisma.notificacion.create({
      data: {
        emisor_id_sm_vc:   emisorId,
        receptor_id_sm_vc: receptorId,
        tipo_sm_vc:        tipo,
        titulo_sm_vc:      titulo,
        contenido_sm_vc:   contenido,
      },
    });

    this.eventEmitter_sm_vc.emit('notificacion.enviar', { receptorId, notificacion: notif });
  }

  private generarRespuesta_sm_vc(evaluacion: any, materiaDesbloqueada: string | null) {
    return {
      id_sm_vc:                  evaluacion.id_sm_vc,
      entrega_id_sm_vc:          evaluacion.entrega_id_sm_vc,
      decision_sm_vc:            evaluacion.decision_sm_vc,
      observaciones_sm_vc:       evaluacion.observaciones_sm_vc,
      fecha_evaluacion_sm_vc:    evaluacion.fecha_evaluacion_sm_vc,
      materia_desbloqueada_sm_vc: materiaDesbloqueada,
    };
  }
}