import { IsEmail, IsEnum, IsNotEmpty, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class CreateUserDto_sm_vc {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  nombre_sm_vc: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  apellido_sm_vc: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(12)
  cedula_sm_vc: string;

  @IsEmail()
  @IsNotEmpty()
  correo_sm_vc: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono_sm_vc?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  clave_sm_vc: string;

  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol_sm_vc: RolUsuario;
}
