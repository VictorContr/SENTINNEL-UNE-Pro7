import { Request } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { CrearDocumentoDto } from './dto/crear-documento.dto';
import { RolUsuario } from '@prisma/client';
interface RequestWithUser extends Request {
    user: {
        id_sm_vc: number;
        rol_sm_vc: RolUsuario;
    };
}
export declare class DocumentosController {
    private readonly documentosService;
    constructor(documentosService: DocumentosService);
    subirDocumento(dto: CrearDocumentoDto, file: Express.Multer.File, req: RequestWithUser): Promise<{
        id_sm_vc: any;
        entrega_id_sm_vc: any;
        tipo_sm_vc: any;
        nombre_archivo_sm_vc: any;
        tamanio_bytes_sm_vc: any;
        mime_type_sm_vc: any;
        fecha_subida_sm_vc: any;
    }>;
    obtenerDocumentosPorEntrega(entregaId: number): Promise<any>;
}
export {};
