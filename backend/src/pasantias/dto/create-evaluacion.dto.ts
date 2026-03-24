import { IsNotEmpty, IsInt, IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { EstadoAprobacion } from '@prisma/client';

export class CreateEvaluacionDto_sm_vc {
  @IsInt()
  @IsNotEmpty()
  entrega_id_sm_vc: number;

  @IsInt()
  @IsNotEmpty()
  profesor_id_sm_vc: number;

  @IsEnum(EstadoAprobacion)
  @IsNotEmpty()
  decision_sm_vc: EstadoAprobacion;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  observaciones_sm_vc?: string;
}
