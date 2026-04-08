import {
  Controller, Get, Post, Param, UseGuards, Request, Body,
  UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from '../auth/guards';
import { PasantiasService_sm_vc } from './pasantias.service';
import { CreateEntregaDto_sm_vc } from './dto/create-entrega.dto';
import { multerDocumentosConfig } from '../config/multer.config';

interface RequestWithUser extends Request {
  user: {
    id_sm_vc: number;
    correo: string;
    rol: string;
  };
}

@Controller('pasantias')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class PasantiasController_sm_vc {
  constructor(private readonly pasantiasService: PasantiasService_sm_vc) {}

  @Get('materias')
  async getMaterias_sm_vc() {
    return this.pasantiasService.getMaterias_sm_vc();
  }

  @Post('entregas')
  @Roles_sm_vc('ESTUDIANTE')
  @UseInterceptors(FileInterceptor('archivo_sm_vc', multerDocumentosConfig))
  async crearEntrega_sm_vc(
    @Request() req: RequestWithUser,
    @Body() createEntregaDto: CreateEntregaDto_sm_vc,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('El archivo de la entrega es obligatorio.');
    }

    // El ID del estudiante viene del token JWT
    const estudianteId = req.user.id_sm_vc;
    return this.pasantiasService.crearEntrega_sm_vc(
      estudianteId,
      createEntregaDto.requisito_id_sm_vc,
      file,
      createEntregaDto.comentario_sm_vc,
    );
  }

  @Get('estudiantes/:id/progreso')
  async getProgresoEstudiante_sm_vc(@Param('id') id: string) {
    return this.pasantiasService.getProgresoEstudiante_sm_vc(parseInt(id));
  }

  @Get('estudiantes/mi-progreso')
  @Roles_sm_vc('ESTUDIANTE')
  async getMiProgreso_sm_vc(@Request() req: RequestWithUser) {
    const estudianteId = req.user.id_sm_vc;
    return this.pasantiasService.getProgresoEstudiante_sm_vc(estudianteId);
  }
}
