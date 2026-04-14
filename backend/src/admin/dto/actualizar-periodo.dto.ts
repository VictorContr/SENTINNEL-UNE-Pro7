import { IsNotEmpty, IsDateString, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO para actualizar el periodo académico actual desde el módulo de administración.
 *
 * El administrador provee el código universitario del nuevo período (ej. "P-166")
 * y la descripción legible (ej. "Mayo 2026 - Agosto 2026"), junto con las fechas.
 */
export class ActualizarPeriodoDto {
  @IsString({ message: 'El código del período debe ser un texto' })
  @IsNotEmpty({ message: 'El código del período es obligatorio (ej. P-166)' })
  @MinLength(2)
  @MaxLength(50)
  readonly nombre_sm_vc: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción del período es obligatoria (ej. Mayo 2026 - Agosto 2026)' })
  @MinLength(5)
  @MaxLength(100)
  readonly descripcion_sm_vc: string;

  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser un formato de fecha válido (ISO 8601)' })
  readonly fecha_inicio_sm_vc: string;

  @IsNotEmpty({ message: 'La fecha de cierre es obligatoria' })
  @IsDateString({}, { message: 'La fecha de cierre debe ser un formato de fecha válido (ISO 8601)' })
  readonly fecha_cierre_sm_vc: string;
}
