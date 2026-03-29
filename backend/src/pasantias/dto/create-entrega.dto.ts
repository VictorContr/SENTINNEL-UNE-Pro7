import { IsNotEmpty, IsInt, IsEnum, IsOptional } from 'class-validator';
import { EstadoAprobacion } from '@prisma/client';

export class CreateEntregaDto_sm_vc {
  @IsInt()
  @IsNotEmpty()
  estudiante_id_sm_vc: number;

  @IsInt()
  @IsNotEmpty()
  requisito_id_sm_vc: number;

  @IsEnum(EstadoAprobacion)
  @IsOptional()
  estado_sm_vc?: EstadoAprobacion = EstadoAprobacion.PENDIENTE;
}
