import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { ConversacionesService } from './conversaciones.service';
import { JwtAuthGuard_sm_vc } from 'src/auth/guards';

@Controller('conversaciones')
@UseGuards(JwtAuthGuard_sm_vc)
export class ConversacionesController {
  constructor(private readonly conversacionesService_sm_vc: ConversacionesService) {}

  @Get(':estudianteId')
  async obtenerHistorial_sm_vc(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
  ) {
    try {
      return await this.conversacionesService_sm_vc.obtenerMensajes_sm_vc(estudianteId);
    } catch (error) {
      if (error.status) throw error;
      throw new HttpException('Error al procesar la solicitud de conversación.', 500);
    }
  }
}
