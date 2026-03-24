import { EstadoAprobacion } from '@prisma/client';
export declare class CreateEvaluacionDto_sm_vc {
    entrega_id_sm_vc: number;
    profesor_id_sm_vc: number;
    decision_sm_vc: EstadoAprobacion;
    observaciones_sm_vc?: string;
}
