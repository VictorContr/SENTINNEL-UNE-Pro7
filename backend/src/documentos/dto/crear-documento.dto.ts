import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export class CrearDocumentoDto {
  @IsInt()
  @IsNotEmpty()
  entrega_id_sm_vc: number;

  @IsEnum(TipoDocumento)
  @IsNotEmpty()
  tipo_sm_vc: TipoDocumento;
}
