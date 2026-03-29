import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto_sm_vc {
  @IsEmail()
  @IsNotEmpty()
  correo_sm_vc: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  clave_sm_vc: string;
}
