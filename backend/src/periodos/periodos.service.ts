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

  // ─────────────────────────────────────────────────────────────────
  // POST /periodos
  // Crea un nuevo período académico con nombre AUTO-GENERADO y lo
  // activa automáticamente, desactivando todos los anteriores.
  //
  // El frontend solo envía fechas. El backend deduce:
  //   • nombre_sm_vc → incrementa el código del período activo (P-N+1)
  //   • descripcion_sm_vc → construye "Mes Año - Mes Año" desde las fechas
  // ─────────────────────────────────────────────────────────────────
  async create_sm_vc(createPeriodoDto: CreatePeriodoDto_sm_vc) {
    const fechaInicio_sm_vc = new Date(createPeriodoDto.fecha_inicio_sm_vc);
    const fechaFin_sm_vc    = new Date(createPeriodoDto.fecha_fin_sm_vc);

    // Validación de rango de fechas
    if (fechaInicio_sm_vc >= fechaFin_sm_vc) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // ─────────────────────────────────────────────────────────────────
    // AUTO-GENERACIÓN DEL CÓDIGO DE PERÍODO (P-N+1)
    //
    // Busca el período activo actual y extrae su número.
    // Ej: "P-165" → 165 → 165+1 = 166 → "P-166"
    // Si no hay período previo (primer período del sistema), inicia en "P-1".
    // ─────────────────────────────────────────────────────────────────
    const periodoActivo_sm_vc = await this.prisma.periodoAcademico.findFirst({
      where:   { estado_activo_sm_vc: true },
      orderBy: { fecha_inicio_sm_vc: 'desc' },
    });

    let nombre_sm_vc: string;
    if (periodoActivo_sm_vc) {
      // Extraer el número del código actual (tolera formatos como "P-165", "P-001", "165")
      const match_sm_vc = periodoActivo_sm_vc.nombre_sm_vc.match(/(\d+)/);
      const numActual_sm_vc = match_sm_vc ? parseInt(match_sm_vc[1], 10) : 0;
      nombre_sm_vc = `P-${numActual_sm_vc + 1}`;
    } else {
      // Fallback: primer período del sistema
      nombre_sm_vc = 'P-1';
    }

    // ─────────────────────────────────────────────────────────────────
    // AUTO-GENERACIÓN DE LA DESCRIPCIÓN LEGIBLE
    //
    // Construye "Mes Año - Mes Año" en español a partir de las fechas.
    // Ej: fechaInicio=2026-05-01, fechaFin=2026-08-31 → "Mayo 2026 - Agosto 2026"
    // Se usa UTC explícito para evitar desfases de timezone.
    // ─────────────────────────────────────────────────────────────────
    const descripcion_sm_vc = this.generarDescripcionPeriodo_sm_vc(
      fechaInicio_sm_vc,
      fechaFin_sm_vc,
    );

    // Verificar que no exista ya un período con el mismo código (colisión improbable pero segura)
    const periodoExistente_sm_vc = await this.prisma.periodoAcademico.findFirst({
      where: { nombre_sm_vc },
    });

    if (periodoExistente_sm_vc) {
      throw new BadRequestException(
        `Ya existe un período con el código auto-generado: "${nombre_sm_vc}". ` +
        'Verifique que no se haya creado un período concurrentemente.',
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // TRANSACCIÓN ATÓMICA: Creación del período + Reasignación de estudiantes.
    //
    // Si la reasignación del estudiante N falla (ej. FK rota, materia faltante),
    // toda la operación se revierte: el período NO queda creado en BD.
    // Timeout extendido a 60s porque puede haber muchos estudiantes activos.
    // ─────────────────────────────────────────────────────────────────────
    try {
      return await this.prisma.$transaction(async (tx) => {

        // 1. Desactivar todos los períodos anteriores
        await tx.periodoAcademico.updateMany({
          where: { estado_activo_sm_vc: true },
          data:  { estado_activo_sm_vc: false },
        });

        // 2. Crear el nuevo período como ACTIVO
        const nuevoPeriodo = await tx.periodoAcademico.create({
          data: {
            nombre_sm_vc,
            descripcion_sm_vc,
            fecha_inicio_sm_vc: fechaInicio_sm_vc,
            fecha_fin_sm_vc:    fechaFin_sm_vc,
            estado_activo_sm_vc: true,
          },
        });

        // 3. Crear las materias del nuevo período (clonadas con FK al nuevo período)
        //    Obtener las materias del período anterior como plantilla
        const materiasAnteriores = await tx.materia.findMany({
          where:   { periodo_id_sm_vc: { not: nuevoPeriodo.id_sm_vc } },
          orderBy: { posicion_sm_vc: 'asc' },
          // Tomamos las más recientes (del período que acabamos de desactivar)
          distinct: ['posicion_sm_vc'],
        });

        // Pre-carga de requisitos: se hace ANTES del Promise.all para evitar
        // el anti-patrón de await dentro de un callback .map() no-async.
        const requisitosParaClonar = await Promise.all(
          materiasAnteriores.map((m) =>
            tx.requisito.findMany({
              where:  { materia_id_sm_vc: m.id_sm_vc },
              select: { nombre_sm_vc: true, descripcion_sm_vc: true, posicion_sm_vc: true },
            }),
          ),
        );

        // Ahora el create es completamente síncrono en su estructura
        const nuevasMaterias = await Promise.all(
          materiasAnteriores.map((m, idx) =>
            tx.materia.create({
              data: {
                nombre_sm_vc:      m.nombre_sm_vc,
                posicion_sm_vc:    m.posicion_sm_vc,
                descripcion_sm_vc: m.descripcion_sm_vc,
                // FK real al nuevo período
                periodo_id_sm_vc:  nuevoPeriodo.id_sm_vc,
                requisitos: {
                  create: requisitosParaClonar[idx],
                },
              },
            }),
          ),
        );

        // 4. Reasignar estudiantes al nuevo período (lógica de negocio completa)
        await this.reasignarEstudiantes_sm_vc(tx, nuevasMaterias);

        // 5. Sincronizar configuración del sistema con el ID del nuevo período (FK real)
        await tx.configuracionSistema.upsert({
          where:  { id_sm_vc: 1 },
          update: { periodo_id_sm_vc: nuevoPeriodo.id_sm_vc },
          create: { id_sm_vc: 1, periodo_id_sm_vc: nuevoPeriodo.id_sm_vc },
        });

        return nuevoPeriodo;

      }, { timeout: 60000 }); // 60s — operación masiva, necesita tiempo extra

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

    // Actualizar configuración del sistema con el ID del nuevo período activo (FK real)
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

    // Buscar el período más reciente para activarlo como sucesor
    const periodoSucesor_sm_vc = await this.prisma.periodoAcademico.findFirst({
      where: {
        id_sm_vc:            { not: id },
        estado_activo_sm_vc: false,
      },
      orderBy: { fecha_inicio_sm_vc: 'desc' },
    });

    if (periodoSucesor_sm_vc) {
      // Actualizar config con el ID del período sucesor (FK real)
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

  // ─────────────────────────────────────────────────────────────────
  // Genera la descripción legible del período (ej. "Mayo 2026 - Agosto 2026").
  // Usado por create_sm_vc para auto-construir descripcion_sm_vc desde las fechas.
  // Utiliza UTC explícito para evitar desfases de zona horaria.
  // ─────────────────────────────────────────────────────────────────
  private generarDescripcionPeriodo_sm_vc(inicio_sm_vc: Date, fin_sm_vc: Date): string {
    return this.generarNombrePeriodo_sm_vc(inicio_sm_vc, fin_sm_vc);
  }

  // ─────────────────────────────────────────────────────────────────
  // Helper interno: formatea una fecha como "Mes YYYY" en español (UTC).
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

  // ─────────────────────────────────────────────────────────────────────────────
  // MOTOR DE REASIGNACIÓN ACADÉMICA
  //
  // Este método es el corazón del "Cambio de Período". Se ejecuta DENTRO de
  // la transacción de create_sm_vc, por lo que cualquier fallo hace rollback total.
  //
  // LÓGICA DE NEGOCIO:
  //   - APROBADO:        posición +1, intento = 1 (avanza al siguiente nivel).
  //   - REPROBADO        posición igual, intento++ (repite el nivel actual).
  //   - EN_CURSO/NINGUNO posición igual, intento++ (no terminó; se queda y reintenta).
  //
  // PERSISTENCIA DE MENSAJES (Opción B):
  //   La consulta de conversaciones ya NO usa materia_id, sino:
  //     WHERE estudiante_id = :id AND posicion_materia = :posicion AND intento = :intento
  //   Esto garantiza que el historial de chat de "Investigación y Desarrollo" (posición 1)
  //   en el período A (intento 1) quede aislado del intento 2 en el período B.
  //   El alumno siempre ve el historial del intento ACTUAL de su posición actual.
  // ─────────────────────────────────────────────────────────────────────────────
  private async reasignarEstudiantes_sm_vc(
    tx:           Prisma.TransactionClient,
    nuevasMaterias: { id_sm_vc: number; posicion_sm_vc: number }[],
  ): Promise<void> {

    // Índice posición → nueva materia para O(1) lookup
    const mapPosicion = new Map(
      nuevasMaterias.map((m) => [m.posicion_sm_vc, m.id_sm_vc]),
    );
    const maxPosicion = Math.max(...nuevasMaterias.map((m) => m.posicion_sm_vc));

    // Traer todos los estudiantes activos con su materia actual y sus entregas
    // para determinar si aprobaron o no el período anterior.
    const estudiantes = await tx.estudiante.findMany({
      include: {
        materiaActiva: {
          include: {
            // Traemos los requisitos de la materia para evaluar si todos están aprobados
            requisitos: {
              include: {
                entregas: {
                  where:   { estudiante_id_sm_vc: undefined }, // se filtra por estudiante más abajo
                  orderBy: { fecha_actualizacion_sm_vc: 'desc' },
                  take:    1,
                },
              },
            },
          },
        },
        // Traemos TODAS las entregas del estudiante para evaluar aprobación
        entregas: {
          include: { requisito: true },
        },
      },
    });

    for (const estudiante of estudiantes) {
      const posicionActual = estudiante.materiaActiva.posicion_sm_vc;

      // ── Determinar si el alumno APROBÓ todos los requisitos de su materia actual ──
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

      if (todosAprobados) {
        // ── CAMINO FELIZ: Alumno aprobó → avanza al siguiente nivel ──
        nuevaPosicion = posicionActual + 1;
        nuevosIntentos = 1; // Primer intento en la nueva posición

        // Guard: si ya está en la última posición, lo dejamos ahí (graduado pendiente)
        if (nuevaPosicion > maxPosicion) {
          nuevaPosicion = posicionActual; // No hay siguiente nivel
          nuevosIntentos = estudiante.intentos_materia_sm_vc; // Mantener intentos
        }
      } else {
        // ── CAMINO DE REPETICIÓN: Reprobado o en curso → misma posición, intento++ ──
        nuevaPosicion  = posicionActual;
        nuevosIntentos = estudiante.intentos_materia_sm_vc + 1;
      }

      // Obtener el ID de la materia en el NUEVO período para la posición determinada
      const nuevaMateriaId = mapPosicion.get(nuevaPosicion);

      if (!nuevaMateriaId) {
        // Situación anómala: no existe la materia en el nuevo período para esa posición.
        // Lanzamos error para que la transacción haga rollback completo.
        throw new InternalServerErrorException(
          `[Reasignación] No se encontró materia en posición ${nuevaPosicion} para el nuevo período. ` +
          `Estudiante ID: ${estudiante.id_sm_vc}. Operación cancelada.`,
        );
      }

      // Actualizar el registro del estudiante en la BD
      await tx.estudiante.update({
        where: { id_sm_vc: estudiante.id_sm_vc },
        data: {
          materia_activa_id_sm_vc: nuevaMateriaId,
          intentos_materia_sm_vc:  nuevosIntentos,
        },
      });

      // ── Registro de log en conversación (Opción B) ──────────────────────────────
      // La conversación del nuevo intento se identifica por (estudiante, posición, intento).
      // upsert: si el alumno ya tenía esta combinación (raro), no duplica.
      // El alumno puede ver su historial anterior con el mismo posicion + intento anterior.
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

      // Mensaje de sistema que queda registrado en el nuevo hilo de conversación
      const accion = todosAprobados ? '✅ Avanzó al siguiente nivel' : '🔄 Repite este nivel';
      await tx.mensaje.create({
        data: {
          conversacion_id_sm_vc: nuevaConversacion.id_sm_vc,
          contenido_sm_vc: (
            `Log de Sistema — Cambio de Período Académico: ${accion}. ` +
            `Intento #${nuevosIntentos} en la posición ${nuevaPosicion}.`
          ),
          es_sistema_sm_vc:  true,
          materia_id_sm_vc:  nuevaMateriaId,
        },
      });
    }

    console.log(
      `[PeriodosService] Reasignación completa: ${estudiantes.length} estudiante(s) procesado(s).`,
    );
  }
}
