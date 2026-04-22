// =============================================================
// SRC/MAILER/DTO/ENVIAR-CONTACTO.DTO.TS
//
// DTO de validación estricta para el formulario de contacto
// de la Landing Page. Define el contrato de datos que acepta
// el endpoint POST /api/mailer/contacto.
// =============================================================

import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class EnviarContactoDto_sm_vc {
  @IsString({ message: 'El nombre debe ser texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres.' })
  nombre_sm_vc: string;

  @IsString({ message: 'El apellido debe ser texto.' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío.' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres.' })
  apellido_sm_vc: string;

  @IsString({ message: 'La cédula debe ser texto.' })
  @IsNotEmpty({ message: 'La cédula no puede estar vacía.' })
  @MaxLength(12, { message: 'La cédula no puede exceder 12 caracteres.' })
  cedula_sm_vc: string;

  @IsEmail({}, { message: 'Debes proveer un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El correo no puede estar vacío.' })
  correo_sm_vc: string;

  @IsString({ message: 'El asunto debe ser texto.' })
  @IsNotEmpty({ message: 'El asunto no puede estar vacío.' })
  @MaxLength(200, { message: 'El asunto no puede exceder 200 caracteres.' })
  asunto_sm_vc: string;
}
