import { PrismaService } from '../prisma/prisma.service';
export declare class PasantiasService_sm_vc {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMaterias_sm_vc(): Promise<any>;
    validarProgresoEstudiante_sm_vc(usuarioId: number, materiaId: number): Promise<boolean>;
    crearEntrega_sm_vc(usuarioId: number, requisitoId: number): Promise<any>;
    getProgresoEstudiante_sm_vc(usuarioId: number): Promise<any>;
}
