import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, ParseIntPipe, BadRequestException,
  NotFoundException, Delete,
} from '@nestjs/common';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from '../auth/guards';
import { PeriodosAcademicosService } from './periodos.service';
import { CreatePeriodoDto_sm_vc } from './dto/create-periodo.dto';
import { UpdatePeriodoDto_sm_vc } from './dto/update-periodo.dto';
import { RolUsuario } from '@prisma/client';

@Controller('periodos')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class PeriodosAcademicosController {
  constructor(private readonly periodosService: PeriodosAcademicosService) {}

  @Get()
  @Roles_sm_vc(RolUsuario.ADMIN, RolUsuario.PROFESOR, RolUsuario.ESTUDIANTE)
  async findAll() {
    return this.periodosService.findAll_sm_vc();
  }

  @Get('activo')
  @Roles_sm_vc(RolUsuario.ADMIN, RolUsuario.PROFESOR, RolUsuario.ESTUDIANTE)
  async findActivo() {
    return this.periodosService.findActivo_sm_vc();
  }

  @Get(':id')
  @Roles_sm_vc(RolUsuario.ADMIN, RolUsuario.PROFESOR, RolUsuario.ESTUDIANTE)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.findOne_sm_vc(id);
  }

  @Post()
  @Roles_sm_vc(RolUsuario.ADMIN)
  async create(@Body() createPeriodoDto: CreatePeriodoDto_sm_vc) {
    return this.periodosService.create_sm_vc(createPeriodoDto);
  }

  // El PATCH solicitado para corregir o editar fechas de un período activo (o cualquier otro)
  @Patch(':id')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodoDto: UpdatePeriodoDto_sm_vc,
  ) {
    return this.periodosService.update_sm_vc(id, updatePeriodoDto);
  }

  @Patch(':id/activar')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async activar(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.activar_sm_vc(id);
  }

  @Patch(':id/desactivar')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.desactivar_sm_vc(id);
  }

  @Delete(':id')
  @Roles_sm_vc(RolUsuario.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.periodosService.remove_sm_vc(id);
  }
}
