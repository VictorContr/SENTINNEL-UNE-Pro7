import { Module } from '@nestjs/common';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';
import { DocumentosModule } from '../documentos/documentos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports:     [DocumentosModule, NotificacionesModule],
  controllers: [EvaluacionesController],
  providers:   [EvaluacionesService],
  exports:     [EvaluacionesService],
})
export class EvaluacionesModule {}