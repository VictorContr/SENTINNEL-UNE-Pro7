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
    validarProgresoEstudiante_sm_vc(estudianteId: number, materiaId: number): Promise<boolean>;
    crearEntrega_sm_vc(estudianteId: number, requisitoId: number): Promise<{
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
    getProgresoEstudiante_sm_vc(estudianteId: number): Promise<{
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
                    estado_sm_vc: import("@prisma/client").$Enums.EstadoAprobacion;
                    estudiante_id_sm_vc: number;
                    requisito_id_sm_vc: number;
                })[];
            } & {
                id_sm_vc: number;
                nombre_sm_vc: string;
                posicion_sm_vc: number;
                descripcion_sm_vc: string;
                materia_id_sm_vc: number;
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
