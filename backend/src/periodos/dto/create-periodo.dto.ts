import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreatePeriodoDto_sm_vc {
  @IsString()
  nombre_sm_vc: string;

  @IsDateString()
  fecha_inicio_sm_vc: string;

  @IsDateString()
  fecha_fin_sm_vc: string;

  @IsOptional()
  @IsString()
  descripcion_sm_vc?: string;
}
