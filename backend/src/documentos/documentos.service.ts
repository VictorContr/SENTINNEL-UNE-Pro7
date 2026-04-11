// ══════════════════════════════════════════════════════════════════
// documentos.service.ts
//
// SPRINT 3: Implementa la arquitectura de "entregaId opcional" aprobada.
//
// Flujo de subirDocumento_sm_vc (3 casos):
//
//   CASO A — Chat libre (sin requisito ni entrega):
//     El Documento se crea con entrega_id_sm_vc = null.
//     No se crea ni valida ninguna Entrega.
//
//   CASO B — Entrega de requisito SIN entregaId previo:
//     Se hace UPSERT atómico de la Entrega y luego se crea el Documento
//     en la misma transacción. Devuelve el documentoId al frontend.
//
//   CASO C — Entrega de requisito CON entregaId existente:
//     Flujo original: valida la Entrega, la marca como ENTREGADO y crea
//     el Documento vinculado a ella.
//
// PATRÓN: Calidad > Velocidad. Sin Exception-Driven Development.
// ══════════════════════════════════════════════════════════════════

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  StreamableFile,
} from '@nestjs/common';
import * as fs   from 'fs';
import * as path from 'path';
import { PrismaService }    from 'src/prisma/prisma.service';
import { EstadoAprobacion, TipoDocumento } from '@prisma/client';
import { EventEmitter2 }    from '@nestjs/event-emitter';
import { CrearDocumentoDto } from './dto/crear-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly prisma:             PrismaService,
    private readonly eventEmitter_sm_vc: EventEmitter2,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // POST /api/documentos — Subir un documento (3 casos según DTO)
  // ─────────────────────────────────────────────────────────────────
  async subirDocumento_sm_vc(
    dto:       CrearDocumentoDto,
    file:      Express.Multer.File,
    usuarioId: number,
  ) {
    try {
      // ══ CASO A: Adjunto de chat libre ══════════════════════════
      // Sin entrega_id ni requisito_id → documento flotante.
      if (!dto.entrega_id_sm_vc && !dto.requisito_id_sm_vc) {
        const doc_sm_vc = await this.prisma.documento.create({
          data: {
            entrega_id_sm_vc:        null,
            usuario_subida_id_sm_vc: usuarioId,
            tipo_sm_vc:              dto.tipo_sm_vc,
            nombre_archivo_sm_vc:    file.originalname,
            ruta_archivo_sm_vc:      file.path,
            tamanio_bytes_sm_vc:     file.size,
            mime_type_sm_vc:         file.mimetype,
          },
        });
        return this.generarRespuesta_sm_vc(doc_sm_vc);
      }

      // ══ CASO B: Entrega vinculada a requisito, sin entregaId previo ══
      // Se hace UPSERT atómico de Entrega + creación de Documento.
      if (!dto.entrega_id_sm_vc && dto.requisito_id_sm_vc && dto.estudiante_id_sm_vc) {
        const requisito_sm_vc = await this.prisma.requisito.findUnique({
          where:   { id_sm_vc: dto.requisito_id_sm_vc },
          include: { materia: true },
        });
        if (!requisito_sm_vc) {
          throw new NotFoundException(`Requisito ${dto.requisito_id_sm_vc} no encontrado.`);
        }

        const documento = await this.prisma.$transaction(async (tx_sm_vc) => {
          // Upsert de la Entrega (crea o deja como está, actualiza estado)
          const entrega_sm_vc = await tx_sm_vc.entrega.upsert({
            where: {
              estudiante_id_sm_vc_requisito_id_sm_vc: {
                estudiante_id_sm_vc: dto.estudiante_id_sm_vc!,
                requisito_id_sm_vc:  dto.requisito_id_sm_vc!,
              },
            },
            create: {
              estudiante_id_sm_vc: dto.estudiante_id_sm_vc!,
              requisito_id_sm_vc:  dto.requisito_id_sm_vc!,
              estado_sm_vc:        EstadoAprobacion.ENTREGADO,
            },
            update: {
              estado_sm_vc:             EstadoAprobacion.ENTREGADO,
              fecha_actualizacion_sm_vc: new Date(),
            },
          });

          const doc_sm_vc = await tx_sm_vc.documento.create({
            data: {
              entrega_id_sm_vc:        entrega_sm_vc.id_sm_vc,
              usuario_subida_id_sm_vc: usuarioId,
              tipo_sm_vc:              dto.tipo_sm_vc,
              nombre_archivo_sm_vc:    file.originalname,
              ruta_archivo_sm_vc:      file.path,
              tamanio_bytes_sm_vc:     file.size,
              mime_type_sm_vc:         file.mimetype,
            },
          });

          return doc_sm_vc;
        });

        // Evento de trazabilidad post-transacción
        this.eventEmitter_sm_vc.emit('documento.subido_sm_vc', {
          estudianteId:      dto.estudiante_id_sm_vc,
          materiaId:         requisito_sm_vc.materia_id_sm_vc,
          descripcion_sm_vc: `Documento "${file.originalname}" subido para "${requisito_sm_vc.nombre_sm_vc}" (${requisito_sm_vc.materia.nombre_sm_vc}).`,
        });

        return this.generarRespuesta_sm_vc(documento);
      }

      // ══ CASO C: entregaId ya conocido (flujo original) ══════════
      const entrega_sm_vc = await this.prisma.entrega.findUnique({
        where:   { id_sm_vc: dto.entrega_id_sm_vc },
        include: {
          estudiante: { include: { usuario: true } },
          requisito:  { include: { materia: true } },
        },
      });

      if (!entrega_sm_vc) {
        throw new NotFoundException(`Entrega ${dto.entrega_id_sm_vc} no encontrada.`);
      }

      if (entrega_sm_vc.estado_sm_vc === EstadoAprobacion.APROBADO) {
        throw new ForbiddenException(
          'No se puede subir documentos a una entrega ya aprobada.',
        );
      }

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

      this.eventEmitter_sm_vc.emit('documento.subido_sm_vc', {
        estudianteId:      entrega_sm_vc.estudiante.id_sm_vc,
        materiaId:         entrega_sm_vc.requisito.materia_id_sm_vc,
        descripcion_sm_vc: `Documento "${file.originalname}" subido para "${entrega_sm_vc.requisito.nombre_sm_vc}" (${entrega_sm_vc.requisito.materia.nombre_sm_vc}).`,
      });

      return this.generarRespuesta_sm_vc(documento);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
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
  // ─────────────────────────────────────────────────────────────────
  async descargarDocumento_sm_vc(
    documentoId: number,
  ): Promise<{ stream: StreamableFile; meta: { nombre: string; mime: string } }> {
    const documento = await this.prisma.documento.findUnique({
      where: { id_sm_vc: documentoId },
    });

    if (!documento) {
      throw new NotFoundException(`Documento ${documentoId} no encontrado.`);
    }

    if (documento.mock_sm_vc) {
      throw new BadRequestException(
        'Este es un documento de simulación (MOCK) para la demostración académica y no tiene un archivo físico asociado.',
      );
    }

    const { ruta_archivo_sm_vc, nombre_archivo_sm_vc, mime_type_sm_vc } = documento;
    let fullPath = ruta_archivo_sm_vc;

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
        mime:   mime_type_sm_vc || 'application/pdf',
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────
  private generarRespuesta_sm_vc(documento: any) {
    return {
      id_sm_vc:                    documento.id_sm_vc,
      entrega_id_sm_vc:            documento.entrega_id_sm_vc,
      tipo_sm_vc:                  documento.tipo_sm_vc,
      nombre_archivo_sm_vc:        documento.nombre_archivo_sm_vc,
      tamanio_bytes_sm_vc:         documento.tamanio_bytes_sm_vc,
      tamanio_formateado_sm_vc:    DocumentosService.formatearTamanioArchivo_sm_vc(documento.tamanio_bytes_sm_vc),
      mime_type_sm_vc:             documento.mime_type_sm_vc,
      fecha_subida_sm_vc:          documento.fecha_subida_sm_vc,
      mock_sm_vc:                  documento.mock_sm_vc,
    };
  }

  /**
   * Formatea el tamaño en bytes a una cadena legible (B, KB, MB, GB).
   */
  static formatearTamanioArchivo_sm_vc(bytes?: number): string {
    if (!bytes) return '0 B';
    const unidades = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let size  = bytes;
    while (size >= 1024 && index < unidades.length - 1) {
      size /= 1024;
      index++;
    }
    return `${size.toFixed(1)} ${unidades[index]}`;
  }
}