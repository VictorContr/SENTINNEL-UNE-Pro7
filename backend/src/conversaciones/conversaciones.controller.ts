import {
  Controller,
  Get,
  Param,
  Query,
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

  /**
   * GET /api/conversaciones/:estudianteId
   * Query params opcionales:
   *   - materiaId (number): Si se envía, filtra el historial por esa materia.
   *                         Si se omite, devuelve el historial global completo.
   *
   * Ejemplo segmentado: GET /api/conversaciones/9?materiaId=1
   * Ejemplo global:     GET /api/conversaciones/9
   */
  @Get(':estudianteId')
  async obtenerHistorial_sm_vc(
    @Param('estudianteId', ParseIntPipe) estudianteId: number,
    @Query('materiaId') materiaId?: string,
  ) {
    try {
      // Convertir el query param string a number, o dejar undefined si no viene
      const materiaIdParsed_sm_vc = materiaId != null ? parseInt(materiaId, 10) : undefined;

      return await this.conversacionesService_sm_vc.obtenerMensajes_sm_vc(
        estudianteId,
        materiaIdParsed_sm_vc,
      );
    } catch (error) {
      if (error.status) throw error;
      throw new HttpException('Error al procesar la solicitud de conversación.', 500);
    }
  }
}
