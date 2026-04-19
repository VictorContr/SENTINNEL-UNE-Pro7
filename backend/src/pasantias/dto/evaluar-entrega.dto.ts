import { IsNotEmpty, IsOptional, ValidateIf, IsString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EstadoAprobacion } from '@prisma/client';

export class EvaluarEntregaDto_sm_vc {
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  es_reprobacion_global_sm_vc?: boolean;

  @ValidateIf(o => o.es_reprobacion_global_sm_vc !== true)
  @IsNotEmpty({ message: 'El ID de la entrega es obligatorio si no es reprobación global.' })
  @Type(() => Number)
  entrega_id_sm_vc?: number;

  @ValidateIf(o => o.es_reprobacion_global_sm_vc === true)
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio en reprobación global.' })
  @Type(() => Number)
  estudiante_id_sm_vc?: number;

  @ValidateIf(o => o.es_reprobacion_global_sm_vc === true)
  @IsNotEmpty({ message: 'El ID de la materia es obligatorio en reprobación global.' })
  @Type(() => Number)
  materia_id_sm_vc?: number;

  @IsString()
  @IsNotEmpty()
  decision_sm_vc: string;

  @Type(() => Number)
  @IsOptional()
  nota_sm_dec?: number;

  @IsString()
  @IsOptional()
  observaciones_sm_vc?: string;
}
