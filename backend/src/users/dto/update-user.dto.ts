import { IsEmail, IsEnum, IsString, IsOptional, MinLength, MaxLength, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { RolUsuario } from '@prisma/client';

export class UpdateEstudianteNestedDto_sm_vc {
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

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEstudianteNestedDto_sm_vc)
  estudiante_sm_vc?: UpdateEstudianteNestedDto_sm_vc;
}
