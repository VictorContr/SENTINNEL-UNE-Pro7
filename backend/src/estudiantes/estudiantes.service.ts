import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAprobacion } from '@prisma/client';
import { ConversacionesService } from '../conversaciones/conversaciones.service';

@Injectable()
export class EstudiantesService {
  constructor(
    private readonly prisma: PrismaService,
    // Inyectamos ConversacionesService para reutilizar la lógica
    // de búsqueda por posicion + intento (Arquitectura Opción-B)
    private readonly conversacionesService: ConversacionesService,
  ) {}

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
              id_sm_vc: true,
              nombre_sm_vc: true,
              apellido_sm_vc: true,
              correo_sm_vc: true,
              activo_sm_vc: true,
            },
          },
          materiaActiva: { include: { periodo: true } },
          entregas: {
            include: { requisito: { include: { materia: true } }, evaluacion: true },
          },
        },
        orderBy: { usuario: { apellido_sm_vc: 'asc' } },
      });

      // Obtener todos los periodos únicos de los estudiantes (por ID de FK, no string)
      const periodosIds_sm_vc = [...new Set(estudiantes.map(e => e.materiaActiva.periodo_id_sm_vc))];
      
      const todasLasMaterias_sm_vc = await this.prisma.materia.findMany({
        where: { periodo_id_sm_vc: { in: periodosIds_sm_vc } },
        include: { requisitos: true },
        orderBy: { posicion_sm_vc: 'asc' },
      });

      return estudiantes.map((e) => {
        const materiasDelPeriodo_sm_vc = todasLasMaterias_sm_vc.filter(
          m => m.periodo_id_sm_vc === e.materiaActiva.periodo_id_sm_vc
        );
        return this.mapearEstudianteConProgresoExtendido_sm_vc(e, materiasDelPeriodo_sm_vc);
      });
    } catch (error) {
      console.error('[obtenerMisEstudiantes_sm_vc] Error:', error);
      throw new InternalServerErrorException('Error al obtener los estudiantes.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/estudiantes/:id/detalle
  // Detalle completo de un estudiante: progreso por materia + historial
  // ─────────────────────────────────────────────────────────────────
  async obtenerDetalleEstudiante_sm_vc(estudianteId: number) {
    try {
      // ─── Consulta principal: SIN el include de conversaciones ───────────────
      // La razón: el include antiguo traía un array "conversaciones" pero el
      // mapper accedía a "e.conversacion" (singular) → siempre undefined.
      // La nueva arquitectura (Opción-B) busca por posicion + intento,
      // no por fecha. Sólo ConversacionesService sabe cómo hacerlo correctamente.
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id_sm_vc: estudianteId },
        include: {
          usuario: true,
          materiaActiva: { include: { periodo: true } },
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
          // ✅ FIX: 'conversaciones' eliminado del include.
          // Se consultará separadamente usando posicion_materia y el intento actual.
        },
      });

      if (!estudiante)
        throw new NotFoundException(`Estudiante ${estudianteId} no encontrado.`);

      // ─── FIX: Historial Unificado por Posición (Opción B Pura) ───────────────
      // Se pasa SIEMPRE undefined como materiaId para evitar el punto ciego:
      // el materiaId cambia cada semestre, pero la posicion_sm_vc (1,2,3,4)
      // es la identidad estable de la fase. ConversacionesService activará
      // el Caso A del resolver (param explícito) → camino más eficiente.
      const posicionActiva_sm_vc = estudiante.materiaActiva?.posicion_sm_vc ?? 0;

      const historial_sm_vc = await this.conversacionesService.obtenerMensajes_sm_vc(
        estudianteId,
        undefined,             // materiaId → ignorado deliberadamente (evita punto ciego)
        posicionActiva_sm_vc,  // posicionMateria → identidad estable de la fase
      );

      return this.mapearDetalleEstudiante_sm_vc(estudiante, historial_sm_vc);
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
        include: { materiaActiva: { include: { periodo: true } } },
      });
      if (!estudiante)
        throw new NotFoundException(`Estudiante ${estudianteId} no encontrado.`);

      // Obtener todas las materias del período activo usando FK real (ID del período)
      const materias = await this.prisma.materia.findMany({
        where: { periodo_id_sm_vc: estudiante.materiaActiva.periodo_id_sm_vc },
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
          // Exponemos el ID del período (FK real) en lugar del string eliminado
          periodo_id_sm_vc:            materia.periodo_id_sm_vc,
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

  private mapearEstudianteConProgresoExtendido_sm_vc(e: any, materiasDelPeriodo_sm_vc: any[]) {
    const posicionActiva_sm_vc = e.materiaActiva?.posicion_sm_vc ?? 0;

    const materias_sm_vc = materiasDelPeriodo_sm_vc.map((materia) => {
      const reqsMateria_sm_vc = materia.requisitos || [];
      const totalRequisitos_sm_vc = reqsMateria_sm_vc.length;

      let aprobados_sm_vc = 0;
      let progreso_decimal_sm_vc = 0;
      let estado_sm_vc: EstadoAprobacion = EstadoAprobacion.PENDIENTE;
      let bloqueada_sm_vc = false;

      // REGLA DE SOBRESCRITURA HISTÓRICA
      if (materia.posicion_sm_vc < posicionActiva_sm_vc) {
        // Fase Pasada: Forzar 100% y Desbloqueada
        aprobados_sm_vc = totalRequisitos_sm_vc;
        progreso_decimal_sm_vc = 1;
        estado_sm_vc = EstadoAprobacion.APROBADO;
        bloqueada_sm_vc = false;
      } else if (materia.posicion_sm_vc === posicionActiva_sm_vc) {
        // Fase Actual: Conteo riguroso desde Prisma
        const entregasMateria_sm_vc = e.entregas.filter((ent: any) =>
          ent.requisito.materia_id_sm_vc === materia.id_sm_vc
        );
        aprobados_sm_vc = entregasMateria_sm_vc.filter(
          (ent: any) => ent.estado_sm_vc === EstadoAprobacion.APROBADO,
        ).length;
        bloqueada_sm_vc = false;
        progreso_decimal_sm_vc = totalRequisitos_sm_vc > 0
          ? parseFloat((aprobados_sm_vc / totalRequisitos_sm_vc).toFixed(2))
          : 0;
        estado_sm_vc = this.calcularEstadoMateria_sm_vc(
          entregasMateria_sm_vc,
          aprobados_sm_vc,
          totalRequisitos_sm_vc,
          bloqueada_sm_vc,
        );
      } else {
        // Fase Futura: Valores 0, Pendiente y Bloqueada
        aprobados_sm_vc = 0;
        progreso_decimal_sm_vc = 0;
        estado_sm_vc = EstadoAprobacion.PENDIENTE;
        bloqueada_sm_vc = true;
      }

      return {
        materia_id_sm_vc: materia.id_sm_vc,
        nombre_sm_vc: materia.nombre_sm_vc,
        posicion_sm_vc: materia.posicion_sm_vc,
        bloqueada_sm_vc,
        total_requisitos_sm_vc: totalRequisitos_sm_vc,
        aprobados_sm_vc,
        progreso_decimal_sm_vc,
        estado_sm_vc,
      };
    });

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
      materia_activa_id_sm_vc: e.materia_activa_id_sm_vc,
      // Exponemos el ID del período (FK real) en lugar del string eliminado
      periodo_id_sm_vc:        e.materiaActiva.periodo_id_sm_vc,
      materias_sm_vc,
    };
  }

  // ─── FIX: El mapper ahora recibe el historial ya resuelto por ConversacionesService ───
  // Se elimina la dependencia de "e.conversacion" (que siempre era undefined
  // porque Prisma devuelve "conversaciones" — plural).
  private mapearDetalleEstudiante_sm_vc(e: any, historial_sm_vc?: any) {
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
      // ✅ FIX: Ahora tomamos los mensajes del historial resuelto (objeto ya mapeado),
      // NO del include incorrecto de Prisma. "mensajes_sm_vc" viene de obtenerMensajes_sm_vc.
      conversacion_sm_vc: {
        id_sm_vc:               historial_sm_vc?.id_sm_vc ?? null,
        ultimos_mensajes_sm_vc: historial_sm_vc?.mensajes_sm_vc ?? [],
      },
    };
  }
}