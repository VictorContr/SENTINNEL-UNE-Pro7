import { PrismaService } from 'src/prisma/prisma.service';
export declare class EstudiantesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obtenerMisEstudiantes_sm_vc(profesorId: number): Promise<any>;
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
    obtenerProgresoMaterias_sm_vc(estudianteId: number): Promise<any>;
    private calcularEstadoMateria_sm_vc;
    private mapearEstudianteConProgreso_sm_vc;
    private mapearDetalleEstudiante_sm_vc;
}
