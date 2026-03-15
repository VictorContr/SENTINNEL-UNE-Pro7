import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard_sm_vc } from '../auth/guards';
import { PasantiasService_sm_vc } from './pasantias.service';

@Controller('pasantias')
@UseGuards(JwtAuthGuard_sm_vc)
export class PasantiasController_sm_vc {
  constructor(private readonly pasantiasService: PasantiasService_sm_vc) {}

  @Get('materias')
  async getMaterias_sm_vc() {
    return this.pasantiasService.getMaterias_sm_vc();
  }
}
