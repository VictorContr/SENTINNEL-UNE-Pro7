import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAprobacion, RolUsuario, TipoNotificacion } from '@prisma/client';
<<<<<<< HEAD
=======
import { EventEmitter2 } from '@nestjs/event-emitter';
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';

@Injectable()
export class EvaluacionesService {
<<<<<<< HEAD
  constructor(private readonly prisma: PrismaService) {}
=======
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2,
  ) {}
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a

  // ─────────────────────────────────────────────────────────────────
  // POST /api/evaluaciones
  // Evalúa una entrega (APROBADO | REPROBADO).
  // Si se aprueba y todos los requisitos de la materia quedan
  // APROBADOS → desbloquea automáticamente la siguiente materia.
  // ─────────────────────────────────────────────────────────────────
  async evaluarEntrega_sm_vc(dto: CrearEvaluacionDto, profesorId: number) {
    try {
      // 1. Cargar la entrega con su contexto completo
      const entrega = await this.prisma.entrega.findUnique({
        where: { id_sm_vc: dto.entrega_id_sm_vc },
        include: {
          estudiante: { include: { usuario: true, materiaActiva: true } },
          requisito:  { include: { materia: true } },
          evaluacion: true,
        },
      });

      if (!entrega) {
        throw new NotFoundException(
          `Entrega ${dto.entrega_id_sm_vc} no encontrada.`,
        );
      }

      // 2. Solo se puede evaluar lo que fue entregado
      if (entrega.estado_sm_vc === EstadoAprobacion.PENDIENTE) {
        throw new BadRequestException(
          'No se puede evaluar una entrega en estado PENDIENTE.',
        );
      }

      // 3. No re-evaluar lo ya aprobado
      if (entrega.estado_sm_vc === EstadoAprobacion.APROBADO) {
        throw new ForbiddenException(
          'Esta entrega ya fue aprobada y no puede ser re-evaluada.',
        );
      }

      // 4. Upsert de la evaluación (crea o actualiza)
      const evaluacion = await this.prisma.evaluacion.upsert({
        where: { entrega_id_sm_vc: dto.entrega_id_sm_vc },
        create: {
          entrega_id_sm_vc:    dto.entrega_id_sm_vc,
          profesor_id_sm_vc:   profesorId,
          decision_sm_vc:      dto.decision_sm_vc,
          observaciones_sm_vc: dto.observaciones_sm_vc ?? null,
        },
        update: {
          profesor_id_sm_vc:   profesorId,
          decision_sm_vc:      dto.decision_sm_vc,
          observaciones_sm_vc: dto.observaciones_sm_vc ?? null,
          fecha_evaluacion_sm_vc: new Date(),
        },
      });

      // 5. Actualizar el estado de la entrega
      await this.prisma.entrega.update({
        where: { id_sm_vc: dto.entrega_id_sm_vc },
        data:  { estado_sm_vc: dto.decision_sm_vc },
      });

      const estudianteId   = entrega.estudiante.id_sm_vc;
      const materiaId      = entrega.requisito.materia_id_sm_vc;
      const materiaNombre  = entrega.requisito.materia.nombre_sm_vc;
      const requisitoNombre = entrega.requisito.nombre_sm_vc;

<<<<<<< HEAD
      // 6. Registrar en historial
      await this.prisma.historialTrazabilidad.create({
        data: {
          estudiante_id_sm_vc: estudianteId,
          actor_id_sm_vc:      profesorId,
          accion_sm_vc:        dto.decision_sm_vc === EstadoAprobacion.APROBADO
            ? 'REQUISITO_APROBADO'
            : 'REQUISITO_REPROBADO',
          detalles_sm_vc: `Profesor evaluó "${requisitoNombre}" como ${dto.decision_sm_vc}.` +
            (dto.observaciones_sm_vc ? ` Observaciones: ${dto.observaciones_sm_vc}` : ''),
        },
=======
      // 6. Emitir evento de trazabilidad (reemplaza historial anterior)
      this.eventEmitter_sm_vc.emit('materia.aprobada_sm_vc', {
        estudianteId: estudianteId,
        descripcion_sm_vc: `Requisito "${requisitoNombre}" evaluado como ${dto.decision_sm_vc}.` +
          (dto.observaciones_sm_vc ? ` Obs: ${dto.observaciones_sm_vc}` : ''),
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
      });

      // 7. Notificar al estudiante sobre el resultado
      await this.notificarEstudiante_sm_vc(
        profesorId,
        entrega.estudiante.usuario_id_sm_vc,
        dto.decision_sm_vc,
        requisitoNombre,
        materiaNombre,
        dto.observaciones_sm_vc,
      );

      // 8. Lógica crítica: verificar si todos los requisitos de la
      //    materia están aprobados para desbloquear la siguiente
      let materiaDesbloqueada: string | null = null;
      if (dto.decision_sm_vc === EstadoAprobacion.APROBADO) {
        materiaDesbloqueada = await this.verificarYDesbloquearMateria_sm_vc(
          estudianteId,
          materiaId,
          entrega.requisito.materia.posicion_sm_vc,
          entrega.requisito.materia.periodo_sm_vc,
          materiaNombre,
          entrega.estudiante.usuario_id_sm_vc,
          profesorId,
        );
      }

      return this.generarRespuesta_sm_vc(evaluacion, materiaDesbloqueada);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) throw error;
      throw new InternalServerErrorException('Error al registrar la evaluación.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/evaluaciones/entrega/:entregaId
  // ─────────────────────────────────────────────────────────────────
  async obtenerEvaluacionDeEntrega_sm_vc(entregaId: number) {
    const evaluacion = await this.prisma.evaluacion.findUnique({
      where: { entrega_id_sm_vc: entregaId },
      include: { profesor: { select: { nombre_sm_vc: true, apellido_sm_vc: true } } },
    });
    if (!evaluacion)
      throw new NotFoundException(`No hay evaluación para la entrega ${entregaId}.`);
    return evaluacion;
  }

  // ─────────────────────────────────────────────────────────────────
  // LÓGICA CRÍTICA: Verificar si la materia quedó completa
  // Si todos los requisitos están APROBADOS →
  //   1. Actualiza materia_activa_id del estudiante
  //   2. Crea notificación de desbloqueo
  //   3. Registra en historial
  // ─────────────────────────────────────────────────────────────────
  private async verificarYDesbloquearMateria_sm_vc(
    estudianteId: number,
    materiaId: number,
    materiaPos: number,
    materiaPeriodo: string,
    materiaNombre: string,
    usuarioEstudianteId: number,
    actorId: number,
  ): Promise<string | null> {
    // Obtener todos los requisitos de esta materia
    const requisitos = await this.prisma.requisito.findMany({
      where: { materia_id_sm_vc: materiaId },
    });

    // Obtener todas las entregas del estudiante en esta materia
    const entregas = await this.prisma.entrega.findMany({
      where: {
        estudiante_id_sm_vc: estudianteId,
        requisito: { materia_id_sm_vc: materiaId },
      },
      include: { requisito: true },
    });

    // Verificar cobertura total: cada requisito tiene entrega APROBADA
    const todasAprobadas = requisitos.every((req) => {
      const entrega = entregas.find((e) => e.requisito_id_sm_vc === req.id_sm_vc);
      return entrega?.estado_sm_vc === EstadoAprobacion.APROBADO;
    });

    if (!todasAprobadas) return null;

    // Buscar la siguiente materia (posicion + 1, mismo periodo)
    const siguienteMateria = await this.prisma.materia.findFirst({
      where: {
        posicion_sm_vc: materiaPos + 1,
        periodo_sm_vc:  materiaPeriodo,
      },
    });

    if (!siguienteMateria) {
      // El estudiante completó la última materia
<<<<<<< HEAD
      await this.prisma.historialTrazabilidad.create({
        data: {
          estudiante_id_sm_vc: estudianteId,
          actor_id_sm_vc:      actorId,
          accion_sm_vc:        'TODAS_MATERIAS_COMPLETADAS',
          detalles_sm_vc:      `El estudiante completó todas las materias del periodo ${materiaPeriodo}. Deploy habilitado.`,
        },
=======
      await this.prisma.estudiante.update({
        where: { id_sm_vc: estudianteId },
        data:  { puede_hacer_deploy_sm_vc: true },
      });

      this.eventEmitter_sm_vc.emit('materia.aprobada_sm_vc', {
        estudianteId: estudianteId,
        descripcion_sm_vc: `¡Proceso completado! Todas las materias aprobadas. Deploy habilitado.`,
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
      });
      await this.prisma.notificacion.create({
        data: {
          emisor_id_sm_vc:   actorId,
          receptor_id_sm_vc: usuarioEstudianteId,
          tipo_sm_vc:        TipoNotificacion.IMPORTANTE,
          titulo_sm_vc:      '¡Proceso completado! Deploy habilitado',
          contenido_sm_vc:   `Has aprobado todas las materias. El módulo de Deploy del Proyecto Final está desbloqueado.`,
        },
      });
      return 'TODAS_COMPLETADAS';
    }

    // Actualizar la materia activa del estudiante
    await this.prisma.estudiante.update({
      where: { id_sm_vc: estudianteId },
      data:  { materia_activa_id_sm_vc: siguienteMateria.id_sm_vc },
    });

<<<<<<< HEAD
    // Registrar en historial
    await this.prisma.historialTrazabilidad.create({
      data: {
        estudiante_id_sm_vc: estudianteId,
        actor_id_sm_vc:      actorId,
        accion_sm_vc:        'MATERIA_COMPLETADA',
        detalles_sm_vc:      `"${materiaNombre}" completada. "${siguienteMateria.nombre_sm_vc}" desbloqueada automáticamente.`,
      },
=======
    // Emitir evento de avance de materia
    this.eventEmitter_sm_vc.emit('materia.aprobada_sm_vc', {
      estudianteId: estudianteId,
      descripcion_sm_vc: `Materia "${materiaNombre}" completada. "${siguienteMateria.nombre_sm_vc}" desbloqueada automáticamente.`,
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
    });

    // Notificar al estudiante
    await this.prisma.notificacion.create({
      data: {
        emisor_id_sm_vc:   actorId,
        receptor_id_sm_vc: usuarioEstudianteId,
        tipo_sm_vc:        TipoNotificacion.INFORMATIVA,
        titulo_sm_vc:      `${materiaNombre} completada — ${siguienteMateria.nombre_sm_vc} desbloqueada`,
        contenido_sm_vc:   `¡Felicitaciones! Aprobaste todos los requisitos de "${materiaNombre}". ` +
          `Ya puedes comenzar con "${siguienteMateria.nombre_sm_vc}".`,
      },
    });

    return siguienteMateria.nombre_sm_vc;
  }

  // ─────────────────────────────────────────────────────────────────
  // Notificar al estudiante sobre el resultado de su entrega
  // ─────────────────────────────────────────────────────────────────
  private async notificarEstudiante_sm_vc(
    emisorId: number,
    receptorId: number,
    decision: EstadoAprobacion,
    requisitoNombre: string,
    materiaNombre: string,
    observaciones?: string,
  ) {
    const esAprobado = decision === EstadoAprobacion.APROBADO;
    await this.prisma.notificacion.create({
      data: {
        emisor_id_sm_vc:   emisorId,
        receptor_id_sm_vc: receptorId,
        tipo_sm_vc:        esAprobado ? TipoNotificacion.INFORMATIVA : TipoNotificacion.URGENTE,
        titulo_sm_vc:      esAprobado
          ? `✔ "${requisitoNombre}" aprobado`
          : `✗ "${requisitoNombre}" requiere correcciones`,
        contenido_sm_vc: esAprobado
          ? `Tu entrega del requisito "${requisitoNombre}" en "${materiaNombre}" fue aprobada.`
          : `Tu entrega del requisito "${requisitoNombre}" fue reprobada.` +
            (observaciones ? ` Observaciones: ${observaciones}` : ''),
      },
    });
  }

  private generarRespuesta_sm_vc(evaluacion: any, materiaDesbloqueada: string | null) {
    return {
      id_sm_vc:               evaluacion.id_sm_vc,
      entrega_id_sm_vc:       evaluacion.entrega_id_sm_vc,
      decision_sm_vc:         evaluacion.decision_sm_vc,
      observaciones_sm_vc:    evaluacion.observaciones_sm_vc,
      fecha_evaluacion_sm_vc: evaluacion.fecha_evaluacion_sm_vc,
      materia_desbloqueada_sm_vc: materiaDesbloqueada,
    };
  }
}