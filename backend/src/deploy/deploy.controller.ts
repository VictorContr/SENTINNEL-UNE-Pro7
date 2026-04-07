import { Readable } from 'stream';
import {
  Controller, Post, Get, Param, Body,
  UploadedFiles, UseInterceptors, UseGuards,
  Request, ParseIntPipe, BadRequestException, ForbiddenException, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DeployService } from './deploy.service';
import { CrearDeployDto_sm_vc } from './dto/crear-deploy.dto';
import { multerDeployConfig } from 'src/config/multer.config';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from 'src/auth/guards';
import { RolUsuario } from '@prisma/client';

interface RequestWithUser extends Request {
  user: {
    id_sm_vc:           number;
    rol_sm_vc:          RolUsuario;
    estudiante_sm_vc?:  { id_sm_vc: number; puede_hacer_deploy_sm_vc: boolean } | null;
  };
}

interface MulterFile {
  fieldname:    string;
  originalname: string;
  encoding:     string;
  mimetype:     string;
  size:         number;
  destination:  string;
  filename:     string;
  path:         string;
  buffer:       Buffer;
  stream:       Readable;
}

@Controller('deploy')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  /**
   * POST /api/deploy/:estudianteId
   * Registra O ACTUALIZA (upsert) el deploy final de un estudiante.
   * Solo el propio estudiante puede registrarlo/actualizarlo.
   *
   * Se eliminó el endpoint PATCH /:id redundante; el POST hace upsert
   * directamente en el servicio, lo que simplifica el flujo del cliente.
   */
  @Post(':estudianteId')
  @Roles_sm_vc(RolUsuario.ESTUDIANTE)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'archivo_zip_sm_vc', maxCount: 1 },
        { name: 'archivo_pdf_sm_vc', maxCount: 1 },
      ],
      multerDeployConfig,
    ),
  )
  async registrarDeploy_sm_vc(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Body() dto: CrearDeployDto_sm_vc,
    @UploadedFiles()
    files: {
      archivo_zip_sm_vc?: MulterFile[];
      archivo_pdf_sm_vc?: MulterFile[];
    },
    @Request() req: RequestWithUser,
  ) {
    // Verificar que el JWT del estudiante tiene perfil y coincide con el param
    const perfilId_sm_vc = req.user.estudiante_sm_vc?.id_sm_vc;

    if (!perfilId_sm_vc) {
      throw new ForbiddenException(
        'Tu cuenta de usuario no tiene un perfil de estudiante asociado.',
      );
    }

    if (perfilId_sm_vc !== estudianteId) {
      throw new ForbiddenException(
        'Solo puedes registrar el deploy de tu propio perfil de estudiante.',
      );
    }

    const archivoZip_sm_vc = files.archivo_zip_sm_vc?.[0];
    const archivoPdf_sm_vc = files.archivo_pdf_sm_vc?.[0];

    if (!archivoZip_sm_vc || !archivoPdf_sm_vc) {
      throw new BadRequestException(
        'Se requieren ambos archivos: ZIP de código y PDF de documentación.',
      );
    }

    return this.deployService.registrarDeploy_sm_vc(
      estudianteId,
      dto,
      archivoZip_sm_vc,
      archivoPdf_sm_vc,
      req.user.id_sm_vc,
    );
  }

  /**
   * GET /api/deploy/:estudianteId
   * Consulta el deploy registrado de un estudiante.
   *
   * Roles permitidos:
   *   - ESTUDIANTE: solo puede consultar su propio deploy (validado por perfilId).
   *   - PROFESOR:   puede consultar el deploy de cualquier estudiante.
   *   - ADMIN:      puede consultar cualquier deploy.
   */
  @Get(':estudianteId')
  @Roles_sm_vc(RolUsuario.ESTUDIANTE, RolUsuario.PROFESOR, RolUsuario.ADMIN)
  async obtenerDeploy_sm_vc(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Request() req: RequestWithUser,
  ) {
    // Solo se restringe si el rol es ESTUDIANTE; PROFESOR y ADMIN acceden libremente.
    if (req.user.rol_sm_vc === RolUsuario.ESTUDIANTE) {
      const perfilId_sm_vc = req.user.estudiante_sm_vc?.id_sm_vc;

      if (!perfilId_sm_vc || perfilId_sm_vc !== estudianteId) {
        throw new ForbiddenException('Solo puedes consultar tu propio deploy.');
      }
    }

    return this.deployService.obtenerDeploy_sm_vc(estudianteId);
  }

  /**
   * GET /api/deploy/:estudianteId/descargar/:tipo_sm_vc
   * Descarga el archivo zip o pdf del deploy final.
   */
  @Get(':estudianteId/descargar/:tipo_sm_vc')
  @Roles_sm_vc(RolUsuario.ESTUDIANTE, RolUsuario.PROFESOR, RolUsuario.ADMIN)
  async descargarDeploy_sm_vc(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Param('tipo_sm_vc') tipo_sm_vc: string,
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user.rol_sm_vc === RolUsuario.ESTUDIANTE) {
      const perfilId_sm_vc = req.user.estudiante_sm_vc?.id_sm_vc;
      if (!perfilId_sm_vc || perfilId_sm_vc !== estudianteId) {
        throw new ForbiddenException('Solo puedes descargar tu propio deploy.');
      }
    }

    const { stream, meta } = await this.deployService.descargarArchivo_sm_vc(estudianteId, tipo_sm_vc);

    res.set({
      'Content-Type': meta.mime,
      'Content-Disposition': `attachment; filename="${meta.nombre}"`,
    });

    return stream;
  }
}