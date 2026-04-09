import { IsNotEmpty, IsDateString } from 'class-validator';

/**
 * DTO para actualizar el periodo académico actual desde el módulo de administración.
 * 
 * Se ha refactorizado para aceptar fechas de inicio y cierre, alineándose
 * con la lógica del frontend y la generación automática de nombres de periodo
 * en el servidor.
 */
export class ActualizarPeriodoDto {
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser un formato de fecha válido (ISO 8601)' })
  readonly fecha_inicio_sm_vc: string;

  @IsNotEmpty({ message: 'La fecha de cierre es obligatoria' })
  @IsDateString({}, { message: 'La fecha de cierre debe ser un formato de fecha válido (ISO 8601)' })
  readonly fecha_cierre_sm_vc: string;
}
