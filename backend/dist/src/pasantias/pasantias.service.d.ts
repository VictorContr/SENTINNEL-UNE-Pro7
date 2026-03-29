import { PrismaService } from '../prisma/prisma.service';
export declare class PasantiasService_sm_vc {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    validarProgresoEstudiante_sm_vc(usuarioId: number, materiaId: number): Promise<boolean>;
    crearEntrega_sm_vc(usuarioId: number, requisitoId: number): Promise<{
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
    getProgresoEstudiante_sm_vc(usuarioId: number): Promise<{
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
