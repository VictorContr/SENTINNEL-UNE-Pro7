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
