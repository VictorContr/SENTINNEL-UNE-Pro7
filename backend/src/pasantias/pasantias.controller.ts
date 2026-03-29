import { Controller, Get, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from '../auth/guards';
import { PasantiasService_sm_vc } from './pasantias.service';
import { CreateEntregaDto_sm_vc } from './dto/create-entrega.dto';

interface RequestWithUser extends Request {
  user: {
    id_sm_vc: number;
    correo: string;
    rol: string;
  };
}

@Controller('pasantias')
@UseGuards(JwtAuthGuard_sm_vc)
export class PasantiasController_sm_vc {
  constructor(private readonly pasantiasService: PasantiasService_sm_vc) {}

  @Get('materias')
  async getMaterias_sm_vc() {
    return this.pasantiasService.getMaterias_sm_vc();
  }

  @Post('entregas')
  @Roles_sm_vc('ESTUDIANTE')
  async crearEntrega_sm_vc(@Request() req: RequestWithUser, @Body() createEntregaDto: CreateEntregaDto_sm_vc) {
    // El ID del estudiante viene del token JWT
    const estudianteId = req.user.id_sm_vc;
    return this.pasantiasService.crearEntrega_sm_vc(estudianteId, createEntregaDto.requisito_id_sm_vc);
  }

  @Get('estudiantes/:id/progreso')
  async getProgresoEstudiante_sm_vc(@Param('id') id: string) {
    return this.pasantiasService.getProgresoEstudiante_sm_vc(parseInt(id));
  }

  @Get('estudiantes/mi-progreso')
  @Roles_sm_vc('ESTUDIANTE')
  async getMiProgreso_sm_vc(@Request() req: RequestWithUser) {
    const estudianteId = req.user.id_sm_vc;
    return this.pasantiasService.getProgresoEstudiante_sm_vc(estudianteId);
  }
}
