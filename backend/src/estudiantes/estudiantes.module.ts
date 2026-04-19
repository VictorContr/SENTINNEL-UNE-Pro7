import { Module } from '@nestjs/common';
import { EstudiantesController } from './estudiantes.controller';
import { EstudiantesService } from './estudiantes.service';
import { ConversacionesModule } from '../conversaciones/conversaciones.module';

@Module({
  imports:     [ConversacionesModule],   // ← Expone ConversacionesService para inyección
  controllers: [EstudiantesController],
  providers:   [EstudiantesService],
  exports:     [EstudiantesService],
})
export class EstudiantesModule {}