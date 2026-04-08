<<<<<<< HEAD
import { IsInt, IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoDocumento } from '@prisma/client';

export class CrearDocumentoDto {
  @Type(() => Number)
  @IsInt({ message: 'entrega_id_sm_vc debe ser un entero.' })
  @IsNotEmpty()
  entrega_id_sm_vc: number;

  @IsEnum(TipoDocumento, { message: 'tipo_sm_vc no es un valor válido.' })
  @IsNotEmpty()
  tipo_sm_vc: TipoDocumento;

  @IsString()
  @IsOptional()
  comentario_sm_vc?: string;
}
=======
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
>>>>>>> 903c4c29d3b62de277bf139cfa3224c4374fb12a
