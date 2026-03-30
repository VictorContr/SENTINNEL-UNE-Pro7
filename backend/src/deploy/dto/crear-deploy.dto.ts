import { IsNotEmpty, IsUrl, Matches } from 'class-validator';

export class CrearDeployDto_sm_vc {
  @IsNotEmpty({ message: 'La URL de producción es obligatoria.' })
  @IsUrl({}, { message: 'Debe ser una URL válida.' })
  @Matches(/^https:\/\//, {
    message: 'La URL de producción debe utilizar obligatoriamente el protocolo HTTPS.',
  })
  url_produccion_sm_vc: string;
}