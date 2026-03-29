import { Request } from '@nestjs/common';
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
    obtenerMisEstudiantes(req: RequestWithUser): Promise<any>;
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
    obtenerProgresoMaterias(id: number): Promise<any>;
}
export {};
