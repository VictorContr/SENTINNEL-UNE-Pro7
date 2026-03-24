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
  async validarProgresoEstudiante_sm_vc(estudianteId: number, materiaId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id_sm_vc: estudianteId },
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
        estudiante_id_sm_vc: estudianteId,
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
  async crearEntrega_sm_vc(estudianteId: number, requisitoId: number) {
    const requisito = await this.prisma.requisito.findUnique({
      where: { id_sm_vc: requisitoId },
      include: { materia: true }
    });

    if (!requisito) {
      throw new NotFoundException('Requisito no encontrado');
    }

    // Validar que el estudiante pueda avanzar a esta materia
    await this.validarProgresoEstudiante_sm_vc(estudianteId, requisito.materia.id_sm_vc);

    // Crear la entrega
    return this.prisma.entrega.create({
      data: {
        estudiante_id_sm_vc: estudianteId,
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
  async getProgresoEstudiante_sm_vc(estudianteId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id_sm_vc: estudianteId },
      include: {
        materiaActiva: {
          include: {
            requisitos: {
              include: {
                entregas: {
                  where: { estudiante_id_sm_vc: estudianteId },
                  include: { evaluacion: true }
                }
              }
            }
          }
        }
      }
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }
}
