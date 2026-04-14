import { IsDateString } from 'class-validator';

/**
 * DTO de creación de Período Académico.
 *
 * DISEÑO: El frontend solo provee las fechas del nuevo período.
 * El nombre (código universitario, ej. "P-166") y la descripción legible
 * (ej. "Mayo 2026 - Agosto 2026") son AUTO-GENERADOS por el servicio backend
 * a partir del período activo anterior y de las fechas recibidas.
 *
 * Esto elimina la posibilidad de errores humanos en el ingreso del código
 * y garantiza consistencia en la nomenclatura del sistema.
 */
export class CreatePeriodoDto_sm_vc {
  @IsDateString()
  fecha_inicio_sm_vc: string;

  @IsDateString()
  fecha_fin_sm_vc: string;
}
