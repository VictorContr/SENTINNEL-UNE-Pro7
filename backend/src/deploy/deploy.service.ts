import * as fs from 'fs';
import * as path from 'path';
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
import { CrearDeployDto_sm_vc } from './dto/crear-deploy.dto';

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
    dto:               CrearDeployDto_sm_vc,
    archivoZip:        Express.Multer.File,
    archivoPdf:        Express.Multer.File,
    usuarioActorId:    number,
  ) {
    try {
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) throw error;
      throw new InternalServerErrorException('Error al procesar el deploy en el servidor.');
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