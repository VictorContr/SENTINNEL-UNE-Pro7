import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService_sm_vc {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll_sm_vc(): Promise<{
        id_sm_vc: number;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
        fecha_creacion_sm_vc: Date;
    }[]>;
    findOne_sm_vc(id_sm_vc: string): Promise<{
        id_sm_vc: number;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
        fecha_creacion_sm_vc: Date;
    }>;
    toggleBan_sm_vc(id_sm_vc: string): Promise<{
        id_sm_vc: number;
        nombre_sm_vc: string;
        activo_sm_vc: boolean;
    }>;
}
