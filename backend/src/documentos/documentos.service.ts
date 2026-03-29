import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAprobacion, TipoDocumento } from '@prisma/client';
import { CrearDocumentoDto } from './dto/crear-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // POST /api/documentos — Subir un documento a una entrega
  // ─────────────────────────────────────────────────────────────────
  async subirDocumento_sm_vc(
    dto: CrearDocumentoDto,
    file: Express.Multer.File,
    usuarioId: number,
  ) {
    try {
      // 1. Verificar que la entrega existe y cargar contexto completo
      const entrega = await this.prisma.entrega.findUnique({
        where: { id_sm_vc: dto.entrega_id_sm_vc },
        include: {
          estudiante: { include: { usuario: true } },
          requisito: { include: { materia: true } },
        },
      });

      if (!entrega) {
        throw new NotFoundException(
          `Entrega ${dto.entrega_id_sm_vc} no encontrada.`,
        );
      }

      // 2. Validar que la entrega no esté bloqueada por aprobación previa
      if (entrega.estado_sm_vc === EstadoAprobacion.APROBADO) {
        throw new ForbiddenException(
          'No se puede subir documentos a una entrega ya aprobada.',
        );
      }

      // 3. Crear el registro del documento en la BD
      const documento = await this.prisma.documento.create({
        data: {
          entrega_id_sm_vc:        dto.entrega_id_sm_vc,
          usuario_subida_id_sm_vc: usuarioId,
          tipo_sm_vc:              dto.tipo_sm_vc,
          nombre_archivo_sm_vc:    file.originalname,
          ruta_archivo_sm_vc:      file.path,
          tamanio_bytes_sm_vc:     file.size,
          mime_type_sm_vc:         file.mimetype,
        },
      });

      // 4. Actualizar el estado de la entrega → ENTREGADO
      await this.prisma.entrega.update({
        where: { id_sm_vc: dto.entrega_id_sm_vc },
        data:  { estado_sm_vc: EstadoAprobacion.ENTREGADO },
      });

      // 5. Registrar en historial de trazabilidad
      await this.prisma.historialTrazabilidad.create({
        data: {
          estudiante_id_sm_vc: entrega.estudiante.id_sm_vc,
          actor_id_sm_vc:      usuarioId,
          accion_sm_vc:        'DOCUMENTO_SUBIDO',
          detalles_sm_vc: `Documento "${file.originalname}" subido para el requisito ` +
            `"${entrega.requisito.nombre_sm_vc}" ` +
            `de la materia "${entrega.requisito.materia.nombre_sm_vc}".`,
        },
      });

      return this.generarRespuesta_sm_vc(documento);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException)
        throw error;
      throw new InternalServerErrorException('Error al subir el documento.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/documentos/entrega/:entregaId
  // ─────────────────────────────────────────────────────────────────
  async obtenerDocumentosDeEntrega_sm_vc(entregaId: number) {
    try {
      const documentos = await this.prisma.documento.findMany({
        where: { entrega_id_sm_vc: entregaId },
        orderBy: { fecha_subida_sm_vc: 'desc' },
      });
      return documentos.map((d) => this.generarRespuesta_sm_vc(d));
    } catch {
      throw new InternalServerErrorException('Error al obtener los documentos.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────
  private generarRespuesta_sm_vc(documento: any) {
    return {
      id_sm_vc:             documento.id_sm_vc,
      entrega_id_sm_vc:     documento.entrega_id_sm_vc,
      tipo_sm_vc:           documento.tipo_sm_vc,
      nombre_archivo_sm_vc: documento.nombre_archivo_sm_vc,
      tamanio_bytes_sm_vc:  documento.tamanio_bytes_sm_vc,
      mime_type_sm_vc:      documento.mime_type_sm_vc,
      fecha_subida_sm_vc:   documento.fecha_subida_sm_vc,
    };
  }
}