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
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000, { message: 'El mensaje no puede superar 5000 caracteres.' })
  contenido_sm_vc: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  estudianteId_sm_vc: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  materiaId_sm_vc?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  documentoId_sm_vc?: number;

  @IsEnum(TipoMensajeChat_sm_vc)
  tipo_sm_vc: TipoMensajeChat_sm_vc;
}