import {
  Controller, Post, Get, Param, Body,
  UseGuards, Request, ParseIntPipe,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvaluacionesService } from './evaluaciones.service';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from 'src/auth/guards';
import { RolUsuario } from '@prisma/client';
import { multerDocumentosConfig } from 'src/config/multer.config';

interface RequestWithUser extends Request {
  user: { id_sm_vc: number; rol_sm_vc: RolUsuario };
}

@Controller('evaluaciones')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  /**
   * POST /api/evaluaciones
   * Evalúa una entrega. Si se aprueba el último requisito de la
   * materia, desbloquea automáticamente la siguiente.
   * Rol requerido: PROFESOR
   */
  @Post()
  @Roles_sm_vc(RolUsuario.PROFESOR)
  @UseInterceptors(FileInterceptor('archivo_correccion_sm_vc', multerDocumentosConfig))
  async evaluarEntrega(
    @Body() dto: CrearEvaluacionDto,
    @Request() req: RequestWithUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.evaluacionesService.evaluarEntrega_sm_vc(dto, req.user.id_sm_vc, file);
  }

  /**
   * GET /api/evaluaciones/entrega/:entregaId
   * Consulta la evaluación de una entrega puntual.
   * Roles: PROFESOR, ADMIN
   */
  @Get('entrega/:entregaId')
  @Roles_sm_vc(RolUsuario.PROFESOR, RolUsuario.ADMIN)
  async obtenerEvaluacion(
    @Param('entregaId', ParseIntPipe) entregaId: number,
  ) {
    return this.evaluacionesService.obtenerEvaluacionDeEntrega_sm_vc(entregaId);
  }
}