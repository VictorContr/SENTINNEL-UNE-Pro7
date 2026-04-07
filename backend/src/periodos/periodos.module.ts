import { Module } from '@nestjs/common';
import { PeriodosAcademicosController } from './periodos.controller';
import { PeriodosAcademicosService } from './periodos.service';

@Module({
  controllers: [PeriodosAcademicosController],
  providers: [PeriodosAcademicosService],
  exports: [PeriodosAcademicosService],
})
export class PeriodosModule {}
