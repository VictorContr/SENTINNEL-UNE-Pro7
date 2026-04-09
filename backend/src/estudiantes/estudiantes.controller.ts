import {
  Controller, Get, Param, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from 'src/auth/guards';
import { RolUsuario } from '@prisma/client';

interface RequestWithUser extends Request {
  user: { id_sm_vc: number; rol_sm_vc: RolUsuario };
}

@Controller('estudiantes')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  /**
   * GET /api/estudiantes/mis-estudiantes_sm_vc
   * Lista los estudiantes asignados al profesor autenticado,
   * con el resumen de su materia activa y progreso.
   */
  @Get('mis-estudiantes_sm_vc')
  @Roles_sm_vc(RolUsuario.PROFESOR)
  async obtenerMisEstudiantes(@Request() req: RequestWithUser) {
    return this.estudiantesService.obtenerMisEstudiantes_sm_vc(req.user.id_sm_vc);
  }

  /**
   * GET /api/estudiantes/:id/detalle
   * Ficha completa de un estudiante (historial, entregas, deploy).
   * PROFESOR ve sólo sus asignados; ADMIN ve cualquiera.
   */
  @Get(':id/detalle')
  @Roles_sm_vc(RolUsuario.PROFESOR, RolUsuario.ADMIN)
  async obtenerDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.estudiantesService.obtenerDetalleEstudiante_sm_vc(id);
  }

  /**
   * GET /api/estudiantes/:id/progreso-materias
   * Devuelve el progreso por materia para el stepper visual del front.
   * Accesible por PROFESOR, ADMIN y el propio ESTUDIANTE (mi-progreso).
   */
  @Get(':id/progreso-materias')
  @Roles_sm_vc(RolUsuario.PROFESOR, RolUsuario.ADMIN, RolUsuario.ESTUDIANTE)
  async obtenerProgresoMaterias(@Param('id', ParseIntPipe) id: number) {
    return this.estudiantesService.obtenerProgresoMaterias_sm_vc(id);
  }
}