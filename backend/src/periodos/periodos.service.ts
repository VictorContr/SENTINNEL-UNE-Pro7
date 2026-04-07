import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePeriodoDto_sm_vc } from './dto/create-periodo.dto';
import { UpdatePeriodoDto_sm_vc } from './dto/update-periodo.dto';

@Injectable()
export class PeriodosAcademicosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll_sm_vc() {
    return this.prisma.periodoAcademico.findMany({
      orderBy: { fecha_inicio_sm_vc: 'desc' },
    });
  }

  async findActivo_sm_vc() {
    const periodoActivo = await this.prisma.periodoAcademico.findFirst({
      where: { estado_activo_sm_vc: true },
    });

    if (!periodoActivo) {
      throw new NotFoundException('No hay un período académico activo');
    }

    return periodoActivo;
  }

  async findOne_sm_vc(id: number) {
    const periodo = await this.prisma.periodoAcademico.findUnique({
      where: { id_sm_vc: id },
    });

    if (!periodo) {
      throw new NotFoundException(`Período académico ${id} no encontrado`);
    }

    return periodo;
  }

  async create_sm_vc(createPeriodoDto: CreatePeriodoDto_sm_vc) {
    // Validar que no exista un período con el mismo nombre
    const periodoExistente = await this.prisma.periodoAcademico.findFirst({
      where: { nombre_sm_vc: createPeriodoDto.nombre_sm_vc },
    });

    if (periodoExistente) {
      throw new BadRequestException(`Ya existe un período con el nombre "${createPeriodoDto.nombre_sm_vc}"`);
    }

    // Validar que las fechas sean válidas
    const fechaInicio = new Date(createPeriodoDto.fecha_inicio_sm_vc);
    const fechaFin = new Date(createPeriodoDto.fecha_fin_sm_vc);

    if (fechaInicio >= fechaFin) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    return this.prisma.periodoAcademico.create({
      data: {
        nombre_sm_vc: createPeriodoDto.nombre_sm_vc,
        fecha_inicio_sm_vc: fechaInicio,
        fecha_fin_sm_vc: fechaFin,
        estado_activo_sm_vc: false, // Por defecto, los nuevos períodos no están activos
      },
    });
  }

  async update_sm_vc(id: number, updatePeriodoDto: UpdatePeriodoDto_sm_vc) {
    const periodo = await this.findOne_sm_vc(id);

    // Validar que no exista otro período con el mismo nombre (si se está actualizando el nombre)
    if (updatePeriodoDto.nombre_sm_vc) {
      const periodoExistente = await this.prisma.periodoAcademico.findFirst({
        where: {
          nombre_sm_vc: updatePeriodoDto.nombre_sm_vc,
          id_sm_vc: { not: id }, // Excluir el período actual
        },
      });

      if (periodoExistente) {
        throw new BadRequestException(`Ya existe otro período con el nombre "${updatePeriodoDto.nombre_sm_vc}"`);
      }
    }

    // Validar fechas si se están actualizando
    if (updatePeriodoDto.fecha_inicio_sm_vc && updatePeriodoDto.fecha_fin_sm_vc) {
      const fechaInicio = new Date(updatePeriodoDto.fecha_inicio_sm_vc);
      const fechaFin = new Date(updatePeriodoDto.fecha_fin_sm_vc);

      if (fechaInicio >= fechaFin) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    return this.prisma.periodoAcademico.update({
      where: { id_sm_vc: id },
      data: {
        ...(updatePeriodoDto.nombre_sm_vc && { nombre_sm_vc: updatePeriodoDto.nombre_sm_vc }),
        ...(updatePeriodoDto.fecha_inicio_sm_vc && { fecha_inicio_sm_vc: new Date(updatePeriodoDto.fecha_inicio_sm_vc) }),
        ...(updatePeriodoDto.fecha_fin_sm_vc && { fecha_fin_sm_vc: new Date(updatePeriodoDto.fecha_fin_sm_vc) }),
        ...(updatePeriodoDto.estado_activo_sm_vc !== undefined && { estado_activo_sm_vc: updatePeriodoDto.estado_activo_sm_vc }),
        ...(updatePeriodoDto.descripcion_sm_vc && { descripcion_sm_vc: updatePeriodoDto.descripcion_sm_vc }),
      },
    });
  }

  async activar_sm_vc(id: number) {
    // Desactivar todos los períodos primero
    await this.prisma.periodoAcademico.updateMany({
      where: { estado_activo_sm_vc: true },
      data: { estado_activo_sm_vc: false },
    });

    // Activar el período solicitado
    const periodo = await this.findOne_sm_vc(id);
    
    // Actualizar configuración del sistema con el nuevo período activo
    await this.prisma.configuracionSistema.update({
      where: { id_sm_vc: 1 },
      data: { periodo_actual_sm_vc: periodo.nombre_sm_vc },
    });

    return this.prisma.periodoAcademico.update({
      where: { id_sm_vc: id },
      data: { estado_activo_sm_vc: true },
    });
  }

  async desactivar_sm_vc(id: number) {
    const periodo = await this.findOne_sm_vc(id);

    if (!periodo.estado_activo_sm_vc) {
      throw new BadRequestException('El período ya está inactivo');
    }

    // Si el período a desactivar es el activo, activar el más reciente
    if (periodo.estado_activo_sm_vc) {
      // Buscar el período más reciente (que no sea el actual)
      const periodoMasReciente = await this.prisma.periodoAcademico.findFirst({
        where: {
          id_sm_vc: { not: id },
          estado_activo_sm_vc: false,
        },
        orderBy: { fecha_inicio_sm_vc: 'desc' },
      });

      if (periodoMasReciente) {
        await this.prisma.configuracionSistema.update({
          where: { id_sm_vc: 1 },
          data: { periodo_actual_sm_vc: periodoMasReciente.nombre_sm_vc },
        });

        await this.prisma.periodoAcademico.update({
          where: { id_sm_vc: periodoMasReciente.id_sm_vc },
          data: { estado_activo_sm_vc: true },
        });
      }
    }

    return this.prisma.periodoAcademico.update({
      where: { id_sm_vc: id },
      data: { estado_activo_sm_vc: false },
    });
  }

  async remove_sm_vc(id: number) {
    const periodo = await this.findOne_sm_vc(id);

    if (periodo.estado_activo_sm_vc) {
      throw new BadRequestException('No se puede eliminar un período académico activo');
    }

    await this.prisma.periodoAcademico.delete({
      where: { id_sm_vc: id },
    });
  }
}
