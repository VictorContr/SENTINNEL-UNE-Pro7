import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  StreamableFile,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoAprobacion, TipoDocumento } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrearDocumentoDto } from './dto/crear-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly prisma:            PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // POST /api/documentos — Subir un documento a una entrega
  // FIX: documento.create + entrega.update ahora son atómicos
  //      dentro de $transaction para evitar documentos huérfanos.
  // ─────────────────────────────────────────────────────────────────
  async subirDocumento_sm_vc(
    dto:       CrearDocumentoDto,
    file:      Express.Multer.File,
    usuarioId: number,
  ) {
    try {
      // 1. Cargar la entrega con contexto completo (solo lectura, fuera de tx)
      const entrega = await this.prisma.entrega.findUnique({
        where: { id_sm_vc: dto.entrega_id_sm_vc },
        include: {
          estudiante: { include: { usuario: true } },
          requisito:  { include: { materia: true } },
        },
      });

      if (!entrega) {
        throw new NotFoundException(`Entrega ${dto.entrega_id_sm_vc} no encontrada.`);
      }

      if (entrega.estado_sm_vc === EstadoAprobacion.APROBADO) {
        throw new ForbiddenException(
          'No se puede subir documentos a una entrega ya aprobada.',
        );
      }

      // ── FIX: Transacción atómica ─────────────────────────────────
      // Si el update de entrega falla, el documento no queda en BD.
      const documento = await this.prisma.$transaction(async (tx_sm_vc) => {
        const doc_sm_vc = await tx_sm_vc.documento.create({
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

        await tx_sm_vc.entrega.update({
          where: { id_sm_vc: dto.entrega_id_sm_vc },
          data:  { estado_sm_vc: EstadoAprobacion.ENTREGADO },
        });

        return doc_sm_vc;
      });

      // ── Post-transacción: evento de trazabilidad ──
      // Incluye materiaId para que el log quede segmentado por materia
      this.eventEmitter_sm_vc.emit('documento.subido_sm_vc', {
        estudianteId:     entrega.estudiante.id_sm_vc,
        materiaId:        entrega.requisito.materia_id_sm_vc,
        descripcion_sm_vc: `Documento "${file.originalname}" subido para "${entrega.requisito.nombre_sm_vc}" (${entrega.requisito.materia.nombre_sm_vc}).`,
      });

      return this.generarRespuesta_sm_vc(documento);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al subir el documento.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/documentos/entrega/:entregaId
  // ─────────────────────────────────────────────────────────────────
  async obtenerDocumentosDeEntrega_sm_vc(entregaId: number) {
    try {
      const documentos = await this.prisma.documento.findMany({
        where:   { entrega_id_sm_vc: entregaId },
        orderBy: { fecha_subida_sm_vc: 'desc' },
      });

      return documentos.map((d) => this.generarRespuesta_sm_vc(d));
    } catch {
      throw new InternalServerErrorException('Error al obtener los documentos.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GET /api/documentos/:documentoId/descargar
  // Descarga un documento físico. Valida MOCK.
  // ─────────────────────────────────────────────────────────────────
  async descargarDocumento_sm_vc(documentoId: number): Promise<{ stream: StreamableFile, meta: any }> {
    const documento = await this.prisma.documento.findUnique({
      where: { id_sm_vc: documentoId },
    });

    if (!documento) {
      throw new NotFoundException(`Documento ${documentoId} no encontrado.`);
    }

    if (documento.mock_sm_vc) {
      throw new BadRequestException('Este es un documento de simulación (MOCK) para la demostración académica y no tiene un archivo físico asociado.');
    }

    const { ruta_archivo_sm_vc, nombre_archivo_sm_vc, mime_type_sm_vc } = documento;
    let fullPath = ruta_archivo_sm_vc;

    // Si la ruta del seed o upload no es absoluta
    if (!path.isAbsolute(fullPath)) {
      fullPath = path.join(process.cwd(), fullPath);
    }

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('El archivo físico no fue encontrado en el servidor.');
    }

    const fileStream = fs.createReadStream(fullPath);
    return {
      stream: new StreamableFile(fileStream),
      meta: {
        nombre: nombre_archivo_sm_vc,
        mime: mime_type_sm_vc || 'application/pdf',
      }
    };
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
      tamanio_formateado_sm_vc: DocumentosService.formatearTamanioArchivo_sm_vc(documento.tamanio_bytes_sm_vc),
      mime_type_sm_vc:      documento.mime_type_sm_vc,
      fecha_subida_sm_vc:   documento.fecha_subida_sm_vc,
      mock_sm_vc:           documento.mock_sm_vc,
    };
  }

  /**
   * Formatea el tamaño en bytes a una cadena legible (KB, MB).
   */
  static formatearTamanioArchivo_sm_vc(bytes?: number): string {
    if (!bytes) return '0 B';
    const unidades = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let size = bytes;
    while (size >= 1024 && index < unidades.length - 1) {
      size /= 1024;
      index++;
    }
    return `${size.toFixed(1)} ${unidades[index]}`;
  }
}