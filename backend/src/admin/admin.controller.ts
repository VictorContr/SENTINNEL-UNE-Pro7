import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
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
}
