import { UsersService_sm_vc } from './users.service';
import { CreateUserDto_sm_vc } from './dto/create-user.dto';
import { UpdateUserDto_sm_vc } from './dto/update-user.dto';
export declare class UsersController_sm_vc {
    private readonly usersService;
    constructor(usersService: UsersService_sm_vc);
    findAll_sm_vc(): Promise<{
        id_sm_vc: number;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
        fecha_creacion_sm_vc: Date;
    }[]>;
    create_sm_vc(dto_sm_vc: CreateUserDto_sm_vc): Promise<{
        id_sm_vc: number;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
    }>;
    findOne_sm_vc(id_sm_vc: string): Promise<{
        id_sm_vc: number;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
        fecha_creacion_sm_vc: Date;
    }>;
    update_sm_vc(id_sm_vc: string, dto_sm_vc: UpdateUserDto_sm_vc): Promise<{
        id_sm_vc: number;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
    }>;
    toggleBan_sm_vc(id_sm_vc: string): Promise<{
        id_sm_vc: number;
        nombre_sm_vc: string;
        activo_sm_vc: boolean;
    }>;
}
