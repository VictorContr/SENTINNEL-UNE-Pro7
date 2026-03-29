import { PasantiasService_sm_vc } from './pasantias.service';
import { CreateEntregaDto_sm_vc } from './dto/create-entrega.dto';
interface RequestWithUser extends Request {
    user: {
        sub: number;
        correo: string;
        rol: string;
    };
}
export declare class PasantiasController_sm_vc {
    private readonly pasantiasService;
    constructor(pasantiasService: PasantiasService_sm_vc);
    getMaterias_sm_vc(): Promise<({
        requisitos: {
            id_sm_vc: number;
            nombre_sm_vc: string;
            posicion_sm_vc: number;
            materia_id_sm_vc: number;
            descripcion_sm_vc: string;
        }[];
    } & {
        id_sm_vc: number;
        nombre_sm_vc: string;
        posicion_sm_vc: number;
        periodo_sm_vc: string;
    })[]>;
    crearEntrega_sm_vc(req: RequestWithUser, createEntregaDto: CreateEntregaDto_sm_vc): Promise<{
        estudiante: {
            id_sm_vc: number;
            usuario_id_sm_vc: number;
            profesor_id_sm_vc: number | null;
            empresa_sm_vc: string;
            tutor_empresarial_sm_vc: string;
            titulo_proyecto_sm_vc: string;
            materia_activa_id_sm_vc: number;
        };
        requisito: {
            materia: {
                id_sm_vc: number;
                nombre_sm_vc: string;
                posicion_sm_vc: number;
                periodo_sm_vc: string;
            };
        } & {
            id_sm_vc: number;
            nombre_sm_vc: string;
            posicion_sm_vc: number;
            materia_id_sm_vc: number;
            descripcion_sm_vc: string;
        };
    } & {
        id_sm_vc: number;
        fecha_actualizacion_sm_vc: Date;
        estudiante_id_sm_vc: number;
        requisito_id_sm_vc: number;
        estado_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
    }>;
    getProgresoEstudiante_sm_vc(id: string): Promise<{
        materiaActiva: {
            requisitos: ({
                entregas: ({
                    evaluacion: {
                        id_sm_vc: number;
                        profesor_id_sm_vc: number;
                        entrega_id_sm_vc: number;
                        decision_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
                        observaciones_sm_vc: string | null;
                        fecha_evaluacion_sm_vc: Date;
                    } | null;
                } & {
                    id_sm_vc: number;
                    fecha_actualizacion_sm_vc: Date;
                    estudiante_id_sm_vc: number;
                    requisito_id_sm_vc: number;
                    estado_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
                })[];
            } & {
                id_sm_vc: number;
                nombre_sm_vc: string;
                posicion_sm_vc: number;
                materia_id_sm_vc: number;
                descripcion_sm_vc: string;
            })[];
        } & {
            id_sm_vc: number;
            nombre_sm_vc: string;
            posicion_sm_vc: number;
            periodo_sm_vc: string;
        };
    } & {
        id_sm_vc: number;
        usuario_id_sm_vc: number;
        profesor_id_sm_vc: number | null;
        empresa_sm_vc: string;
        tutor_empresarial_sm_vc: string;
        titulo_proyecto_sm_vc: string;
        materia_activa_id_sm_vc: number;
    }>;
    getMiProgreso_sm_vc(req: RequestWithUser): Promise<{
        materiaActiva: {
            requisitos: ({
                entregas: ({
                    evaluacion: {
                        id_sm_vc: number;
                        profesor_id_sm_vc: number;
                        entrega_id_sm_vc: number;
                        decision_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
                        observaciones_sm_vc: string | null;
                        fecha_evaluacion_sm_vc: Date;
                    } | null;
                } & {
                    id_sm_vc: number;
                    fecha_actualizacion_sm_vc: Date;
                    estudiante_id_sm_vc: number;
                    requisito_id_sm_vc: number;
                    estado_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
                })[];
            } & {
                id_sm_vc: number;
                nombre_sm_vc: string;
                posicion_sm_vc: number;
                materia_id_sm_vc: number;
                descripcion_sm_vc: string;
            })[];
        } & {
            id_sm_vc: number;
            nombre_sm_vc: string;
            posicion_sm_vc: number;
            periodo_sm_vc: string;
        };
    } & {
        id_sm_vc: number;
        usuario_id_sm_vc: number;
        profesor_id_sm_vc: number | null;
        empresa_sm_vc: string;
        tutor_empresarial_sm_vc: string;
        titulo_proyecto_sm_vc: string;
        materia_activa_id_sm_vc: number;
    }>;
}
export {};
