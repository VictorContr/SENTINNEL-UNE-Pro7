import { IsNotEmpty, IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateEstudianteDto_sm_vc {
  @IsInt()
  @IsNotEmpty()
  usuario_id_sm_vc: number;

  @IsInt()
  @IsOptional()
  profesor_id_sm_vc?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  empresa_sm_vc: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tutor_empresarial_sm_vc: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titulo_proyecto_sm_vc: string;

  @IsInt()
  @IsNotEmpty()
  materia_activa_id_sm_vc: number;
}
