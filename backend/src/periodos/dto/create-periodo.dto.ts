import { IsDateString } from 'class-validator';

/**
 * DTO de creación de Período Académico.
 *
 * El campo `nombre_sm_vc` ha sido eliminado intencionalmente:
 * el servidor genera el nombre dinámicamente a partir de las fechas
 * (e.g. "Enero 2026 - Julio 2026"), garantizando consistencia y
 * evitando validaciones absurdas en el frontend.
 */
export class CreatePeriodoDto_sm_vc {
  @IsDateString()
  fecha_inicio_sm_vc: string;

  @IsDateString()
  fecha_fin_sm_vc: string;
}
