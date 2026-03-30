import { PrismaService } from 'src/prisma/prisma.service';
import { CrearEvaluacionDto } from './dto/crear-evaluacion.dto';
export declare class EvaluacionesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    evaluarEntrega_sm_vc(dto: CrearEvaluacionDto, profesorId: number): Promise<{
        id_sm_vc: any;
        entrega_id_sm_vc: any;
        decision_sm_vc: any;
        observaciones_sm_vc: any;
        fecha_evaluacion_sm_vc: any;
        materia_desbloqueada_sm_vc: string | null;
    }>;
    obtenerEvaluacionDeEntrega_sm_vc(entregaId: number): Promise<{
        profesor: {
            nombre_sm_vc: string;
            apellido_sm_vc: string;
        };
    } & {
        id_sm_vc: number;
        profesor_id_sm_vc: number;
        entrega_id_sm_vc: number;
        decision_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
        observaciones_sm_vc: string | null;
        fecha_evaluacion_sm_vc: Date;
    }>;
    private verificarYDesbloquearMateria_sm_vc;
    private notificarEstudiante_sm_vc;
    private generarRespuesta_sm_vc;
}
