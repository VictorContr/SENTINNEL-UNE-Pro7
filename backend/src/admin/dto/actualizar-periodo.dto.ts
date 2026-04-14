import { IsNotEmpty, IsDateString } from 'class-validator';

/**
 * DTO para actualizar el periodo académico actual desde el módulo de administración.
 *
 * DISEÑO: El frontend (CambioPeriodoPage.vue) solo envía las fechas del nuevo período.
 * El código universitario (ej. "P-166") y la descripción legible (ej. "Mayo 2026 - Agosto 2026")
 * son AUTO-GENERADOS en PeriodosAcademicosService.create_sm_vc a partir del período activo previo.
 */
export class ActualizarPeriodoDto {
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser un formato de fecha válido (ISO 8601)' })
  readonly fecha_inicio_sm_vc: string;

  @IsNotEmpty({ message: 'La fecha de cierre es obligatoria' })
  @IsDateString({}, { message: 'La fecha de cierre debe ser un formato de fecha válido (ISO 8601)' })
  readonly fecha_cierre_sm_vc: string;
}
