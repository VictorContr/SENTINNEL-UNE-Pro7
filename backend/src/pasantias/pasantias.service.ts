import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAprobacion, TipoDocumento } from '@prisma/client';
import { ConversacionesService } from '../conversaciones/conversaciones.service';
import { DocumentosService } from '../documentos/documentos.service';

@Injectable()
export class PasantiasService_sm_vc {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversacionesService: ConversacionesService,
    private readonly documentosService: DocumentosService,
  ) {}

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
   * Crear una entrega física con archivo binario y trazabilidad
   */
  /**
   * Crear o actualizar una entrega física con archivo binario y trazabilidad
   * Implementa lógica de versiones: un requisito puede tener múltiples documentos (historial)
   * pero solo un registro de Entrega (estado actual).
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
      // 1. Upsert de la entrega (Crear si no existe, actualizar estado si existe)
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
          // Si se vuelve a subir, el estado pasa obligatoriamente a ENTREGADO (especialmente si estaba REPROBADO)
          estado_sm_vc: EstadoAprobacion.ENTREGADO,
          fecha_actualizacion_sm_vc: new Date(),
        },
      });

      // 2. Registrar el nuevo documento físico (Siempre se crea una nueva fila para el historial)
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
    const entrega = await this.prisma.entrega.findUnique({
      where: { id_sm_vc: entregaId },
      include: { requisito: { include: { materia: true } }, estudiante: true }
    });

    if (!entrega) throw new NotFoundException('Entrega no encontrada.');

    return await this.prisma.$transaction(async (tx) => {
      // 1. Crear/Actualizar Evaluación
      const evaluacion = await tx.evaluacion.upsert({
        where: { entrega_id_sm_vc: entregaId },
        update: {
          decision_sm_vc: decision,
          nota_sm_dec: nota ? parseFloat(nota.toFixed(2)) : null,
          observaciones_sm_vc: observaciones,
          profesor_id_sm_vc: profesorId,
        },
        create: {
          entrega_id_sm_vc: entregaId,
          profesor_id_sm_vc: profesorId,
          decision_sm_vc: decision,
          nota_sm_dec: nota ? parseFloat(nota.toFixed(2)) : null,
          observaciones_sm_vc: observaciones,
        }
      });

      // 2. Actualizar estado de la Entrega
      await tx.entrega.update({
        where: { id_sm_vc: entregaId },
        data: { estado_sm_vc: decision }
      });

      // 3. Documento de corrección (Opcional)
      if (archivoCorreccion) {
        await tx.documento.create({
          data: {
            entrega_id_sm_vc: entregaId,
            usuario_subida_id_sm_vc: profesorId,
            tipo_sm_vc: TipoDocumento.CORRECCION_PROFESOR,
            nombre_archivo_sm_vc: archivoCorreccion.originalname,
            ruta_archivo_sm_vc: archivoCorreccion.path,
            tamanio_bytes_sm_vc: archivoCorreccion.size,
            mime_type_sm_vc: archivoCorreccion.mimetype,
          }
        });
      }

      // 4. Log de trazabilidad
      const prefijoLog = decision === EstadoAprobacion.APROBADO ? '✅ Aprobado' : (decision === EstadoAprobacion.REPROBADO ? '❌ Reprobado' : '📝 Observaciones');
      const contenidoMensaje = `${prefijoLog}: Requisito **${entrega.requisito.nombre_sm_vc}**.\n\n**Nota:** ${nota || 'N/A'}\n**Profesor:** ${observaciones || 'Sin observaciones.'}`;

      await this.conversacionesService.registrarMensajeManual_sm_vc({
        estudianteId: entrega.estudiante_id_sm_vc,
        contenido_sm_vc: contenidoMensaje,
        materiaId: entrega.requisito.materia_id_sm_vc
      });

      return evaluacion;
    });
  }

  /**
   * Evaluación masiva o granular de requisitos.
   * DT-005: Si se aprueba toda la materia, se genera un log consolidado con la nota global.
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
        // 1. Forzar Entrega (UPSERT)
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

        // 2. Forzar Evaluación (UPSERT)
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

    // 3. Trazabilidad
    let mensajeLog = '';
    if (esMateriaCompleta) {
      mensajeLog = `🏆 **Materia Aprobada en Totalidad**\n\nEl profesor ha aprobado todos los requisitos de **${materia.nombre_sm_vc}**.\n\n**Calificación Global:** ${notaGlobal}\n**Comentario:** ${comentario || 'Ninguno'}`;
    } else {
      mensajeLog = `✅ **Aprobación de Requisitos (${requisitosIds.length}/${materia.requisitos.length})**\n\nEl profesor ha aprobado un lote de requisitos de la materia.\n\n${comentario || ''}`;
    }

    await this.conversacionesService.registrarMensajeManual_sm_vc({
      estudianteId: estudianteId,
      contenido_sm_vc: mensajeLog,
      materiaId: materiaId
    });

    return { success: true, count: requisitosIds.length };
  }

  /**
   * Obtener el progreso actual de un estudiante
   */
  async getProgresoEstudiante_sm_vc(usuarioId: number) {
    const estudianteBase = await this.prisma.estudiante.findFirst({
      where: { 
        OR: [
          { usuario_id_sm_vc: usuarioId },
          { id_sm_vc: usuarioId }
        ]
      },
      include: { materiaActiva: true }
    });

    if (!estudianteBase || !estudianteBase.materiaActiva) {
      throw new NotFoundException('Estudiante o materia activa no encontrados');
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

      const aprobados_list = entregasMateria.filter(e => e.estado_sm_vc === EstadoAprobacion.APROBADO);
      const aprobados = aprobados_list.length;

      // Intentar obtener la nota global si existe en alguna evaluación de la materia
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
