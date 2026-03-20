import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO para actualizar el periodo académico actual
 * Valida que el periodo sea un string válido con mínimo 4 caracteres
 */
export class ActualizarPeriodoDto {
  @IsNotEmpty({ message: 'El periodo académico es obligatorio' })
  @IsString({ message: 'El periodo debe ser un texto' })
  @MinLength(4, { message: 'El periodo debe tener al menos 4 caracteres' })
  readonly periodo_actual_sm_vc: string;
}
