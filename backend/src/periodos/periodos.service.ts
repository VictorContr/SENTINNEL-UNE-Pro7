import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAprobacion, Prisma } from '@prisma/client';
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

  async create_sm_vc(createPeriodoDto: CreatePeriodoDto_sm_vc) {
    const fechaInicio_sm_vc = new Date(createPeriodoDto.fecha_inicio_sm_vc);
    const fechaFin_sm_vc    = new Date(createPeriodoDto.fecha_fin_sm_vc);

    if (fechaInicio_sm_vc >= fechaFin_sm_vc) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    const periodoActivo_sm_vc = await this.prisma.periodoAcademico.findFirst({
      where:   { estado_activo_sm_vc: true },
      orderBy: { fecha_inicio_sm_vc: 'desc' },
    });

    let nombre_sm_vc: string;
    if (periodoActivo_sm_vc) {
      const match_sm_vc = periodoActivo_sm_vc.nombre_sm_vc.match(/(\d+)/);
      const numActual_sm_vc = match_sm_vc ? parseInt(match_sm_vc[1], 10) : 0;
      nombre_sm_vc = `P-${numActual_sm_vc + 1}`;
    } else {
      nombre_sm_vc = 'P-1';
    }

    const descripcion_sm_vc = this.generarDescripcionPeriodo_sm_vc(
      fechaInicio_sm_vc,
      fechaFin_sm_vc,
    );

    const periodoExistente_sm_vc = await this.prisma.periodoAcademico.findFirst({
      where: { nombre_sm_vc },
    });

    if (periodoExistente_sm_vc) {
      throw new BadRequestException(
        `Ya existe un período con el código auto-generado: "${nombre_sm_vc}". ` +
        'Verifique que no se haya creado un período concurrentemente.',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {

        await tx.periodoAcademico.updateMany({
          where: { estado_activo_sm_vc: true },
          data:  { estado_activo_sm_vc: false },
        });

        const nuevoPeriodo = await tx.periodoAcademico.create({
          data: {
            nombre_sm_vc,
            descripcion_sm_vc,
            fecha_inicio_sm_vc: fechaInicio_sm_vc,
            fecha_fin_sm_vc:    fechaFin_sm_vc,
            estado_activo_sm_vc: true,
          },
        });

        const materiasAnteriores = await tx.materia.findMany({
          where:   { periodo_id_sm_vc: { not: nuevoPeriodo.id_sm_vc } },
          orderBy: { posicion_sm_vc: 'asc' },
          distinct: ['posicion_sm_vc'],
        });

        const requisitosParaClonar = await Promise.all(
          materiasAnteriores.map((m) =>
            tx.requisito.findMany({
              where:  { materia_id_sm_vc: m.id_sm_vc },
              select: { nombre_sm_vc: true, descripcion_sm_vc: true, posicion_sm_vc: true },
            }),
          ),
        );

        const nuevasMaterias = await Promise.all(
          materiasAnteriores.map((m, idx) =>
            tx.materia.create({
              data: {
                nombre_sm_vc:      m.nombre_sm_vc,
                posicion_sm_vc:    m.posicion_sm_vc,
                descripcion_sm_vc: m.descripcion_sm_vc,
                periodo_id_sm_vc:  nuevoPeriodo.id_sm_vc,
                requisitos: {
                  create: requisitosParaClonar[idx],
                },
              },
            }),
          ),
        );

        await this.reasignarEstudiantes_sm_vc(tx, nuevasMaterias);

        await tx.configuracionSistema.upsert({
          where:  { id_sm_vc: 1 },
          update: { periodo_id_sm_vc: nuevoPeriodo.id_sm_vc },
          create: { id_sm_vc: 1, periodo_id_sm_vc: nuevoPeriodo.id_sm_vc },
        });

        return nuevoPeriodo;

      }, { timeout: 60000 }); 

    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('[PeriodosService] Error en create_sm_vc transacción:', error);
      throw new InternalServerErrorException(
        'Error al crear el período académico. Ningún cambio fue aplicado a la base de datos.',
      );
    }
  }

  async update_sm_vc(id: number, updatePeriodoDto: UpdatePeriodoDto_sm_vc) {
    await this.findOne_sm_vc(id);

    const data_sm_vc: Record<string, unknown> = {};

    if (updatePeriodoDto.fecha_inicio_sm_vc) {
      data_sm_vc.fecha_inicio_sm_vc = new Date(updatePeriodoDto.fecha_inicio_sm_vc);
    }
    if (updatePeriodoDto.fecha_fin_sm_vc) {
      data_sm_vc.fecha_fin_sm_vc = new Date(updatePeriodoDto.fecha_fin_sm_vc);
    }

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
    await this.prisma.periodoAcademico.updateMany({
      where: { estado_activo_sm_vc: true },
      data:  { estado_activo_sm_vc: false },
    });

    const periodo_sm_vc = await this.findOne_sm_vc(id);

    try {
      await this.prisma.configuracionSistema.update({
        where: { id_sm_vc: 1 },
        data:  { periodo_id_sm_vc: id },
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
          data:  { periodo_id_sm_vc: periodoSucesor_sm_vc.id_sm_vc },
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

  private generarDescripcionPeriodo_sm_vc(inicio_sm_vc: Date, fin_sm_vc: Date): string {
    return this.generarNombrePeriodo_sm_vc(inicio_sm_vc, fin_sm_vc);
  }

  private generarNombrePeriodo_sm_vc(inicio_sm_vc: Date, fin_sm_vc: Date): string {
    const formatMesAnio_sm_vc = (fecha_sm_vc: Date): string => {
      const mes_sm_vc = fecha_sm_vc.toLocaleDateString('es-ES', {
        month: 'long',
        timeZone: 'UTC',
      });
      const anio_sm_vc = fecha_sm_vc.getUTCFullYear();
      return `${mes_sm_vc.charAt(0).toUpperCase()}${mes_sm_vc.slice(1)} ${anio_sm_vc}`;
    };

    return `${formatMesAnio_sm_vc(inicio_sm_vc)} - ${formatMesAnio_sm_vc(fin_sm_vc)}`;
  }

  private async reasignarEstudiantes_sm_vc(
    tx:           Prisma.TransactionClient,
    nuevasMaterias: { id_sm_vc: number; posicion_sm_vc: number }[],
  ): Promise<void> {

    const mapPosicion = new Map(
      nuevasMaterias.map((m) => [m.posicion_sm_vc, m.id_sm_vc]),
    );
    const maxPosicion = Math.max(...nuevasMaterias.map((m) => m.posicion_sm_vc));

    const estudiantes = await tx.estudiante.findMany({
      include: {
        materiaActiva: {
          include: {
            requisitos: {
              include: {
                entregas: {
                  where:   { estudiante_id_sm_vc: undefined }, 
                  orderBy: { fecha_actualizacion_sm_vc: 'desc' },
                  take:    1,
                },
              },
            },
          },
        },
        entregas: {
          include: { requisito: true },
        },
      },
    });

    for (const estudiante of estudiantes) {
      // Si por alguna razón la data está corrupta y no tiene materia, saltar
      if (!estudiante.materiaActiva) continue;

      const posicionActual = estudiante.materiaActiva.posicion_sm_vc;

      const requisitosDeMateria = estudiante.materiaActiva.requisitos;
      const todosAprobados = requisitosDeMateria.length > 0 &&
        requisitosDeMateria.every((req) => {
          const entrega = estudiante.entregas.find(
            (e) => e.requisito_id_sm_vc === req.id_sm_vc,
          );
          return entrega?.estado_sm_vc === EstadoAprobacion.APROBADO;
        });

let nuevaPosicion: number;
      let nuevosIntentos: number;
      let habilitarDeploy = estudiante.puede_hacer_deploy_sm_vc; // Mantenemos su estado actual

      if (todosAprobados) {
        nuevaPosicion = posicionActual + 1;
        nuevosIntentos = 1; 

        // ✅ FIX: Si el tesista aprobó la última fase (Pos 4)
        if (nuevaPosicion > maxPosicion) {
          nuevaPosicion = maxPosicion; // Lo anclamos en la 4
          nuevosIntentos = estudiante.intentos_materia_sm_vc; // Mantiene su intento final
          habilitarDeploy = true; // ✅ Le damos luz verde para graduarse (Deploy)
        }
      } else {
        nuevaPosicion  = posicionActual;
        nuevosIntentos = estudiante.intentos_materia_sm_vc + 1;
      }

      const nuevaMateriaId = mapPosicion.get(nuevaPosicion);

      if (!nuevaMateriaId) {
        throw new InternalServerErrorException(
          `[Reasignación] No se encontró materia en posición ${nuevaPosicion} para el nuevo período. ` +
          `Estudiante ID: ${estudiante.id_sm_vc}. Operación cancelada.`,
        );
      }

      // ✅ FIX: Actualizamos la BD usando SOLO las columnas que de verdad existen
      await tx.estudiante.update({
        where: { id_sm_vc: estudiante.id_sm_vc },
        data: {
          materia_activa_id_sm_vc: nuevaMateriaId,
          intentos_materia_sm_vc:  nuevosIntentos,
          puede_hacer_deploy_sm_vc: habilitarDeploy, // El flag real para los que aprueban todo
        },
      });

      const nuevaConversacion = await tx.conversacion.upsert({
        where: {
          estudiante_id_sm_vc_posicion_materia_sm_vc_intento_sm_vc: {
            estudiante_id_sm_vc:    estudiante.id_sm_vc,
            posicion_materia_sm_vc: nuevaPosicion,
            intento_sm_vc:          nuevosIntentos,
          },
        },
        update: {},
        create: {
          estudiante_id_sm_vc:    estudiante.id_sm_vc,
          posicion_materia_sm_vc: nuevaPosicion,
          intento_sm_vc:          nuevosIntentos,
        },
      });

// ✅ FIX: Actualizamos el mensaje del bot para que lea la variable correcta
      const accion_sm_vc = todosAprobados
        ? (habilitarDeploy) 
          ? `✅ Felicitaciones, has culminado tus pasantías. Ya tienes habilitado el módulo de Deploy en Producción.` 
          : `✅ Has avanzado al siguiente nivel (Posición ${nuevaPosicion}).`
        : `🔄 Repetirás este nivel (Posición ${nuevaPosicion}, Intento #${nuevosIntentos}).`;

      await tx.mensaje.create({
        data: {
          conversacion_id_sm_vc: nuevaConversacion.id_sm_vc,
          contenido_sm_vc: (
            `🤖 [Aviso Automático del Sistema]: Se ha efectuado el cambio de período académico. ` +
            `Este es tu nuevo espacio de trabajo y correcciones para este ciclo.\n\n${accion_sm_vc}`
          ),
          es_sistema_sm_vc: true,      
          materia_id_sm_vc: nuevaMateriaId,
        },
      });
    }

    console.log(
      `[PeriodosService] Reasignación completa: ${estudiantes.length} estudiante(s) procesado(s).`,
    );
  }
}