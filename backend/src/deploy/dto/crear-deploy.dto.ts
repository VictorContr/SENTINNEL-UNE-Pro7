<<<<<<< HEAD
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CrearDeployDto {
  @IsString()
  @IsNotEmpty({ message: 'La URL de producción es obligatoria.' })
  @IsUrl({}, { message: 'Debe ser una URL válida (https://...).' })
=======
import { IsNotEmpty, IsUrl, Matches } from 'class-validator';

export class CrearDeployDto_sm_vc {
  @IsNotEmpty({ message: 'La URL de producción es obligatoria.' })
  @IsUrl({}, { message: 'Debe ser una URL válida.' })
  @Matches(/^https:\/\//, {
    message: 'La URL de producción debe utilizar obligatoriamente el protocolo HTTPS.',
  })
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
  url_produccion_sm_vc: string;
}