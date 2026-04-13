import { IsEmail, IsEnum, IsNotEmpty, IsString, IsOptional, MinLength, MaxLength, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { RolUsuario } from '@prisma/client';

export class CreateEstudianteNestedDto_sm_vc {
  @IsInt()
  @IsOptional()
  id_sm_vc?: number;

  @IsInt()
  @IsOptional()
  usuario_id_sm_vc?: number;

  @IsInt()
  @IsOptional()
  profesor_id_sm_vc?: number;

  @IsInt()
  @IsOptional()
  materia_activa_id_sm_vc?: number;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  empresa_sm_vc?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  tutor_empresarial_sm_vc?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  titulo_proyecto_sm_vc?: string;

  @IsOptional()
  puede_hacer_deploy_sm_vc?: boolean;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEstudianteNestedDto_sm_vc)
  estudiante_sm_vc?: CreateEstudianteNestedDto_sm_vc;
}
