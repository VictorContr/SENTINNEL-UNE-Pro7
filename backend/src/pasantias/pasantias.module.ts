import { Module } from '@nestjs/common';
import { PasantiasController_sm_vc } from './pasantias.controller';
import { PasantiasService_sm_vc } from './pasantias.service';
import { ConversacionesModule } from '../conversaciones/conversaciones.module';
import { DocumentosModule } from '../documentos/documentos.module';

@Module({
  imports: [ConversacionesModule, DocumentosModule],
  controllers: [PasantiasController_sm_vc],
  providers: [PasantiasService_sm_vc],
  exports: [PasantiasService_sm_vc],
})
export class PasantiasModule_sm_vc {}
