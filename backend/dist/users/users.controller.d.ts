import { UsersService_sm_vc } from './users.service';
export declare class UsersController_sm_vc {
    private readonly usersService;
    constructor(usersService: UsersService_sm_vc);
    findAll_sm_vc(): Promise<{
        id_sm_vc: number;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import(".prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
        fecha_creacion_sm_vc: Date;
    }[]>;
    findOne_sm_vc(id_sm_vc: string): Promise<{
        id_sm_vc: number;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import(".prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
        fecha_creacion_sm_vc: Date;
    }>;
    toggleBan_sm_vc(id_sm_vc: string): Promise<{
        id_sm_vc: number;
        nombre_sm_vc: string;
        activo_sm_vc: boolean;
    }>;
}
