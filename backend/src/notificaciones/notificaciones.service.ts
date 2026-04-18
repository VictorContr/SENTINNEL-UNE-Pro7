import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoNotificacion } from '@prisma/client';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async crearNotificacion(
    emisorId: number, 
    receptorId: number, 
    tipo: TipoNotificacion, 
    titulo: string, 
    contenido: string
  ) {
    try {
      const notif = await this.prisma.notificacion.create({
        data: {
          emisor_id_sm_vc: emisorId,
          receptor_id_sm_vc: receptorId,
          tipo_sm_vc: tipo,
          titulo_sm_vc: titulo,
          contenido_sm_vc: contenido,
        }
      });
      // Emit to Gateway via EventBus
      console.log(`[NotificacionesService] Creando notificacion para receptor ${receptorId} de tipo ${tipo}. Emitiendo notificacion.enviar para websocket...`);
      this.eventEmitter.emit('notificacion.enviar', {
        receptorId,
        notificacion: notif
      });
      return notif;
    } catch (e) {
      this.logger.error(`Error creando notificación: ${(e as Error).message}`);
    }
  }

  async getMisNotificaciones(userId: number) {
    return this.prisma.notificacion.findMany({
      where: { receptor_id_sm_vc: userId },
      orderBy: { fecha_creacion_sm_vc: 'desc' },
      take: 50
    });
  }

  async marcarLeida(id: number, userId: number) {
    const notif = await this.prisma.notificacion.findUnique({ where: { id_sm_vc: id }});
    if (notif?.receptor_id_sm_vc === userId) {
      return this.prisma.notificacion.update({
        where: { id_sm_vc: id },
        data: { leida_sm_vc: true }
      });
    }
  }

  // --- LISTENERS DE EVENTOS --- //

  @OnEvent('periodo.cambiado', { async: true })
  async handlePeriodoCambiado(payload: { emisorId: number, periodoActivoName: string }) {
    console.log(`[NotificacionesService] Evento capturado: periodo.cambiado. Generando alertas masivas...`)
    const usuariosActivos = await this.prisma.usuario.findMany({ where: { activo_sm_vc: true }, select: { id_sm_vc: true }});
    for (const u of usuariosActivos) {
       await this.crearNotificacion(payload.emisorId, u.id_sm_vc, 'IMPORTANTE', 'Cambio de Periodo', `El periodo académico ha cambiado a ${payload.periodoActivoName}.`);
    }
  }

  @OnEvent('carga_masiva.hecha', { async: true })
  async handleCargaMasivaHecha(payload: { emisorId: number, mensaje: string }) {
    const admins = await this.prisma.usuario.findMany({ where: { rol_sm_vc: 'ADMIN', activo_sm_vc: true }, select: { id_sm_vc: true }});
    for (const admin of admins) {
       await this.crearNotificacion(payload.emisorId, admin.id_sm_vc, 'INFORMATIVA', 'Carga Masiva', payload.mensaje);
    }
  }

  @OnEvent('usuario.modificado', { async: true })
  async handleUsuarioModificado(payload: { emisorId: number, accion: string, user: string }) {
    const admins = await this.prisma.usuario.findMany({ where: { rol_sm_vc: 'ADMIN', activo_sm_vc: true }, select: { id_sm_vc: true }});
    for (const admin of admins) {
       await this.crearNotificacion(payload.emisorId, admin.id_sm_vc, 'INFORMATIVA', 'Usuario actualizado', `El usuario ${payload.user} fue ${payload.accion}.`);
    }
  }

  @OnEvent('documento.subido_sm_vc', { async: true })
  async handleDocumentoEnviado(payload: { estudianteId: number, materiaId: number, descripcion_sm_vc: string, emisorId?: number }) {
    console.log(`[NotificacionesService] Evento capturado: documento.subido_sm_vc. Buscando al profesor de este estudiante.`)
    const estudianteActivo = await this.prisma.estudiante.findUnique({
      where: { id_sm_vc: payload.estudianteId },
      include: { usuario: true } // Para obtener su nombre
    });
    
    if(!estudianteActivo || !estudianteActivo.profesor_asignado_id_sm_vc) return;

    await this.crearNotificacion(
      payload.emisorId || 1, 
      estudianteActivo.profesor_asignado_id_sm_vc, 
      'IMPORTANTE', 
      'Nuevo Informe Recibido', 
      `El estudiante ${estudianteActivo.usuario?.nombre_sm_vc || ''} ha enviado un documento: ${payload.descripcion_sm_vc}`
    );
  }

  @OnEvent('documento.evaluado', { async: true })
  async handleDocumentoEvaluado(payload: { emisorId: number, estudianteId: number, decision: string, materiaName: string }) {
    console.log(`[NotificacionesService] Evento capturado: documento.evaluado. Avisando al estudiante...`)
    // Necesitamos el ID del usuario del estudiante
    const estudianteActivo = await this.prisma.estudiante.findUnique({
      where: { id_sm_vc: payload.estudianteId }
    });
    if(!estudianteActivo || !estudianteActivo.usuario_id_sm_vc) return;

    await this.crearNotificacion(payload.emisorId, estudianteActivo.usuario_id_sm_vc, 'IMPORTANTE', 'Documento Evaluado', `Tu profesor ha evaluado un documento para ${payload.materiaName} como ${payload.decision}.`);
  }
}
