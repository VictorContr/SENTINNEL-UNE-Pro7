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
    const periodoActivo_sm_vc = await this.prisma.periodoAcademico.findFirst({
      where: { estado_activo_sm_vc: true },
    });

    if (!periodoActivo_sm_vc) {
      throw new NotFoundException('No hay un período académico activo');
    }

    return periodoActivo_sm_vc;
  }

  async findOne_sm_vc(id: number) {
    const periodo_sm_vc = await this.prisma.periodoAcademico.findUnique({
      where: { id_sm_vc: id },
    });

    if (!periodo_sm_vc) {
      throw new NotFoundException(`Período académico ${id} no encontrado`);
    }

    return periodo_sm_vc;
  }

  // ─────────────────────────────────────────────────────────────────
  // POST /periodos
  // Crea un nuevo período académico con nombre auto-generado y lo
  // activa automáticamente, desactivando todos los anteriores.
  // ─────────────────────────────────────────────────────────────────
  async create_sm_vc(createPeriodoDto: CreatePeriodoDto_sm_vc) {
    const fechaInicio_sm_vc = new Date(createPeriodoDto.fecha_inicio_sm_vc);
    const fechaFin_sm_vc    = new Date(createPeriodoDto.fecha_fin_sm_vc);

    // Validación de rango de fechas
    if (fechaInicio_sm_vc >= fechaFin_sm_vc) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Generar nombre dinámicamente desde las fechas del período.
    // Resultado esperado: "Enero 2026 - Julio 2026"
    const nombre_sm_vc = this.generarNombrePeriodo_sm_vc(fechaInicio_sm_vc, fechaFin_sm_vc);

    // Verificar que no exista ya un período con el mismo nombre generado
    const periodoExistente_sm_vc = await this.prisma.periodoAcademico.findFirst({
      where: { nombre_sm_vc },
    });

    if (periodoExistente_sm_vc) {
      throw new BadRequestException(
        `Ya existe un período con el rango de fechas equivalente: "${nombre_sm_vc}"`,
      );
    }

    // Desactivar todos los períodos anteriores antes de crear el nuevo.
    // La regla de negocio es: solo puede haber UN período activo.
    await this.prisma.periodoAcademico.updateMany({
      where: { estado_activo_sm_vc: true },
      data:  { estado_activo_sm_vc: false },
    });

    // Crear el nuevo período como ACTIVO directamente
    const nuevoPeriodo_sm_vc = await this.prisma.periodoAcademico.create({
      data: {
        nombre_sm_vc,
        fecha_inicio_sm_vc: fechaInicio_sm_vc,
        fecha_fin_sm_vc:    fechaFin_sm_vc,
        estado_activo_sm_vc: true,
      },
    });

    // Sincronizar la tabla de configuración del sistema con el nuevo período activo
    try {
      await this.prisma.configuracionSistema.update({
        where: { id_sm_vc: 1 },
        data:  { periodo_actual_sm_vc: nombre_sm_vc },
      });
    } catch {
      // No bloqueante: si la tabla de configuración no existe, continuamos.
      console.warn('[PeriodosService] No se pudo actualizar configuracionSistema.');
    }

    return nuevoPeriodo_sm_vc;
  }

  async update_sm_vc(id: number, updatePeriodoDto: UpdatePeriodoDto_sm_vc) {
    await this.findOne_sm_vc(id);

    // Si se están actualizando ambas fechas, regenerar el nombre automáticamente
    const data_sm_vc: Record<string, unknown> = {};

    if (updatePeriodoDto.fecha_inicio_sm_vc) {
      data_sm_vc.fecha_inicio_sm_vc = new Date(updatePeriodoDto.fecha_inicio_sm_vc);
    }
    if (updatePeriodoDto.fecha_fin_sm_vc) {
      data_sm_vc.fecha_fin_sm_vc = new Date(updatePeriodoDto.fecha_fin_sm_vc);
    }

    // Si viene explícitamente un nombre, lo respetamos; si no, lo regeneramos
    // cuando se actualizan las dos fechas a la vez.
    if (updatePeriodoDto.nombre_sm_vc) {
      data_sm_vc.nombre_sm_vc = updatePeriodoDto.nombre_sm_vc;
    } else if (updatePeriodoDto.fecha_inicio_sm_vc && updatePeriodoDto.fecha_fin_sm_vc) {
      data_sm_vc.nombre_sm_vc = this.generarNombrePeriodo_sm_vc(
        new Date(updatePeriodoDto.fecha_inicio_sm_vc),
        new Date(updatePeriodoDto.fecha_fin_sm_vc),
      );
    }

    if (updatePeriodoDto.estado_activo_sm_vc !== undefined) {
      data_sm_vc.estado_activo_sm_vc = updatePeriodoDto.estado_activo_sm_vc;
    }
    if (updatePeriodoDto.descripcion_sm_vc) {
      data_sm_vc.descripcion_sm_vc = updatePeriodoDto.descripcion_sm_vc;
    }

    // Validar rango si vienen ambas fechas
    if (data_sm_vc.fecha_inicio_sm_vc && data_sm_vc.fecha_fin_sm_vc) {
      if ((data_sm_vc.fecha_inicio_sm_vc as Date) >= (data_sm_vc.fecha_fin_sm_vc as Date)) {
        throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    return this.prisma.periodoAcademico.update({
      where: { id_sm_vc: id },
      data:  data_sm_vc,
    });
  }

  async activar_sm_vc(id: number) {
    // Desactivar todos los períodos activos primero
    await this.prisma.periodoAcademico.updateMany({
      where: { estado_activo_sm_vc: true },
      data:  { estado_activo_sm_vc: false },
    });

    const periodo_sm_vc = await this.findOne_sm_vc(id);

    // Actualizar configuración del sistema con el nuevo período activo
    try {
      await this.prisma.configuracionSistema.update({
        where: { id_sm_vc: 1 },
        data:  { periodo_actual_sm_vc: periodo_sm_vc.nombre_sm_vc },
      });
    } catch {
      console.warn('[PeriodosService] No se pudo actualizar configuracionSistema.');
    }

    return this.prisma.periodoAcademico.update({
      where: { id_sm_vc: id },
      data:  { estado_activo_sm_vc: true },
    });
  }

  async desactivar_sm_vc(id: number) {
    const periodo_sm_vc = await this.findOne_sm_vc(id);

    if (!periodo_sm_vc.estado_activo_sm_vc) {
      throw new BadRequestException('El período ya está inactivo');
    }

    // Buscar el período más reciente para activarlo como sucesor
    const periodoSucesor_sm_vc = await this.prisma.periodoAcademico.findFirst({
      where: {
        id_sm_vc:            { not: id },
        estado_activo_sm_vc: false,
      },
      orderBy: { fecha_inicio_sm_vc: 'desc' },
    });

    if (periodoSucesor_sm_vc) {
      try {
        await this.prisma.configuracionSistema.update({
          where: { id_sm_vc: 1 },
          data:  { periodo_actual_sm_vc: periodoSucesor_sm_vc.nombre_sm_vc },
        });
      } catch {
        console.warn('[PeriodosService] No se pudo actualizar configuracionSistema.');
      }

      await this.prisma.periodoAcademico.update({
        where: { id_sm_vc: periodoSucesor_sm_vc.id_sm_vc },
        data:  { estado_activo_sm_vc: true },
      });
    }

    return this.prisma.periodoAcademico.update({
      where: { id_sm_vc: id },
      data:  { estado_activo_sm_vc: false },
    });
  }

  async remove_sm_vc(id: number) {
    const periodo_sm_vc = await this.findOne_sm_vc(id);

    if (periodo_sm_vc.estado_activo_sm_vc) {
      throw new BadRequestException('No se puede eliminar un período académico activo');
    }

    await this.prisma.periodoAcademico.delete({
      where: { id_sm_vc: id },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Método privado: genera el nombre del período a partir de las fechas.
  // Ejemplo de salida: "Enero 2026 - Julio 2026"
  // ─────────────────────────────────────────────────────────────────
  private generarNombrePeriodo_sm_vc(inicio_sm_vc: Date, fin_sm_vc: Date): string {
    const formatMesAnio_sm_vc = (fecha_sm_vc: Date): string => {
      const mes_sm_vc = fecha_sm_vc.toLocaleDateString('es-ES', {
        month: 'long',
        timeZone: 'UTC',
      });
      const anio_sm_vc = fecha_sm_vc.getUTCFullYear();
      // Capitalizar primera letra del mes
      return `${mes_sm_vc.charAt(0).toUpperCase()}${mes_sm_vc.slice(1)} ${anio_sm_vc}`;
    };

    return `${formatMesAnio_sm_vc(inicio_sm_vc)} - ${formatMesAnio_sm_vc(fin_sm_vc)}`;
  }
}
