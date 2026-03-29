import { Module } from '@nestjs/common';
import { ConversacionesService } from './conversaciones.service';
import { ConversacionesController } from './conversaciones.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConversacionesService],
  controllers: [ConversacionesController],
  exports: [ConversacionesService],
})
export class ConversacionesModule {}
