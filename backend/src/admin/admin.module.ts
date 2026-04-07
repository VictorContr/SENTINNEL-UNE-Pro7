import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PeriodosModule } from 'src/periodos/periodos.module';

/**
 * Módulo de Administración - Configuración global del sistema.
 * 
 * Se importa PeriodosModule para permitir al AdminService crear
 * y activar periodos académicos automáticamente mediante el
 * PeriodosAcademicosService.
 */
@Module({
  imports: [PrismaModule, PeriodosModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
