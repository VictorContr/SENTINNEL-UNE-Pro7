import {
  Controller, Post, Get, Param, Body,
  UploadedFiles, UseInterceptors, UseGuards,
  Request, ParseIntPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DeployService } from './deploy.service';
import { CrearDeployDto } from './dto/crear-deploy.dto';
import { multerDeployConfig } from 'src/config/multer.config';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from 'src/auth/guards';
import { RolUsuario } from '@prisma/client';

interface RequestWithUser extends Request {
  user: { id_sm_vc: number; rol_sm_vc: RolUsuario };
}

@Controller('deploy')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  /**
   * POST /api/deploy/:estudianteId
   * Registra el deploy final: URL + archivo ZIP + PDF de documentación.
   * Requiere que las 3 materias estén aprobadas.
   * Usa FileFields para manejar 2 archivos en un mismo request:
   *   - campo "codigo"       → ZIP del código fuente
   *   - campo "documentacion" → PDF técnico
   */
  @Post(':estudianteId')
  @Roles_sm_vc(RolUsuario.ESTUDIANTE, RolUsuario.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'codigo',        maxCount: 1 },
        { name: 'documentacion', maxCount: 1 },
      ],
      multerDeployConfig,
    ),
  )
  async registrarDeploy(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Body() dto: CrearDeployDto,
    @UploadedFiles()
    files: {
      codigo?:        Express.Multer.File[];
      documentacion?: Express.Multer.File[];
    },
    @Request() req: RequestWithUser,
  ) {
    return this.deployService.registrarDeploy_sm_vc(
      estudianteId,
      dto,
      files?.codigo?.[0] as Express.Multer.File,
      files?.documentacion?.[0] as Express.Multer.File,
      req.user.id_sm_vc,
    );
  }

  /**
   * GET /api/deploy/:estudianteId
   * Obtiene el deploy registrado de un estudiante.
   */
  @Get(':estudianteId')
  @Roles_sm_vc(RolUsuario.ESTUDIANTE, RolUsuario.PROFESOR, RolUsuario.ADMIN)
  async obtenerDeploy(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
  ) {
    return this.deployService.obtenerDeploy_sm_vc(estudianteId);
  }
}