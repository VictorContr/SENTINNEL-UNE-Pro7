import {
  IsInt, IsNotEmpty, IsEnum, IsOptional, IsString, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAprobacion } from '@prisma/client';

export class CrearEvaluacionDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  entrega_id_sm_vc: number;

  @IsEnum(EstadoAprobacion, {
    message: 'decision_sm_vc debe ser APROBADO o REPROBADO.',
  })
  @IsNotEmpty()
  decision_sm_vc: EstadoAprobacion;

  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Las observaciones no pueden superar 2000 caracteres.' })
  observaciones_sm_vc?: string;
}