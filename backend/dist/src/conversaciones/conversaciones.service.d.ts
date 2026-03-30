import { PrismaService } from 'src/prisma/prisma.service';
export declare class ConversacionesService {
    private readonly prisma_sm_vc;
    constructor(prisma_sm_vc: PrismaService);
    manejarMateriaAprobada_sm_vc(payload: {
        estudianteId: number;
        descripcion_sm_vc: string;
    }): Promise<void>;
    manejarDocumentoSubido_sm_vc(payload: {
        estudianteId: number;
        descripcion_sm_vc: string;
    }): Promise<void>;
    manejarDeployCompletado_sm_vc(payload: {
        estudianteId: number;
        descripcion_sm_vc: string;
    }): Promise<void>;
    private registrarMensajeSistema_sm_vc;
    obtenerMensajes_sm_vc(estudianteId: number): Promise<{
        id_sm_vc: number;
        estudiante_id_sm_vc: number;
        mensajes_sm_vc: {
            id_sm_vc: any;
            contenido_sm_vc: any;
            es_sistema_sm_vc: any;
            fecha_creacion_sm_vc: any;
        }[];
    }>;
}
