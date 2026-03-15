import { PasantiasService_sm_vc } from './pasantias.service';
export declare class PasantiasController_sm_vc {
    private readonly pasantiasService;
    constructor(pasantiasService: PasantiasService_sm_vc);
    getMaterias_sm_vc(): Promise<({
        requisitos: {
            id_sm_vc: string;
            nombre_sm_vc: string;
            orden_sm_int: number;
            obligatorio_sm_vc: boolean;
            materia_id_sm_vc: string;
        }[];
    } & {
        id_sm_vc: string;
        nombre_sm_vc: string;
        activo_sm_vc: boolean;
        descripcion_sm_vc: string | null;
        orden_sm_int: number;
    })[]>;
}
