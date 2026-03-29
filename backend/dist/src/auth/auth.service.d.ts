import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService_sm_vc {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login_sm_vc(correo_sm_vc: string, clave_sm_vc: string): Promise<{
        requires_password_change: boolean;
        user_sm_vc: {
            id_sm_vc: number;
            nombre_sm_vc: string;
            cedula_sm_vc: string;
            correo_sm_vc: string;
            apellido_sm_vc: string;
            telefono_sm_vc: string | null;
            rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
            activo_sm_vc: boolean;
            requiere_cambio_clave_sm_vc: boolean;
            fecha_creacion_sm_vc: Date;
        };
        access_token_sm_vc?: undefined;
    } | {
        access_token_sm_vc: string;
        user_sm_vc: {
            id_sm_vc: number;
            nombre_sm_vc: string;
            cedula_sm_vc: string;
            correo_sm_vc: string;
            apellido_sm_vc: string;
            telefono_sm_vc: string | null;
            rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
            activo_sm_vc: boolean;
            requiere_cambio_clave_sm_vc: boolean;
            fecha_creacion_sm_vc: Date;
        };
        requires_password_change?: undefined;
    }>;
    cambiarClaveInicial_sm_vc(correo_sm_vc: string, clave_temporal_sm_vc: string, nueva_clave_sm_vc: string): Promise<{
        message: string;
    }>;
    validateUser_sm_vc(userId_sm_vc: number): Promise<{
        id_sm_vc: number;
        nombre_sm_vc: string;
        cedula_sm_vc: string;
        correo_sm_vc: string;
        apellido_sm_vc: string;
        telefono_sm_vc: string | null;
        rol_sm_vc: import("@prisma/client").$Enums.RolUsuario;
        activo_sm_vc: boolean;
        requiere_cambio_clave_sm_vc: boolean;
        fecha_creacion_sm_vc: Date;
    }>;
}
