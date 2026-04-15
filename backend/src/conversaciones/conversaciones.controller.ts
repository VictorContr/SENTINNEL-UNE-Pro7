import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpException,
  Req
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
   * - materiaId (number): Si se envía, filtra el historial por esa materia.
   * - posicion (number):  La posición de la fase (Opción B Pura).
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

      // ✅ FIX DE SEGURIDAD Y ACCESO ASIMÉTRICO (Profesor vs Estudiante)
      const usuarioActivo = req.user; 
      let targetId = estudianteId;

      if (usuarioActivo && usuarioActivo.rol_sm_vc === 'ESTUDIANTE') {
         // Si es estudiante, ignoramos la URL y lo obligamos a ver SU propio chat
         targetId = usuarioActivo.id_sm_vc;
      }

      return await this.conversacionesService_sm_vc.obtenerMensajes_sm_vc(
        targetId, // El Profesor usará el de la URL, el Estudiante el suyo propio
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