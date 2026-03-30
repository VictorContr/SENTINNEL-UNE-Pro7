import { EstudiantesService } from './estudiantes.service';
import { RolUsuario } from '@prisma/client';
interface RequestWithUser extends Request {
    user: {
        id_sm_vc: number;
        rol_sm_vc: RolUsuario;
    };
}
export declare class EstudiantesController {
    private readonly estudiantesService;
    constructor(estudiantesService: EstudiantesService);
    obtenerMisEstudiantes(req: RequestWithUser): Promise<{
        id_sm_vc: any;
        usuario_id_sm_vc: any;
        nombre_sm_vc: any;
        apellido_sm_vc: any;
        correo_sm_vc: any;
        activo_sm_vc: any;
        empresa_sm_vc: any;
        titulo_proyecto_sm_vc: any;
        tutor_empresarial_sm_vc: any;
        materia_activa_sm_vc: {
            id_sm_vc: any;
            nombre_sm_vc: any;
            posicion_sm_vc: any;
            total_requisitos_sm_vc: any;
            aprobados_sm_vc: any;
            progreso_decimal_sm_vc: number;
            estado_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
        };
    }[]>;
    obtenerDetalle(id: number): Promise<{
        id_sm_vc: any;
        usuario: any;
        empresa_sm_vc: any;
        tutor_empresarial_sm_vc: any;
        titulo_proyecto_sm_vc: any;
        profesor_tutor: any;
        materia_activa: any;
        entregas: any;
        proyecto_deploy: any;
        historial: any;
    }>;
    obtenerProgresoMaterias(id: number): Promise<{
        id_sm_vc: number;
        nombre_sm_vc: string;
        descripcion_sm_vc: string | null;
        posicion_sm_vc: number;
        periodo_sm_vc: string;
        bloqueada_sm_vc: boolean;
        es_activa_sm_vc: boolean;
        total_requisitos_sm_vc: number;
        requisitos_aprobados_sm_vc: number;
        progreso_decimal_sm_vc: number;
        estado_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
        requisitos: {
            id_sm_vc: number;
            nombre_sm_vc: string;
            descripcion_sm_vc: string;
            posicion_sm_vc: number;
            estado_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
            entrega_id_sm_vc: number | null;
        }[];
    }[]>;
}
export {};
