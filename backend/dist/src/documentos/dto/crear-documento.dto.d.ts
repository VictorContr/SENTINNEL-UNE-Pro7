import { TipoDocumento } from '@prisma/client';
export declare class CrearDocumentoDto {
    entrega_id_sm_vc: number;
    tipo_sm_vc: TipoDocumento;
    comentario_sm_vc?: string;
}
