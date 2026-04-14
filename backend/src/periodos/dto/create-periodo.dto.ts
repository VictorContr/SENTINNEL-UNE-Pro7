import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO de creación de Período Académico.
 *
 * El campo `nombre_sm_vc` ahora recibe el CÓDIGO universitario del período
 * (ej. "P-165"), no el rango de fechas. La descripción legible
 * (ej. "Enero 2026 - Abril 2026") se registra en `descripcion_sm_vc`.
 */
export class CreatePeriodoDto_sm_vc {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre_sm_vc: string;

  @IsString()
  @MinLength(5)
  @MaxLength(100)
  descripcion_sm_vc: string;

  @IsDateString()
  fecha_inicio_sm_vc: string;

  @IsDateString()
  fecha_fin_sm_vc: string;
}
