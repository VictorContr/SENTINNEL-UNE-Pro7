import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAprobacion, TipoDocumento } from '@prisma/client';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import { DocumentosService } from '../documentos/documentos.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PasantiasService_sm_vc {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversacionesService: ConversacionesService,
    private readonly documentosService: DocumentosService,
    private readonly eventEmitter_sm_vc: EventEmitter2,
  ) {}

  async getMaterias_sm_vc() {
    // ✅ FIX: Filtrar por el período ACTIVO.
    const config_sm_vc = await this.prisma.configuracionSistema.findFirst({
      where: { id_sm_vc: 1 },
      select: { periodo_id_sm_vc: true },
    });

    if (!config_sm_vc) {
      return []; // Sistema no inicializado aún
    }

    const materias = await this.prisma.materia.findMany({
      where: { periodo_id_sm_vc: config_sm_vc.periodo_id_sm_vc },
      include: {
        requisitos: { orderBy: { posicion_sm_vc: 'asc' } },
        periodo: { select: { nombre_sm_vc: true, descripcion_sm_vc: true } },
      },
      orderBy: { posicion_sm_vc: 'asc' },
    });

    return materias.map(m => ({
      ...m,
      // Retrocompatibilidad con frontend que espera el string directo:
      periodo_sm_vc: m.periodo?.nombre_sm_vc || 'Sin Periodo'
    }));
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

    // Buscar la materia anterior usando FK real
    const materiaAnterior = await this.prisma.materia.findFirst({
      where: { 
        posicion_sm_vc: materiaActual.posicion_sm_vc - 1,
        periodo_id_sm_vc: materiaActual.periodo_id_sm_vc,
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
   * Crear o actualizar una entrega física con archivo binario y trazabilidad
   */
  async crearEntrega_sm_vc(
    usuarioId: number,
    requisitoId: number,
    file: Express.Multer.File,
    comentario?: string
  ) {
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

    // Validar progreso académico
    await this.validarProgresoEstudiante_sm_vc(usuarioId, requisito.materia.id_sm_vc);

    // ── Validación de Máquina de Estados ──
    const entregaExistente_sm_vc = await this.prisma.entrega.findUnique({
      where: {
        estudiante_id_sm_vc_requisito_id_sm_vc: {
          estudiante_id_sm_vc: estudiante.id_sm_vc,
          requisito_id_sm_vc: requisitoId,
        },
      },
    });

    if (entregaExistente_sm_vc?.estado_sm_vc === EstadoAprobacion.APROBADO) {
      throw new BadRequestException('No se pueden modificar requisitos que ya han sido aprobados');
    }

    const esNuevaVersion_sm_vc = !!entregaExistente_sm_vc;

    // ── Transacción Atómica ──
    const entrega = await this.prisma.$transaction(async (tx) => {
      const entP_sm_vc = await tx.entrega.upsert({
        where: {
          estudiante_id_sm_vc_requisito_id_sm_vc: {
            estudiante_id_sm_vc: estudiante.id_sm_vc,
            requisito_id_sm_vc: requisitoId,
          },
        },
        create: {
          estudiante_id_sm_vc: estudiante.id_sm_vc,
          requisito_id_sm_vc: requisitoId,
          estado_sm_vc: EstadoAprobacion.ENTREGADO,
        },
        update: {
          estado_sm_vc: EstadoAprobacion.ENTREGADO,
          fecha_actualizacion_sm_vc: new Date(),
        },
      });

      await tx.documento.create({
        data: {
          entrega_id_sm_vc: entP_sm_vc.id_sm_vc,
          usuario_subida_id_sm_vc: usuarioId,
          tipo_sm_vc: TipoDocumento.ENTREGABLE_ESTUDIANTE,
          nombre_archivo_sm_vc: file.originalname,
          ruta_archivo_sm_vc: file.path,
          tamanio_bytes_sm_vc: file.size,
          mime_type_sm_vc: file.mimetype,
        }
      });

      return entP_sm_vc;
    });

    // ── Trazabilidad en Conversaciones ──
    const pesoFormateado_sm_vc = DocumentosService.formatearTamanioArchivo_sm_vc(file.size);
    const prefijoMensaje_sm_vc = esNuevaVersion_sm_vc 
      ? `Nueva versión del informe subida` 
      : `Nueva entrega subida`;

    const mensajeBase_sm_vc = `${prefijoMensaje_sm_vc}: **${file.originalname}** (${pesoFormateado_sm_vc}).`;
    const contenidoFinal_sm_vc = comentario 
      ? `${mensajeBase_sm_vc}\n\n**Comentario Estudiante:** ${comentario}`
      : mensajeBase_sm_vc;

    await this.conversacionesService.registrarMensajeManual_sm_vc({
      estudianteId: estudiante.id_sm_vc,
      contenido_sm_vc: contenidoFinal_sm_vc,
      materiaId: requisito.materia.id_sm_vc
    });

    return entrega;
  }

  /**
   * Evaluacion individual de una entrega (Aprobar/Reprobar/Observaciones)
   */
  async evaluarEntrega_sm_vc(
    profesorId: number,
    entregaId: number,
    decision: EstadoAprobacion,
    nota?: number,
    observaciones?: string,
    archivoCorreccion?: Express.Multer.File
  ) {
    let id_real_sm_vc = entregaId;

    let entrega = await this.prisma.entrega.findUnique({
      where: { id_sm_vc: id_real_sm_vc },
      include: { requisito: { include: { materia: true } }, estudiante: true }
    });

    // Fallback de Documento: Si no es ID de Entrega, buscar si es de Documento
    if (!entrega) {
      const documentoFallback = await this.prisma.documento.findUnique({
        where: { id_sm_vc: entregaId },
      });

      if (documentoFallback && documentoFallback.entrega_id_sm_vc) {
        id_real_sm_vc = documentoFallback.entrega_id_sm_vc;
        entrega = await this.prisma.entrega.findUnique({
          where: { id_sm_vc: id_real_sm_vc },
          include: { requisito: { include: { materia: true } }, estudiante: true }
        });
      }
    }

    if (!entrega) throw new NotFoundException('Entrega/Documento no encontrado.');

    // ✅ FIX: No hay más mapeador forzado a REPROBADO. El backend 
    // reconoce el estado OBSERVACIONES devuelto por Frontend a BD.
    const estadoReal_sm_vc = decision;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Crear/Actualizar Evaluación
      const evaluacion = await tx.evaluacion.upsert({
        where: { entrega_id_sm_vc: id_real_sm_vc },
        update: {
          decision_sm_vc: estadoReal_sm_vc, // <-- Aquí inyectamos el estado limpio
          nota_sm_dec: nota ? parseFloat(nota.toFixed(2)) : null,
          observaciones_sm_vc: observaciones,
          profesor_id_sm_vc: profesorId,
        },
        create: {
          entrega_id_sm_vc: id_real_sm_vc,
          profesor_id_sm_vc: profesorId,
          decision_sm_vc: estadoReal_sm_vc, // <-- Aquí también
          nota_sm_dec: nota ? parseFloat(nota.toFixed(2)) : null,
          observaciones_sm_vc: observaciones,
        }
      });

      // 2. Actualizar estado de la Entrega
      await tx.entrega.update({
        where: { id_sm_vc: id_real_sm_vc },
        data: { estado_sm_vc: estadoReal_sm_vc } // <-- Y aquí
      });

      // 3. Documento de corrección (Opcional)
      if (archivoCorreccion) {
        await tx.documento.create({
          data: {
            entrega_id_sm_vc: id_real_sm_vc,
            usuario_subida_id_sm_vc: profesorId,
            tipo_sm_vc: TipoDocumento.CORRECCION_PROFESOR,
            nombre_archivo_sm_vc: archivoCorreccion.originalname,
            ruta_archivo_sm_vc: archivoCorreccion.path,
            tamanio_bytes_sm_vc: archivoCorreccion.size,
            mime_type_sm_vc: archivoCorreccion.mimetype,
          }
        });
      }

      // 4. Log de trazabilidad con identidad del Profesor
      const prefijoLog = estadoReal_sm_vc === EstadoAprobacion.APROBADO
        ? 'Aprobado' 
        : (estadoReal_sm_vc === EstadoAprobacion.REPROBADO ? 'Reprobado' : 'Observaciones');
      
      const contenidoMensaje = `${prefijoLog}: Requisito **${entrega.requisito.nombre_sm_vc}**.\n\n**Nota:** ${nota || 'N/A'}\n**Observaciones:** ${observaciones || 'Sin observaciones.'}`;

      await this.conversacionesService.registrarMensajeManual_sm_vc({
        estudianteId: entrega.estudiante_id_sm_vc,
        contenido_sm_vc: contenidoMensaje,
        materiaId: entrega.requisito.materia_id_sm_vc,
        remitenteId: profesorId,
        remitenteRol: 'PROFESOR',
      });

      this.eventEmitter_sm_vc.emit('entrega.actualizada_sm_vc', {
        estudianteId_sm_vc: entrega.estudiante_id_sm_vc,
        materiaId_sm_vc: entrega.requisito.materia_id_sm_vc,
        requisito_id_sm_vc: entrega.requisito_id_sm_vc,
        estado_sm_vc: estadoReal_sm_vc, // APROBADO o REPROBADO
        documento_id_original: entregaId, // 🚨 CRÍTICO: El ID que el frontend mandó inicialmente
        entrega_id_real: id_real_sm_vc
      });

      // --- [HOTFIX SPRINT NOTIFICACIONES] ---
      const notifEvaluacion = await tx.notificacion.create({
        data: {
          emisor_id_sm_vc: profesorId,
          receptor_id_sm_vc: entrega.estudiante.usuario_id_sm_vc,
          tipo_sm_vc: estadoReal_sm_vc === EstadoAprobacion.APROBADO ? 'INFORMATIVA' : 'IMPORTANTE',
          titulo_sm_vc: estadoReal_sm_vc === EstadoAprobacion.APROBADO 
            ? `✔ "${entrega.requisito.nombre_sm_vc}" aprobado`
            : `⚠ Requisito re-evaluado: "${entrega.requisito.nombre_sm_vc}"`,
          contenido_sm_vc: estadoReal_sm_vc === EstadoAprobacion.APROBADO
            ? `Tu entrega en "${entrega.requisito.materia.nombre_sm_vc}" fue aprobada.`
            : (estadoReal_sm_vc === EstadoAprobacion.OBSERVACIONES ? `Tu entrega en "${entrega.requisito.materia.nombre_sm_vc}" presenta observaciones.` : `Tu entrega en "${entrega.requisito.materia.nombre_sm_vc}" fue reprobada.`),
        }
      });
      console.log(`📤 [PasantiasService] DB Notif guardada para Estu_Usuario ${entrega.estudiante.usuario_id_sm_vc}. Emitiendo 'notificacion.enviar' al Gateway...`);
      this.eventEmitter_sm_vc.emit('notificacion.enviar', { receptorId: entrega.estudiante.usuario_id_sm_vc, notificacion: notifEvaluacion });

      return evaluacion;
    });
  }

  /**
   * Evaluación masiva o granular de requisitos.
   */
  async evaluarRequisitosBulk_sm_vc(
    profesorId: number,
    estudianteId: number,
    materiaId: number,
    requisitosIds: number[],
    notaGlobal?: number,
    comentario?: string
  ) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id_sm_vc: estudianteId },
      include: { materiaActiva: true }
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado.');

    const materia = await this.prisma.materia.findUnique({
      where: { id_sm_vc: materiaId },
      include: { requisitos: true }
    });
    if (!materia) throw new NotFoundException('Materia no encontrada.');

    const esMateriaCompleta = requisitosIds.length === materia.requisitos.length;

    await this.prisma.$transaction(async (tx) => {
      for (const reqId of requisitosIds) {
        const entP = await tx.entrega.upsert({
          where: {
            estudiante_id_sm_vc_requisito_id_sm_vc: {
              estudiante_id_sm_vc: estudianteId,
              requisito_id_sm_vc: reqId,
            }
          },
          update: { estado_sm_vc: EstadoAprobacion.APROBADO },
          create: {
            estudiante_id_sm_vc: estudianteId,
            requisito_id_sm_vc: reqId,
            estado_sm_vc: EstadoAprobacion.APROBADO
          }
        });

        await tx.evaluacion.upsert({
          where: { entrega_id_sm_vc: entP.id_sm_vc },
          update: {
            decision_sm_vc: EstadoAprobacion.APROBADO,
            profesor_id_sm_vc: profesorId,
            nota_sm_dec: notaGlobal ? parseFloat(notaGlobal.toFixed(2)) : null,
          },
          create: {
            entrega_id_sm_vc: entP.id_sm_vc,
            profesor_id_sm_vc: profesorId,
            decision_sm_vc: EstadoAprobacion.APROBADO,
            nota_sm_dec: notaGlobal ? parseFloat(notaGlobal.toFixed(2)) : null,
          }
        });
      }
    });

    let mensajeLog = '';
    if (esMateriaCompleta) {
      mensajeLog = `🏆 **Materia Aprobada en Totalidad**\n\nEl profesor ha aprobado todos los requisitos de **${materia.nombre_sm_vc}**.\n\n**Calificación Global:** ${notaGlobal}\n**Comentario:** ${comentario || 'Ninguno'}`;
    } else {
      mensajeLog = `✅ **Aprobación de Requisitos (${requisitosIds.length}/${materia.requisitos.length})**\n\nEl profesor ha aprobado un lote de requisitos de la materia.\n\n${comentario || ''}`;
    }

    await this.conversacionesService.registrarMensajeManual_sm_vc({
      estudianteId: estudianteId,
      contenido_sm_vc: mensajeLog,
      materiaId: materiaId,
      remitenteId: profesorId,
      remitenteRol: 'PROFESOR',
    });

    // --- [HOTFIX SPRINT NOTIFICACIONES] ---
    const notifBulk = await this.prisma.notificacion.create({
      data: {
        emisor_id_sm_vc: profesorId,
        receptor_id_sm_vc: estudiante.usuario_id_sm_vc,
        tipo_sm_vc: 'INFORMATIVA',
        titulo_sm_vc: esMateriaCompleta ? `🏆 Materia "${materia.nombre_sm_vc}" Aprobada` : `✅ Requisitos de "${materia.nombre_sm_vc}" Aprobados`,
        contenido_sm_vc: esMateriaCompleta 
          ? `Felicitaciones, has completado todos los requisitos de la materia.` 
          : `El profesor ha aprobado un lote de ${requisitosIds.length} requisitos.`,
      }
    });
    console.log(`📤 [PasantiasService BULK] DB Notif guardada para Estu_Usuario ${estudiante.usuario_id_sm_vc}. Emitiendo 'notificacion.enviar'...`);
    this.eventEmitter_sm_vc.emit('notificacion.enviar', { receptorId: estudiante.usuario_id_sm_vc, notificacion: notifBulk });

    return { success: true, count: requisitosIds.length };
  }

  /**
   * Reprobar Materia Globalmente
   */
  async reprobarMateriaGlobal_sm_vc(
    profesorId: number,
    estudianteId: number,
    materiaId: number,
    observaciones?: string
  ) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id_sm_vc: estudianteId },
      include: { materiaActiva: true }
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado.');

    const materia = await this.prisma.materia.findUnique({
      where: { id_sm_vc: materiaId },
      include: { requisitos: true }
    });
    if (!materia) throw new NotFoundException('Materia no encontrada.');

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const req of materia.requisitos) {
          const entP = await tx.entrega.upsert({
            where: {
              estudiante_id_sm_vc_requisito_id_sm_vc: {
                estudiante_id_sm_vc: estudianteId,
                requisito_id_sm_vc: req.id_sm_vc,
              }
            },
            update: { estado_sm_vc: EstadoAprobacion.REPROBADO },
            create: {
              estudiante_id_sm_vc: estudianteId,
              requisito_id_sm_vc: req.id_sm_vc,
              estado_sm_vc: EstadoAprobacion.REPROBADO
            }
          });

          await tx.evaluacion.upsert({
            where: { entrega_id_sm_vc: entP.id_sm_vc },
            update: {
              decision_sm_vc: EstadoAprobacion.REPROBADO,
              profesor_id_sm_vc: profesorId,
              observaciones_sm_vc: observaciones || 'Materia reprobada globalmente',
            },
            create: {
              entrega_id_sm_vc: entP.id_sm_vc,
              profesor_id_sm_vc: profesorId,
              decision_sm_vc: EstadoAprobacion.REPROBADO,
              observaciones_sm_vc: observaciones || 'Materia reprobada globalmente',
            }
          });
        }
      });
      
      const mensajeLog = `❌ **Materia Reprobada**\n\nEl profesor ha reprobado la materia **${materia.nombre_sm_vc}**.\n\n**Comentario:** ${observaciones || 'Ninguno'}`;
  
      await this.conversacionesService.registrarMensajeManual_sm_vc({
        estudianteId: estudianteId,
        contenido_sm_vc: mensajeLog,
        materiaId: materiaId,
        remitenteId: profesorId,
        remitenteRol: 'PROFESOR',
      });
  
      const notifReprobado = await this.prisma.notificacion.create({
        data: {
          emisor_id_sm_vc: profesorId,
          receptor_id_sm_vc: estudiante.usuario_id_sm_vc,
          tipo_sm_vc: 'IMPORTANTE',
          titulo_sm_vc: `❌ Materia "${materia.nombre_sm_vc}" Reprobada`,
          contenido_sm_vc: `Has reprobado la materia en este período. Queda bloqueada hasta la apertura de un nuevo ciclo.`,
        }
      });
      this.eventEmitter_sm_vc.emit('notificacion.enviar', { receptorId: estudiante.usuario_id_sm_vc, notificacion: notifReprobado });
  
      this.eventEmitter_sm_vc.emit('entrega.actualizada_sm_vc', {
        estudianteId_sm_vc: estudianteId,
        materiaId_sm_vc: materiaId,
        estado_sm_vc: EstadoAprobacion.REPROBADO,
        es_reprobacion_global: true
      });

      return { success: true, message: 'Materia reprobada en su totalidad.' };
    } catch (err) {
      console.error('[PasantiasService] Error al reprobar materia globalmente', err);
      throw new BadRequestException('Ocurrió un error al intentar reprobar la materia globalmente.');
    }
  }

  /**
   * Obtener el progreso actual de un estudiante
   */
  async getProgresoEstudiante_sm_vc(id: number, tipo_id: 'ESTUDIANTE' | 'USUARIO' = 'USUARIO') {
    const whereClause = tipo_id === 'ESTUDIANTE' 
      ? { id_sm_vc: id } 
      : { usuario_id_sm_vc: id };

    const estudianteBase = await this.prisma.estudiante.findFirst({
      where: whereClause,
      include: { materiaActiva: true }
    });

    if (!estudianteBase || !estudianteBase.materiaActiva) {
      throw new NotFoundException('Estudiante o materia activa no encontrados');
    }

    const periodoDeLaMateria_sm_vc = estudianteBase.materiaActiva.periodo_id_sm_vc;

    const materias = await this.prisma.materia.findMany({
      where:    { periodo_id_sm_vc: periodoDeLaMateria_sm_vc },
      include:  { requisitos: true },
      orderBy:  { posicion_sm_vc: 'asc' },
    });

    if (materias.length === 0) {
      throw new NotFoundException(
        `No se encontraron materias para el período activo del estudiante (periodo_id=${periodoDeLaMateria_sm_vc}).`,
      );
    }

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

      const aprobados_list = entregasMateria.filter(e => e.estado_sm_vc === EstadoAprobacion.APROBADO);
      const aprobados = aprobados_list.length;

      const evalConNota = aprobados_list.find(e => e.evaluacion?.nota_sm_dec != null);
      const notaMateria_sm_dec = (evalConNota && evalConNota.evaluacion) 
        ? parseFloat(evalConNota.evaluacion.nota_sm_dec!.toString()) 
        : null;

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
        } else if (entregasMateria.some(e => e.estado_sm_vc === EstadoAprobacion.ENTREGADO )) {
          estadoAprobacion = EstadoAprobacion.ENTREGADO;
        } else {
          estadoAprobacion = EstadoAprobacion.PENDIENTE;
        }
      }

      return {
        estudiante_id_sm_vc: estudianteBase.id_sm_vc,
        id_sm_vc:        materia.id_sm_vc,
        nombre_sm_vc:    materia.nombre_sm_vc,
        orden_sm_int:    materia.posicion_sm_vc,
        posicion_sm_vc:  materia.posicion_sm_vc,
        periodo_id_sm_vc: materia.periodo_id_sm_vc,
        estado_aprobacion_sm_vc: estadoAprobacion,
        progreso_decimal: progresoDecimal,
        requisitos_aprobados_sm_int: aprobados,
        total_requisitos_sm_int: totalRequisitos,
        bloqueada: bloqueada,
        requisitos: requisitosMateria,
        nota_sm_dec: notaMateria_sm_dec,
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