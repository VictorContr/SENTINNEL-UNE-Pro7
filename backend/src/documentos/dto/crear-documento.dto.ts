// ══════════════════════════════════════════════════════════════════
// crear-documento.dto.ts
//
// DTO de creación de documento. Refleja la arquitectura aprobada del Sprint 3:
//
//   CASO A — Adjunto de chat general:
//     entrega_id_sm_vc = null | undefined
//     El documento flotante queda vinculado solo al mensaje de chat.
//
//   CASO B — Entrega de requisito:
//     entrega_id_sm_vc = <id numérico>
//     El backend usa UPSERT atómico si la Entrega no existe aún.
//
// RAZÓN: Hacerlo obligatorio generaría "Exception-Driven Development"
// (esperar un 400 para crear la entrega). El nullable es la arquitectura
// correcta para adjuntos de conversación libre.
// ══════════════════════════════════════════════════════════════════

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoDocumento } from '@prisma/client';

export class CrearDocumentoDto {
  /**
   * ID de la Entrega académica a la que pertenece este documento.
   * OPCIONAL: cuando es un adjunto de chat libre (sin requisito asociado),
   * este campo puede omitirse. El documento flotará en el chat sin FK de Entrega.
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  entrega_id_sm_vc?: number;

  /**
   * ID del Requisito vinculado al documento (solo para Caso B).
   * Si se envía, el backend hará UPSERT de la Entrega automáticamente
   * en la misma transacción atómica antes de crear el Documento.
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  requisito_id_sm_vc?: number;

  /**
   * ID del Estudiante propietario (usado para el UPSERT del Caso B).
   * Se ignora si entrega_id_sm_vc ya está presente.
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  estudiante_id_sm_vc?: number;

  /**
   * Tipo de documento según el Enum de Prisma.
   * Define si es un entregable del estudiante, corrección del profesor, etc.
   */
  @IsEnum(TipoDocumento)
  tipo_sm_vc: TipoDocumento;
}
