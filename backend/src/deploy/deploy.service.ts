import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAprobacion, TipoDocumento, TipoNotificacion } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrearDeployDto } from './dto/crear-deploy.dto';

@Injectable()
export class DeployService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // POST /api/deploy/:estudianteId
  // Registra la URL + archivos del deploy final.
  // Solo disponible cuando las 3 materias están APROBADAS.
  // ─────────────────────────────────────────────────────────────────
  async registrarDeploy_sm_vc(
    estudianteId:      number,
    dto:               CrearDeployDto,
    archivoZip:        Express.Multer.File,
    archivoPdf:        Express.Multer.File,
    usuarioActorId:    number,
  ) {
    try {
      // 1. Verificar que el perfil del estudiante existe
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id_sm_vc: estudianteId },
        include: {
          usuario: true,
          materiaActiva: { include: { requisitos: true } },
        },
      });
      if (!estudiante)
        throw new NotFoundException(`Estudiante ${estudianteId} no encontrado.`);

      // 2. Verificar que el usuario actuante ES el estudiante o un ADMIN
      if (estudiante.usuario_id_sm_vc !== usuarioActorId) {
        const actor = await this.prisma.usuario.findUnique({
          where: { id_sm_vc: usuarioActorId },
        });
        if (actor?.rol_sm_vc !== 'ADMIN')
          throw new ForbiddenException('Solo el propio estudiante o un Admin puede registrar el deploy.');
      }

      // 3. Verificar que TODAS las materias estén aprobadas (condición de desbloqueo)
      await this.validarMateriasTodosAprobadas_sm_vc(
        estudianteId,
        estudiante.materiaActiva.periodo_sm_vc,
      );

      // 4. Verificar que se subieron ambos archivos
      if (!archivoZip)
        throw new BadRequestException('El archivo ZIP con el código fuente es obligatorio.');
      if (!archivoPdf)
        throw new BadRequestException('El PDF de documentación técnica es obligatorio.');

      // 5. Crear los dos registros de documento en la BD
      const docZip = await this.prisma.documento.create({
        data: {
          usuario_subida_id_sm_vc: usuarioActorId,
          tipo_sm_vc:              TipoDocumento.CODIGO_ZIP,
          nombre_archivo_sm_vc:    archivoZip.originalname,
          ruta_archivo_sm_vc:      archivoZip.path,
          tamanio_bytes_sm_vc:     archivoZip.size,
          mime_type_sm_vc:         archivoZip.mimetype,
        },
      });

      const docPdf = await this.prisma.documento.create({
        data: {
          usuario_subida_id_sm_vc: usuarioActorId,
          tipo_sm_vc:              TipoDocumento.DOCUMENTACION_DEPLOY,
          nombre_archivo_sm_vc:    archivoPdf.originalname,
          ruta_archivo_sm_vc:      archivoPdf.path,
          tamanio_bytes_sm_vc:     archivoPdf.size,
          mime_type_sm_vc:         archivoPdf.mimetype,
        },
      });

      // 6. Upsert del deploy (permite actualizar si ya existe)
      const deploy = await this.prisma.proyectoDeploy.upsert({
        where:  { estudiante_id_sm_vc: estudianteId },
        create: {
          estudiante_id_sm_vc:            estudianteId,
          url_produccion_sm_vc:           dto.url_produccion_sm_vc,
          archivo_codigo_id_sm_vc:        docZip.id_sm_vc,
          documentacion_tecnica_id_sm_vc: docPdf.id_sm_vc,
        },
        update: {
          url_produccion_sm_vc:           dto.url_produccion_sm_vc,
          archivo_codigo_id_sm_vc:        docZip.id_sm_vc,
          documentacion_tecnica_id_sm_vc: docPdf.id_sm_vc,
          fecha_deploy_sm_vc:             new Date(),
        },
        include: {
          archivoCodigo:        true,
          documentacionTecnica: true,
        },
      });

      // 7. Emitir evento de trazabilidad
      this.eventEmitter_sm_vc.emit('materia.aprobada_sm_vc', {
        estudianteId: estudianteId,
        descripcion_sm_vc: `🚀 Deploy registrado exitosamente. URL: ${dto.url_produccion_sm_vc}`,
      });

      // 8. Notificar al estudiante
      await this.prisma.notificacion.create({
        data: {
          emisor_id_sm_vc:   usuarioActorId,
          receptor_id_sm_vc: estudiante.usuario_id_sm_vc,
          tipo_sm_vc:        TipoNotificacion.INFORMATIVA,
          titulo_sm_vc:      '🚀 Deploy del Proyecto Final registrado',
          contenido_sm_vc:   `Tu proyecto en "${dto.url_produccion_sm_vc}" fue registrado exitosamente con toda la documentación requerida.`,
        },
      });

      return this.generarRespuesta_sm_vc(deploy);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) throw error;
      throw new InternalServerErrorException('Error al registrar el deploy.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/deploy/:estudianteId
  // Obtiene el deploy registrado de un estudiante.
  // ─────────────────────────────────────────────────────────────────
  async obtenerDeploy_sm_vc(estudianteId: number) {
    const deploy = await this.prisma.proyectoDeploy.findUnique({
      where: { estudiante_id_sm_vc: estudianteId },
      include: {
        archivoCodigo:        true,
        documentacionTecnica: true,
      },
    });
    if (!deploy)
      throw new NotFoundException(`El estudiante ${estudianteId} no tiene un deploy registrado.`);
    return this.generarRespuesta_sm_vc(deploy);
  }

  // ─────────────────────────────────────────────────────────────────
  // Valida que todas las materias del periodo estén APROBADAS
  // ─────────────────────────────────────────────────────────────────
  private async validarMateriasTodosAprobadas_sm_vc(
    estudianteId: number,
    periodo: string,
  ) {
    const materias = await this.prisma.materia.findMany({
      where: { periodo_sm_vc: periodo },
      include: { requisitos: true },
    });

    const entregas = await this.prisma.entrega.findMany({
      where: { estudiante_id_sm_vc: estudianteId },
    });

    for (const materia of materias) {
      const todasAprobadas = materia.requisitos.every((req) => {
        const entrega = entregas.find((e) => e.requisito_id_sm_vc === req.id_sm_vc);
        return entrega?.estado_sm_vc === EstadoAprobacion.APROBADO;
      });
      if (!todasAprobadas) {
        throw new ForbiddenException(
          `No puedes registrar el deploy hasta aprobar todos los requisitos de "${materia.nombre_sm_vc}".`,
        );
      }
    }
  }

  private generarRespuesta_sm_vc(deploy: any) {
    return {
      id_sm_vc:                deploy.id_sm_vc,
      estudiante_id_sm_vc:     deploy.estudiante_id_sm_vc,
      url_produccion_sm_vc:    deploy.url_produccion_sm_vc,
      fecha_deploy_sm_vc:      deploy.fecha_deploy_sm_vc,
      archivo_codigo_sm_vc: {
        id_sm_vc:             deploy.archivoCodigo?.id_sm_vc,
        nombre_sm_vc:         deploy.archivoCodigo?.nombre_archivo_sm_vc,
        tamanio_bytes_sm_vc:  deploy.archivoCodigo?.tamanio_bytes_sm_vc,
      },
      documentacion_sm_vc: {
        id_sm_vc:             deploy.documentacionTecnica?.id_sm_vc,
        nombre_sm_vc:         deploy.documentacionTecnica?.nombre_archivo_sm_vc,
        tamanio_bytes_sm_vc:  deploy.documentacionTecnica?.tamanio_bytes_sm_vc,
      },
    };
  }
}