import { Controller, Get, Put, Post, Body, Param, Res, StreamableFile, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { ActualizarPeriodoDto } from './dto/actualizar-periodo.dto';
import {
  JwtAuthGuard_sm_vc,
  RolesGuard_sm_vc,
  Roles_sm_vc,
} from 'src/auth/guards';
import { RolUsuario } from '@prisma/client';

/**
 * Controlador de Administración - Endpoints para configuración global
 * Todas las rutas requieren autenticación y rol de ADMIN
 */
@Controller('admin')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Obtiene el periodo académico actual
   * GET /admin/configuracion/periodo
   * @returns Configuración actual del sistema
   */
  @Get('configuracion/periodo')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async obtenerPeriodoActual() {
    return this.adminService.obtenerPeriodoActual();
  }

  /**
   * Actualiza el periodo académico actual
   * PUT /admin/configuracion/periodo
   * @param dto - DTO con el nuevo periodo
   * @returns Configuración actualizada
   */
  @Put('configuracion/periodo')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async actualizarPeriodo(@Body() dto: ActualizarPeriodoDto) {
    return this.adminService.actualizarPeriodo(dto);
  }

  /**
   * Procesa la carga masiva de usuarios y requisitos vía XLSX
   * POST /admin/carga-masiva
   */
  @Post('carga-masiva')
  @Roles_sm_vc(RolUsuario.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'usuarios', maxCount: 1 },
      { name: 'requisitos', maxCount: 1 },
    ]),
  )
  async cargaMasiva(
    @UploadedFiles()
    files: {
      usuarios?: Express.Multer.File[];
      requisitos?: Express.Multer.File[];
    },
    @Body('modo') modo: string,
  ) {
    if (!files || !files.usuarios || !files.requisitos) {
      throw new BadRequestException('Se requieren ambos archivos (usuarios y requisitos) para la carga.');
    }

    if (!modo || !['eliminar', 'continuar'].includes(modo)) {
      throw new BadRequestException('Modo de carga inválido.');
    }

    return this.adminService.procesarCargaMasiva(
      files.usuarios[0],
      files.requisitos[0],
      modo,
    );
  }

  /**
   * Genera un excel con los datos vivos actuales (Backup)
   * GET /admin/descargar-datos/:tipo
   */
  @Get('descargar-datos/:tipo')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async descargarDatos(
    @Param('tipo') tipo: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    if (!['usuarios', 'requisitos'].includes(tipo)) {
      throw new BadRequestException('Tipo de descarga inválido.');
    }

    const { buffer, fileName } = await this.adminService.generarBackupDatos(tipo);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(buffer);
  }

  /**
   * Valida array de cedulas y correos contra la base de datos para detectar pre-duplicados
   * POST /admin/validar-duplicados
   */
  @Post('validar-duplicados')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async validarDuplicados(@Body() data: { cedulas: string[], correos: string[] }) {
    return this.adminService.validarDuplicados(data.cedulas, data.correos);
  }
}
