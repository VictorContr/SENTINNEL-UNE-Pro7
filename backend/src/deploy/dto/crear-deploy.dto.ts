import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CrearDeployDto {
  @IsString()
  @IsNotEmpty({ message: 'La URL de producción es obligatoria.' })
  @IsUrl({}, { message: 'Debe ser una URL válida (https://...).' })
  url_produccion_sm_vc: string;
}