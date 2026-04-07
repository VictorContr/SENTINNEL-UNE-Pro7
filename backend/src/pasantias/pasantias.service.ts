import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAprobacion } from '@prisma/client';

@Injectable()
export class PasantiasService_sm_vc {
  constructor(private readonly prisma: PrismaService) {}

  async getMaterias_sm_vc() {
    return this.prisma.materia.findMany({
      include: { 
        requisitos: { 
          orderBy: { posicion_sm_vc: 'asc' } 
        } 
      },
      orderBy: { posicion_sm_vc: 'asc' },
    });
  }

  /**
   * Validación Step-by-Step: Un estudiante solo puede avanzar si la materia anterior está aprobada
   */
  async validarProgresoEstudiante_sm_vc(usuarioId: number, materiaId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { usuario_id_sm_vc: usuarioId },
      include: { materiaActiva: true }
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const materiaActual = await this.prisma.materia.findUnique({
      where: { id_sm_vc: materiaId },
      include: { requisitos: true }
    });

    if (!materiaActual) {
      throw new NotFoundException('Materia no encontrada');
    }

    // Si es la primera materia (posición 1), permitir comenzar directamente
    if (materiaActual.posicion_sm_vc === 1) {
      return true;
    }

    // Buscar la materia anterior
    const materiaAnterior = await this.prisma.materia.findFirst({
      where: { 
        posicion_sm_vc: materiaActual.posicion_sm_vc - 1,
        periodo_sm_vc: materiaActual.periodo_sm_vc 
      }
    });

    if (!materiaAnterior) {
      throw new NotFoundException('No se encuentra la materia anterior');
    }

    // Verificar si el estudiante aprobó todos los requisitos de la materia anterior
    const entregasAnteriores = await this.prisma.entrega.findMany({
      where: {
        estudiante_id_sm_vc: estudiante.id_sm_vc,
        requisito: {
          materia_id_sm_vc: materiaAnterior.id_sm_vc
        }
      },
      include: {
        evaluacion: true
      }
    });

    const todosAprobados = entregasAnteriores.every(entrega => 
      entrega.evaluacion?.decision_sm_vc === EstadoAprobacion.APROBADO
    );

    if (!todosAprobados) {
      throw new ForbiddenException(
        `No puedes avanzar a ${materiaActual.nombre_sm_vc} hasta aprobar todos los requisitos de ${materiaAnterior.nombre_sm_vc}`
      );
    }

    return true;
  }

  /**
   * Crear una entrega solo si el estudiante tiene permiso
   */
  async crearEntrega_sm_vc(usuarioId: number, requisitoId: number) {
    const requisito = await this.prisma.requisito.findUnique({
      where: { id_sm_vc: requisitoId },
      include: { materia: true }
    });

    if (!requisito) {
      throw new NotFoundException('Requisito no encontrado');
    }

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { usuario_id_sm_vc: usuarioId },
      select: { id_sm_vc: true }
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Validar que el estudiante pueda avanzar a esta materia
    await this.validarProgresoEstudiante_sm_vc(usuarioId, requisito.materia.id_sm_vc);

    // Crear la entrega
    return this.prisma.entrega.create({
      data: {
        estudiante_id_sm_vc: estudiante.id_sm_vc,
        requisito_id_sm_vc: requisitoId,
        estado_sm_vc: EstadoAprobacion.PENDIENTE
      },
      include: {
        estudiante: true,
        requisito: {
          include: { materia: true }
        }
      }
    });
  }

  /**
   * Obtener el progreso actual de un estudiante
   */
  async getProgresoEstudiante_sm_vc(usuarioId: number) {
    const estudianteBase = await this.prisma.estudiante.findUnique({
      where: { usuario_id_sm_vc: usuarioId },
      include: { materiaActiva: true }
    });

    if (!estudianteBase) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    const materias = await this.prisma.materia.findMany({
      include: { requisitos: true },
      orderBy: { posicion_sm_vc: 'asc' }
    });

    const entregas = await this.prisma.entrega.findMany({
      where: { estudiante_id_sm_vc: estudianteBase.id_sm_vc },
      include: { documentos: true, evaluacion: true }
    });

    const resultado = materias.map(materia => {
      const requisitosMateria = materia.requisitos;
      const totalRequisitos = requisitosMateria.length;
      
      const entregasMateria = entregas.filter(e => 
        requisitosMateria.some(req => req.id_sm_vc === e.requisito_id_sm_vc)
      );

      const aprobados = entregasMateria.filter(e => e.estado_sm_vc === EstadoAprobacion.APROBADO).length;

      let progresoDecimal = totalRequisitos > 0 ? aprobados / totalRequisitos : 0;
      let estadoAprobacion: EstadoAprobacion = EstadoAprobacion.PENDIENTE;
      let bloqueada = materia.posicion_sm_vc > estudianteBase.materiaActiva.posicion_sm_vc;

      if (materia.posicion_sm_vc < estudianteBase.materiaActiva.posicion_sm_vc) {
        estadoAprobacion = EstadoAprobacion.APROBADO;
        progresoDecimal = 1.0;
      } else if (materia.posicion_sm_vc === estudianteBase.materiaActiva.posicion_sm_vc) {
        if (aprobados === totalRequisitos && totalRequisitos > 0) {
          estadoAprobacion = EstadoAprobacion.APROBADO;
        } else if (entregasMateria.some(e => e.estado_sm_vc === EstadoAprobacion.REPROBADO)) {
          estadoAprobacion = EstadoAprobacion.REPROBADO;
        } else if (entregasMateria.some(e => e.estado_sm_vc === EstadoAprobacion.ENTREGADO || e.estado_sm_vc === EstadoAprobacion.PENDIENTE)) {
          // Hay algo nuevo entregado o pendiente de revisión
          estadoAprobacion = EstadoAprobacion.ENTREGADO;
        } else {
          estadoAprobacion = EstadoAprobacion.PENDIENTE;
        }
      }

      return {
        id_sm_vc: materia.id_sm_vc,
        nombre_sm_vc: materia.nombre_sm_vc,
        orden_sm_int: materia.posicion_sm_vc,
        posicion_sm_vc: materia.posicion_sm_vc,
        periodo_sm_vc: materia.periodo_sm_vc,
        estado_aprobacion_sm_vc: estadoAprobacion,
        progreso_decimal: progresoDecimal,
        requisitos_aprobados_sm_int: aprobados,
        total_requisitos_sm_int: totalRequisitos,
        bloqueada: bloqueada,
        requisitos: requisitosMateria,
        nota_sm_dec: null, // TODO: Implementar cuando existan notas reales
        intentos_sm_int: 0,
        conversacion_count_sm_int: entregasMateria.length,
        progreso: {
          requisitos_aprobados_detalle_sm_vc: entregasMateria
            .filter(e => e.estado_sm_vc === EstadoAprobacion.APROBADO)
            .map(e => ({ requisito_id_sm_vc: e.requisito_id_sm_vc })),
          entregas_detalle_sm_vc: entregasMateria.map(e => ({
            entrega_id_sm_vc: e.id_sm_vc,
            requisito_id_sm_vc: e.requisito_id_sm_vc,
            estado_sm_vc: e.estado_sm_vc,
            fecha_actualizacion_sm_vc: e.fecha_actualizacion_sm_vc,
            documentos_sm_vc: e.documentos
          }))
        }
      };
    });

    return resultado;
  }
}
