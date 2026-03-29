import {
  Controller, Post, Get, Param, Body, UploadedFile,
  UseInterceptors, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { CrearDocumentoDto } from './dto/crear-documento.dto';
import { multerDocumentosConfig } from 'src/config/multer.config';
import { JwtAuthGuard_sm_vc, RolesGuard_sm_vc, Roles_sm_vc } from 'src/auth/guards';
import { RolUsuario } from '@prisma/client';

interface RequestWithUser extends Request {
  user: { id_sm_vc: number; rol_sm_vc: RolUsuario };
}

@Controller('documentos')
@UseGuards(JwtAuthGuard_sm_vc, RolesGuard_sm_vc)
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  /**
   * POST /api/documentos
   * Sube un archivo PDF a una entrega existente.
   * Roles: ESTUDIANTE (para ENTREGABLE), PROFESOR (para CORRECCION)
   */
  @Post()
  @Roles_sm_vc(RolUsuario.ESTUDIANTE, RolUsuario.PROFESOR)
  @UseInterceptors(FileInterceptor('archivo', multerDocumentosConfig))
  async subirDocumento(
    @Body() dto: CrearDocumentoDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: RequestWithUser,
  ) {
    return this.documentosService.subirDocumento_sm_vc(
      dto,
      file,
      req.user.id_sm_vc,
    );
  }

  /**
   * GET /api/documentos/entrega/:entregaId
   * Lista todos los documentos de una entrega específica.
   */
  @Get('entrega/:entregaId')
  async obtenerDocumentosPorEntrega(
    @Param('entregaId', ParseIntPipe) entregaId: number,
  ) {
    return this.documentosService.obtenerDocumentosDeEntrega_sm_vc(entregaId);
  }
}