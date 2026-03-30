import { PrismaService } from 'src/prisma/prisma.service';
export declare class EstudiantesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obtenerMisEstudiantes_sm_vc(profesorId: number): Promise<{
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
    obtenerDetalleEstudiante_sm_vc(estudianteId: number): Promise<{
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
    obtenerProgresoMaterias_sm_vc(estudianteId: number): Promise<{
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
    private calcularEstadoMateria_sm_vc;
    private mapearEstudianteConProgreso_sm_vc;
    private mapearDetalleEstudiante_sm_vc;
}
