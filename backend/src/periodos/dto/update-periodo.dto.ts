import { IsDateString, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePeriodoDto_sm_vc {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser válida (ISO 8601)' })
  fecha_inicio_sm_vc?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser válida (ISO 8601)' })
  fecha_fin_sm_vc?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido' })
  nombre_sm_vc?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser booleano' })
  estado_activo_sm_vc?: boolean;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  descripcion_sm_vc?: string;
}
