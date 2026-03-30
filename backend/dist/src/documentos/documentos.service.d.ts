import { PrismaService } from 'src/prisma/prisma.service';
import { CrearDocumentoDto } from './dto/crear-documento.dto';
export declare class DocumentosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    subirDocumento_sm_vc(dto: CrearDocumentoDto, file: Express.Multer.File, usuarioId: number): Promise<{
        id_sm_vc: any;
        entrega_id_sm_vc: any;
        tipo_sm_vc: any;
        nombre_archivo_sm_vc: any;
        tamanio_bytes_sm_vc: any;
        mime_type_sm_vc: any;
        fecha_subida_sm_vc: any;
    }>;
    obtenerDocumentosDeEntrega_sm_vc(entregaId: number): Promise<{
        id_sm_vc: any;
        entrega_id_sm_vc: any;
        tipo_sm_vc: any;
        nombre_archivo_sm_vc: any;
        tamanio_bytes_sm_vc: any;
        mime_type_sm_vc: any;
        fecha_subida_sm_vc: any;
    }[]>;
    private generarRespuesta_sm_vc;
}
