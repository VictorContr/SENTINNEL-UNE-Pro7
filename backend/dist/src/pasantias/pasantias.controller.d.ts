import { PasantiasService_sm_vc } from './pasantias.service';
import { CreateEntregaDto_sm_vc } from './dto/create-entrega.dto';
interface RequestWithUser extends Request {
    user: {
        id_sm_vc: number;
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
            descripcion_sm_vc: string;
            materia_id_sm_vc: number;
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
            descripcion_sm_vc: string;
            materia_id_sm_vc: number;
        };
    } & {
        id_sm_vc: number;
        fecha_actualizacion_sm_vc: Date;
        estado_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
        estudiante_id_sm_vc: number;
        requisito_id_sm_vc: number;
    }>;
    getProgresoEstudiante_sm_vc(id: string): Promise<{
        id_sm_vc: number;
        nombre_sm_vc: string;
        orden_sm_int: number;
        posicion_sm_vc: number;
        periodo_sm_vc: string;
        estado_aprobacion_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
        progreso_decimal: number;
        requisitos_aprobados_sm_int: number;
        total_requisitos_sm_int: number;
        bloqueada: boolean;
        requisitos: {
            id_sm_vc: number;
            nombre_sm_vc: string;
            posicion_sm_vc: number;
            descripcion_sm_vc: string;
            materia_id_sm_vc: number;
        }[];
        nota_sm_dec: null;
        intentos_sm_int: number;
        conversacion_count_sm_int: number;
        progreso: {
            requisitos_aprobados_detalle_sm_vc: {
                requisito_id_sm_vc: number;
            }[];
        };
    }[]>;
    getMiProgreso_sm_vc(req: RequestWithUser): Promise<{
        id_sm_vc: number;
        nombre_sm_vc: string;
        orden_sm_int: number;
        posicion_sm_vc: number;
        periodo_sm_vc: string;
        estado_aprobacion_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
        progreso_decimal: number;
        requisitos_aprobados_sm_int: number;
        total_requisitos_sm_int: number;
        bloqueada: boolean;
        requisitos: {
            id_sm_vc: number;
            nombre_sm_vc: string;
            posicion_sm_vc: number;
            descripcion_sm_vc: string;
            materia_id_sm_vc: number;
        }[];
        nota_sm_dec: null;
        intentos_sm_int: number;
        conversacion_count_sm_int: number;
        progreso: {
            requisitos_aprobados_detalle_sm_vc: {
                requisito_id_sm_vc: number;
            }[];
        };
    }[]>;
}
export {};
