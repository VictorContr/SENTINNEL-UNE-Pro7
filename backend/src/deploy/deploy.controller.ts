import {
<<<<<<< HEAD
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DeployService } from './deploy.service';
import { CrearDeployDto } from './dto/crear-deploy.dto';
import { multerDeployConfig } from 'src/config/multer.config';
import {
  JwtAuthGuard_sm_vc,
  RolesGuard_sm_vc,
  Roles_sm_vc,
} from 'src/auth/guards';
=======
  Controller, Post, Get, Param, Body,
  UploadedFiles, UseInterceptors, UseGuards,
  Request, ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DeployService } from './deploy.service';
import { CrearDeployDto_sm_vc } from './dto/crear-deploy.dto';
import { multerDeployConfig } from 'src/config/multer.config';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from 'src/auth/guards';
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
import { RolUsuario } from '@prisma/client';

interface RequestWithUser extends Request {
  user: { id_sm_vc: number; rol_sm_vc: RolUsuario };
}

@Controller('deploy')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

<<<<<<< HEAD
  /**
   * POST /api/deploy/:estudianteId
   * Registra el deploy final: URL + archivo ZIP + PDF de documentación.
   * Requiere que las 3 materias estén aprobadas.
   * Usa FileFields para manejar 2 archivos en un mismo request:
   *   - campo "codigo"       → ZIP del código fuente
   *   - campo "documentacion" → PDF técnico
   */
=======
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
  @Post(':estudianteId')
  @Roles_sm_vc(RolUsuario.ESTUDIANTE, RolUsuario.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
<<<<<<< HEAD
        { name: 'codigo', maxCount: 1 },
        { name: 'documentacion', maxCount: 1 },
=======
        { name: 'archivo_zip_sm_vc', maxCount: 1 },
        { name: 'archivo_pdf_sm_vc', maxCount: 1 },
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
      ],
      multerDeployConfig,
    ),
  )
  async registrarDeploy(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
<<<<<<< HEAD
    @Body() dto: CrearDeployDto,
    @UploadedFiles()
    files: {
      codigo?: Express.Multer.File[];
      documentacion?: Express.Multer.File[];
    },
    @Request() req: RequestWithUser,
  ) {
    return this.deployService.registrarDeploy_sm_vc(
      estudianteId,
      dto,
      files?.codigo?.[0]!,
      files?.documentacion?.[0]!,
=======
    @Body() dto: CrearDeployDto_sm_vc,
    @UploadedFiles()
    files: {
      archivo_zip_sm_vc?: Express.Multer.File[];
      archivo_pdf_sm_vc?: Express.Multer.File[];
    },
    @Request() req: RequestWithUser,
  ) {
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
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
