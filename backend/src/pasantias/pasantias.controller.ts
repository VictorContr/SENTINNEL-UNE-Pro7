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

  @Post('evaluar-entrega')
  @Roles_sm_vc('PROFESOR', 'ADMIN')
  @UseInterceptors(FileInterceptor('archivo_correccion_sm_vc', multerDocumentosConfig))
  async evaluarEntrega_sm_vc(
    @Request() req: RequestWithUser,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const profesorId = req.user.id_sm_vc;
    const entregaId = parseInt(body.entrega_id_sm_vc);
    const decision = body.decision_sm_vc;
    const nota = body.nota_sm_dec ? parseFloat(body.nota_sm_dec) : undefined;
    const observaciones = body.observaciones_sm_vc;

    return this.pasantiasService.evaluarEntrega_sm_vc(
      profesorId,
      entregaId,
      decision,
      nota,
      observaciones,
      file,
    );
  }

  @Post('aprobar-requisitos-bulk')
  @Roles_sm_vc('PROFESOR', 'ADMIN')
  async evaluarRequisitosBulk_sm_vc(
    @Request() req: RequestWithUser,
    @Body() body: {
      estudiante_id_sm_vc: number;
      materia_id_sm_vc: number;
      requisitos_ids: number[];
      nota_global_sm_dec?: number;
      comentario_sm_vc?: string;
    },
  ) {
    const profesorId = req.user.id_sm_vc;
    return this.pasantiasService.evaluarRequisitosBulk_sm_vc(
      profesorId,
      body.estudiante_id_sm_vc,
      body.materia_id_sm_vc,
      body.requisitos_ids,
      body.nota_global_sm_dec,
      body.comentario_sm_vc,
    );
  }
}
