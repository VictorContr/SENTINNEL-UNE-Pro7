import * as fs from 'fs';
import * as path from 'path';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  StreamableFile,
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
  // Registra o ACTUALIZA (upsert) el deploy final del estudiante.
  // Si ya existe un deploy previo, los documentos viejos son eliminados
  // (físicamente del disco y de la BD) antes de guardar los nuevos.
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
      const estudiante_sm_vc = await this.prisma.estudiante.findUnique({
        where: { id_sm_vc: estudianteId },
        include: { usuario: true },
      });

      if (!estudiante_sm_vc)
        throw new NotFoundException(`Estudiante ${estudianteId} no encontrado.`);

      if (!estudiante_sm_vc.puede_hacer_deploy_sm_vc) {
        throw new ForbiddenException(
          'No tienes permiso para realizar el deploy. Debes aprobar todos los requisitos de la última materia primero.',
        );
      }

      // 2. Verificar que los archivos llegaron correctamente
      if (!archivoZip || !archivoPdf)
        throw new BadRequestException('Se requieren ambos archivos: ZIP de código y PDF de documentación.');

      // 3. Buscar deploy previo ANTES de crear nada (para limpiar después)
      const deployPrevio_sm_vc = await this.prisma.proyectoDeploy.findUnique({
        where: { estudiante_id_sm_vc: estudianteId },
        include: {
          archivoCodigo:        true,
          documentacionTecnica: true,
        },
      });

      // 4. Estrategia de Naming y Almacenamiento Físico de los NUEVOS archivos
      const uploadDir_sm_vc = path.join(process.cwd(), 'uploads', 'deploys');
      fs.mkdirSync(uploadDir_sm_vc, { recursive: true });

      const timestamp_sm_vc = Math.floor(Date.now() / 1000);
      const cedula_sm_vc = estudiante_sm_vc.usuario.cedula_sm_vc;

      const nombreZip_sm_vc = `${timestamp_sm_vc}_${cedula_sm_vc}_ZIP_sm_vc${path.extname(archivoZip.originalname)}`;
      const nombrePdf_sm_vc = `${timestamp_sm_vc}_${cedula_sm_vc}_PDF_sm_vc${path.extname(archivoPdf.originalname)}`;

      const rutaZip_sm_vc = path.join(uploadDir_sm_vc, nombreZip_sm_vc);
      const rutaPdf_sm_vc = path.join(uploadDir_sm_vc, nombrePdf_sm_vc);

      // Guardar archivos físicamente en disco
      fs.writeFileSync(rutaZip_sm_vc, archivoZip.buffer);
      fs.writeFileSync(rutaPdf_sm_vc, archivoPdf.buffer);

      // 5. Transacción Atómica: crear nuevos documentos + upsert del deploy
      const resultado_sm_vc = await this.prisma.$transaction(async (tx) => {
        // Crear los nuevos registros de documentos
        const docZip_sm_vc = await tx.documento.create({
          data: {
            usuario_subida_id_sm_vc: usuarioActorId,
            tipo_sm_vc:              TipoDocumento.CODIGO_ZIP,
            nombre_archivo_sm_vc:    nombreZip_sm_vc,
            nombre_original_sm_vc:   archivoZip.originalname,
            ruta_archivo_sm_vc:      rutaZip_sm_vc,
            tamanio_bytes_sm_vc:     archivoZip.size,
            mime_type_sm_vc:         archivoZip.mimetype,
          },
        });

        const docPdf_sm_vc = await tx.documento.create({
          data: {
            usuario_subida_id_sm_vc: usuarioActorId,
            tipo_sm_vc:              TipoDocumento.DOCUMENTACION_DEPLOY,
            nombre_archivo_sm_vc:    nombrePdf_sm_vc,
            nombre_original_sm_vc:   archivoPdf.originalname,
            ruta_archivo_sm_vc:      rutaPdf_sm_vc,
            tamanio_bytes_sm_vc:     archivoPdf.size,
            mime_type_sm_vc:         archivoPdf.mimetype,
          },
        });

        // Upsert del registro de deploy: crea si no existe, actualiza si existe.
        // En la rama 'update' sobrescribimos IDs apuntando a los nuevos documentos.
        const deployUpsert_sm_vc = await tx.proyectoDeploy.upsert({
          where:  { estudiante_id_sm_vc: estudianteId },
          create: {
            estudiante_id_sm_vc:            estudianteId,
            url_produccion_sm_vc:           dto.url_produccion_sm_vc,
            archivo_codigo_id_sm_vc:        docZip_sm_vc.id_sm_vc,
            documentacion_tecnica_id_sm_vc: docPdf_sm_vc.id_sm_vc,
          },
          update: {
            url_produccion_sm_vc:           dto.url_produccion_sm_vc,
            archivo_codigo_id_sm_vc:        docZip_sm_vc.id_sm_vc,
            documentacion_tecnica_id_sm_vc: docPdf_sm_vc.id_sm_vc,
            fecha_deploy_sm_vc:             new Date(),
          },
          include: {
            archivoCodigo:        true,
            documentacionTecnica: true,
          },
        });

        // 6. Eliminar los documentos VIEJOS de la BD (dentro de la transacción,
        //    después del upsert para evitar FK violations por las relaciones).
        if (deployPrevio_sm_vc) {
          const idsViejos_sm_vc = [
            deployPrevio_sm_vc.archivoCodigo?.id_sm_vc,
            deployPrevio_sm_vc.documentacionTecnica?.id_sm_vc,
          ].filter(Boolean) as number[];

          if (idsViejos_sm_vc.length > 0) {
            await tx.documento.deleteMany({
              where: { id_sm_vc: { in: idsViejos_sm_vc } },
            });
          }
        }

        return deployUpsert_sm_vc;
      });

      // 7. Eliminar archivos físicos viejos del disco (fuera de la TX para
      //    no bloquear; si esto falla, solo es un leak de archivo, no un error de datos).
      if (deployPrevio_sm_vc) {
        this.eliminarArchivosViejos_sm_vc([
          deployPrevio_sm_vc.archivoCodigo?.ruta_archivo_sm_vc,
          deployPrevio_sm_vc.documentacionTecnica?.ruta_archivo_sm_vc,
        ]);
      }

      // 8. Emitir evento de trazabilidad
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
  // Accesible por ESTUDIANTE (propio), PROFESOR y ADMIN.
  // ─────────────────────────────────────────────────────────────────
  async obtenerDeploy_sm_vc(estudianteId: number) {
    const deploy_sm_vc = await this.prisma.proyectoDeploy.findFirst({
      where: {
        OR: [
          { estudiante_id_sm_vc: estudianteId },
          { estudiante: { usuario_id_sm_vc: estudianteId } }
        ]
      },
      include: {
        estudiante: {
          include: { usuario: true }
        },
        archivoCodigo:        true,
        documentacionTecnica: true,
      },
    });

    if (!deploy_sm_vc)
      throw new NotFoundException(`El estudiante ${estudianteId} no tiene un deploy registrado.`);

    return this.generarRespuesta_sm_vc(deploy_sm_vc);
  }

  // ─────────────────────────────────────────────────────────────────
  // Método privado: eliminar rutas de disco de forma silenciosa.
  // ─────────────────────────────────────────────────────────────────
  async descargarArchivo_sm_vc(estudianteId: number, tipo_sm_vc: string): Promise<{ stream: StreamableFile, meta: any }> {
    const deploy_sm_vc = await this.prisma.proyectoDeploy.findFirst({
      where: {
        OR: [
          { estudiante_id_sm_vc: estudianteId },
          { estudiante: { usuario_id_sm_vc: estudianteId } }
        ]
      },
      include: {
        archivoCodigo: true,
        documentacionTecnica: true,
      },
    });

    if (!deploy_sm_vc) {
      throw new NotFoundException(`El estudiante ${estudianteId} no tiene un deploy registrado.`);
    }

    let documento = null;
    if (tipo_sm_vc === 'zip' || tipo_sm_vc === 'codigo') {
      documento = deploy_sm_vc.archivoCodigo;
    } else if (tipo_sm_vc === 'pdf' || tipo_sm_vc === 'documentacion') {
      documento = deploy_sm_vc.documentacionTecnica;
    } else {
      throw new BadRequestException('Tipo de archivo no válido. Use zip o pdf.');
    }

    if (!documento) {
      throw new NotFoundException('El archivo solicitado no se encontró en este deploy.');
    }

    if (documento.mock_sm_vc) {
      throw new BadRequestException('Este es un documento de simulación (MOCK) para la demostración académica y no tiene un archivo físico asociado.');
    }

    let fullPath = documento.ruta_archivo_sm_vc;
    if (!path.isAbsolute(fullPath)) {
      fullPath = path.join(process.cwd(), fullPath);
    }

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('El archivo físico no fue encontrado en el servidor.');
    }

    const fileStream = fs.createReadStream(fullPath);
    return {
      stream: new StreamableFile(fileStream),
      meta: {
        nombre: documento.nombre_original_sm_vc || documento.nombre_archivo_sm_vc,
        mime: documento.mime_type_sm_vc || 'application/octet-stream',
      }
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Método privado: eliminar rutas de disco de forma silenciosa.
  // ─────────────────────────────────────────────────────────────────
  private eliminarArchivosViejos_sm_vc(rutas_sm_vc: (string | null | undefined)[]) {
    for (const ruta_sm_vc of rutas_sm_vc) {
      if (!ruta_sm_vc) continue;
      try {
        if (fs.existsSync(ruta_sm_vc)) {
          fs.unlinkSync(ruta_sm_vc);
        }
      } catch (e) {
        // No propagamos el error: es una limpieza cosmética opcional.
        console.warn(`[DeployService] No se pudo eliminar archivo físico: ${ruta_sm_vc}`, e);
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
        nombre_sm_vc:         deploy.archivoCodigo?.nombre_original_sm_vc || deploy.archivoCodigo?.nombre_archivo_sm_vc,
        tamanio_bytes_sm_vc:  deploy.archivoCodigo?.tamanio_bytes_sm_vc,
        ruta_archivo_sm_vc:   deploy.archivoCodigo?.ruta_archivo_sm_vc,
        mock_sm_vc:           deploy.archivoCodigo?.mock_sm_vc,
      },
      documentacion_sm_vc: {
        id_sm_vc:             deploy.documentacionTecnica?.id_sm_vc,
        nombre_sm_vc:         deploy.documentacionTecnica?.nombre_original_sm_vc || deploy.documentacionTecnica?.nombre_archivo_sm_vc,
        tamanio_bytes_sm_vc:  deploy.documentacionTecnica?.tamanio_bytes_sm_vc,
        ruta_archivo_sm_vc:   deploy.documentacionTecnica?.ruta_archivo_sm_vc,
        mock_sm_vc:           deploy.documentacionTecnica?.mock_sm_vc,
      },
    };
  }
}