import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpException,
  Req,
} from '@nestjs/common';
import { ConversacionesService } from './conversaciones.service';
import { JwtAuthGuard_sm_vc } from 'src/auth/guards';

@Controller('conversaciones')
@UseGuards(JwtAuthGuard_sm_vc)
export class ConversacionesController {
  constructor(private readonly conversacionesService_sm_vc: ConversacionesService) {}

  /**
   * GET /api/conversaciones/:estudianteId
   */
  @Get(':estudianteId')
  async obtenerHistorial_sm_vc(
    @Req() req: any,
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Query('materiaId') materiaId?: string,
    @Query('posicion') posicion?: string,
    @Query('intento') intento?: string,
  ) {
    try {
      const materiaIdParsed_sm_vc = materiaId != null ? parseInt(materiaId, 10) : undefined;
      const posicionParsed_sm_vc  = posicion != null ? parseInt(posicion, 10) : undefined;
      const intentoParsed_sm_vc   = intento != null ? parseInt(intento, 10) : undefined;

      // ✅ FIX VITAL: Confiamos en el ID que manda el frontend en la URL.
      // Al forzar el uso del ID del Token, estábamos mezclando IDs de Usuario 
      // con IDs de Estudiante, causando que un alumno viera el chat de otro.
      const targetId = estudianteId;

      return await this.conversacionesService_sm_vc.obtenerMensajes_sm_vc(
        targetId, 
        materiaIdParsed_sm_vc,
        posicionParsed_sm_vc,
        intentoParsed_sm_vc,
      );
    } catch (error) {
      if (error.status) throw error;
      throw new HttpException('Error al procesar la solicitud de conversación.', 500);
    }
  }
}