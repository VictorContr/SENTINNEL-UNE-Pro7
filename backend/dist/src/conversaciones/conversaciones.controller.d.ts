import { ConversacionesService } from './conversaciones.service';
export declare class ConversacionesController {
    private readonly conversacionesService_sm_vc;
    constructor(conversacionesService_sm_vc: ConversacionesService);
    obtenerHistorial_sm_vc(estudianteId: number): Promise<{
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
