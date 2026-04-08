<<<<<<< HEAD
=======
import * as fs from 'fs';
import * as path from 'path';
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAprobacion, TipoDocumento, TipoNotificacion } from '@prisma/client';
<<<<<<< HEAD
import { CrearDeployDto } from './dto/crear-deploy.dto';

@Injectable()
export class DeployService {
  constructor(private readonly prisma: PrismaService) {}
=======
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrearDeployDto_sm_vc } from './dto/crear-deploy.dto';

@Injectable()
export class DeployService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2,
  ) {}
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a

  // ─────────────────────────────────────────────────────────────────
  // POST /api/deploy/:estudianteId
  // Registra la URL + archivos del deploy final.
  // Solo disponible cuando las 3 materias están APROBADAS.
  // ─────────────────────────────────────────────────────────────────
  async registrarDeploy_sm_vc(
    estudianteId:      number,
<<<<<<< HEAD
    dto:               CrearDeployDto,
=======
    dto:               CrearDeployDto_sm_vc,
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
    archivoZip:        Express.Multer.File,
    archivoPdf:        Express.Multer.File,
    usuarioActorId:    number,
  ) {
    try {
<<<<<<< HEAD
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

      // 7. Registrar en historial
      await this.prisma.historialTrazabilidad.create({
        data: {
          estudiante_id_sm_vc: estudianteId,
          actor_id_sm_vc:      usuarioActorId,
          accion_sm_vc:        'DEPLOY_REGISTRADO',
          detalles_sm_vc:      `Deploy registrado. URL: ${dto.url_produccion_sm_vc}. ` +
            `ZIP: ${archivoZip.originalname}. PDF: ${archivoPdf.originalname}.`,
        },
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
=======
      // 1. Verificar que el perfil del estudiante existe y tiene el flag activo
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id_sm_vc: estudianteId },
        include: { usuario: true },
      });

      if (!estudiante)
        throw new NotFoundException(`Estudiante ${estudianteId} no encontrado.`);

      if (!estudiante.puede_hacer_deploy_sm_vc) {
        throw new ForbiddenException(
          'No tienes permiso para realizar el deploy. Debes aprobar todos los requisitos de la última materia primero.',
        );
      }

      // 2. Verificar archivos
      if (!archivoZip || !archivoPdf)
        throw new BadRequestException('Se requieren ambos archivos: ZIP de código y PDF de documentación.');

      // 3. Estrategia de Naming y Almacenamiento Físico
      const uploadDir_sm_vc = path.join(process.cwd(), 'uploads', 'deploys');
      fs.mkdirSync(uploadDir_sm_vc, { recursive: true });

      const timestamp_sm_vc = Math.floor(Date.now() / 1000);
      const cedula_sm_vc = estudiante.usuario.cedula_sm_vc;

      const nombreZip_sm_vc = `${timestamp_sm_vc}_${cedula_sm_vc}_ZIP_sm_vc${path.extname(archivoZip.originalname)}`;
      const nombrePdf_sm_vc = `${timestamp_sm_vc}_${cedula_sm_vc}_PDF_sm_vc${path.extname(archivoPdf.originalname)}`;

      const rutaZip_sm_vc = path.join(uploadDir_sm_vc, nombreZip_sm_vc);
      const rutaPdf_sm_vc = path.join(uploadDir_sm_vc, nombrePdf_sm_vc);

      // Guardar archivos físicamente
      fs.writeFileSync(rutaZip_sm_vc, archivoZip.buffer);
      fs.writeFileSync(rutaPdf_sm_vc, archivoPdf.buffer);

      // 4. Transacción Atómica para Base de Datos
      const resultado_sm_vc = await this.prisma.$transaction(async (tx) => {
        // Crear documentos
        const docZip = await tx.documento.create({
          data: {
            usuario_subida_id_sm_vc: usuarioActorId,
            tipo_sm_vc:              TipoDocumento.CODIGO_ZIP,
            nombre_archivo_sm_vc:    nombreZip_sm_vc,
            ruta_archivo_sm_vc:      rutaZip_sm_vc,
            tamanio_bytes_sm_vc:     archivoZip.size,
            mime_type_sm_vc:         archivoZip.mimetype,
          },
        });

        const docPdf = await tx.documento.create({
          data: {
            usuario_subida_id_sm_vc: usuarioActorId,
            tipo_sm_vc:              TipoDocumento.DOCUMENTACION_DEPLOY,
            nombre_archivo_sm_vc:    nombrePdf_sm_vc,
            ruta_archivo_sm_vc:      rutaPdf_sm_vc,
            tamanio_bytes_sm_vc:     archivoPdf.size,
            mime_type_sm_vc:         archivoPdf.mimetype,
          },
        });

        // Upsert del deploy
        return await tx.proyectoDeploy.upsert({
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
      });

      // 5. Emitir evento de trazabilidad
      this.eventEmitter_sm_vc.emit('deploy.completado_sm_vc', {
        estudianteId: estudianteId,
        descripcion_sm_vc: `Registro de Deploy finalizado exitosamente. URL: ${dto.url_produccion_sm_vc}`,
        url_sm_vc:    dto.url_produccion_sm_vc,
      });

      return this.generarRespuesta_sm_vc(resultado_sm_vc);
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) throw error;
<<<<<<< HEAD
      throw new InternalServerErrorException('Error al registrar el deploy.');
=======
      throw new InternalServerErrorException('Error al procesar el deploy en el servidor.');
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
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

<<<<<<< HEAD
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
=======
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a

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