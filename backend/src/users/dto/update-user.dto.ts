import { IsEmail, IsEnum, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class UpdateUserDto_sm_vc {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  nombre_sm_vc?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  apellido_sm_vc?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(12)
  cedula_sm_vc?: string;

  @IsEmail()
  @IsOptional()
  correo_sm_vc?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono_sm_vc?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  clave_sm_vc?: string;

  @IsEnum(RolUsuario)
  @IsOptional()
  rol_sm_vc?: RolUsuario;

  @IsOptional()
  activo_sm_vc?: boolean;
}
