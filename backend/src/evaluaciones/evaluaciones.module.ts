import { Module } from '@nestjs/common';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';
import { DocumentosModule } from '../documentos/documentos.module';

@Module({
  imports:     [DocumentosModule],
  controllers: [EvaluacionesController],
  providers:   [EvaluacionesService],
  exports:     [EvaluacionesService],
})
export class EvaluacionesModule {}