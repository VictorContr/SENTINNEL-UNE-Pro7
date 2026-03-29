import { Module } from '@nestjs/common';
import { PasantiasController_sm_vc } from './pasantias.controller';
import { PasantiasService_sm_vc } from './pasantias.service';

@Module({
  controllers: [PasantiasController_sm_vc],
  providers: [PasantiasService_sm_vc],
  exports: [PasantiasService_sm_vc],
})
export class PasantiasModule_sm_vc {}
