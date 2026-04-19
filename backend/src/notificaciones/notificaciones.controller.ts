import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard_sm_vc } from '../auth/guards';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard_sm_vc)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  async getMisNotificaciones(@Request() req: any) {
    // req.user has been attached by JwtAuthGuard_sm_vc
    const userId = req.user.id_sm_vc;
    return this.notificacionesService.getMisNotificaciones(userId);
  }

  @Patch(':id/leida')
  async marcarLeida(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id_sm_vc;
    return this.notificacionesService.marcarLeida(parseInt(id), userId);
  }
}
