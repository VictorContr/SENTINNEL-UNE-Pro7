import { Readable } from 'stream';
import {
  Controller, Post, Get, Patch, Param, Body,
  UploadedFiles, UseInterceptors, UseGuards,
  Request, ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DeployService } from './deploy.service';
import { CrearDeployDto_sm_vc } from './dto/crear-deploy.dto';
import { multerDeployConfig } from 'src/config/multer.config';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from 'src/auth/guards';
import { RolUsuario } from '@prisma/client';

interface RequestWithUser extends Request {
  user: { id_sm_vc: number; rol_sm_vc: RolUsuario };
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  stream: Readable;
}

@Controller('deploy')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

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
  async registrarDeploy(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Body() dto: CrearDeployDto_sm_vc,
    @UploadedFiles()
    files: {
      archivo_zip_sm_vc?: MulterFile[];
      archivo_pdf_sm_vc?: MulterFile[];
    },
    @Request() req: RequestWithUser,
  ) {
    // Validar que el estudiante solo pueda hacer deploy de su propio perfil
    if (req.user.rol_sm_vc === RolUsuario.ESTUDIANTE && req.user.id_sm_vc !== estudianteId) {
      throw new BadRequestException('Solo puedes hacer deploy de tu propio perfil.');
    }

    // Extraer archivos del interceptor
    const archivoZip_sm_vc = files.archivo_zip_sm_vc?.[0];
    const archivoPdf_sm_vc = files.archivo_pdf_sm_vc?.[0];

    if (!archivoZip_sm_vc || !archivoPdf_sm_vc) {
      throw new BadRequestException('Se requieren ambos archivos: ZIP de código y PDF de documentación.');
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
   * Obtiene el deploy registrado de un estudiante.
   * ADMIN y PROFESOR pueden ver todo. ESTUDIANTE solo el suyo.
   */
  @Get(':estudianteId')
  @Roles_sm_vc(RolUsuario.ESTUDIANTE, RolUsuario.PROFESOR, RolUsuario.ADMIN)
  async obtenerDeploy(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Request() req: RequestWithUser,
  ) {
    // Validar ownership para estudiantes
    if (req.user.rol_sm_vc === RolUsuario.ESTUDIANTE && req.user.id_sm_vc !== estudianteId) {
      throw new BadRequestException('Solo puedes ver tu propio deploy.');
    }

    return this.deployService.obtenerDeploy_sm_vc(estudianteId);
  }

  /**
   * PATCH /api/deploy/:id
   * Actualiza el deploy de un estudiante.
   * Solo ESTUDIANTE puede actualizar su propio deploy.
   */
  @Patch(':id')
  @Roles_sm_vc(RolUsuario.ESTUDIANTE)
  async actualizarDeploy(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearDeployDto_sm_vc,
    @Request() req: RequestWithUser,
  ) {
    // Validar que el estudiante solo pueda actualizar su propio deploy
    return this.deployService.actualizarDeploy_sm_vc(id, dto, req.user.id_sm_vc);
  }
}