import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService_sm_vc {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login_sm_vc(correo_sm_vc: string, clave_sm_vc: string): Promise<{
        access_token_sm_vc: string;
        user_sm_vc: {
            id_sm_vc: string;
            correo_sm_vc: string;
            nombre_sm_vc: string;
            rol_sm_vc: import("@prisma/client").$Enums.Rol_sm;
            avatar_sm_vc: string | null;
            activo_sm_vc: boolean;
            cohorte_sm_vc: string | null;
            profesor_id_sm_vc: string | null;
            created_at_sm_vc: Date;
            updated_at_sm_vc: Date;
        };
    }>;
    validateUser_sm_vc(userId_sm_vc: string): Promise<{
        id_sm_vc: string;
        correo_sm_vc: string;
        nombre_sm_vc: string;
        rol_sm_vc: import("@prisma/client").$Enums.Rol_sm;
        avatar_sm_vc: string | null;
        activo_sm_vc: boolean;
        cohorte_sm_vc: string | null;
        profesor_id_sm_vc: string | null;
        created_at_sm_vc: Date;
        updated_at_sm_vc: Date;
    }>;
}
