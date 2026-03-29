import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAprobacion } from '@prisma/client';

@Injectable()
export class EstudiantesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // GET /api/estudiantes
  // Devuelve los estudiantes asignados al profesor solicitante,
  // incluyendo el estado actual de su materia activa.
  // ─────────────────────────────────────────────────────────────────
  async obtenerMisEstudiantes_sm_vc(profesorId: number) {
    try {
      const estudiantes = await this.prisma.estudiante.findMany({
        where: { profesor_id_sm_vc: profesorId },
        include: {
          usuario: {
            select: {
              id_sm_vc:    true,
              nombre_sm_vc:   true,
              apellido_sm_vc: true,
              correo_sm_vc:   true,
              activo_sm_vc:   true,
            },
          },
          materiaActiva: {
            include: {
              requisitos: { orderBy: { posicion_sm_vc: 'asc' } },
            },
          },
          entregas: {
            include: { requisito: true, evaluacion: true },
          },
        },
        orderBy: { usuario: { apellido_sm_vc: 'asc' } },
      });

      return estudiantes.map((e) =>
        this.mapearEstudianteConProgreso_sm_vc(e),
      );
    } catch {
      throw new InternalServerErrorException('Error al obtener los estudiantes.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/estudiantes/:id/detalle
  // Detalle completo de un estudiante: progreso por materia + historial
  // ─────────────────────────────────────────────────────────────────
  async obtenerDetalleEstudiante_sm_vc(estudianteId: number) {
    try {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id_sm_vc: estudianteId },
        include: {
          usuario: true,
          materiaActiva: true,
          profesorTutor: {
            select: { nombre_sm_vc: true, apellido_sm_vc: true, correo_sm_vc: true },
          },
          entregas: {
            include: {
              requisito:  { include: { materia: true } },
              documentos: { orderBy: { fecha_subida_sm_vc: 'desc' } },
              evaluacion: { include: { profesor: { select: { nombre_sm_vc: true, apellido_sm_vc: true } } } },
            },
            orderBy: { fecha_actualizacion_sm_vc: 'desc' },
          },
          proyectoDeploy: {
            include: {
              archivoCodigo:        true,
              documentacionTecnica: true,
            },
          },
          conversacion: {
            include: { mensajes: { take: 5, orderBy: { fecha_creacion_sm_vc: 'desc' } } }
          }
        },
      });

      if (!estudiante)
        throw new NotFoundException(`Estudiante ${estudianteId} no encontrado.`);

      return this.mapearDetalleEstudiante_sm_vc(estudiante);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al obtener el detalle.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/estudiantes/:id/progreso-materias
  // Progreso consolidado por materia para el stepper visual del frontend
  // ─────────────────────────────────────────────────────────────────
  async obtenerProgresoMaterias_sm_vc(estudianteId: number) {
    try {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id_sm_vc: estudianteId },
        include: { materiaActiva: true },
      });
      if (!estudiante)
        throw new NotFoundException(`Estudiante ${estudianteId} no encontrado.`);

      // Obtener todas las materias del periodo activo
      const materias = await this.prisma.materia.findMany({
        where: { periodo_sm_vc: estudiante.materiaActiva.periodo_sm_vc },
        include: { requisitos: { orderBy: { posicion_sm_vc: 'asc' } } },
        orderBy: { posicion_sm_vc: 'asc' },
      });

      // Obtener todas las entregas del estudiante
      const entregas = await this.prisma.entrega.findMany({
        where: { estudiante_id_sm_vc: estudianteId },
        include: { evaluacion: true },
      });

      return materias.map((materia) => {
        const reqsMateria      = materia.requisitos;
        const entregasMateria  = entregas.filter((e) =>
          reqsMateria.some((r) => r.id_sm_vc === e.requisito_id_sm_vc),
        );
        const aprobados = entregasMateria.filter(
          (e) => e.estado_sm_vc === EstadoAprobacion.APROBADO,
        ).length;
        const bloqueada = materia.posicion_sm_vc > estudiante.materiaActiva.posicion_sm_vc;

        return {
          id_sm_vc:                    materia.id_sm_vc,
          nombre_sm_vc:                materia.nombre_sm_vc,
          descripcion_sm_vc:           materia.descripcion_sm_vc,
          posicion_sm_vc:              materia.posicion_sm_vc,
          periodo_sm_vc:               materia.periodo_sm_vc,
          bloqueada_sm_vc:             bloqueada,
          es_activa_sm_vc:             materia.id_sm_vc === estudiante.materia_activa_id_sm_vc,
          total_requisitos_sm_vc:      reqsMateria.length,
          requisitos_aprobados_sm_vc:  aprobados,
          progreso_decimal_sm_vc:      reqsMateria.length > 0
            ? parseFloat((aprobados / reqsMateria.length).toFixed(2))
            : 0,
          estado_sm_vc: this.calcularEstadoMateria_sm_vc(
            entregasMateria,
            aprobados,
            reqsMateria.length,
            bloqueada,
          ),
          requisitos: reqsMateria.map((req) => {
            const entrega = entregasMateria.find(
              (e) => e.requisito_id_sm_vc === req.id_sm_vc,
            );
            return {
              id_sm_vc:          req.id_sm_vc,
              nombre_sm_vc:      req.nombre_sm_vc,
              descripcion_sm_vc: req.descripcion_sm_vc,
              posicion_sm_vc:    req.posicion_sm_vc,
              estado_sm_vc:      entrega?.estado_sm_vc ?? EstadoAprobacion.PENDIENTE,
              entrega_id_sm_vc:  entrega?.id_sm_vc ?? null,
            };
          }),
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al obtener el progreso.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers privados
  // ─────────────────────────────────────────────────────────────────
  private calcularEstadoMateria_sm_vc(
    entregas: any[],
    aprobados: number,
    total: number,
    bloqueada: boolean,
  ): EstadoAprobacion {
    if (bloqueada) return EstadoAprobacion.PENDIENTE;
    if (aprobados === total && total > 0) return EstadoAprobacion.APROBADO;
    if (entregas.some((e) => e.estado_sm_vc === EstadoAprobacion.REPROBADO))
      return EstadoAprobacion.REPROBADO;
    if (entregas.some((e) => e.estado_sm_vc === EstadoAprobacion.ENTREGADO))
      return EstadoAprobacion.ENTREGADO;
    return EstadoAprobacion.PENDIENTE;
  }

  private mapearEstudianteConProgreso_sm_vc(e: any) {
    const reqsActivos = e.materiaActiva.requisitos;
    const entregasActivas = e.entregas.filter((ent: any) =>
      reqsActivos.some((r: any) => r.id_sm_vc === ent.requisito_id_sm_vc),
    );
    const aprobados = entregasActivas.filter(
      (ent: any) => ent.estado_sm_vc === EstadoAprobacion.APROBADO,
    ).length;

    return {
      id_sm_vc:                e.id_sm_vc,
      usuario_id_sm_vc:        e.usuario_id_sm_vc,
      nombre_sm_vc:            e.usuario.nombre_sm_vc,
      apellido_sm_vc:          e.usuario.apellido_sm_vc,
      correo_sm_vc:            e.usuario.correo_sm_vc,
      activo_sm_vc:            e.usuario.activo_sm_vc,
      empresa_sm_vc:           e.empresa_sm_vc,
      titulo_proyecto_sm_vc:   e.titulo_proyecto_sm_vc,
      tutor_empresarial_sm_vc: e.tutor_empresarial_sm_vc,
      materia_activa_sm_vc: {
        id_sm_vc:               e.materiaActiva.id_sm_vc,
        nombre_sm_vc:           e.materiaActiva.nombre_sm_vc,
        posicion_sm_vc:         e.materiaActiva.posicion_sm_vc,
        total_requisitos_sm_vc: reqsActivos.length,
        aprobados_sm_vc:        aprobados,
        progreso_decimal_sm_vc: reqsActivos.length > 0
          ? parseFloat((aprobados / reqsActivos.length).toFixed(2))
          : 0,
        estado_sm_vc: this.calcularEstadoMateria_sm_vc(
          entregasActivas,
          aprobados,
          reqsActivos.length,
          false,
        ),
      },
    };
  }

  private mapearDetalleEstudiante_sm_vc(e: any) {
    return {
      id_sm_vc:                e.id_sm_vc,
      usuario:                 e.usuario,
      empresa_sm_vc:           e.empresa_sm_vc,
      tutor_empresarial_sm_vc: e.tutor_empresarial_sm_vc,
      titulo_proyecto_sm_vc:   e.titulo_proyecto_sm_vc,
      profesor_tutor:          e.profesorTutor,
      materia_activa:          e.materiaActiva,
      entregas:                e.entregas,
      proyecto_deploy:         e.proyectoDeploy,
      conversacion_sm_vc: {
        id_sm_vc: e.conversacion?.id_sm_vc,
        ultimos_mensajes_sm_vc: e.conversacion?.mensajes ?? [],
      },
    };
  }
}