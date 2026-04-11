// ══════════════════════════════════════════════════════════════════
// send-message.dto.ts
//
// DTO para el evento WebSocket 'send_message_sm_vc'.
// Sprint 3: documentoId_sm_vc permite a los Forms enviar el ID del
// archivo ya subido (via POST /documentos) dentro del mensaje de WS.
// El tipo DOCUMENTO activa el renderizado de tarjeta de archivo
// en ConvMessages.vue en lugar de una burbuja de texto simple.
// ══════════════════════════════════════════════════════════════════

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoMensajeChat_sm_vc {
  TEXTO     = 'TEXTO',
  DOCUMENTO = 'DOCUMENTO',
}

export class SendMessageDto_sm_vc {
  /**
   * Contenido de texto del mensaje.
   * Para mensajes de tipo DOCUMENTO, contendrá el nombre del archivo.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'El mensaje no puede superar 5000 caracteres.' })
  contenido_sm_vc: string;

  /**
   * ID del Estudiante involucrado en la conversación.
   * Requerido para determinar la sala del socket.
   */
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  estudianteId_sm_vc: number;

  /**
   * ID de la Materia. Permite segmentar mensajes por materia
   * en conversaciones académicas.
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  materiaId_sm_vc?: number;

  /**
   * ID del Documento ya subido via POST /api/documentos.
   * Solo presente cuando tipo_sm_vc === 'DOCUMENTO'.
   * El gateway usará este ID para enriquecer el mensaje con
   * nombre y tamaño del archivo antes de emitirlo a los clientes.
   */
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  documentoId_sm_vc?: number;

  /**
   * Discriminador de tipo para el renderizador de ConvMessages.
   * TEXTO     → Burbuja de chat estándar
   * DOCUMENTO → Tarjeta de archivo con botones de descarga
   */
  @IsEnum(TipoMensajeChat_sm_vc)
  tipo_sm_vc: TipoMensajeChat_sm_vc;
}