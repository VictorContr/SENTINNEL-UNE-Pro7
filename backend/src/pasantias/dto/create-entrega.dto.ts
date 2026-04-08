import { IsNotEmpty, IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAprobacion } from '@prisma/client';

export class CreateEntregaDto_sm_vc {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  estudiante_id_sm_vc?: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  requisito_id_sm_vc: number;

  @IsString()
  @IsOptional()
  comentario_sm_vc?: string;

  @IsEnum(EstadoAprobacion)
  @IsOptional()
  estado_sm_vc?: EstadoAprobacion = EstadoAprobacion.PENDIENTE;
}
