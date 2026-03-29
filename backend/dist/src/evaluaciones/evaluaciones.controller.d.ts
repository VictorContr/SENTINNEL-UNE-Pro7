import { Request } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
import { RolUsuario } from '@prisma/client';
interface RequestWithUser extends Request {
    user: {
        id_sm_vc: number;
        rol_sm_vc: RolUsuario;
    };
}
export declare class EvaluacionesController {
    private readonly evaluacionesService;
    constructor(evaluacionesService: EvaluacionesService);
    evaluarEntrega(dto: CrearEvaluacionDto, req: RequestWithUser): Promise<{
        id_sm_vc: any;
        entrega_id_sm_vc: any;
        decision_sm_vc: any;
        observaciones_sm_vc: any;
        fecha_evaluacion_sm_vc: any;
        materia_desbloqueada_sm_vc: string | null;
    }>;
    obtenerEvaluacion(entregaId: number): Promise<any>;
}
export {};
