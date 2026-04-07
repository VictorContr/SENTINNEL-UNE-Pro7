import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePeriodoDto_sm_vc {
  @IsString()
  @IsOptional()
  nombre_sm_vc?: string;

  @IsDateString()
  @IsOptional()
  fecha_inicio_sm_vc?: string;

  @IsDateString()
  @IsOptional()
  fecha_fin_sm_vc?: string;

  @IsBoolean()
  @IsOptional()
  estado_activo_sm_vc?: boolean;

  @IsString()
  @IsOptional()
  descripcion_sm_vc?: string;
}
